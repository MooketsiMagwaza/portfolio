# Mooketsi Magwaza — portfolio

The source for Mooketsi Vincent Magwaza's engineering portfolio, presented as a
macOS-style desktop that runs in the browser. It is a small, static Astro
application: no database, analytics SDK, cookie banner, or server runtime.

Live at <https://mooketsimagwaza.github.io/portfolio/>.

## The desktop

| Piece | What it does |
| --- | --- |
| **Finder** | The projects, as a gallery. Switch between Gallery, Icons, and List views; filter by tag; search; press **Space** for Quick Look. A project with screenshots can be paged through (buttons, or ↑/↓); one without shows a typographic cover. |
| **Contacts** | About me, with quick actions. |
| **Notes** | How I work: the principles, each tied to a project that shows it. |
| **Terminal** | `help`, `ls`, `cat <project>`, `open <project>`, `stack`, `neofetch`, and a few surprises. Tab completes, ↑ recalls history. |
| **Mail** | A compose window. Sending hands the draft to your own mail app; nothing is sent from the page. |
| **About This Mac** | Overview, technical toolkit, and credits. |
| **Spotlight** | <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>K</kbd> (or `/`) searches projects, apps, and actions. |
| **Control Center** | Light/dark appearance and a reduce-motion switch. |

Windows can be dragged, resized, zoomed, and minimised into the Dock. On phones
each window becomes a full-screen card. Content is rendered on the server, so
the site stays readable without JavaScript.

## Local development

```bash
npm install
npm run dev
```

The development server starts at `http://localhost:4321/portfolio/`.

## Quality checks

```bash
npm run check
npm run build
```

The production site is generated in `dist/`. Pushes to `main` deploy it to
GitHub Pages through the official Astro and GitHub Pages actions.

## Content model

- **Projects** live in `src/data/projects.ts`. Each one separates what is
  verified today (`evidence`) from what comes next (`next`), so the copy never
  overstates production readiness. Work that is not finished carries a `status`
  such as "In development" and says what it is aiming at, not what it does.
  Each project also has the colours behind its cover and, optionally, its
  screenshots.
- **Profile, principles, toolkit, and credits** live in `src/data/site.ts`.
- **Apps** (what appears in the Dock and Spotlight) live in `src/data/apps.ts`.

### Adding a project

Adding a project is a data change: add an entry to the `projects` list in
`src/data/projects.ts`, and the Finder, Quick Look, Spotlight, and the
Terminal pick it up. The required fields are `slug`, `name`, `filename`, `kind`,
`kicker`, `summary`, `story`, `evidence`, `stack`, `tags`, `featured`, and `theme`.

- Leave out `repository` while the repository is private. No GitHub link is shown,
  and the project says its source is private for now.
- Use `stack: []` while the stack is not settled.
- Set `status: 'In development'` for work in progress.
- Set `mark` (one to three characters) for the typographic cover; it defaults to
  the first letter of the name.
- Leave out `shots` until there are screenshots.
- Say "sample data" in a caption when the picture shows invented data.

### Project images

Every project has its images, in the gallery, in Quick Look and as the small cover
thumbnail:

| Project | Images | Where they come from |
| --- | --- | --- |
| Zenith | Four Mac-window shots | Captures of the app, baked with `tools/mockups` (raw screens in `public/images/zenith/`) |
| Kori | The landing page and the review console in Mac windows, and the three phone screens (home, the offline map, logging a sighting) side by side in iPhone frames | Captured from the running web apps on their fictional sample reserve (raw screens in `public/images/kori/`) |
| Tagwise | Five Mac-window shots and one iPhone shot | Captures of the browser prototype's sample workspace, copied from its own screenshots (raw screens in `public/images/tagwise/`) |
| University CS Docs | Four plain screenshots | The site draws the browser window around them |

The baked images are WebP, with transparency, in `public/images/projects/<slug>/`.
The first one of each project also has a `<file>-sm.webp` thumbnail, which is its
cover. A project without `shots` still works: it shows a typographic cover (its mark
on its own colours) and the gallery says "Screenshots coming soon".

To add or replace images:

1. Put the raw captures in `public/images/<slug>/`: 1440 × 900 for a desktop screen,
   390 × 844 at 2x (780 × 1688 px) for a phone.
2. Add a job per image to `tools/mockups/bake.mjs` and bake it to a folder outside the
   repository: `node tools/mockups/bake.mjs <out-dir> <job>`.
3. Convert the baked PNG to WebP, which also prints the `w` and `h` to use:
   `node tools/mockups/webp.mjs <out-dir>/<job>.png public/images/projects/<slug> --name <file>`.
   Add `--thumb 640` for the project's first image, and `--width N` to scale a large one down.
4. Add it to the project's `shots` in `src/data/projects.ts`: `file` (without the
   extension), `alt`, `caption`, and `w` and `h`, the image's pixel size, which reserve
   space so the layout doesn't jump. Set the project's `frame` (`browser`, `tablet`,
   `phone`, or `bare` for images that already include their own Mac window or iPhone).

Check each image by looking at it before it goes in. The tool is described in
[tools/mockups/README.md](tools/mockups/README.md). The Zenith and University CS Docs
images were taken out on 8 October 2026 and brought back from git history
(`git checkout 7e6482c -- public/images/projects/zenith
public/images/projects/university-cs-docs public/images/zenith`).

## Credit

The idea of a portfolio that lives inside a desktop operating system comes from
[Loago Moremi's portfolio](https://loag0.github.io/), which sits inside a Windows
XP desktop. This is an independent macOS take on that idea, built from scratch,
with the app icons drawn for the site. macOS, Finder, and other Apple names are
trademarks of Apple Inc.; this project is not affiliated with Apple.

## License

Code is available under the [MIT License](LICENSE).
