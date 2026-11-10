# Hero cat tests

`scaffold-cat.js` (the black cat in the Scaffold hero) is driven frame by frame. The page's default is
the pre-scripted cat (runs in from the side of the screen and sits beside a front post); the behaviour scenarios below switch
on the free-roaming cat (`cat.scripted = false`), and one scenario checks the scripted one. It is in
headless Chromium with a scripted cursor, and each scenario is checked pass/fail:
reaction time, what it does (chase / stalk / wiggle / pounce / swat), that it
ignores far cursors, that play ends when the cursor stops or leaves, and that
the head never snaps (> 30° in one frame), plus the newer behaviours: lock-on
ear/tail flick, pounces that lead a moving cursor, the one-two swat at a flick,
the "missed it" look around, the pause before getting up from a loaf, and a 15-minute
no-cursor run (rendering off) that checks every lamp post gets a visit and that his sprite
is never drawn over a post that is nearer than he is. Every scenario also fails if any bone
jumps more than 70° in one frame (a pop), a swat-pacing scenario checks he doesn't swat on a
loop, and a render check confirms his eyes are lit facing the viewer and dark from behind.
Two more cover the scripted run-in (seen side-on while he runs across, no cursor-tracking
mid-run) and the toy mouse from `bat-mouse.js` (a drop counts only on him, once seated; he
looks at it, then at you, and slow-blinks).

    npm i -D playwright && npx playwright install chromium   # once
    npm run test:cat                                          # RUNS=5 VERBOSE=1 for more

`npm run test:cat:sizes` plays his entrance (in from the side, to each front post) at six window sizes (900×640 up to
2560×1440) in the real page, with pixel checks: nothing of him shows at the start, he is revealed
gradually, he really crosses the screen, and he ends up in the lane. `SIZES=1440x900,1920x1080` and
`ONLY=mid` narrow it.

Options: `RUNS=5` repeats each scenario five times (use it when judging a change);
`VERBOSE=1` prints each run's clip timeline and pounce misses; `ONLY=<text>` runs only
scenarios whose name contains the text; `TRACE=<secs>` dumps per-frame state (toy, distance,
heading error, cursor speed, interest) for the first seconds. Without internet, point
`CAT_TEST_MODULES` at a node_modules holding react@18.3.1, react-dom@18.3.1 and three@0.169.0.

Behaviour is partly random, so each scenario runs several times from different
spots. Open the page with `?catdebug` to get `window.__cat` in the console, or
`?catdebug=lines` to also draw the measured lane.
