// api/pipedrive-goals.js — reads leads-vs-goal progress from Pipedrive's
// Goals API for each brand. Read-only: goals themselves are configured in
// Pipedrive, never here. Reached only after middleware.js's cookie check.
//
// NOT YET LIVE-VERIFIED: Pipedrive has no literal "leads" goal type
// (deals_won | deals_progressed | activities_completed | activities_added |
// deals_started | revenue_forecast). This uses deals_started as the best
// stand-in for lead volume, per the design handoff's own note that this
// needs confirming against real numbers once real credentials exist --
// treat the type/brand-matching below as a first draft, not final.
export default async function handler(req, res) {
  const token = process.env.PIPEDRIVE_API_TOKEN;
  const domain = process.env.PIPEDRIVE_DOMAIN;

  if (!token || !domain) {
    res.status(200).json({ configured: false, goals: {} });
    return;
  }

  const base = `https://${domain}.pipedrive.com/v1`;
  const brands = { ltw: 'LTW', sq: 'Squeeky' };

  try {
    const goals = {};
    for (const [brandKey, brandLabel] of Object.entries(brands)) {
      // Pipedrive goals aren't natively scoped by "brand" -- this searches
      // by goal type and matches title text containing the brand name.
      // First real test against the account will tell us whether this
      // actually finds anything, or whether goals need a different filter
      // (e.g. by owner_id or pipeline_id instead).
      const r = await fetch(
        `${base}/goals/find?type.name=deals_started&api_token=${encodeURIComponent(token)}`
      );
      if (!r.ok) { goals[brandKey] = { found: false, error: `Pipedrive returned ${r.status}` }; continue; }
      const data = await r.json();
      const match = (data.data || []).find((g) =>
        (g.title || '').toLowerCase().includes(brandLabel.toLowerCase()));
      if (!match) { goals[brandKey] = { found: false }; continue; }

      const resultRes = await fetch(`${base}/goals/${match.id}/results?api_token=${encodeURIComponent(token)}`);
      const resultData = resultRes.ok ? await resultRes.json() : null;
      const progress = resultData && resultData.data ? resultData.data.progress : null;

      goals[brandKey] = {
        found: true,
        target: match.expected_outcome ? match.expected_outcome.target : null,
        current: progress ? progress.value : null,
        syncedAt: new Date().toISOString(),
      };
    }
    res.status(200).json({ configured: true, goals });
  } catch (e) {
    res.status(502).json({ configured: true, error: 'Could not reach Pipedrive.', goals: {} });
  }
}
