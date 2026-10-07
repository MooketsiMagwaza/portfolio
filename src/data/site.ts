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
      slug: 'zenith',
      note: 'Zenith starts from how focused work actually goes: pick one thing, put time into it, and write down what happened.',
    },
  },
  {
    title: 'Make the edges obvious.',
    body: 'Clear ownership for data, services, permissions, and failures keeps a growing system understandable.',
    points: ['Data', 'Services', 'Permissions', 'Failures'],
    example: {
      slug: 'orb-view',
      note: 'The concept data is validated JSON with its own link and path checks, kept separate from the app that shows it.',
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

/** The "Technical toolkit" from the GitHub profile README. */
export const stackGroups: { label: string; items: string[] }[] = [
  { label: 'Backend', items: ['Rust', 'Axum', 'Python', 'FastAPI', 'Go', 'Java', 'REST APIs'] },
  { label: 'Web', items: ['TypeScript', 'React', 'Next.js', 'Vite', 'Accessible responsive UI'] },
  { label: 'Data', items: ['PostgreSQL', 'PostGIS', 'pgRouting', 'Redis', 'SQLAlchemy', 'sqlx', 'Alembic'] },
  { label: 'Operations', items: ['Docker', 'nginx', 'GitHub Actions', 'Prometheus', 'Grafana', 'Tempo', 'OpenTelemetry'] },
  { label: 'Native', items: ['Swift', 'SwiftUI', 'Android platform APIs', 'Bluetooth HID'] },
];

/** Where the desktop-in-a-browser idea comes from. */
export const inspiration = {
  name: 'Loago Moremi',
  url: 'https://loag0.github.io/',
  description: 'which lives inside a Windows XP desktop',
} as const;
