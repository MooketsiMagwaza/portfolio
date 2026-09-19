# Mooketsi Magwaza — portfolio

The source for Mooketsi Vincent Magwaza's engineering portfolio. The site is a
small, static Astro application designed around verified project evidence rather
than a generic technology list.

## Local development

```bash
npm install
npm run dev
```

The development server starts at `http://localhost:4321`.

## Quality checks

```bash
npm run check
npm run build
```

The production site is generated in `dist/` and can be deployed to any static
host. No database, analytics SDK, cookie banner, or server runtime is required.

Pushes to `main` deploy the production build to
`https://mooketsimagwaza.github.io/portfolio/` through the official Astro and
GitHub Pages actions.

## Content model

Project data lives in `src/data/projects.ts`. Each entry separates what is
verified today from the next engineering milestone so the public copy does not
overstate production readiness.

## License

Code is available under the [MIT License](LICENSE).
