# Mooketsi Magwaza — portfolio

The source for Mooketsi Vincent Magwaza's engineering portfolio, presented as a
macOS-style desktop that runs in the browser. It is a small, static Astro
application: no database, analytics SDK, cookie banner, or server runtime.

Live at <https://mooketsimagwaza.github.io/portfolio/>.

## The desktop

| Piece | What it does |
| --- | --- |
| **Finder** | The projects, as a gallery of real screenshots. Switch between Gallery, Icons, and List views; filter by tag; search; page through screenshots (buttons, or ↑/↓); press **Space** for Quick Look. |
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
  overstates production readiness. Each project also lists its screenshots
  (with alt text and a caption), a frame style, and the colours behind them.
- **Profile, principles, toolkit, and credits** live in `src/data/site.ts`.
- **Apps** (what appears in the Dock and Spotlight) live in `src/data/apps.ts`.

### Project images

Screenshots live in `public/images/projects/<slug>/` as WebP, with a small
`-sm` thumbnail for each cover. They come from:

- the images chosen for the [GitHub profile README](https://github.com/MooketsiMagwaza)
  (StockLink's dark-mode shots and Tsela's rider app), which already include a
  Mac window or iPhone mockup and use the `bare` frame;
- each project's own repository docs (Tsela, Obsidian Sync for iOS, GlassHID);
- captures of the live [University CS Docs](https://university-cs-docs.vercel.app) site.

To add or replace one, export it as WebP (about 1,400px wide is plenty), drop it
in the project's folder, and update its `shots` entry. `w` and `h` are the
image's pixel size; they reserve space so the layout doesn't jump.

## Credit

The idea of a portfolio that lives inside a desktop operating system comes from
[Loago Moremi's portfolio](https://loag0.github.io/), which sits inside a Windows
XP desktop. This is an independent macOS take on that idea, built from scratch,
with the app icons drawn for the site. macOS, Finder, and other Apple names are
trademarks of Apple Inc.; this project is not affiliated with Apple.

## License

Code is available under the [MIT License](LICENSE).
