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
  headline: 'Full-stack engineer building complete products from interface to infrastructure.',
  intro:
    'I design and ship working software across product UI, backend APIs, databases, native integrations, CI/CD, and observability. Recent work includes offline geospatial software, pharmacy inventory and expiry workflows, Windows productivity tools, and interactive computer-science courses.',
  focus: ['Product systems', 'Backend engineering', 'Platform delivery'],
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
      slug: 'tagwise',
      note: 'Tagwise starts from a pharmacy workflow: track batches, bulk stock, and expiry dates without buying a desktop POS subscription and separate add-ons.',
    },
  },
  {
    title: 'Make the edges obvious.',
    body: 'Clear ownership for data, services, permissions, and failures keeps a growing system understandable.',
    points: ['Data', 'Services', 'Permissions', 'Failures'],
    example: {
      slug: 'opaline',
      note: 'Opaline reads the Windows Desktop but never moves, renames, or deletes its files; its panes and preferences live in separate local metadata.',
    },
  },
  {
    title: 'Show the receipts.',
    body: 'Tests, traces, screenshots, and runbooks make the work easier to trust—and easier for the next person to continue.',
    points: ['Tests', 'Traces', 'Screenshots', 'Runbooks'],
    example: {
      slug: 'university-cs-docs',
      note: 'CI, CodeQL analysis, and dependency review run on every change, and a documented contributor path sits next to the code.',
    },
  },
];

/** The "Technical toolkit" from the GitHub profile README. */
export const stackGroups: { label: string; items: string[] }[] = [
  { label: 'Languages', items: ['TypeScript', 'JavaScript', 'Rust', 'Python', 'SQL', 'Go', 'Java'] },
  { label: 'Frontend', items: ['React', 'Next.js', 'Vite', 'Responsive UI', 'Accessibility', 'IndexedDB'] },
  { label: 'Backend', items: ['Axum', 'FastAPI', 'REST APIs', 'Authentication', 'Background jobs'] },
  { label: 'Data', items: ['PostgreSQL', 'PostGIS', 'pgRouting', 'Redis', 'SQLAlchemy', 'sqlx', 'Alembic'] },
  { label: 'DevOps & observability', items: ['Docker', 'nginx', 'GitHub Actions', 'OpenTelemetry', 'Prometheus', 'Grafana', 'Tempo'] },
  { label: 'Native & geospatial', items: ['Tauri 2', 'Windows APIs', 'WebView2', 'MapLibre', 'PMTiles'] },
];

/** Where the desktop-in-a-browser idea comes from. */
export const inspiration = {
  name: 'Loago Moremi',
  url: 'https://loag0.github.io/',
  description: 'which lives inside a Windows XP desktop',
} as const;
