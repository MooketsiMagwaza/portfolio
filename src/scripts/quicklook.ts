import { projects } from '@/data/projects';
import { $$, must } from './lib';

let root: HTMLElement;
let panel: HTMLElement;
let previousFocus: HTMLElement | null = null;

export const isQuickLookOpen = (): boolean => !root.hidden;

export function openQuickLook(slug: string): void {
  const project = projects.find((entry) => entry.slug === slug);
  if (!project) return;

  $$('[data-ql]', root).forEach((page) => {
    page.hidden = page.dataset.ql !== slug;
  });
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

  // Space or Escape dismisses, like the real Quick Look. Capture so nothing underneath reacts.
  document.addEventListener(
    'keydown',
    (event) => {
      if (root.hidden) return;
      if (event.key === 'Escape' || event.key === ' ') {
        event.preventDefault();
        event.stopPropagation();
        closeQuickLook();
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
