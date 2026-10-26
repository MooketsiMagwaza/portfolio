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

// Order is the order they are shown in: Kori, Tagwise, Zenith, then University CS Docs; the first is selected when the desktop opens. (Tsela and StockLink are company assets and are not shown here.)
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
      'An offline-first safari and wildlife app for Botswana. Log a sighting with no signal, download a park map before the trip, and have every sighting reviewed before anyone else sees it.',
    story:
      'Kori is named after the kori bustard, kgori in Setswana, Botswana’s national bird. It is a safari app that keeps working without signal. You log a sighting on your phone and it waits there until a connection returns, and a reviewer approves it before anyone else sees it. Park maps are downloaded before the trip, so the map and your position work with no mobile signal, and guidance to a sighting follows known roads and tracks only. A sighting can be passed from phone to phone with a QR code. Kori never shows a live animal location: other people see a sighting only after review, at least an hour later, and only as a 1 km area. Sensitive species, such as rhino and pangolin, are shown as a 10 km area after 7 days and are never guided to or shared.',
    evidence:
      'Four web apps make up the front end: a phone-first field app, a landing site, a review console and API docs, written in Next.js and TypeScript. In the field app a sighting is saved in the phone’s own storage (IndexedDB), photos are redrawn on the phone to strip hidden location data, and the park pack is drawn with MapLibre with no map tiles. The backend is a Python service on FastAPI and PostGIS, with Alembic migrations and a scheduler for lifecycle jobs such as expiring shared trips and clearing uploads. An auth service and S3-style object storage sit beside it. Monitoring is set up with Prometheus, Grafana, Tempo and OpenTelemetry, and the backup and recovery scripts include a restore drill. All of it is defined in one Docker Compose stack, and GitHub Actions runs the checks. The backend is built and tested, but the apps do not call it yet. The data in the apps is a fictional sample reserve with invented observers, and the screens say so.',
    stack: stackOf(koriStack),
    stackGroups: koriStack,
    tags: ['mobile'],
    repository: 'https://github.com/MooketsiMagwaza/kori',
    featured: true,
    frame: 'bare',
    theme: { from: '#0b3a52', to: '#146c2e', glow: '#9fe3c4' },
    shots: [
      { file: 'landing', alt: 'The Kori landing page: wildlife sightings that keep working where the signal ends, with a phone showing the offline map and a note that the reserve is invented', caption: 'The landing page (sample reserve)', w: 1420, h: 999 },
      { file: 'review', alt: 'The Kori review console: a queue of four sightings waiting for a reviewer, with an African elephant sighting open on a map as a one kilometre square', caption: 'The review queue: nothing is public until approved (sample data)', w: 1420, h: 999 },
      { file: 'phones', alt: 'Three phone screens of the Kori field app in iPhone frames: the home screen, the map drawn from a downloaded park pack, and the form for logging a sighting', caption: 'Field app: home, offline map, logging a sighting (sample reserve)', w: 1400, h: 1041 },
    ],
  },
  {
    slug: 'tagwise',
    name: 'Tagwise',
    filename: 'Tagwise.app',
    kind: 'Asset and stock register',
    kicker: 'One shared register for assets and stock',
    summary:
      'A shared register for an organisation’s assets and stock. Put a QR label on each thing, import the spreadsheet you already have, count a site with several people at once, and see every site on a map.',
    story:
      'Tagwise is a shared register for the assets and stock that schools, clinics, offices and stores often keep in a spreadsheet. Each thing gets a QR label that opens its page when a phone scans it, with who has it, where it is and what has happened to it. The spreadsheet you already have comes in through an Excel and CSV import that checks every row before anything is saved. A stock-take can be run by several people at once, and every site shows on a map.',
    evidence:
      'The app is a React and TypeScript single-page app built with Vite. It has a register table with saved views, filters and columns; asset and stock pages with comments and history; QR labels, as A4 sheets or one at a time; scanning by typed code, handheld scanner or camera; the import wizard; live stock-takes; and a sites map drawn with MapLibre. The backend is a Rust workspace of five services, identity, register, notifications, media and ops, built on Axum and sitting behind an nginx gateway, each with its own PostgreSQL database, plus Redis. Prometheus, Grafana, Tempo and an OpenTelemetry collector make up the monitoring stack, and a Fumadocs site publishes the docs and the API reference. The whole stack is defined in Docker Compose files and has been started: the database, Redis, the five services with their migrations, the docs site, the web container and the gateway all reported healthy. GitHub Actions runs the tests, including the register service’s against PostgreSQL. The backend is built and tested, but the app does not call it yet. The data in the app is a fictional sample workspace, a trust with invented people and figures, and the app says so on screen.',
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
    ],
  },
  {
    slug: 'zenith',
    name: 'Zenith',
    filename: 'Zenith.app',
    kind: 'Focus workspace',
    kicker: 'Time tracking with intention',
    summary:
      'A deliberate-practice timer, a deck and card workspace, a markdown journal, and a full-screen Zen mode, all running in your browser.',
    story:
      'Most productivity apps are built to capture tasks or to bill time. Zenith is built for attention: pick one thing, put time into it, and write down what happened. There are no streaks, no XP bars, and no nags.',
    evidence:
      'It is local-first: data lives in the browser, every delete can be undone, and each card and deck has exactly one journal. There is no server and no account: everything stays in the browser. The README is the full specification, down to every key and storage name. It is open source under the MIT licence.',
    stack: ['React', 'TypeScript', 'TanStack', 'Tailwind CSS'],
    tags: ['web'],
    repository: 'https://github.com/MooketsiMagwaza/Zenith',
    featured: true,
    frame: 'bare',
    theme: { from: '#0a0a0a', to: '#3a2f12', glow: '#c9a84c' },
    shots: [
      { file: 'decks', alt: 'Zenith’s decks view: a deck called Academics with three timed cards for a study session, a lab, and practice', caption: 'Decks and cards, each with its own timer', w: 1420, h: 919 },
      { file: 'journal', alt: 'Zenith’s markdown journal, one document per card or deck', caption: 'One journal per card or deck', w: 1420, h: 919 },
      { file: 'history', alt: 'Zenith’s history view of past focus sessions', caption: 'History of what you put time into', w: 1420, h: 919 },
      { file: 'zen', alt: 'Zenith’s full-screen Zen mode, with almost nothing on screen', caption: 'Zen mode removes everything else', w: 1420, h: 919 },
    ],
  },
  {
    slug: 'university-cs-docs',
    name: 'University CS Docs',
    filename: 'University CS Docs.webloc',
    kind: 'Study hub',
    kicker: 'Notes, code & quizzes for University of Botswana CS',
    summary:
      'A deployed, open-source learning platform for University of Botswana computer-science courses.',
    story:
      'Notes, code, and quizzes for computer science courses at the University of Botswana, with a focus timer for study sessions. It is open, and built to be contributed to.',
    evidence:
      'A live site backed by CI, CodeQL analysis, dependency review, project governance, a documented contributor path, and reusable interactive MDX components.',
    stack: ['Next.js', 'MDX', 'CI', 'CodeQL'],
    tags: ['docs', 'web'],
    repository: 'https://github.com/MooketsiMagwaza/university-cs-docs',
    featured: false,
    frame: 'browser',
    theme: { from: '#06241c', to: '#0f7a55', glow: '#5eead4' },
    mark: 'CS',
    shots: [
      { file: 'home', alt: 'The University CS Docs home page with course cards for data structures, discrete maths, functional programming and calculus', caption: 'Home', w: 1440, h: 900 },
      { file: 'course', alt: 'The CSI247 Data Structures course overview with a study sequence', caption: 'A course overview', w: 1440, h: 900 },
      { file: 'semester', alt: 'The Semester III overview listing core courses and an elective', caption: 'Semester overview', w: 1440, h: 900 },
      { file: 'focus-timer', alt: 'The Pomodoro focus timer page', caption: 'Focus timer', w: 1440, h: 900 },
    ],
  },
];

export const featuredProjects = projects.filter((project) => project.featured);
