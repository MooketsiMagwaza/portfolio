export type ProjectTag = 'web' | 'systems' | 'mobile' | 'docs';

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
  /** Sprite id of the cover illustration (see ArtSprites.astro). */
  art: string;
};

export const tagLabels: Record<ProjectTag, string> = {
  web: 'Web',
  systems: 'Systems',
  mobile: 'Mobile',
  docs: 'Docs',
};

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
    art: 'tsela',
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
      'Stock moves through a warehouse faster when every team can see the same clear picture. StockLink explores that shared operational view.',
    evidence:
      'Four Rust and Axum services own separate PostgreSQL databases behind an nginx gateway, with Redis-backed controls, a React interface, and generated Fumadocs documentation.',
    next: 'Harden event delivery and complete a reproducible deployment path before calling the system production-ready.',
    stack: ['Rust', 'Axum', 'PostgreSQL', 'Redis', 'React'],
    tags: ['systems', 'web'],
    repository: 'https://github.com/MooketsiMagwaza/stocklink',
    featured: true,
    art: 'stocklink',
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
    art: 'obsidian',
  },
  {
    slug: 'university-cs-docs',
    name: 'University CS Docs',
    filename: 'University CS Docs.webloc',
    kind: 'Open learning resource',
    kicker: 'An open learning resource with a path for contributors',
    summary:
      'An open learning resource with a live site, continuous integration, and a clear way to contribute.',
    story:
      'An open learning resource built with the habits that keep open projects healthy: automated checks, dependency review, governance, and a clear contributor path.',
    evidence:
      'A live site, CI, CodeQL analysis, dependency review, project governance, and a documented contributor path.',
    stack: ['CI', 'CodeQL', 'Dependency review'],
    tags: ['docs', 'web'],
    repository: 'https://github.com/MooketsiMagwaza/university-cs-docs',
    featured: false,
    art: 'docs',
  },
  {
    slug: 'glasshid',
    name: 'GlassHID',
    filename: 'GlassHID.apk',
    kind: 'Android utility',
    kicker: 'An offline Android utility for Bluetooth HID and USB/ADB',
    summary:
      'An offline Android Bluetooth HID and USB/ADB utility, presented honestly while CI and compatibility evidence are expanded.',
    story:
      'A small, offline Android utility that works over Bluetooth HID and USB/ADB. It is presented honestly: the compatibility and CI evidence is still being expanded.',
    evidence: 'An offline Android utility covering Bluetooth HID and USB/ADB.',
    next: 'Expand CI and device-compatibility evidence.',
    stack: ['Android', 'Bluetooth HID', 'USB/ADB'],
    tags: ['mobile'],
    repository: 'https://github.com/MooketsiMagwaza/GlassHID',
    featured: false,
    art: 'glasshid',
  },
];

export const featuredProjects = projects.filter((project) => project.featured);
