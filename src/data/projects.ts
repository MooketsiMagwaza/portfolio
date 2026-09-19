export type Project = {
  slug: string;
  name: string;
  kicker: string;
  summary: string;
  evidence: string;
  next: string;
  stack: string[];
  repository: string;
  featured: boolean;
};

export const projects: Project[] = [
  {
    slug: 'tsela',
    name: 'Tsela',
    kicker: 'Public transport, mapped for how people actually move',
    summary:
      'A multi-surface transit platform for riders, operators, developers, and route contributors in Botswana.',
    evidence:
      'The repository combines a FastAPI service, PostGIS and pgRouting, OR-Tools, multiple Next.js applications, Docker development, observability scaffolding, route documentation, and real product screens.',
    next:
      'Validate the remaining launch controls against a production-like environment and expand verified route coverage.',
    stack: ['FastAPI', 'PostGIS', 'Next.js', 'OR-Tools', 'Prometheus'],
    repository: 'https://github.com/MooketsiMagwaza/transit-route-optimization',
    featured: true,
  },
  {
    slug: 'stocklink',
    name: 'StockLink',
    kicker: 'Warehouse operations across clear service boundaries',
    summary:
      'A logistics platform exploring service-owned data, authentication controls, and a practical warehouse workflow.',
    evidence:
      'Four Rust and Axum services own separate PostgreSQL databases behind an nginx gateway, with Redis-backed controls, a React interface, and generated Fumadocs documentation.',
    next:
      'Harden event delivery and complete a reproducible deployment path before calling the system production-ready.',
    stack: ['Rust', 'Axum', 'PostgreSQL', 'Redis', 'React'],
    repository: 'https://github.com/MooketsiMagwaza/stocklink',
    featured: true,
  },
  {
    slug: 'obsidian-sync',
    name: 'Obsidian Sync for iOS',
    kicker: 'A real synchronization engine behind a native interface',
    summary:
      'An iPad-focused prototype that integrates Syncthing with Swift and a carefully documented Go boundary.',
    evidence:
      'Physical-device tests demonstrated bidirectional transfer and deletion propagation. The project includes simulator tests, integration coverage, CI, security guidance, and third-party notices.',
    next:
      'Turn the tested development build into a repeatable, signed release without hiding the constraints of iOS background execution.',
    stack: ['Swift', 'Go', 'Syncthing', 'XCTest', 'GitHub Actions'],
    repository: 'https://github.com/MooketsiMagwaza/obsidian-sync-ios',
    featured: true,
  },
];

export const supportingProjects = [
  {
    name: 'University CS Docs',
    description:
      'An open learning resource with a live site, CI, CodeQL, dependency review, governance, and a contributor path.',
    href: 'https://github.com/MooketsiMagwaza/university-cs-docs',
  },
  {
    name: 'GlassHID',
    description:
      'An offline Android Bluetooth HID and USB/ADB utility, presented honestly while CI and compatibility evidence are expanded.',
    href: 'https://github.com/MooketsiMagwaza/GlassHID',
  },
];
