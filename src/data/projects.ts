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

// Order is the order they are shown in: StockLink leads.
export const projects: Project[] = [
  {
    slug: 'stocklink',
    name: 'StockLink',
    kicker: 'Wholesale stock, from warehouse to shop door',
    summary:
      'Connects warehouses, shops and delivery drivers, with bulk orders, handover codes and public parcel tracking.',
    evidence:
      'Five Rust services, each with its own PostgreSQL database, sit behind one gateway. One React app works for warehouses, shops, drivers and staff, in light and dark, and there’s an admin console for staff next to Prometheus and Grafana. Every page has a screenshot from a sample-data preview, and the repo says plainly what hasn’t been run yet.',
    next:
      'Get the whole stack running on Docker for the first time, try the newest migrations on a real PostgreSQL, and finish event delivery before I call it production-ready.',
    stack: ['Rust', 'Axum', 'PostgreSQL', 'Redis', 'React'],
    repository: 'https://github.com/MooketsiMagwaza/stocklink',
    featured: true,
  },
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
