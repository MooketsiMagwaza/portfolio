export type ProjectTag = 'web' | 'systems' | 'mobile' | 'docs';

/** How a project's screenshots are presented: a browser window, a tablet, or a landscape phone. */
export type Frame = 'browser' | 'tablet' | 'phone';

export type Shot = {
  /** File name (without extension) inside public/images/projects/<slug>/. */
  file: string;
  alt: string;
  caption: string;
  /** Pixel size of the optimised image, used to reserve space before it loads. */
  w: number;
  h: number;
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
  /** The longer, first-person story behind the project. */
  story: string;
  evidence: string;
  next?: string;
  stack: string[];
  tags: ProjectTag[];
  repository: string;
  featured: boolean;
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

export const shotUrl = (project: Project, shot: Shot): string => asset(`images/projects/${project.slug}/${shot.file}.webp`);
export const coverThumbUrl = (project: Project): string => asset(`images/projects/${project.slug}/${project.shots[0].file}-sm.webp`);

/**
 * Aspect ratio of a framed screenshot (frame included), so layout is stable before the image loads.
 * The constants mirror the frame proportions in apps.css.
 */
export function frameAspect(frame: Frame, shot: Shot): number {
  const { w, h } = shot;
  if (frame === 'browser') return w / (h + w * 0.04);
  const pad = frame === 'tablet' ? 0.022 : 0.018;
  return (w + 2 * pad * w) / (h + 2 * pad * w);
}

export const projects: Project[] = [
  {
    slug: 'tsela',
    name: 'Tsela',
    filename: 'Tsela.app',
    kind: 'Transit platform',
    kicker: 'Public transport, mapped for how people actually move',
    summary:
      'A multi-surface transit platform for riders, operators, developers, and route contributors in Botswana.',
    story:
      'Getting around Gaborone shouldn’t require insider knowledge. Tsela brings routes, stops, directions, and community knowledge into one calm place.',
    evidence:
      'The repository combines a FastAPI service, PostGIS and pgRouting, OR-Tools, multiple Next.js applications, Docker development, observability scaffolding, route documentation, and real product screens.',
    next: 'Validate the remaining launch controls against a production-like environment and expand verified route coverage.',
    stack: ['FastAPI', 'PostGIS', 'Next.js', 'OR-Tools', 'Prometheus'],
    tags: ['web', 'systems'],
    repository: 'https://github.com/MooketsiMagwaza/transit-route-optimization',
    featured: true,
    frame: 'browser',
    theme: { from: '#0a1f44', to: '#0e5a94', glow: '#2dd4bf' },
    shots: [
      { file: 'home', alt: 'Tsela’s marketing site: “Know which combi gets you there”, with a route preview map', caption: 'Marketing site', w: 1440, h: 960 },
      { file: 'admin', alt: 'Tsela’s admin console dashboard showing capacity and reliability figures', caption: 'Admin console', w: 1440, h: 960 },
      { file: 'route', alt: 'A route detail page in the admin console, with stops and a street map', caption: 'Route detail and map', w: 1440, h: 960 },
      { file: 'rider', alt: 'The rider guide: “Know the route. Ride with context.”', caption: 'Rider guide', w: 1440, h: 960 },
    ],
  },
  {
    slug: 'stocklink',
    name: 'StockLink',
    filename: 'StockLink.app',
    kind: 'Logistics platform',
    kicker: 'Warehouse operations across clear service boundaries',
    summary:
      'A logistics platform exploring service-owned data, authentication controls, and a practical warehouse workflow.',
    story:
      'Stock moves through a warehouse faster when every team can see the same clear picture. StockLink connects warehouses to retail stores with consolidated bulk ordering and live parcel tracking.',
    evidence:
      'Four Rust and Axum services own separate PostgreSQL databases behind an nginx gateway, with Redis-backed controls, a React interface, and generated Fumadocs documentation.',
    next: 'Harden event delivery and complete a reproducible deployment path before calling the system production-ready.',
    stack: ['Rust', 'Axum', 'PostgreSQL', 'Redis', 'React'],
    tags: ['systems', 'web'],
    repository: 'https://github.com/MooketsiMagwaza/stocklink',
    featured: true,
    frame: 'browser',
    theme: { from: '#24140a', to: '#9a5410', glow: '#ffb020' },
    shots: [
      { file: 'marketplace', alt: 'StockLink’s marketplace, where stores browse stock from connected warehouses', caption: 'Marketplace (sample data)', w: 1280, h: 800 },
      { file: 'dashboard', alt: 'The warehouse dashboard, with charts and a table of recent orders', caption: 'Warehouse dashboard', w: 1280, h: 800 },
      { file: 'catalogue', alt: 'The catalogue, where a warehouse publishes and manages its stock', caption: 'Catalogue', w: 1280, h: 800 },
      { file: 'orders', alt: 'The warehouse orders table, with order status and payment state', caption: 'Orders', w: 1280, h: 800 },
    ],
  },
  {
    slug: 'obsidian-sync',
    name: 'Obsidian Sync for iOS',
    filename: 'Obsidian Sync.app',
    kind: 'iPadOS prototype',
    kicker: 'A real synchronization engine behind a native interface',
    summary:
      'An iPad-focused prototype that integrates Syncthing with Swift and a carefully documented Go boundary.',
    story:
      'I wanted notes to move between my devices without handing them to another cloud. This is the native iPad experiment that came from that.',
    evidence:
      'Physical-device tests demonstrated bidirectional transfer and deletion propagation. The project includes simulator tests, integration coverage, CI, security guidance, and third-party notices.',
    next: 'Turn the tested development build into a repeatable, signed release without hiding the constraints of iOS background execution.',
    stack: ['Swift', 'Go', 'Syncthing', 'XCTest', 'GitHub Actions'],
    tags: ['mobile', 'systems'],
    repository: 'https://github.com/MooketsiMagwaza/obsidian-sync-ios',
    featured: true,
    frame: 'tablet',
    theme: { from: '#150b28', to: '#4a2590', glow: '#a78bfa' },
    shots: [
      { file: 'session', alt: 'Vault Sync on an iPad, mid-way through a sync session', caption: 'A sync session in progress', w: 1080, h: 751 },
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
      'An open, interactive Computer Science study hub for University of Botswana courses, live on the web.',
    story:
      'Notes, code, and quizzes for computer science courses at the University of Botswana, with a focus timer for study sessions. It is open, and built to be contributed to.',
    evidence:
      'A live site, CI, CodeQL analysis, dependency review, project governance, and a documented contributor path.',
    stack: ['Next.js', 'CI', 'CodeQL', 'Dependency review'],
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
    kicker: 'An Android phone as a Bluetooth keyboard, trackpad, and gamepad',
    summary:
      'Turn an Android phone into an offline Bluetooth keyboard, trackpad, media remote, and gamepad.',
    story:
      'A phone that doubles as your input devices over Bluetooth HID or USB/ADB, fully offline. It is presented honestly: the CI and compatibility evidence is still being expanded.',
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
