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
`public/images/<slug>/`; `markup.mjs` has `mac()` and `iphone()`). Bake to a folder
outside the repository: the PNGs are large, and only the WebP goes in.

The jobs today, by project:

| Project | Jobs | Source in `public/images/` |
| --- | --- | --- |
| Zenith | `zenith-decks`, `zenith-journal`, `zenith-history`, `zenith-zen` | `zenith/*.png` |
| Tagwise | `tagwise-home`, `tagwise-register`, `tagwise-asset`, `tagwise-import`, `tagwise-sites`, `tagwise-phone` | `tagwise/*-dark.jpg`, copied from the Tagwise repository's `public/screens/` |
| Kori | `kori-landing`, `kori-review`, `kori-phone-home`, `kori-phone-map`, `kori-phone-log`, and `kori-phones` (the three phones side by side, which is what the gallery uses) | `kori/*.png`, captured from the running apps |

**Converting to WebP.** `webp.mjs` turns a baked PNG into the WebP the gallery uses,
keeping the transparency, and prints the size to put in `shots`:

```bash
node tools/mockups/webp.mjs <out-dir>/tagwise-home.png public/images/projects/tagwise --name home --thumb 640
```

`--thumb 640` also writes `home-sm.webp`, the small cover image (do it for a project's
first image only). `--width N` scales a large PNG down to N pixels wide. Then add a
`shots` entry in `src/data/projects.ts` with `frame: 'bare'`, so the gallery doesn't draw
a second frame around an image that already has its own.

**Re-taking and re-baking the Kori images** (for example after Kori is restyled). Nothing in the
Kori repository is changed; the three web apps are only started. Build and start each one, in
its own terminal:

```bash
cd <kori>/apps/field   && npm ci && npm run build && npm start   # http://localhost:3100
cd <kori>/apps/landing && npm ci && npm run build && npm start   # http://localhost:3000
cd <kori>/apps/review  && npm ci && npm run build && npm start   # http://localhost:3300
```

Then, in this repository:

```bash
node tools/mockups/capture-kori.mjs          # --scheme dark for Night colours; writes public/images/kori/
node tools/mockups/bake.mjs <out-dir> kori-landing kori-review kori-phone-home kori-phone-map kori-phone-log kori-phones
node tools/mockups/webp.mjs <out-dir>/kori-landing.png public/images/projects/kori --name landing --thumb 640
node tools/mockups/webp.mjs <out-dir>/kori-review.png public/images/projects/kori --name review
node tools/mockups/webp.mjs <out-dir>/kori-phones.png public/images/projects/kori --name phones --width 1400
```

`capture-kori.mjs` also writes `public/images/kori/phone-colours.json`: the app's top-bar and
bottom-bar colours and whether it is light or dark. The Kori bake jobs read it for the iPhone's
status bar, its home strip and the Mac window theme, so a restyle needs no edit in `bake.mjs`.
Afterwards, check that the `w` and `h` the WebP step prints still match the Kori `shots` in
`src/data/projects.ts` (the baked sizes only change if a job's width or padding does), that
the captions still describe the screens, and that Kori's `theme` colours (the gradient behind
its images) suit the new look. If the apps' ports differ, set `KORI_FIELD_URL`,
`KORI_LANDING_URL` and `KORI_REVIEW_URL`.

**Preparing a phone screen.** `iphone()` expects a 390-wide phone screen. A capture of
the phone's viewport (390 × 844 at 2x, with the app's own tab bar floating at the bottom)
can go in as it is. A full-page capture has its tab bar only at the very bottom, so crop
the top of the page and join the tab bar back underneath, as a real viewport would show.
The status bar colour (`statusBg`) should match the app's top bar, and `safeBg` the colour
of its bottom bar, which fills the strip under it. For a light app pass `tone: 'light'`, so
the time, icons and home indicator are dark instead of white.

**Capturing from a running app.** Headless Edge enforces a minimum window width, so a plain
`--window-size=390,844` screenshot is cropped. Drive it over the Chrome DevTools Protocol
instead: `Emulation.setDeviceMetricsOverride` with width 390, height 844, `deviceScaleFactor`
2 and `mobile: true`, then `Page.captureScreenshot`. For a desktop screen, use 1440 × 900
at 1x. Node has a global `WebSocket`, so no packages are needed.

Set `BROWSER_PATH` if Edge or Chrome isn't in a standard location.

The Orb View jobs were removed when Orb View left the portfolio.
