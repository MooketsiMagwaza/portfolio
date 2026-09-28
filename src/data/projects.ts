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

export const projects: Project[] = [
  {
    slug: 'tsela',
    name: 'Tsela',
    filename: 'Tsela.app',
    kind: 'Transit platform',
    kicker: 'Gaborone transit, made searchable',
    summary:
      'A multi-surface transit platform for riders, operators, developers, and route contributors in Botswana.',
    story:
      'Tsela turns Gaborone’s informal combi knowledge into a route-planning platform. A rider can choose an origin and destination, compare road-following routes, see where to board, and understand where to get off.',
    evidence:
      'FastAPI owns the HTTP API; PostgreSQL, PostGIS, and pgRouting own spatial data and road-aligned routing; OR-Tools supports optimization. Five product surfaces share one platform, with Prometheus, Grafana, Tempo, and OpenTelemetry giving an observable path through it.',
    next: 'Check the route data against real Gaborone roads and what riders actually know, and move sign-in and ops controls from local demos to something ready to launch.',
    stack: ['FastAPI', 'PostGIS', 'pgRouting', 'Next.js', 'OR-Tools', 'Prometheus'],
    tags: ['web', 'systems'],
    repository: 'https://github.com/MooketsiMagwaza/transit-route-optimization',
    featured: true,
    frame: 'browser',
    theme: { from: '#0a1f44', to: '#0e5a94', glow: '#2dd4bf' },
    shots: [
      { file: 'rider-routes', alt: 'The Tsela rider app in a Mac window: every mapped route in Gaborone, with search and a route list', caption: 'Rider app: explore every route', w: 1280, h: 949, frame: 'bare' },
      { file: 'home', alt: 'Tsela’s marketing site: “Know which combi gets you there”, with a route preview map', caption: 'Marketing site', w: 1440, h: 960 },
      { file: 'admin', alt: 'Tsela’s admin console dashboard showing capacity and reliability figures', caption: 'Admin console', w: 1440, h: 960 },
      { file: 'route', alt: 'A route detail page in the admin console, with stops and a street map', caption: 'Route detail and map', w: 1440, h: 960 },
    ],
  },
  {
    slug: 'stocklink',
    name: 'StockLink',
    filename: 'StockLink.app',
    kind: 'Logistics platform',
    kicker: 'Wholesale stock, from warehouse to shop door',
    summary:
      'A logistics platform where shops order from many warehouses in one cart, and every parcel can be followed from the warehouse door to the shop.',
    story:
      'Small shops often buy from several warehouses and then wait on deliveries they can’t see. StockLink puts all of that in one place: one cart across many warehouses, demand pooled into bulk orders, and every parcel followed to the shop.',
    evidence:
      'Five Rust (Axum) services, each with its own PostgreSQL database, sit behind one nginx gateway: identity, commerce, notifications, media, and ops. Redis handles the denylist and rate limits, and one React app covers warehouses, shops, drivers, and staff.',
    next: 'Bring the whole Docker stack up end to end for the first time, then finish event delivery (the outbox and Kafka publisher are not finished).',
    stack: ['Rust', 'Axum', 'PostgreSQL', 'Redis', 'React', 'nginx'],
    tags: ['systems', 'web'],
    repository: 'https://github.com/MooketsiMagwaza/stocklink',
    featured: true,
    frame: 'bare',
    theme: { from: '#1a1410', to: '#7a4a1e', glow: '#ffb020' },
    shots: [
      { file: 'store-order', alt: 'StockLink’s retail store view in dark mode, in a Mac window: an order in transit, with its delivery code, QR code, and live position', caption: 'A shop follows its order', w: 1280, h: 964 },
      { file: 'driver-phones', alt: 'The StockLink driver app in dark mode on two iPhones: collecting a parcel with the warehouse’s pickup code, then on the road with the handover form', caption: 'Driver app, built phone-first', w: 1100, h: 1229 },
      { file: 'public-tracking', alt: 'The public tracking page in dark mode, in a Mac window: a parcel’s journey and rounded position, no account needed', caption: 'Public tracking, no account needed', w: 760, h: 765 },
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
