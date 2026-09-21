# Device mockups

The site shows project screenshots inside a **Mac window** (traffic lights, title bar)
and an **iPhone** (bezel, Dynamic Island, status bar, home indicator). Both are plain
HTML and CSS — `src/components/MacWindow.astro`, `src/components/IPhone.astro` and
`src/styles/mockups.css` — and each scales as one piece from the width of its wrapper.

Some places can't run CSS, such as a GitHub profile README. `bake.mjs` renders the same
markup and styles in headless Edge or Chrome and saves transparent PNGs:

```bash
node tools/mockups/bake.mjs <out-dir>                 # every job
node tools/mockups/bake.mjs <out-dir> tsela-rider-routes   # just one
```

To add an image, add a job to `JOBS` in `bake.mjs` (the source picture lives in
`public/images/`; `markup.mjs` has `mac()` and `iphone()`).

**Preparing a phone screen.** `iphone()` expects a 390-wide phone screen. A full-page
capture has its tab bar only at the very bottom, so crop the top of the page and join the
tab bar back underneath, as a real viewport would show. The status bar colour
(`statusBg`) should match the app's top bar.

Set `BROWSER_PATH` if Edge or Chrome isn't in a standard location.
