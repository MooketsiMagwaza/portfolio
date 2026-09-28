import { projects, tagLabels, type Project, type ProjectTag } from '@/data/projects';
import { $, $$, must, openExternal, prefersReducedMotion } from './lib';
import { openQuickLook } from './quicklook';
import { openApp } from './windows';

export type FinderView = 'gallery' | 'icons' | 'list';
type Filter = 'all' | 'featured' | ProjectTag;

const state: { selected: string | null; view: FinderView; filter: Filter; query: string } = {
  selected: projects[0]?.slug ?? null,
  view: 'gallery',
  filter: 'all',
  query: '',
};

let root: HTMLElement;

const bySlug = (slug: string | null): Project | undefined => projects.find((project) => project.slug === slug);

function matches(project: Project): boolean {
  const inFilter =
    state.filter === 'all' || (state.filter === 'featured' ? project.featured : project.tags.includes(state.filter));
  if (!inFilter) return false;
  const query = state.query.trim().toLowerCase();
  if (!query) return true;
  const haystack = [project.name, project.filename, project.kind, project.kicker, project.summary, ...project.stack, ...project.tags.map((tag) => tagLabels[tag])]
    .join(' ')
    .toLowerCase();
  return query.split(/\s+/).every((word) => haystack.includes(word));
}

const visibleSlugs = (): string[] => projects.filter(matches).map((project) => project.slug);

export const getView = (): FinderView => state.view;

function render(): void {
  const visible = new Set(visibleSlugs());
  if (!state.selected || !visible.has(state.selected)) state.selected = visible.values().next().value ?? null;

  // Items: every view shows the same projects, so toggle by slug.
  $$('[data-project]', root).forEach((el) => {
    const slug = el.dataset.project ?? '';
    const isVisible = visible.has(slug);
    const isSelected = slug === state.selected;
    el.hidden = !isVisible;
    el.classList.toggle('is-selected', isSelected);
    if (el.tagName === 'BUTTON') el.setAttribute('aria-pressed', String(isSelected));
    else if (isSelected) el.setAttribute('aria-current', 'true');
    else el.removeAttribute('aria-current');
  });

  $$('[data-preview]', root).forEach((el) => (el.hidden = el.dataset.preview !== state.selected));
  $$('[data-panel]', root).forEach((el) => (el.hidden = el.dataset.panel !== state.selected));

  // View, filter, and status
  root.dataset.view = state.view;
  $$('[data-view-panel]', root).forEach((el) => (el.hidden = el.dataset.viewPanel !== state.view));
  $$('[data-set-view]', root).forEach((el) => el.setAttribute('aria-checked', String(el.dataset.setView === state.view)));
  $$('[data-filter-btn]', root).forEach((el) => {
    const on = el.dataset.filterBtn === state.filter;
    el.classList.toggle('is-active', on);
    el.setAttribute('aria-pressed', String(on));
  });

  const count = visible.size;
  const selected = bySlug(state.selected);
  must('[data-finder-count]', root).textContent = `${count} ${count === 1 ? 'item' : 'items'}`;
  must('[data-finder-status]', root).textContent = selected
    ? `1 of ${count} selected · ${selected.filename}`
    : `${count} items`;

  const empty = must('[data-empty]', root);
  empty.hidden = count > 0;
  must('[data-empty-query]', root).textContent = state.query.trim() || tagLabelFor(state.filter);
}

const tagLabelFor = (filter: Filter): string => (filter === 'all' ? '' : filter === 'featured' ? 'Featured' : tagLabels[filter]);

/** Keep the chosen thumbnail in view without scrolling any ancestor windows. */
function revealInStrip(el: HTMLElement): void {
  const strip = el.closest<HTMLElement>('.gallery__strip');
  if (!strip) return;
  const bounds = strip.getBoundingClientRect();
  const box = el.getBoundingClientRect();
  const behavior = prefersReducedMotion() ? 'auto' : 'smooth';
  if (box.left < bounds.left + 12) strip.scrollBy({ left: box.left - bounds.left - 18, behavior });
  else if (box.right > bounds.right - 12) strip.scrollBy({ left: box.right - bounds.right + 18, behavior });
}

export function selectProject(slug: string, options: { focus?: boolean } = {}): void {
  if (!bySlug(slug)) return;
  state.selected = slug;
  render();
  const el = $<HTMLElement>(`[data-view-panel]:not([hidden]) [data-project="${slug}"]`, root);
  if (el) {
    revealInStrip(el);
    if (options.focus) el.focus({ preventScroll: true });
  }
}

export function setView(view: FinderView): void {
  state.view = view;
  render();
}

function setFilter(filter: Filter): void {
  state.filter = filter;
  render();
}

/** Open the gallery on a project from anywhere (Spotlight, Terminal, Notes…). */
export function openProject(slug: string, options: { quickLook?: boolean } = {}): void {
  state.filter = 'all';
  state.query = '';
  must<HTMLInputElement>('[data-finder-search]', root).value = '';
  openApp('finder');
  selectProject(slug);
  if (options.quickLook) openQuickLook(slug);
}

function move(delta: number, vertical: boolean): void {
  const items = $$<HTMLElement>('[data-view-panel]:not([hidden]) [data-project]', root).filter((el) => !el.hidden);
  if (!items.length) return;
  const index = Math.max(0, items.findIndex((el) => el.dataset.project === state.selected));
  let step = delta;
  if (vertical && state.view === 'icons') {
    // Jump a whole row: count items sharing the first item's top edge.
    const firstTop = items[0]?.offsetTop;
    const columns = items.filter((el) => el.offsetTop === firstTop).length || 1;
    step = delta * columns;
  } else if (vertical && state.view === 'gallery') {
    return;
  }
  const next = items[Math.min(items.length - 1, Math.max(0, index + step))];
  if (next?.dataset.project) selectProject(next.dataset.project, { focus: true });
}

function wireTilt(): void {
  $$('[data-tilt]', root).forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      if (event.pointerType !== 'mouse' || prefersReducedMotion()) return;
      const box = card.getBoundingClientRect();
      const px = (event.clientX - box.left) / box.width;
      const py = (event.clientY - box.top) / box.height;
      card.classList.add('is-tilting');
      card.style.setProperty('--ry', `${((px - 0.5) * 7).toFixed(2)}deg`);
      card.style.setProperty('--rx', `${((0.5 - py) * 6).toFixed(2)}deg`);
      card.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`);
      card.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`);
    });
    card.addEventListener('pointerleave', () => {
      card.classList.remove('is-tilting');
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });
}

export function initFinder(): void {
  root = must('[data-finder]');

  root.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;

    const item = target.closest<HTMLElement>('[data-project]');
    if (item?.dataset.project) selectProject(item.dataset.project);

    const view = target.closest<HTMLElement>('[data-set-view]');
    if (view) setView(view.dataset.setView as FinderView);

    const filter = target.closest<HTMLElement>('[data-filter-btn]');
    if (filter) setFilter(filter.dataset.filterBtn as Filter);

    const quick = target.closest<HTMLElement>('[data-quicklook]');
    if (quick?.dataset.quicklook) openQuickLook(quick.dataset.quicklook);
  });

  root.addEventListener('dblclick', (event) => {
    const item = (event.target as HTMLElement).closest<HTMLElement>('[data-project]');
    if (item?.dataset.project) openQuickLook(item.dataset.project);
  });

  must<HTMLInputElement>('[data-finder-search]', root).addEventListener('input', (event) => {
    state.query = (event.target as HTMLInputElement).value;
    render();
  });

  root.addEventListener('keydown', (event) => {
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT') {
      if (event.key === 'Escape') {
        (target as HTMLInputElement).value = '';
        state.query = '';
        render();
      }
      return;
    }
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        return move(1, false);
      case 'ArrowLeft':
        event.preventDefault();
        return move(-1, false);
      case 'ArrowDown':
        event.preventDefault();
        return move(1, true);
      case 'ArrowUp':
        event.preventDefault();
        return move(-1, true);
      case ' ':
        if (state.selected && !target.closest('a, [data-set-view], [data-filter-btn], [data-quicklook]')) {
          event.preventDefault();
          openQuickLook(state.selected);
        }
        return;
      case 'Enter': {
        const project = bySlug(state.selected);
        if (project && target.closest('[data-project]')) {
          event.preventDefault();
          openExternal(project.repository);
        }
      }
    }
  });

  wireTilt();
  render();
}
