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

// Order is the order they are shown in: Zenith leads, then Kori, Tagwise and University CS Docs. (Tsela and StockLink are company assets and are no longer shown here.)
//
// Adding a project is a data change: add an entry here and the Finder, Quick Look, Spotlight and the
// Terminal all pick it up. Leave out `repository` while a repository is private and `shots` until there
// are screenshots; use `stack: []` while the stack is not settled; set `status` for unfinished work.
export const projects: Project[] = [
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
    slug: 'kori',
    name: 'Kori',
    filename: 'Kori.app',
    kind: 'Safari and wildlife app',
    kicker: 'Offline-first wildlife sightings for Botswana',
    summary:
      'A prototype of an offline-first safari and wildlife app for Botswana: log a sighting with no signal, download a park map before the trip, and have a reviewer approve sightings before anyone else sees them. It runs on a fictional sample reserve.',
    story:
      'Kori is an early prototype, so this page says what has been built and what has not. It is named after the kori bustard, kgori in Setswana, Botswana’s national bird. The idea is a safari app that keeps working without signal. You log a sighting on your phone and it waits there until a connection returns, and a reviewer approves it before anyone else sees it. Park maps are downloaded before the trip, so the map and your position still work with no signal. Guidance to a sighting follows known roads and tracks only, and a sighting can be passed from phone to phone with a QR code. Kori never shows a live animal location: other people see a sighting only after review, at least an hour later, and only as a 1 km area. Sensitive species, rhino and pangolin in the prototype, are shown more coarsely and later, and are never guided to or shared.',
    evidence:
      'Four web apps run in the browser on a fictional sample reserve: a phone-first field app, a landing page, a review console and API docs. In the field app you can log a sighting into the phone’s own storage, download the sample park pack and see it drawn with no map tiles, and be routed along tracks; I clicked through each of those in a browser. Behind the apps is a Python backend (FastAPI and PostGIS) with migrations and tests that pass, and in CI its database and API start and report healthy. The apps do not call that backend yet, and its monitoring and backups are configured but have not been run. It has not been tried on a real phone, so the service worker, live GPS, camera scanning and trip recording are untested. Nothing is deployed. The reserve and every sighting that is not your own are invented, and the screens say so.',
    next: 'Connect the web apps to the backend, try the offline features on a real phone, and deploy.',
    status: 'In development',
    stack: ['Next.js', 'TypeScript', 'MapLibre', 'Python', 'FastAPI', 'PostGIS'],
    tags: ['mobile'],
    // No `repository` while it is private: the Finder and Quick Look then show no link.
    featured: true,
    frame: 'bare',
    theme: { from: '#2b140a', to: '#a5471c', glow: '#ffb98a' },
    shots: [
      { file: 'landing', alt: 'The Kori landing page: wildlife sightings that keep working where the signal ends, with a phone showing the offline map and a note that the reserve is invented', caption: 'The landing page (sample reserve)', w: 1420, h: 999 },
      { file: 'review', alt: 'The Kori review console: a queue of four sightings waiting for a reviewer, with an African elephant sighting open on a map as a one kilometre square', caption: 'The review queue: nothing is shown to anyone until it is approved (sample data)', w: 1420, h: 999 },
      { file: 'phones', alt: 'Three phone screens of the Kori field app in iPhone frames: the home screen, the map drawn from a downloaded park pack, and the form for logging a sighting', caption: 'The field app on a phone: home, the offline map from a downloaded pack, and logging a sighting (sample reserve)', w: 1400, h: 1041 },
    ],
  },
  {
    slug: 'tagwise',
    name: 'Tagwise',
    filename: 'Tagwise.app',
    kind: 'Asset and stock register',
    kicker: 'One shared register for assets and stock',
    summary:
      'A shared register for an organisation’s assets and stock, with QR labels, an Excel and CSV import wizard, stock-takes and a map of sites. A browser prototype on a sample workspace.',
    story:
      'Tagwise is an early prototype, so this page says what has been built and what has not. It is a shared register for the assets and stock that schools, clinics, offices and stores often keep in a spreadsheet. The idea is to put a QR label on each thing and scan it with any phone, bring in the spreadsheet you already have, count a site with several people at once, and see every site on a map. The prototype runs on a sample workspace, a fictional trust whose people and figures are all invented, and the app says so on screen.',
    evidence:
      'The prototype runs entirely in the browser, and its data stays in that browser. It has a register table with saved views, filters and columns; asset pages with comments and history; QR labels; scanning by typed code or handheld scanner; an Excel and CSV import wizard that checks every row and reports the problems; stock-takes; and a sites map. Camera scanning is built but not yet tested on a real phone, and the labels have not been printed and scanned from paper. Behind it is a Rust backend (Axum services, PostgreSQL and a register service, with Docker and observability configuration) whose tests run in CI, and a documentation site. The backend has not been run as a whole stack and the app does not use it yet, so there is no sign-in and nothing is shared between devices. Nothing is deployed.',
    next: 'Connect the app to the backend, try scanning and label printing on a real phone and printer, and deploy.',
    status: 'In development',
    stack: ['React', 'TypeScript', 'Vite', 'Rust', 'PostgreSQL'],
    tags: ['web'],
    // No `repository` while it is private: the Finder and Quick Look then show no link.
    featured: true,
    frame: 'bare',
    theme: { from: '#1a1033', to: '#5b3fd0', glow: '#c4b5fd' },
    mark: 'Tw',
    shots: [
      { file: 'home', alt: 'Tagwise’s home page in its sample workspace: what needs attention, a stock-take in progress and recent activity', caption: 'Home: what needs attention (sample workspace)', w: 1420, h: 999 },
      { file: 'register', alt: 'Tagwise’s register: a table of assets with saved views, filters and columns', caption: 'The register, with saved views and filters (sample data)', w: 1420, h: 999 },
      { file: 'asset', alt: 'A Tagwise asset page with its details, who has it, and a QR label ready to print', caption: 'An asset with its QR label (sample data)', w: 1420, h: 999 },
      { file: 'import', alt: 'Tagwise’s spreadsheet import, with the rows that have problems marked before anything is written', caption: 'Importing a spreadsheet: problems shown before anything is saved (sample data)', w: 1420, h: 999 },
      { file: 'sites', alt: 'Tagwise’s sites page: six places on a map of Botswana, with a list beside it', caption: 'Sites on a map (sample data)', w: 1420, h: 999 },
      { file: 'phone', alt: 'Tagwise’s home page on a phone, in an iPhone frame', caption: 'The same app on a phone (sample workspace)', w: 600, h: 1293 },
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
