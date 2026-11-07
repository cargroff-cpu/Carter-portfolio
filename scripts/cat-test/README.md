# Hero cat tests

`scaffold-cat.js` (the black cat in the Scaffold hero) is driven frame by frame in
headless Chromium with a scripted cursor, and each scenario is checked pass/fail:
reaction time, what it does (chase / stalk / wiggle / pounce / swat), that it
ignores far cursors, that play ends when the cursor stops or leaves, and that
the head never snaps (> 30° in one frame).

    npm i -D playwright && npx playwright install chromium   # once
    npm run test:cat                                          # RUNS=5 VERBOSE=1 for more

Behaviour is partly random, so each scenario runs several times from different
spots. Open the page with `?catdebug` to get `window.__cat` in the console, or
`?catdebug=lines` to also draw the measured lane.
