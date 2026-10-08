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

// Order is the order they are shown in: Zenith leads. (Tsela and StockLink are company assets and are no longer shown here.)
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
      'It is local-first: data lives in the browser, every delete can be undone, and each card and deck has exactly one journal. There is no server and no account: everything stays in the browser. The README is the full specification, down to every key and storage name.',
    stack: ['React', 'TypeScript', 'TanStack', 'Tailwind CSS'],
    tags: ['web'],
    repository: 'https://github.com/MooketsiMagwaza/Zenith',
    featured: true,
    frame: 'bare',
    theme: { from: '#0a0a0a', to: '#3a2f12', glow: '#c9a84c' },
  },
  {
    slug: 'orb-view',
    name: 'Orb View',
    filename: 'Orb View.app',
    kind: 'Learning app',
    kicker: 'Explore how ideas connect',
    summary:
      'A visual learning library and concept map: browse ideas by subject, follow guided learning paths, or move through an open graph of connected concepts.',
    story:
      'I wanted to see how ideas connect instead of reading them as a list. Orb View lets you browse a library, open a concept to see its layers and prerequisites, or wander the map one connection at a time.',
    evidence:
      'The library holds hundreds of concepts as validated JSON, with checks for data, links, and learning paths. A separate documentation site publishes the whole library, and the app also builds as a Tauri 2 desktop app. It is deployed on the web.',
    stack: ['React', 'TypeScript', 'Vite', 'Tauri 2'],
    tags: ['web', 'docs'],
    repository: 'https://github.com/MooketsiMagwaza/orb-view',
    featured: true,
    frame: 'bare',
    theme: { from: '#0a1a33', to: '#1f5fbf', glow: '#8fd3ff' },
    mark: 'OV',
  },
  {
    slug: 'tagwise',
    name: 'Tagwise',
    filename: 'Tagwise.app',
    kind: 'Asset and stock register',
    kicker: 'One shared register for assets and stock',
    summary:
      'A shared register for an organisation’s assets and stock, being built to scan QR codes and barcodes in the browser, import and export Excel and CSV, and let several people run a stock-take together.',
    story:
      'Tagwise is being built now, so this page says what it is aiming at, not what it already does. The aim is one shared register of an organisation’s assets and stock. People would scan QR codes and barcodes in the browser, bring in and send out Excel and CSV files, and run a stock-take with several people at once. Sites would show on a map, and a shared workspace, like Notion, would hold the notes.',
    evidence: 'Nothing to show yet. It is being built now and is not ready to try.',
    status: 'In development',
    stack: ['React', 'TypeScript', 'Vite'],
    tags: ['web'],
    // No `repository` while it is private: the Finder and Quick Look then show no link.
    featured: true,
    theme: { from: '#1a1033', to: '#5b3fd0', glow: '#c4b5fd' },
    mark: 'Tw',
  },
  {
    slug: 'kori',
    name: 'Kori',
    filename: 'Kori.app',
    kind: 'Safari and wildlife app',
    kicker: 'Offline-first wildlife sightings for Botswana',
    summary:
      'An offline-first safari and wildlife app for Botswana, being built around reviewed sightings, offline park maps, and guidance to a sighting along existing roads and tracks.',
    story:
      'Kori is being built now, so this page says what it is aiming at, not what it already does. It is named after the kori bustard, kgori in Setswana, Botswana’s national bird. The aim is a safari app that keeps working without signal. Wildlife sightings would be reviewed in a queue, and a public API would need a key. Parks would have maps that work offline, and a track map would be built from GPS traces that people choose to share. Sightings could be passed on by QR code when there is no signal, and the app would guide you to a sighting along existing roads and tracks.',
    evidence: 'Nothing to show yet. The repository has only just been started.',
    status: 'In development',
    stack: [],
    tags: ['mobile'],
    // No `repository` while it is private. `stack` stays empty until the repository settles it.
    featured: true,
    theme: { from: '#2b140a', to: '#a5471c', glow: '#ffb98a' },
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
  },
  {
    slug: 'glasshid',
    name: 'GlassHID',
    filename: 'GlassHID.apk',
    kind: 'Android utility',
    kicker: 'A phone that is a keyboard, trackpad, remote, and gamepad',
    summary:
      'Turns an Android phone into a local-only Bluetooth keyboard, trackpad, media remote, and gamepad using native HID APIs.',
    story:
      'A small, local-only Android utility that turns a phone into the input devices you need, over Bluetooth HID or USB/ADB. It is presented honestly: the CI and compatibility evidence is still being expanded.',
    evidence: 'An offline Android utility covering Bluetooth HID and USB/ADB.',
    next: 'Expand CI and device-compatibility evidence.',
    stack: ['Android', 'Bluetooth HID', 'USB/ADB'],
    tags: ['mobile'],
    repository: 'https://github.com/MooketsiMagwaza/GlassHID',
    featured: false,
    frame: 'phone',
    theme: { from: '#051c25', to: '#0c7d96', glow: '#22d3ee' },
    mark: 'GH',
  },
];

export const featuredProjects = projects.filter((project) => project.featured);
