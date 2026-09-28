import { apps } from '@/data/apps';
import { coverThumbUrl, projects, type Project } from '@/data/projects';
import * as actions from './actions';
import { $$, appIcon, glyph, isTypingTarget, must } from './lib';

type Group = 'Projects' | 'Apps' | 'Actions';

type Entry = {
  group: Group;
  title: string;
  subtitle: string;
  keywords: string;
  icon: () => Element;
  run: () => void;
  suggested?: boolean;
};

const GROUPS: Group[] = ['Projects', 'Apps', 'Actions'];

let root: HTMLElement;
let input: HTMLInputElement;
let list: HTMLElement;
let index: Entry[] = [];
let shown: Entry[] = [];
let selected = 0;
let previousFocus: HTMLElement | null = null;

/** A small cover screenshot on the project's own colours, matching the gallery thumbnails. */
function coverBadge(project: Project): HTMLElement {
  const badge = document.createElement('span');
  badge.className = 'cover';
  badge.style.cssText = `--g1:${project.theme.from};--g2:${project.theme.to};--glow:${project.theme.glow}`;
  const img = document.createElement('img');
  img.src = coverThumbUrl(project);
  img.alt = '';
  img.decoding = 'async';
  badge.append(img);
  return badge;
}

function buildIndex(): Entry[] {
  const projectEntries: Entry[] = projects.map((project) => ({
    group: 'Projects',
    title: project.name,
    subtitle: `${project.kind} · ${project.stack.slice(0, 3).join(', ')}`,
    keywords: [project.filename, project.kicker, ...project.stack].join(' '),
    icon: () => coverBadge(project),
    run: () => actions.openProject(project.slug),
    suggested: project.featured,
  }));

  const appEntries: Entry[] = apps.map((app) => ({
    group: 'Apps',
    title: app.title,
    subtitle: `${app.name} · ${app.blurb}`,
    keywords: [app.name, ...app.keywords].join(' '),
    icon: () => appIcon(app.icon, 30),
    run: () => actions.openApp(app.id),
    suggested: ['contacts', 'terminal', 'mail'].includes(app.id),
  }));

  const actionEntries: Entry[] = [
    { title: 'Toggle dark mode', subtitle: 'Switch between light and dark appearance', keywords: 'theme appearance night light', icon: 'moon', run: actions.toggleTheme, suggested: true },
    { title: 'Copy email address', subtitle: 'Put it on your clipboard', keywords: 'contact mail', icon: 'copy', run: () => void actions.copyEmail() },
    { title: 'Send an email', subtitle: 'Opens your email app', keywords: 'contact hire message', icon: 'mail', run: actions.emailMe },
    { title: 'Open GitHub profile', subtitle: 'github.com/MooketsiMagwaza', keywords: 'code repos source', icon: 'code', run: actions.openGitHub },
    { title: 'Credits & inspiration', subtitle: 'Where the desktop idea came from', keywords: 'about loago moremi windows xp thanks', icon: 'note', run: actions.showCredits },
    { title: 'View this site’s source', subtitle: 'The portfolio repository on GitHub', keywords: 'code github repo', icon: 'code', run: actions.openSource },
  ].map((action) => ({
    group: 'Actions' as const,
    title: action.title,
    subtitle: action.subtitle,
    keywords: action.keywords,
    icon: () => glyph(action.icon, 30),
    run: action.run,
    suggested: 'suggested' in action ? action.suggested : false,
  }));

  return [...projectEntries, ...appEntries, ...actionEntries];
}

function search(query: string): Entry[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return index.filter((entry) => entry.suggested);

  const scored = index
    .map((entry) => {
      const title = entry.title.toLowerCase();
      const haystack = `${title} ${entry.subtitle} ${entry.keywords}`.toLowerCase();
      if (!words.every((word) => haystack.includes(word))) return null;
      const rank = title.startsWith(words[0] ?? '') ? 0 : title.includes(words[0] ?? '') ? 1 : 2;
      return { entry, rank };
    })
    .filter((hit): hit is { entry: Entry; rank: number } => hit !== null);

  scored.sort((a, b) => GROUPS.indexOf(a.entry.group) - GROUPS.indexOf(b.entry.group) || a.rank - b.rank);
  return scored.slice(0, 9).map((hit) => hit.entry);
}

function render(): void {
  shown = search(input.value.trim());
  selected = Math.min(selected, Math.max(0, shown.length - 1));
  list.replaceChildren();

  if (!shown.length) {
    const none = document.createElement('li');
    none.className = 'spotlight__none';
    none.setAttribute('role', 'presentation');
    none.textContent = `No results for “${input.value.trim()}”`;
    list.append(none);
    input.removeAttribute('aria-activedescendant');
    return;
  }

  let lastGroup: Group | null = null;
  shown.forEach((entry, position) => {
    if (entry.group !== lastGroup) {
      const heading = document.createElement('li');
      heading.className = 'spotlight__group';
      heading.setAttribute('role', 'presentation');
      heading.textContent = entry.group;
      list.append(heading);
      lastGroup = entry.group;
    }
    const row = document.createElement('li');
    row.className = 'spotlight__row';
    row.id = `sp-opt-${position}`;
    row.setAttribute('role', 'option');
    row.setAttribute('aria-selected', String(position === selected));

    const copy = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = entry.title;
    const subtitle = document.createElement('small');
    subtitle.textContent = entry.subtitle;
    copy.append(title, subtitle);
    row.append(entry.icon(), copy);

    row.addEventListener('pointermove', () => choose(position, false));
    row.addEventListener('click', () => run(position));
    list.append(row);
  });

  input.setAttribute('aria-activedescendant', `sp-opt-${selected}`);
}

function choose(position: number, scroll = true): void {
  if (position === selected || !shown[position]) return;
  selected = position;
  $$('.spotlight__row', list).forEach((row, i) => row.setAttribute('aria-selected', String(i === selected)));
  input.setAttribute('aria-activedescendant', `sp-opt-${selected}`);
  if (scroll) document.getElementById(`sp-opt-${selected}`)?.scrollIntoView({ block: 'nearest' });
}

function run(position: number): void {
  const entry = shown[position];
  if (!entry) return;
  closeSpotlight();
  entry.run();
}

export const isSpotlightOpen = (): boolean => !root.hidden;

export function openSpotlight(): void {
  if (!root.hidden) return;
  previousFocus = document.activeElement as HTMLElement | null;
  root.hidden = false;
  input.value = '';
  selected = 0;
  render();
  input.focus();
}

export function closeSpotlight(): void {
  if (root.hidden) return;
  root.hidden = true;
  previousFocus?.focus({ preventScroll: true });
  previousFocus = null;
}

export const toggleSpotlight = (): void => (root.hidden ? openSpotlight() : closeSpotlight());

export function initSpotlight(): void {
  root = must('[data-spotlight]');
  input = must<HTMLInputElement>('[data-spotlight-input]', root);
  list = must('[data-spotlight-results]', root);
  index = buildIndex();

  input.addEventListener('input', () => {
    selected = 0;
    render();
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      choose((selected + 1) % Math.max(1, shown.length));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      choose((selected - 1 + shown.length) % Math.max(1, shown.length));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      run(selected);
    }
  });

  root.addEventListener('click', (event) => {
    if ((event.target as HTMLElement).closest('[data-spotlight-close]')) closeSpotlight();
  });

  document.querySelectorAll('[data-spotlight-open]').forEach((el) => el.addEventListener('click', toggleSpotlight));

  document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      toggleSpotlight();
    } else if (event.key === 'Escape' && !root.hidden) {
      event.preventDefault();
      closeSpotlight();
    } else if (event.key === '/' && root.hidden && !isTypingTarget(event.target)) {
      event.preventDefault();
      openSpotlight();
    }
  });
}
