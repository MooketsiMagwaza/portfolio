export const profile = {
  name: 'Mooketsi Vincent Magwaza',
  shortName: 'Mooketsi Magwaza',
  initials: 'MM',
  role: 'Full-stack engineer',
  location: 'Gaborone, Botswana',
  timeZone: 'Africa/Gaborone',
  email: 'mooketsimagwazajr@gmail.com',
  github: 'https://github.com/MooketsiMagwaza',
  githubHandle: 'MooketsiMagwaza',
  sourceRepo: 'https://github.com/MooketsiMagwaza/portfolio',
  headline: 'I make complicated software feel simple.',
  intro:
    'I’m Mooketsi. I turn messy, real-world problems into tools people can actually use—from the screen they tap to the systems working behind it.',
  focus: ['Product thinking', 'Systems engineering', 'Operational clarity'],
  invitation:
    'I’m always happy to talk about a thoughtful product, a stubborn systems problem, or work that genuinely helps people.',
} as const;

export type Principle = {
  title: string;
  body: string;
  points?: string[];
  /** A project that shows the principle at work. */
  example: { slug: string; note: string };
};

export const principles: Principle[] = [
  {
    title: 'Listen before building.',
    body: 'The best technical decision starts with understanding what someone is actually trying to get done.',
    example: {
      slug: 'tsela',
      note: 'Getting around Gaborone shouldn’t require insider knowledge, so Tsela starts from how people actually move.',
    },
  },
  {
    title: 'Make the edges obvious.',
    body: 'Clear ownership for data, services, permissions, and failures keeps a growing system understandable.',
    points: ['Data', 'Services', 'Permissions', 'Failures'],
    example: {
      slug: 'stocklink',
      note: 'Four services, each owning its own database, behind one gateway.',
    },
  },
  {
    title: 'Show the receipts.',
    body: 'Tests, traces, screenshots, and runbooks make the work easier to trust—and easier for the next person to continue.',
    points: ['Tests', 'Traces', 'Screenshots', 'Runbooks'],
    example: {
      slug: 'obsidian-sync',
      note: 'Physical-device tests, simulator tests, CI, and security guidance sit next to the code.',
    },
  },
];

/** Everything here is drawn from the projects' own stacks. */
export const stackGroups: { label: string; items: string[] }[] = [
  { label: 'Services', items: ['Rust', 'Axum', 'FastAPI', 'Go'] },
  { label: 'Web', items: ['React', 'Next.js'] },
  { label: 'Data & routing', items: ['PostgreSQL', 'PostGIS', 'pgRouting', 'Redis', 'OR-Tools'] },
  { label: 'Devices', items: ['Swift', 'Syncthing', 'Android', 'Bluetooth HID', 'USB/ADB'] },
  { label: 'Delivery & quality', items: ['Docker', 'nginx', 'Prometheus', 'GitHub Actions', 'CodeQL', 'XCTest'] },
];

/** Where the desktop-in-a-browser idea comes from. */
export const inspiration = {
  name: 'Loago Moremi',
  url: 'https://loag0.github.io/',
  description: 'which lives inside a Windows XP desktop',
} as const;
