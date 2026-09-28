import { projects } from '@/data/projects';
import { initAppUi } from './appui';
import { initDock } from './dock';
import { initFinder, openProject } from './finder';
import { isApple, isCompact, modKey } from './lib';
import { initMenus } from './menus';
import { notify } from './notify';
import { initQuickLook } from './quicklook';
import { initSpotlight } from './spotlight';
import { initStatusBar } from './statusbar';
import { initTerminal } from './terminal';
import { initTheme } from './theme';
import { initWindows, MENUBAR_H, openApp } from './windows';

/** Lay the first windows out to suit the screen: a pair on wide desktops, one everywhere else. */
function openFirstWindows(): void {
  const width = innerWidth;
  const height = innerHeight;

  if (isCompact()) {
    openApp('finder');
    return;
  }

  const iconColumn = 130;
  const usable = width - iconColumn;
  const winHeight = Math.max(380, Math.min(560, height - MENUBAR_H - 130));
  const y = MENUBAR_H + Math.max(20, Math.round((height - MENUBAR_H - 96 - winHeight) / 2));

  if (usable >= 1100) {
    const contactsWidth = 350;
    const gap = 22;
    const finderWidth = Math.min(920, usable - contactsWidth - gap - 64);
    const x = Math.round((usable - (contactsWidth + gap + finderWidth)) / 2) + 6;
    openApp('contacts', { rect: { x, y, w: contactsWidth, h: winHeight } });
    openApp('finder', { rect: { x: x + contactsWidth + gap, y, w: finderWidth, h: winHeight } });
  } else {
    const finderWidth = Math.min(900, usable - 24);
    openApp('finder', { rect: { x: Math.round((usable - finderWidth) / 2), y, w: finderWidth, h: winHeight } });
  }
}

function welcome(): void {
  const hint = document.createElement('span');
  hint.append(`${projects.length} projects in the gallery. Click to explore, or press `);
  const key = document.createElement('kbd');
  key.textContent = isApple ? '⌘K' : `${modKey}K`.trim();
  hint.append(key, ' to search.');
  notify({
    title: 'Welcome',
    body: hint,
    icon: 'finder',
    timeout: 9000,
    onClick: () => openProject(projects[0]?.slug ?? ''),
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
