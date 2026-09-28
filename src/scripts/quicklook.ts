import { projects } from '@/data/projects';
import { $, $$, must } from './lib';

let root: HTMLElement;
let panel: HTMLElement;
let previousFocus: HTMLElement | null = null;

export const isQuickLookOpen = (): boolean => !root.hidden;

/** Show one screenshot of a project inside its Quick Look page. */
function showShot(slug: string, index: number): void {
  const project = projects.find((entry) => entry.slug === slug);
  const page = $(`[data-ql="${slug}"]`, root);
  if (!project || !page) return;
  const total = project.shots.length;
  const next = (index + total) % total;
  page.dataset.current = String(next);
  $$('[data-shot]', page).forEach((frame) => (frame.hidden = Number(frame.dataset.shot) !== next));
  const caption = $('[data-ql-caption]', page);
  const count = $('[data-ql-count]', page);
  if (caption) caption.textContent = project.shots[next]?.caption ?? '';
  if (count) count.textContent = `${next + 1} / ${total}`;
}

const activePage = (): HTMLElement | null => $<HTMLElement>('[data-ql]:not([hidden])', root);

const stepActive = (delta: number): boolean => {
  const page = activePage();
  const slug = page?.dataset.ql;
  if (!page || !slug) return false;
  showShot(slug, Number(page.dataset.current ?? 0) + delta);
  return true;
};

export function openQuickLook(slug: string, shot = 0): void {
  const project = projects.find((entry) => entry.slug === slug);
  if (!project) return;

  $$('[data-ql]', root).forEach((page) => {
    page.hidden = page.dataset.ql !== slug;
  });
  showShot(slug, shot);
  must('[data-ql-title]', root).textContent = project.filename;
  must<HTMLAnchorElement>('[data-ql-open]', root).href = project.repository;

  if (root.hidden) previousFocus = document.activeElement as HTMLElement | null;
  root.hidden = false;
  panel.focus({ preventScroll: true });
}

export function closeQuickLook(): void {
  if (root.hidden) return;
  root.hidden = true;
  previousFocus?.focus({ preventScroll: true });
  previousFocus = null;
}

export function initQuickLook(): void {
  root = must('[data-ql-root]');
  panel = must('.quicklook__panel', root);

  $$('[data-quicklook-close]', root).forEach((el) => el.addEventListener('click', closeQuickLook));
  $$('[data-ql-step]', root).forEach((button) => {
    button.addEventListener('click', () => stepActive(Number(button.dataset.qlStep)));
  });

  // Space or Escape dismisses, like the real Quick Look. Capture so nothing underneath reacts.
  document.addEventListener(
    'keydown',
    (event) => {
      if (root.hidden) return;
      if (event.key === 'Escape' || event.key === ' ') {
        event.preventDefault();
        event.stopPropagation();
        closeQuickLook();
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        // Arrow keys browse screenshots, as they do in the real Quick Look.
        if (stepActive(event.key === 'ArrowRight' ? 1 : -1)) {
          event.preventDefault();
          event.stopPropagation();
        }
      } else if (event.key === 'Tab') {
        // Keep focus inside the dialog.
        const focusable = $$<HTMLElement>('a[href], button', panel).filter((el) => !el.closest('[hidden]'));
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    },
    true,
  );
}
