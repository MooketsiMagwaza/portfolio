# Device mockups

A **Mac window** (traffic lights, title bar) and an **iPhone** (bezel, Dynamic Island,
status bar, home indicator) drawn around a screenshot. Both are plain HTML and CSS —
`src/components/MacWindow.astro`, `src/components/IPhone.astro` and
`src/styles/mockups.css` — and each scales as one piece from the width of its wrapper.

The macOS-style desktop no longer imports these components: its gallery shows the
**baked PNGs** below (converted to WebP in `public/images/projects/`) or draws its own
lightweight frames around plain screenshots. The components and CSS stay in the repo
because `bake.mjs` renders them, and so they can be used again on any page.

Some places can't run CSS, such as a GitHub profile README. `bake.mjs` renders the same
markup and styles in headless Edge or Chrome and saves transparent PNGs:

```bash
node tools/mockups/bake.mjs <out-dir>                 # every job
node tools/mockups/bake.mjs <out-dir> <job-name>   # just one
```

To add an image, add a job to `JOBS` in `bake.mjs` (the source picture lives in
`public/images/`; `markup.mjs` has `mac()` and `iphone()`).

To use a baked image in the gallery, convert it to WebP (keep the transparency),
save it in `public/images/projects/<slug>/`, and add a `shots` entry in
`src/data/projects.ts` with `frame: 'bare'` so the gallery doesn't draw a second frame.

**Preparing a phone screen.** `iphone()` expects a 390-wide phone screen. A full-page
capture has its tab bar only at the very bottom, so crop the top of the page and join the
tab bar back underneath, as a real viewport would show. The status bar colour
(`statusBg`) should match the app's top bar.

Set `BROWSER_PATH` if Edge or Chrome isn't in a standard location.

**The site's images are off for now.** The raw screens the current jobs read
(`public/images/zenith/` and `public/images/orb-view/`) were removed from the working
tree along with every other project image. Restore them from history before running
those jobs (`git checkout 7e6482c -- public/images/zenith public/images/orb-view`), or
add new jobs that read new captures.
