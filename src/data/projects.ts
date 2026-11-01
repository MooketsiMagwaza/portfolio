export type ProjectTag = 'web' | 'systems' | 'mobile' | 'docs';

/**
 * How a screenshot is presented: a browser window, a tablet, or a landscape phone drawn around it,
 * or `bare` for images that already come with their own Mac window or iPhone mockup.
 */
export type Frame = 'browser' | 'tablet' | 'phone' | 'bare';

export type Shot = {
  /** File name (without extension) inside public/images/projects/<slug>/. */
  file: string;
  alt: string;
  caption: string;
  /** Pixel size of the optimised image, used to reserve space before it loads. */
  w: number;
  h: number;
  /** Overrides the project's default frame for this one image. */
  frame?: Frame;
};

/** The stack, grouped (Frontend, Backend, Data, Observability, ...), for a project whose architecture is worth showing. */
export type StackGroup = { label: string; items: string[] };

export type Project = {
  slug: string;
  name: string;
  /** How the project appears as a "file" in the Finder-style gallery. */
  filename: string;
  /** The Finder "Kind" column. */
  kind: string;
  kicker: string;
  summary: string;
  /** The longer story behind the project. */
  story: string;
  evidence: string;
  next?: string;
  /** Where the project stands when it is not finished, for example "In development". Leave it out for shipped work. */
  status?: string;
  /** Leave the list empty when the stack is not settled yet. */
  stack: string[];
  /** The same stack in groups, shown as labelled chips in the Finder and Quick Look. Optional: without it `stack` is shown as one row. */
  stackGroups?: StackGroup[];
  tags: ProjectTag[];
  /** The public repository. Leave it out while the repository is private: no link is shown. */
  repository?: string;
  featured: boolean;
  /** The default frame for this project's screenshots. Only used when the project has `shots`. */
  frame?: Frame;
  /** Colours behind the cover and the screenshots: a gradient and a soft highlight. */
  theme: { from: string; to: string; glow: string };
  /** One to three characters drawn on the cover when there is no screenshot. Defaults to the first letter of the name. */
  mark?: string;
  /**
   * Real screenshots; the first one is the cover. Optional: without them the project gets a typographic
   * cover and a "Screenshots coming soon" line, and the gallery and its pager are left out.
   */
  shots?: [Shot, ...Shot[]];
};

export const tagLabels: Record<ProjectTag, string> = {
  web: 'Web',
  systems: 'Systems',
  mobile: 'Mobile',
  docs: 'Docs',
};

/** Resolve a path inside /public against the site's base path (e.g. /portfolio). */
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
export const asset = (path: string): string => `${base}/${path}`;

/** The screenshots a project has (none is fine: it then shows a typographic cover). */
export const shotsOf = (project: Project): Shot[] => project.shots ?? [];
export const hasShots = (project: Project): boolean => shotsOf(project).length > 0;

export const shotFrame = (project: Project, shot: Shot): Frame => shot.frame ?? project.frame ?? 'browser';
export const shotUrl = (project: Project, shot: Shot): string => asset(`images/projects/${project.slug}/${shot.file}.webp`);
/** The small cover image, or null when the project has no screenshots. */
export const coverThumbUrl = (project: Project): string | null => {
  const first = project.shots?.[0];
  return first ? asset(`images/projects/${project.slug}/${first.file}-sm.webp`) : null;
};

/** The characters drawn on a typographic cover. */
export const coverMark = (project: Project): string => project.mark ?? project.name.trim().charAt(0).toUpperCase();

/**
 * Aspect ratio of a framed screenshot (frame included), so layout is stable before the image loads.
 * The constants mirror the frame proportions in apps.css.
 */
export function frameAspect(frame: Frame, shot: Shot): number {
  const { w, h } = shot;
  if (frame === 'bare') return w / h;
  if (frame === 'browser') return w / (h + w * 0.04);
  const pad = frame === 'tablet' ? 0.022 : 0.018;
  return (w + 2 * pad * w) / (h + 2 * pad * w);
}

/** The flat `stack` list (Spotlight, the Terminal, search) from the groups. */
const stackOf = (groups: StackGroup[]): string[] => groups.flatMap((group) => group.items);

// Each item was checked against the repository: the Cargo workspace and package.json, the compose files,
// pyproject.toml and the CI workflows.
const koriStack: StackGroup[] = [
  { label: 'Frontend', items: ['Next.js', 'TypeScript', 'MapLibre', 'IndexedDB'] },
  { label: 'Backend', items: ['Python', 'FastAPI'] },
  { label: 'Data', items: ['PostGIS', 'Alembic'] },
  { label: 'Observability', items: ['OpenTelemetry', 'Prometheus', 'Grafana', 'Tempo'] },
  { label: 'Tooling', items: ['Docker', 'GitHub Actions'] },
];

const tagwiseStack: StackGroup[] = [
  { label: 'Frontend', items: ['React', 'TypeScript', 'Vite', 'MapLibre'] },
  { label: 'Backend', items: ['Rust', 'Axum', 'nginx gateway'] },
  { label: 'Data', items: ['PostgreSQL', 'Redis'] },
  { label: 'Observability', items: ['OpenTelemetry', 'Prometheus', 'Grafana', 'Tempo'] },
  { label: 'Tooling', items: ['Docker', 'Fumadocs', 'GitHub Actions'] },
];

// Order is the order they are shown in: Kori, Tagwise, Opaline, then University CS Docs; the first is selected when the desktop opens. (Tsela and StockLink are company assets and are not shown here.)
//
// Adding a project is a data change: add an entry here and the Finder, Quick Look, Spotlight and the
// Terminal all pick it up. Leave out `repository` while a repository is private and `shots` until there
// are screenshots; use `stack: []` while the stack is not settled; set `status` for unfinished work.
export const projects: Project[] = [
  {
    slug: 'kori',
    name: 'Kori',
    filename: 'Kori.app',
    kind: 'Safari and wildlife app',
    kicker: 'Offline-first wildlife sightings for Botswana',
    summary:
      'An offline-first safari and wildlife platform for Botswana: real downloadable maps, track-only guidance, private-by-design sightings, and a review workflow that keeps working beyond mobile coverage.',
    story:
      'Kori began with two Botswana-specific constraints that ordinary map and social apps do not solve well: safari routes often lose mobile coverage, and publishing an animal’s exact live location can be unsafe. Named after the kori bustard, kgori in Setswana, it lets a visitor log a sighting on the phone, keep it there until a connection returns, and pass it to another phone with a QR code. Downloaded maps keep the basemap, position and routing available offline, while guidance follows mapped roads and tracks only. Every shared sighting is reviewed and delayed, normal species appear as a 1 km area, and sensitive species such as rhino and pangolin appear only as a 10 km area after 7 days and are never guided to.',
    evidence:
      'Four web apps make up the front end: a phone-first field app, a landing site, a review console and API docs, written in Next.js and TypeScript. In the field app a sighting is saved in IndexedDB, photos are redrawn on the phone to strip hidden location data, and downloaded PMTiles packs are drawn locally with MapLibre. A private Savuti pack combines an OpenStreetMap vector basemap and routing graph with Sentinel-2 imagery; its satellite-first view, attribution, local storage, OSM-track routing and offline reload passed 16 of 16 automated checks. The private park pack and its screenshots remain off the web pending wildlife-authority guidance. The backend is a FastAPI and PostGIS service with Alembic migrations and scheduled lifecycle jobs. Authentication, object storage, Prometheus, Grafana, Tempo, OpenTelemetry, backups, recovery tooling, Docker Compose and GitHub Actions form the operating foundation. The backend is built and tested, but the apps do not call it yet.',
    stack: stackOf(koriStack),
    stackGroups: koriStack,
    tags: ['mobile'],
    repository: 'https://github.com/MooketsiMagwaza/kori',
    featured: true,
    frame: 'bare',
    theme: { from: '#0b3a52', to: '#146c2e', glow: '#9fe3c4' },
    shots: [
      { file: 'flow', alt: 'Three iPhone frames showing Kori home, log-a-sighting and sightings-list screens', caption: 'The offline field flow: start, log, and review sightings', w: 1400, h: 1041 },
      { file: 'home-phone', alt: 'Kori home screen in an iPhone frame, with offline status and actions to log, open the map or scan a code', caption: 'Home: the field workflow starts on the phone', w: 600, h: 1293 },
      { file: 'log-phone', alt: 'Kori log-a-sighting screen in an iPhone frame with a searchable species list', caption: 'Log a sighting, saved locally first', w: 600, h: 1293 },
      { file: 'sightings-phone', alt: 'Kori sightings screen in an iPhone frame showing reviewed sightings as areas rather than exact points', caption: 'Reviewed sightings are shown as areas, never exact points', w: 600, h: 1293 },
    ],
  },
  {
    slug: 'tagwise',
    name: 'Tagwise',
    filename: 'Tagwise.app',
    kind: 'Asset and stock register',
    kicker: 'One shared register for assets and stock',
    summary:
      'A browser-based asset, stock, batch and expiry register for retailers and organisations that need more than a spreadsheet without buying a desktop POS subscription and add-ons.',
    story:
      'Tagwise started with a pharmacy problem in my own family: my sister needed a practical way to track batches, bulk stock and expiry dates, but the usual answer was a paid point-of-sale subscription plus separate extensions and a dedicated desktop setup. Tagwise turns that workflow into a browser-based register that feels familiar to spreadsheet users. It keeps the table view, Excel and CSV import, and bulk editing people already understand, then adds expiry warnings, QR and barcode scanning, printable labels, stock movement history, multi-person stock-takes, roles and site maps. The aim is a lower-friction alternative for pharmacies, retailers, schools, clinics and offices that should work on the devices they already have.',
    evidence:
      'The app is a React and TypeScript single-page app built with Vite, with a flat Apple-style interface: system-like surfaces, hairline borders, one accent and no decorative gradients. The spreadsheet-like register supports saved views, filters and columns; stock lines carry batches and expiry dates, the dashboard calls out batches expiring within 60 days, and a saved view isolates expiring stock. It also includes asset and stock history, QR labels, typed, handheld or camera scanning, Excel and CSV import with row-level validation, multi-person stock-takes, roles, stale-edit conflict handling and a MapLibre sites map. The backend is a Rust workspace of five Axum services, identity, register, notifications, media and ops, behind an nginx gateway, with PostgreSQL and Redis. Prometheus, Grafana, Tempo, OpenTelemetry, Fumadocs, Docker Compose and GitHub Actions form the operating foundation. The development stack has been started and all ten containers reported healthy. The browser build works with a labelled local sample workspace and does not need a dedicated desktop app, but it is not yet connected to the backend services. The repository is public but currently all rights reserved; an open-source licence still needs to be chosen before calling it open source.',
    stack: stackOf(tagwiseStack),
    stackGroups: tagwiseStack,
    tags: ['web'],
    repository: 'https://github.com/MooketsiMagwaza/tagwise',
    featured: true,
    frame: 'bare',
    theme: { from: '#1a1033', to: '#5b3fd0', glow: '#c4b5fd' },
    mark: 'Tw',
    shots: [
      { file: 'home', alt: 'Tagwise’s home page in its sample workspace: what needs attention, a stock-take in progress and recent activity', caption: 'Home: what needs attention (sample workspace)', w: 1420, h: 999 },
      { file: 'register', alt: 'Tagwise’s register: a table of assets with saved views, filters and columns', caption: 'The register, with saved views and filters (sample data)', w: 1420, h: 999 },
      { file: 'asset', alt: 'A Tagwise asset page with its details, who has it, and a QR label ready to print', caption: 'An asset with its QR label (sample data)', w: 1420, h: 999 },
      { file: 'import', alt: 'Tagwise’s spreadsheet import, with the rows that have problems marked before anything is written', caption: 'Importing a spreadsheet, problems shown first (sample data)', w: 1420, h: 999 },
      { file: 'sites', alt: 'Tagwise’s sites page: six places on a map of Botswana, with a list beside it', caption: 'Sites on a map (sample data)', w: 1420, h: 999 },
      { file: 'phone', alt: 'Tagwise’s home page on a phone, in an iPhone frame', caption: 'The same app on a phone (sample workspace)', w: 600, h: 1293 },
      { file: 'phone-register', alt: 'Tagwise’s asset register on a phone, in an iPhone frame', caption: 'The register on a phone (sample workspace)', w: 600, h: 1293 },
    ],
  },
  {
    slug: 'opaline',
    name: 'Opaline',
    filename: 'Opaline.app',
    kind: 'Local-first productivity workspace',
    kicker: 'Apps, files, time and focus in one Windows workspace',
    summary:
      'A local-first Windows productivity workspace that combines desktop organisation, installed apps, screen-time insight, Pomodoro focus, Zen mode, and a calm screen saver.',
    story:
      'Opaline turns a busy Windows desktop into a purpose-built productivity space without replacing the shell or taking control of the user’s files. A global hotkey opens a full-screen acrylic workspace with organised Desktop panes, custom home screens, a searchable installed-app library, and a mirror of pinned and running apps. Screen-time history, a configurable Pomodoro timer, Zen prompts, and an optional screen saver bring organisation and attention management into the same interface. Opaline reads the Desktop, but never moves, renames or deletes its files and makes no network requests.',
    evidence:
      'The shipped Windows application uses Tauri 2 with a Rust backend and a framework-free TypeScript and CSS interface. Its settings cover blur, tint, layout, hotkey and opt-in login startup; local JSON stores pane metadata, workspaces, screen time and shell preferences. Window previews stay in memory, screen-time data stays local, and Windows-key routing is optional and preserves system shortcuts. Release v0.2.1 is available as NSIS, MSI and portable builds. TypeScript and Rust tests cover the data and layout rules; remaining real-device checks are listed openly in the project work order.',
    stack: ['Tauri 2', 'Rust', 'TypeScript', 'CSS', 'WebView2', 'Windows APIs'],
    tags: ['systems'],
    repository: 'https://github.com/MooketsiMagwaza/opaline',
    featured: true,
    frame: 'bare',
    theme: { from: '#0c1830', to: '#315a80', glow: '#b9ddff' },
    mark: 'Op',
    shots: [
      { file: 'home', alt: 'Opaline Home showing organised desktop panes over a softened Windows desktop and a bottom taskbar mirror', caption: 'Desktop items organised into virtual panes', w: 1280, h: 800 },
      { file: 'apps', alt: 'Opaline All apps page with a searchable catalogue of installed Windows applications', caption: 'Searchable installed-app catalogue', w: 1280, h: 800 },
      { file: 'screen-time', alt: 'Opaline screen-time page with local app usage totals and a daily chart', caption: 'Local screen-time totals', w: 1280, h: 800 },
      { file: 'focus', alt: 'Opaline Focus page with a timer, daily progress and Zen controls', caption: 'Focus timer and local progress', w: 1280, h: 800 },
    ],
  },
  {
    slug: 'university-cs-docs',
    name: 'University CS Docs',
    filename: 'University CS Docs.webloc',
    kind: 'Interactive learning platform',
    kicker: 'Guided CS courses, code playgrounds and revision tools',
    summary:
      'A course-from-scratch learning platform for University of Botswana computer science, combining guided lessons, runnable playgrounds, flashcards, quizzes, and focused study tools.',
    story:
      'University CS Docs is a guided teaching experience inspired by Debbie Stokes and Khan Academy. Each course starts with the foundations, develops ideas in sequence, and moves learners through explanations, worked examples, browser-based code practice, cheat sheets, flashcards, quizzes, chapter assessments, and further resources. CSI243 Functional Programming demonstrates the full model: a beginner-first Haskell course taught from core programming ideas through practical problem solving, with a built-in focus timer and study dashboard.',
    evidence:
      'The live Next.js and MDX platform includes reusable course navigation, code playgrounds, review cards, assessments, progress and focus tools. It is backed by CI, CodeQL analysis, dependency review, project governance, and a documented contributor path so new courses and learning components can be added without rebuilding the platform.',
    stack: ['Next.js', 'MDX', 'CI', 'CodeQL'],
    tags: ['docs', 'web'],
    repository: 'https://github.com/MooketsiMagwaza/university-cs-docs',
    featured: true,
    frame: 'browser',
    theme: { from: '#06241c', to: '#0f7a55', glow: '#5eead4' },
    mark: 'CS',
    shots: [
      { file: 'functional-overview', alt: 'The CSI243 Functional Programming course overview with its chapter sequence and study tools', caption: 'CSI243 Functional Programming course overview', w: 1440, h: 900 },
      { file: 'functional-thinking', alt: 'A Functional Thinking lesson with navigation, explanation and a Haskell code example', caption: 'Structured notes with worked Haskell examples', w: 1440, h: 900 },
      { file: 'haskell-playground', alt: 'The browser-based Haskell playground with editable code and an output panel', caption: 'Haskell runs directly in the browser', w: 1440, h: 900 },
      { file: 'functional-review', alt: 'The Functional Programming review page with flashcards and a chapter assessment', caption: 'Review with flashcards and assessment', w: 1440, h: 900 },
    ],
  },
];

export const featuredProjects = projects.filter((project) => project.featured);
