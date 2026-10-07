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
  stack: string[];
  tags: ProjectTag[];
  repository: string;
  featured: boolean;
  /** The default frame for this project's screenshots. */
  frame: Frame;
  /** Colours behind the screenshots: a gradient and a soft highlight. */
  theme: { from: string; to: string; glow: string };
  /** Real screenshots; the first one is the cover. */
  shots: [Shot, ...Shot[]];
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

export const shotFrame = (project: Project, shot: Shot): Frame => shot.frame ?? project.frame;
export const shotUrl = (project: Project, shot: Shot): string => asset(`images/projects/${project.slug}/${shot.file}.webp`);
export const coverThumbUrl = (project: Project): string => asset(`images/projects/${project.slug}/${project.shots[0].file}-sm.webp`);

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
      'It is local-first: data lives in the browser, every delete can be undone, and each card and deck has exactly one journal. Optional accounts add sync across devices. The README is the full specification, down to every key and storage name.',
    stack: ['React', 'TypeScript', 'TanStack', 'Tailwind CSS', 'Supabase'],
    tags: ['web'],
    repository: 'https://github.com/MooketsiMagwaza/Zenith',
    featured: true,
    frame: 'browser',
    theme: { from: '#0a0a0a', to: '#3a2f12', glow: '#c9a84c' },
    shots: [
      { file: 'decks', alt: 'Zenith’s decks view: a deck called Academics with three timed cards for a study session, a lab, and practice', caption: 'Decks and cards, each with its own timer', w: 1536, h: 864 },
      { file: 'journal', alt: 'Zenith’s markdown journal, one document per card or deck', caption: 'One journal per card or deck', w: 1536, h: 864 },
      { file: 'history', alt: 'Zenith’s history view of past focus sessions', caption: 'History of what you put time into', w: 1536, h: 864 },
      { file: 'zen', alt: 'Zenith’s full-screen Zen mode, with almost nothing on screen', caption: 'Zen mode removes everything else', w: 1536, h: 864 },
    ],
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
    frame: 'browser',
    theme: { from: '#0a1a33', to: '#1f5fbf', glow: '#8fd3ff' },
    shots: [
      { file: 'library', alt: 'The Orb View library: a search field, subject filters, and cards for Me and Engineering and Technology with their topics', caption: 'The library, by subject', w: 1440, h: 900 },
      { file: 'map', alt: 'The Orb View concept map: Entropy at the centre with eight connected ideas around it', caption: 'The concept map', w: 1440, h: 900 },
    ],
  },
  {
    slug: 'obsidian-sync',
    name: 'Obsidian Sync for iOS',
    filename: 'Obsidian Sync.app',
    kind: 'iPadOS prototype',
    kicker: 'Local-first vault synchronization',
    summary:
      'A free, open-source iPhone and iPad companion that joins an existing Syncthing cluster to sync an Obsidian vault, with no hosted account.',
    story:
      'I wanted notes to move between my devices without handing them to another cloud. This is the native iPad experiment that came from that: it joins an existing Syncthing cluster and synchronizes an Obsidian vault without a hosted account or proprietary sync service.',
    evidence:
      'Physical testing proved desktop-to-iPad and iPad-to-desktop transfers, including a deletion propagated back to the desktop. GitHub Actions cross-compiles the XCFramework, builds the iOS app, and runs the simulator suite.',
    next: 'Turn the tested development build into a repeatable, signed release without hiding the constraints of iOS background execution.',
    stack: ['Swift', 'SwiftUI', 'Go', 'Syncthing', 'GitHub Actions'],
    tags: ['mobile', 'systems'],
    repository: 'https://github.com/MooketsiMagwaza/obsidian-sync-ios',
    featured: true,
    frame: 'tablet',
    theme: { from: '#150b28', to: '#4a2590', glow: '#a78bfa' },
    shots: [
      { file: 'session', alt: 'Obsidian Sync transferring an established vault on a physical iPad', caption: 'A sync session in progress', w: 1080, h: 751 },
      { file: 'activity', alt: 'The recent activity list on iPad, showing files that were updated', caption: 'Recent activity', w: 1080, h: 751 },
      { file: 'vault', alt: 'An Obsidian vault, kept in sync, open on an iPad', caption: 'The synced vault in Obsidian', w: 1080, h: 751 },
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
    shots: [
      { file: 'home', alt: 'The University CS Docs home page with course cards for data structures, discrete maths, functional programming and calculus', caption: 'Home', w: 1440, h: 900 },
      { file: 'course', alt: 'The CSI247 Data Structures course overview with a study sequence', caption: 'A course overview', w: 1440, h: 900 },
      { file: 'semester', alt: 'The Semester III overview listing core courses and an elective', caption: 'Semester overview', w: 1440, h: 900 },
      { file: 'focus-timer', alt: 'The Pomodoro focus timer page', caption: 'Focus timer', w: 1440, h: 900 },
    ],
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
    shots: [
      { file: 'gamepad', alt: 'GlassHID’s gamepad layout on a phone in landscape', caption: 'Gamepad', w: 1600, h: 720 },
      { file: 'keyboard', alt: 'GlassHID’s full keyboard layout', caption: 'Keyboard', w: 1600, h: 720 },
      { file: 'trackpad', alt: 'GlassHID’s trackpad, docked on the left of the keyboard', caption: 'Trackpad', w: 1600, h: 720 },
      { file: 'system-controls', alt: 'The system controls panel with volume and brightness', caption: 'System controls', w: 1600, h: 720 },
    ],
  },
];

export const featuredProjects = projects.filter((project) => project.featured);
