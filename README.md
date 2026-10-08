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

### Project images

There are no project images for now. Every project shows a typographic cover (its
mark on its own colours) in place of a screenshot, and the gallery says
"Screenshots coming soon" where the screenshots used to be.

The idea is kept, not deleted. `shots` is optional on each project, and the
frames, the pager, and Quick Look's previous and next buttons are still in the
code. They appear for any project that has a `shots` list:

1. Export each screenshot as WebP (about 1,400px wide is plenty) to
   `public/images/projects/<slug>/`, plus a small `<file>-sm.webp` thumbnail for
   the first one, which is the cover.
2. Add a `shots` list to the project: `file` (without the extension), `alt`,
   `caption`, and `w` and `h`, the image's pixel size, which reserve space so the
   layout doesn't jump. Set the project's `frame` (`browser`, `tablet`, `phone`,
   or `bare` for images that already include their own Mac window or iPhone).

The previous images and `shots` entries are in git history, for example
`git show 7e6482c:src/data/projects.ts` and
`git checkout 7e6482c -- public/images`.

`tools/mockups/` is the script that bakes Mac-window and iPhone mockups from raw
screens (see its README). The site itself doesn't use `src/styles/mockups.css`
or those components, but the tool does, so they are kept. The raw screens it
reads were removed from `public/images/` with the rest of the images; restore
them from history or add new captures before baking.

## Credit

The idea of a portfolio that lives inside a desktop operating system comes from
[Loago Moremi's portfolio](https://loag0.github.io/), which sits inside a Windows
XP desktop. This is an independent macOS take on that idea, built from scratch,
with the app icons drawn for the site. macOS, Finder, and other Apple names are
trademarks of Apple Inc.; this project is not affiliated with Apple.

## License

Code is available under the [MIT License](LICENSE).
