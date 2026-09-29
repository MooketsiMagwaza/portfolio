import type { AppId } from '@/data/apps';
import { $, $$, clamp, isCompact, prefersReducedMotion } from './lib';

export type Rect = { x: number; y: number; w: number; h: number };

type Win = {
  id: AppId;
  el: HTMLElement;
  open: boolean;
  minimized: boolean;
  zoomed: boolean;
  restore: Rect | null;
  fixed: boolean;
  closeTimer: number;
};

export type WindowEvent = { type: 'open' | 'close' | 'minimize' | 'restore' | 'focus' | 'zoom' | 'nudge'; id: AppId | null };

export const MENUBAR_H = 28;
/** Space kept clear at the bottom for the Dock when placing or zooming windows. */
const DOCK_CLEARANCE = 90;

const wins = new Map<AppId, Win>();
let zTop = 20;
let cascade = 0;
let activeId: AppId | null = null;

const emit = (type: WindowEvent['type'], id: AppId | null): void => {
  document.dispatchEvent(new CustomEvent<WindowEvent>('wm:change', { detail: { type, id } }));
};

const getRect = (el: HTMLElement): Rect => ({ x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight });

function setRect(el: HTMLElement, rect: Rect): void {
  el.style.left = `${Math.round(rect.x)}px`;
  el.style.top = `${Math.round(rect.y)}px`;
  el.style.width = `${Math.round(rect.w)}px`;
  el.style.height = `${Math.round(rect.h)}px`;
}

/** Keep a window inside the viewport and clear of the Dock. */
function fit(rect: Rect): Rect {
  const w = Math.min(rect.w, innerWidth - 16);
  const h = Math.min(rect.h, Math.max(200, innerHeight - MENUBAR_H - DOCK_CLEARANCE - 4));
  return {
    w,
    h,
    x: clamp(rect.x, 8, Math.max(8, innerWidth - w - 8)),
    y: clamp(rect.y, MENUBAR_H + 4, Math.max(MENUBAR_H + 4, innerHeight - DOCK_CLEARANCE - h)),
  };
}

/** Where a window opens when nothing says otherwise: centred, and nudged for each one opened. */
function defaultRect(win: Win, nudge: boolean): Rect {
  const width = Number(win.el.dataset.w) || 640;
  const height = Number(win.el.dataset.h) || 440;
  const step = nudge ? (cascade++ % 6) * 26 : 0;
  const w = Math.min(width, innerWidth - 24);
  return fit({
    w,
    h: height,
    x: Math.round((innerWidth - w) / 2 - 40 + step),
    y: Math.round(MENUBAR_H + 28 + step),
  });
}

/** Grow a window that opted in (data-fit) until its content shows without scrolling, if there's room. */
function fitToContent(win: Win): void {
  const target = $<HTMLElement>('[data-fit-target]', win.el);
  if (!target) return;
  const overflow = target.scrollHeight - target.clientHeight;
  if (overflow <= 0) return;
  const rect = getRect(win.el);
  setRect(win.el, fit({ ...rect, h: rect.h + overflow }));
}

export const getWindowRect = (id: AppId): Rect | null => {
  const win = wins.get(id);
  return win?.open ? getRect(win.el) : null;
};

const zoomRect = (): Rect => ({
  x: 8,
  y: MENUBAR_H + 6,
  w: innerWidth - 16,
  h: innerHeight - MENUBAR_H - 6 - DOCK_CLEARANCE,
});

const isInteractive = (target: EventTarget | null, boundary: HTMLElement): boolean => {
  const hit = (target as Element | null)?.closest('button, a, input, textarea, select, label, [data-nodrag]');
  return Boolean(hit && boundary.contains(hit));
};

function tween(win: Win): void {
  if (prefersReducedMotion()) return;
  win.el.classList.add('is-tweening');
  window.setTimeout(() => win.el.classList.remove('is-tweening'), 360);
}

/* --------------------------------------------------------------------------
   State queries
   -------------------------------------------------------------------------- */

export const isOpen = (id: AppId): boolean => wins.get(id)?.open ?? false;
export const isMinimized = (id: AppId): boolean => wins.get(id)?.minimized ?? false;
export const getActiveId = (): AppId | null => activeId;

export const listWindows = (): { id: AppId; minimized: boolean; active: boolean }[] =>
  [...wins.values()]
    .filter((win) => win.open)
    .map((win) => ({ id: win.id, minimized: win.minimized, active: win.id === activeId }));

/* --------------------------------------------------------------------------
   Focus and stacking
   -------------------------------------------------------------------------- */

function setActive(id: AppId | null): void {
  activeId = id;
  wins.forEach((win) => {
    const on = win.id === id;
    win.el.classList.toggle('is-active', on);
    win.el.classList.toggle('is-top', on);
  });
}

export function focusApp(id: AppId): void {
  const win = wins.get(id);
  if (!win || !win.open || win.minimized) return;
  win.el.style.zIndex = String(++zTop);
  if (activeId !== id) {
    setActive(id);
    emit('focus', id);
  }
}

/** A brief pulse on a window that's already open, so clicking its Dock icon (or a Spotlight
 *  result, or an "open project" link) again never feels like nothing happened. */
function nudge(win: Win): void {
  if (prefersReducedMotion()) return;
  win.el.classList.remove('is-nudging');
  void win.el.offsetWidth; // restart the animation if it's triggered again quickly
  win.el.classList.add('is-nudging');
  const done = () => win.el.classList.remove('is-nudging');
  win.el.addEventListener('animationend', done, { once: true });
  window.setTimeout(done, 400); // fallback: animationend isn't guaranteed (e.g. an interrupted animation)
}

function activateTop(): void {
  const candidates = [...wins.values()].filter((win) => win.open && !win.minimized);
  candidates.sort((a, b) => Number(b.el.style.zIndex || 0) - Number(a.el.style.zIndex || 0));
  const next = candidates[0]?.id ?? null;
  setActive(next);
  emit('focus', next);
}

/* --------------------------------------------------------------------------
   Open / close / minimize / zoom
   -------------------------------------------------------------------------- */

export function openApp(id: AppId, options: { rect?: Partial<Rect> } = {}): void {
  const win = wins.get(id);
  if (!win) return;
  if (win.open && win.minimized) return restoreApp(id);
  if (win.open) {
    focusApp(id);
    nudge(win);
    emit('nudge', id);
    return;
  }

  window.clearTimeout(win.closeTimer);
  win.open = true;
  win.minimized = false;
  win.zoomed = false;
  setRect(win.el, fit({ ...defaultRect(win, !options.rect), ...options.rect }));
  win.el.classList.remove('is-closing', 'is-minimized', 'is-zoomed');
  win.el.classList.add('is-open');
  if (win.el.hasAttribute('data-fit')) fitToContent(win);

  if (!prefersReducedMotion()) {
    win.el.classList.add('is-opening');
    const done = () => win.el.classList.remove('is-opening');
    win.el.addEventListener('animationend', done, { once: true });
    window.setTimeout(done, 500);
  }

  win.el.style.zIndex = String(++zTop);
  setActive(id);
  emit('open', id);
  win.el.focus({ preventScroll: true });
}

export function closeApp(id: AppId): void {
  const win = wins.get(id);
  if (!win || !win.open) return;
  win.open = false;
  win.minimized = false;
  win.el.classList.add('is-closing');

  const finish = () => {
    win.zoomed = false;
    win.restore = null;
    win.el.classList.remove('is-open', 'is-closing', 'is-minimized', 'is-zoomed', 'is-active', 'is-top', 'is-tweening');
  };
  win.closeTimer = window.setTimeout(finish, prefersReducedMotion() ? 0 : 170);

  emit('close', id);
  activateTop();
}

/** The Dock icon a window should shrink into (falls back to the Dock's centre). */
function dockTarget(id: AppId): { x: number; y: number } {
  const target = $(`[data-dock="${id}"]`) ?? $('[data-dock]');
  const rect = target?.getBoundingClientRect();
  if (!rect) return { x: innerWidth / 2, y: innerHeight - 30 };
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

export function minimizeApp(id: AppId): void {
  const win = wins.get(id);
  if (!win || !win.open || win.minimized || win.fixed) return;

  if (!isCompact() && !prefersReducedMotion()) {
    const box = win.el.getBoundingClientRect();
    const target = dockTarget(id);
    win.el.style.setProperty('--min-tx', `${Math.round(target.x - (box.left + box.width / 2))}px`);
    win.el.style.setProperty('--min-ty', `${Math.round(target.y - (box.top + box.height / 2))}px`);
  }

  win.minimized = true;
  win.el.classList.add('is-minimized');
  emit('minimize', id);
  activateTop();
}

export function restoreApp(id: AppId): void {
  const win = wins.get(id);
  if (!win || !win.open || !win.minimized) return;
  win.minimized = false;
  win.el.classList.remove('is-minimized');
  win.el.style.zIndex = String(++zTop);
  setActive(id);
  emit('restore', id);
}

export function toggleZoom(id: AppId): void {
  const win = wins.get(id);
  if (!win || !win.open || win.fixed || isCompact()) return;
  tween(win);
  if (win.zoomed && win.restore) {
    setRect(win.el, win.restore);
    win.zoomed = false;
    win.el.classList.remove('is-zoomed');
  } else {
    win.restore = getRect(win.el);
    setRect(win.el, zoomRect());
    win.zoomed = true;
    win.el.classList.add('is-zoomed');
  }
  emit('zoom', id);
}

/* --------------------------------------------------------------------------
   Pointer interaction: drag and resize
   -------------------------------------------------------------------------- */

/** Route the rest of a gesture to `el`. Capture can legitimately fail (e.g. a cancelled pointer), and dragging still works without it. */
function capture(el: HTMLElement, pointerId: number): void {
  try {
    el.setPointerCapture(pointerId);
  } catch {
    // Not fatal.
  }
}

function startDrag(event: PointerEvent, win: Win, handle: HTMLElement): void {
  if (event.button !== 0 || isCompact() || win.zoomed || isInteractive(event.target, handle)) return;
  const start = getRect(win.el);
  const originX = event.clientX;
  const originY = event.clientY;
  // Keep at least 96px of the window on screen, and never slide it under the menu bar.
  const minDx = 96 - start.w - start.x;
  const maxDx = innerWidth - 96 - start.x;
  const minDy = MENUBAR_H - start.y;
  const maxDy = innerHeight - 56 - start.y;
  let dx = 0;
  let dy = 0;
  capture(handle, event.pointerId);
  win.el.classList.add('is-dragging');

  // Move with a transform (compositor-only, ~8x cheaper than left/top); commit the position on release.
  const move = (ev: PointerEvent) => {
    dx = clamp(ev.clientX - originX, minDx, maxDx);
    dy = clamp(ev.clientY - originY, minDy, maxDy);
    win.el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
  };
  const end = () => {
    handle.removeEventListener('pointermove', move);
    handle.removeEventListener('pointerup', end);
    handle.removeEventListener('pointercancel', end);
    win.el.style.left = `${Math.round(start.x + dx)}px`;
    win.el.style.top = `${Math.round(start.y + dy)}px`;
    win.el.style.transform = '';
    win.el.classList.remove('is-dragging');
  };
  handle.addEventListener('pointermove', move);
  handle.addEventListener('pointerup', end);
  handle.addEventListener('pointercancel', end);
}

function startResize(event: PointerEvent, win: Win, edge: string, handle: HTMLElement): void {
  if (event.button !== 0 || isCompact() || win.zoomed || win.fixed) return;
  event.preventDefault();
  const start = getRect(win.el);
  const minW = Number(win.el.dataset.minW) || 420;
  const minH = Number(win.el.dataset.minH) || 300;
  const originX = event.clientX;
  const originY = event.clientY;
  capture(handle, event.pointerId);
  win.el.classList.add('is-resizing');

  const move = (ev: PointerEvent) => {
    const dx = ev.clientX - originX;
    const dy = ev.clientY - originY;
    const next = { ...start };
    if (edge.includes('e')) next.w = Math.max(minW, start.w + dx);
    if (edge.includes('s')) next.h = Math.max(minH, start.h + dy);
    if (edge.includes('w')) {
      next.w = Math.max(minW, start.w - dx);
      next.x = start.x + start.w - next.w;
    }
    if (edge.includes('n')) {
      next.h = Math.max(minH, start.h - dy);
      next.y = start.y + start.h - next.h;
      if (next.y < MENUBAR_H) {
        next.h -= MENUBAR_H - next.y;
        next.y = MENUBAR_H;
      }
    }
    setRect(win.el, next);
  };
  const end = () => {
    handle.removeEventListener('pointermove', move);
    handle.removeEventListener('pointerup', end);
    handle.removeEventListener('pointercancel', end);
    win.el.classList.remove('is-resizing');
  };
  handle.addEventListener('pointermove', move);
  handle.addEventListener('pointerup', end);
  handle.addEventListener('pointercancel', end);
}

function wire(win: Win): void {
  const { el, id } = win;

  // Any interaction inside a window brings it to the front.
  el.addEventListener('pointerdown', () => focusApp(id), { capture: true });

  $$<HTMLButtonElement>('.traffic__btn', el).forEach((button) => {
    button.addEventListener('click', () => {
      if (button.dataset.action === 'close') closeApp(id);
      if (button.dataset.action === 'minimize') minimizeApp(id);
      if (button.dataset.action === 'zoom') toggleZoom(id);
    });
  });

  $$('[data-drag]', el).forEach((handle) => {
    handle.addEventListener('pointerdown', (event) => startDrag(event, win, handle));
    handle.addEventListener('dblclick', (event) => {
      if (!isInteractive(event.target, handle)) toggleZoom(id);
    });
  });

  $$('[data-resize]', el).forEach((handle) => {
    handle.addEventListener('pointerdown', (event) => startResize(event, win, handle.dataset.resize ?? 'se', handle));
  });
}

function onViewportResize(): void {
  wins.forEach((win) => {
    if (!win.open) return;
    setRect(win.el, win.zoomed ? zoomRect() : fit(getRect(win.el)));
  });
}

export function initWindows(): void {
  $$('[data-window]').forEach((el) => {
    const id = el.dataset.window as AppId;
    const win: Win = { id, el, open: false, minimized: false, zoomed: false, restore: null, fixed: el.hasAttribute('data-fixed'), closeTimer: 0 };
    wins.set(id, win);
    wire(win);
  });
  addEventListener('resize', onViewportResize);
}
