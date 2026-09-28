import type { AppId } from '@/data/apps';
import { profile } from '@/data/site';
import * as actions from './actions';
import { $$, must } from './lib';
import { notify } from './notify';

/** A roving-tabindex tab list: one tab is tabbable, arrows move between them. */
function wireTabs(tabs: HTMLElement[], select: (tab: HTMLElement) => void, keys: { prev: string; next: string }): void {
  const activate = (tab: HTMLElement, focus: boolean) => {
    tabs.forEach((entry) => {
      entry.setAttribute('aria-selected', String(entry === tab));
      entry.tabIndex = entry === tab ? 0 : -1;
    });
    select(tab);
    if (focus) tab.focus();
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab, false));
    tab.addEventListener('keydown', (event) => {
      if (event.key !== keys.prev && event.key !== keys.next) return;
      event.preventDefault();
      const step = event.key === keys.next ? 1 : -1;
      const next = tabs[(index + step + tabs.length) % tabs.length];
      if (next) activate(next, true);
    });
  });

  const current = tabs.find((tab) => tab.getAttribute('aria-selected') === 'true') ?? tabs[0];
  if (current) activate(current, false);
}

function initNotes(): void {
  const root = must('[data-notes]');
  const tabs = $$('[data-note]', root);
  wireTabs(
    tabs,
    (tab) => {
      tabs.forEach((entry) => entry.classList.toggle('is-active', entry === tab));
      $$('[data-note-page]', root).forEach((page) => (page.hidden = page.dataset.notePage !== tab.dataset.note));
    },
    { prev: 'ArrowUp', next: 'ArrowDown' },
  );
}

function initAbout(): void {
  const root = must('[data-about]');
  const tabs = $$('[data-about-tab]', root);
  const show = (tab: HTMLElement) => {
    $$('[data-about-panel]', root).forEach((panel) => (panel.hidden = panel.dataset.aboutPanel !== tab.dataset.aboutTab));
  };
  wireTabs(tabs, show, { prev: 'ArrowLeft', next: 'ArrowRight' });

  document.addEventListener('about:tab', (event) => {
    const name = (event as CustomEvent<string>).detail;
    tabs.find((tab) => tab.dataset.aboutTab === name)?.click();
  });
}

function initMail(): void {
  const form = must<HTMLFormElement>('[data-mail-form]');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const subject = String(data.get('subject') ?? '').trim() || 'Hello from your portfolio';
    const body = String(data.get('body') ?? '');
    // Nothing is sent from the page: this hands the draft to the visitor's own mail app.
    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    notify({ title: 'Mail', body: 'Opening your email app with the draft…', icon: 'mail', timeout: 3500 });
  });

  must('[data-copy-email]', form).addEventListener('click', () => void actions.copyEmail());
}

function initDesktopIcons(): void {
  const icons = $$<HTMLElement>('[data-desktop-icon]');
  let pointerType = 'mouse';

  const clearSelection = () => icons.forEach((icon) => icon.classList.remove('is-selected'));

  icons.forEach((icon) => {
    icon.addEventListener('pointerdown', (event) => {
      pointerType = event.pointerType;
    });
    icon.addEventListener('click', (event) => {
      // Double-click (or a tap, or Enter) opens; a single mouse click selects.
      if (event.detail >= 2 || event.detail === 0 || pointerType === 'touch') {
        clearSelection();
        actions.openApp(icon.dataset.openApp as AppId);
      } else {
        clearSelection();
        icon.classList.add('is-selected');
      }
    });
  });

  must('.desktop').addEventListener('pointerdown', (event) => {
    if (!(event.target as Element).closest('.desktop-icon')) clearSelection();
  });
}

export function initAppUi(): void {
  initNotes();
  initAbout();
  initMail();
  initDesktopIcons();

  // Anything marked data-open-app / data-open-project opens that app or project.
  document.addEventListener('click', (event) => {
    const target = event.target as Element;

    const appTrigger = target.closest<HTMLElement>('[data-open-app]');
    if (appTrigger && !appTrigger.hasAttribute('data-desktop-icon')) {
      actions.openApp(appTrigger.dataset.openApp as AppId);
    }

    const projectTrigger = target.closest<HTMLElement>('[data-open-project]');
    if (projectTrigger?.dataset.openProject) actions.openProject(projectTrigger.dataset.openProject);
  });

}
