import { appById, apps } from '@/data/apps';
import * as actions from './actions';
import { getView, setView, type FinderView } from './finder';
import { $, $$, appIcon, must, modKey } from './lib';
import { toggleSpotlight } from './spotlight';
import { getTheme, setTheme } from './theme';
import { closeApp, focusApp, getActiveId, isMinimized, listWindows, minimizeApp, openApp, restoreApp, toggleZoom } from './windows';

type MenuItem =
  | 'sep'
  | {
      label: string;
      run?: () => void;
      shortcut?: string;
      checked?: boolean;
      disabled?: boolean;
      icon?: () => SVGSVGElement;
    };

const activeApp = () => appById(getActiveId() ?? 'finder');

function viewItem(label: string, view: FinderView): MenuItem {
  return {
    label,
    checked: getView() === view,
    run: () => {
      openApp('finder');
      setView(view);
    },
  };
}

const menus: Record<string, () => MenuItem[]> = {
  system: () => [
    { label: 'About This Mac', run: () => openApp('about') },
    'sep',
    { label: 'Light Appearance', checked: getTheme() === 'light', run: () => setTheme('light') },
    { label: 'Dark Appearance', checked: getTheme() === 'dark', run: () => setTheme('dark') },
    'sep',
    { label: 'Copy Email Address', run: () => void actions.copyEmail() },
    { label: 'Credits & Inspiration…', run: actions.showCredits },
    'sep',
    { label: 'Source Code on GitHub', run: actions.openSource },
  ],

  app: () => {
    const app = activeApp();
    const id = getActiveId();
    return [
      { label: `About ${app.name}`, run: () => openApp('about') },
      'sep',
      { label: `Hide ${app.name}`, disabled: !id || id === 'about', run: () => id && minimizeApp(id) },
      { label: `Quit ${app.name}`, disabled: !id, run: () => id && closeApp(id) },
    ];
  },

  file: () => {
    const id = getActiveId();
    return [
      { label: 'New Message…', run: () => openApp('mail') },
      { label: 'Open Projects', run: () => openApp('finder') },
      'sep',
      { label: 'Close Window', disabled: !id, run: () => id && closeApp(id) },
    ];
  },

  edit: () => [
    { label: 'Copy Email Address', run: () => void actions.copyEmail() },
    { label: 'Copy GitHub URL', run: () => void actions.copyGitHub() },
    'sep',
    { label: 'Find…', shortcut: `${modKey}K`, run: toggleSpotlight },
  ],

  view: () => [
    viewItem('as Gallery', 'gallery'),
    viewItem('as Icons', 'icons'),
    viewItem('as List', 'list'),
    'sep',
    { label: 'Toggle Zoom', disabled: !getActiveId() || getActiveId() === 'about', run: () => { const id = getActiveId(); if (id) toggleZoom(id); } },
    {
      label: getTheme() === 'dark' ? 'Switch to Light Appearance' : 'Switch to Dark Appearance',
      run: actions.toggleTheme,
    },
  ],

  go: () => [
    ...apps
      .filter((app) => app.dock)
      .map((app): MenuItem => ({ label: app.title, icon: () => appIcon(app.icon, 16), run: () => openApp(app.id) })),
    'sep',
    { label: 'GitHub', run: actions.openGitHub },
  ],

  window: () => {
    const id = getActiveId();
    const open = listWindows();
    const items: MenuItem[] = [
      { label: 'Minimize', disabled: !id || id === 'about', run: () => id && minimizeApp(id) },
      { label: 'Zoom', disabled: !id || id === 'about', run: () => id && toggleZoom(id) },
      'sep',
    ];
    if (!open.length) items.push({ label: 'No open windows', disabled: true });
    open.forEach((entry) => {
      const app = appById(entry.id);
      items.push({
        label: entry.minimized ? `${app.title} (minimized)` : app.title,
        checked: entry.active,
        run: () => (isMinimized(entry.id) ? restoreApp(entry.id) : focusApp(entry.id)),
      });
    });
    return items;
  },

  help: () => [
    { label: 'Search', shortcut: `${modKey}K`, run: toggleSpotlight },
    { label: 'Credits & Inspiration', run: actions.showCredits },
    'sep',
    { label: 'View Source on GitHub', run: actions.openSource },
  ],
};

const labels: Record<string, string> = { system: 'mOS', app: 'Application', file: 'File', edit: 'Edit', view: 'View', go: 'Go', window: 'Window', help: 'Help' };

let layer: HTMLElement;
let openMenu: HTMLElement | null = null;
let trigger: HTMLElement | null = null;

const triggers = (): HTMLElement[] => $$('[data-menu]');

function close(returnFocus = false): void {
  openMenu?.remove();
  openMenu = null;
  trigger?.setAttribute('aria-expanded', 'false');
  if (returnFocus) trigger?.focus();
  trigger = null;
}

function focusItem(menu: HTMLElement, step: 1 | -1 | 'first' | 'last'): void {
  const items = $$<HTMLButtonElement>('.menu__item:not(:disabled)', menu);
  if (!items.length) return;
  const current = items.indexOf(document.activeElement as HTMLButtonElement);
  let next = 0;
  if (step === 'last') next = items.length - 1;
  else if (typeof step === 'number') next = (current + step + items.length) % items.length;
  items[next]?.focus();
}

function open(button: HTMLElement, focusFirst = false): void {
  const id = button.dataset.menu ?? '';
  const build = menus[id];
  if (!build) return;
  close();

  trigger = button;
  button.setAttribute('aria-expanded', 'true');

  const menu = document.createElement('div');
  menu.className = 'menu';
  menu.setAttribute('role', 'menu');
  menu.setAttribute('aria-label', labels[id] ?? id);

  build().forEach((item) => {
    if (item === 'sep') {
      const sep = document.createElement('div');
      sep.className = 'menu__sep';
      sep.setAttribute('role', 'separator');
      menu.append(sep);
      return;
    }
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'menu__item';
    row.setAttribute('role', item.checked === undefined ? 'menuitem' : 'menuitemcheckbox');
    if (item.checked !== undefined) row.setAttribute('aria-checked', String(item.checked));
    row.disabled = Boolean(item.disabled);

    const check = document.createElement('span');
    check.className = 'menu__check';
    check.textContent = item.checked ? '✓' : '';
    check.setAttribute('aria-hidden', 'true');
    row.append(check);

    if (item.icon) {
      const icon = item.icon();
      icon.classList.add('menu__icon');
      row.append(icon);
    }
    const label = document.createElement('span');
    label.className = 'menu__label';
    label.textContent = item.label;
    row.append(label);

    if (item.shortcut) {
      const shortcut = document.createElement('span');
      shortcut.className = 'menu__shortcut';
      shortcut.textContent = item.shortcut;
      row.append(shortcut);
    }

    row.addEventListener('click', () => {
      close();
      item.run?.();
    });
    menu.append(row);
  });

  layer.append(menu);
  const box = button.getBoundingClientRect();
  menu.style.top = `${box.bottom + 2}px`;
  menu.style.left = `${Math.max(6, Math.min(box.left - 2, innerWidth - menu.offsetWidth - 8))}px`;
  openMenu = menu;
  if (focusFirst) focusItem(menu, 'first');
}

export function initMenus(): void {
  layer = must('[data-menu-layer]');
  const label = must('[data-active-app]');

  const syncActiveApp = () => {
    label.textContent = activeApp().name;
  };
  document.addEventListener('wm:change', syncActiveApp);
  syncActiveApp();

  triggers().forEach((button) => {
    button.addEventListener('click', () => (trigger === button ? close() : open(button)));
    button.addEventListener('pointerenter', () => {
      if (openMenu && trigger !== button) open(button);
    });
    button.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        open(button, true);
      }
    });
  });

  // Dismiss on outside click; keyboard navigation inside and across menus.
  document.addEventListener('pointerdown', (event) => {
    const target = event.target as Element;
    if (openMenu && !openMenu.contains(target) && !target.closest('[data-menu]')) close();
  });

  document.addEventListener('keydown', (event) => {
    if (!openMenu) return;
    const all = triggers();
    const at = trigger ? all.indexOf(trigger) : -1;
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        return close(true);
      case 'ArrowDown':
        event.preventDefault();
        return focusItem(openMenu, 1);
      case 'ArrowUp':
        event.preventDefault();
        return focusItem(openMenu, -1);
      case 'Home':
        event.preventDefault();
        return focusItem(openMenu, 'first');
      case 'End':
        event.preventDefault();
        return focusItem(openMenu, 'last');
      case 'ArrowRight':
      case 'ArrowLeft': {
        event.preventDefault();
        const next = all[(at + (event.key === 'ArrowRight' ? 1 : -1) + all.length) % all.length];
        if (next) open(next, true);
      }
    }
  });

  addEventListener('blur', () => close());
  // Menus depend on window state, so a stale one should never linger.
  document.addEventListener('wm:change', () => $('.menu') && close());
}
