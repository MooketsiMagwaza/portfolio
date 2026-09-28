import type { AppId } from '@/data/apps';
import { $$, isCompact, must, prefersReducedMotion } from './lib';
import { notify } from './notify';
import { isOpen, type WindowEvent } from './windows';

const MAX_SCALE = 1.62;
const RANGE = 132;

export function initDock(): void {
  const dock = must('[data-dock]');
  const items = $$('.dock__item', dock);
  const buttons = $$<HTMLElement>('.dock__btn', dock);

  // Running indicators and bounce-on-launch ---------------------------------
  // Only apps have windows; `github` and `trash` simply report "not open".
  const syncRunning = () => {
    buttons.forEach((button) => {
      button.classList.toggle('is-running', isOpen(button.dataset.dock as AppId));
    });
  };

  document.addEventListener('wm:change', (event) => {
    const { type, id } = (event as CustomEvent<WindowEvent>).detail;
    syncRunning();
    if (type === 'open' && id && !prefersReducedMotion()) {
      const button = buttons.find((entry) => entry.dataset.dock === id);
      button?.classList.add('is-bouncing');
      button?.addEventListener('animationend', () => button.classList.remove('is-bouncing'), { once: true });
    }
  });

  // Magnification ------------------------------------------------------------
  // Item centres are measured at rest (relative to the Dock's centre) so growing icons
  // never feed back into their own distance calculation.
  let offsets: number[] = [];
  const measure = () => {
    const box = dock.getBoundingClientRect();
    const centre = box.left + box.width / 2;
    offsets = items.map((item) => {
      const rect = item.getBoundingClientRect();
      return rect.left + rect.width / 2 - centre;
    });
  };

  let frame = 0;
  const fine = matchMedia('(hover: hover) and (pointer: fine)');

  dock.addEventListener('pointerenter', (event) => {
    if (event.pointerType !== 'mouse' || !fine.matches || isCompact() || prefersReducedMotion()) return;
    measure();
    dock.classList.add('is-hovering');
  });

  dock.addEventListener('pointermove', (event) => {
    if (!dock.classList.contains('is-hovering')) return;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const box = dock.getBoundingClientRect();
      const pointer = event.clientX - (box.left + box.width / 2);
      items.forEach((item, index) => {
        const distance = Math.abs(pointer - (offsets[index] ?? 0));
        const weight = distance >= RANGE ? 0 : Math.cos((distance / RANGE) * (Math.PI / 2)) ** 2;
        item.style.setProperty('--s', (1 + (MAX_SCALE - 1) * weight).toFixed(3));
      });
    });
  });

  dock.addEventListener('pointerleave', () => {
    cancelAnimationFrame(frame);
    dock.classList.remove('is-hovering');
    items.forEach((item) => item.style.removeProperty('--s'));
  });

  // The Trash is a joke, but a kind one --------------------------------------
  dock.querySelector<HTMLElement>('[data-trash]')?.addEventListener('click', (event) => {
    const button = event.currentTarget as HTMLElement;
    button.classList.add('is-shaking');
    button.addEventListener('animationend', () => button.classList.remove('is-shaking'), { once: true });
    notify({ title: 'Trash', body: 'Empty. Nothing shipped here gets thrown away.', icon: 'trash', timeout: 3500 });
  });

  syncRunning();
}
