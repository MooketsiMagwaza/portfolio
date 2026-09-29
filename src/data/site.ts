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
    title: 'Start with the user journey',
    body: 'Every project here starts from a concrete scenario, not a feature list: a rider trying to find the right combi, a shop tracking a delivery it can’t see, a note that needs to sync without handing it to another cloud. The system’s shape comes from that scenario, not from what’s convenient to build first.',
    example: {
      slug: 'tsela',
      note: 'Tsela’s routing starts from how people already navigate Gaborone by combi, not from a generic trip planner bolted onto a map.',
    },
  },
  {
    title: 'Give data and services explicit owners',
    body: 'When two parts of a system can both write the same data, or nobody’s sure which one owns a decision, that’s where bugs hide. StockLink is five Rust services — identity, commerce, notifications, media, ops — each with its own PostgreSQL database and its own auth checks, so ownership is never ambiguous.',
    points: ['Identity', 'Commerce', 'Notifications', 'Media', 'Ops'],
    example: {
      slug: 'stocklink',
      note: 'Five services, five databases, one gateway between them — no shared tables to fall out of sync.',
    },
  },
  {
    title: 'Treat auth, limits, and failure states as product work',
    body: 'Sign-in, validation, rate limits, and what happens when something breaks aren’t a cleanup pass at the end — they’re part of what the product actually promises. Privacy has to be part of the brief from day one, not bolted on after the feature works.',
    example: {
      slug: 'stocklink',
      note: 'A parcel can be tracked publicly with just a link, but its position is rounded to about 100 metres, and no names, addresses, or contents are ever shown.',
    },
  },
  {
    title: 'Say what’s verified and what isn’t',
    body: 'A demo that looks finished but hasn’t actually been tested is a liability, not a feature. Every project here separates what’s been verified — tests that run, screens that are real, transfers confirmed on a physical device — from what’s still scaffolding, so no one mistakes one for the other.',
    example: {
      slug: 'obsidian-sync',
      note: 'The README says plainly that it’s a foreground-only development build, and lists exactly what hasn’t been proven yet.',
    },
  },
  {
    title: 'Keep it small until the numbers say otherwise',
    body: 'It’s easy to build for a scale a project doesn’t have yet. I’d rather ship something small and understandable, and add infrastructure when there’s a measured reason to, not before.',
    example: {
      slug: 'glasshid',
      note: 'No account, no cloud, no server behind it — just Bluetooth HID and USB/ADB doing the one job it needs to do.',
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
