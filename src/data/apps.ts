export type AppId = 'finder' | 'contacts' | 'notes' | 'terminal' | 'mail' | 'about';

export type App = {
  id: AppId;
  /** Shown in the menu bar while the app is frontmost. */
  name: string;
  /** What the window is actually for. */
  title: string;
  blurb: string;
  /** Sprite id suffix: `#app-${icon}`. */
  icon: string;
  keywords: string[];
  dock: boolean;
};

export const apps: App[] = [
  {
    id: 'finder',
    name: 'Finder',
    title: 'Projects',
    blurb: 'Browse everything I’ve built',
    icon: 'finder',
    keywords: ['work', 'gallery', 'portfolio', 'projects', 'files'],
    dock: true,
  },
  {
    id: 'contacts',
    name: 'Contacts',
    title: 'About me',
    blurb: 'Who I am and how to reach me',
    icon: 'contacts',
    keywords: ['about', 'bio', 'me', 'profile', 'who'],
    dock: true,
  },
  {
    id: 'notes',
    name: 'Notes',
    title: 'How I work',
    blurb: 'The principles behind the projects',
    icon: 'notes',
    keywords: ['approach', 'principles', 'process', 'philosophy'],
    dock: true,
  },
  {
    id: 'terminal',
    name: 'Terminal',
    title: 'Terminal',
    blurb: 'Poke around from the command line',
    icon: 'terminal',
    keywords: ['shell', 'cli', 'command', 'zsh'],
    dock: true,
  },
  {
    id: 'mail',
    name: 'Mail',
    title: 'Get in touch',
    blurb: 'Start a conversation',
    icon: 'mail',
    keywords: ['contact', 'email', 'hire', 'message', 'hello'],
    dock: true,
  },
  {
    id: 'about',
    name: 'System Information',
    title: 'About This Mac',
    blurb: 'Stack, specs, and credits',
    icon: 'logo',
    keywords: ['stack', 'skills', 'tech', 'credits', 'inspiration', 'specs'],
    dock: false,
  },
];

export const appById = (id: AppId): App => {
  const app = apps.find((entry) => entry.id === id);
  if (!app) throw new Error(`Unknown app: ${id}`);
  return app;
};
