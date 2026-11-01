import { projects } from '@/data/projects';
import { initAppUi } from './appui';
import { initDock } from './dock';
import { initFinder } from './finder';
import { isApple, modKey } from './lib';
import { initMenus } from './menus';
import { notify } from './notify';
import { initQuickLook } from './quicklook';
import { initSpotlight } from './spotlight';
import { initStatusBar } from './statusbar';
import { initTerminal } from './terminal';
import { initTheme } from './theme';
import { initWindows, openApp } from './windows';

/** Start with the professional summary and CV so a recruiter does not need to search for context. */
function openFirstWindows(): void {
  openApp('about');
}

function welcome(): void {
  const hint = document.createElement('span');
  hint.append(`CV, technical toolkit, and ${projects.length} selected projects. Press `);
  const key = document.createElement('kbd');
  key.textContent = isApple ? '⌘K' : `${modKey}K`.trim();
  hint.append(key, ' to search the portfolio.');
  notify({
    title: 'Welcome',
    body: hint,
    icon: 'contacts',
    timeout: 7000,
    onClick: () => openApp('about'),
  });
}

function boot(): void {
  initTheme();
  initWindows();
  initFinder();
  initQuickLook();
  initDock();
  initSpotlight();
  initMenus();
  initStatusBar();
  initTerminal();
  initAppUi();

  openFirstWindows();
  window.setTimeout(welcome, 1600);
}

boot();
