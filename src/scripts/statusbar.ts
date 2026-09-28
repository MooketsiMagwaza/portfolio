import { profile } from '@/data/site';
import { $$, must } from './lib';
import { getTheme, isMotionReduced, setMotionReduced, setTheme, type Theme } from './theme';

const weekday = new Intl.DateTimeFormat(undefined, { weekday: 'short' });
const dayMonth = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short' });
const clock = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' });
const home = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', timeZone: profile.timeZone });

export function initStatusBar(): void {
  const label = must('[data-clock-text]');
  const homeTime = must('[data-gaborone-time]');

  const tick = () => {
    const now = new Date();
    label.textContent = `${weekday.format(now)} ${dayMonth.format(now)}  ${clock.format(now)}`;
    label.setAttribute('datetime', now.toISOString());
    homeTime.textContent = `${home.format(now)} CAT`;
  };
  tick();
  // Align to the next minute, then tick every minute.
  window.setTimeout(() => {
    tick();
    window.setInterval(tick, 60_000);
  }, 60_000 - (Date.now() % 60_000));

  initControlCenter();
}

function initControlCenter(): void {
  const panel = must('[data-cc]');
  const toggles = $$('[data-cc-toggle]');
  const themeButtons = $$<HTMLElement>('[data-theme-set]', panel);
  const motion = must<HTMLInputElement>('[data-motion-toggle]', panel);

  const syncTheme = () => {
    themeButtons.forEach((button) => button.setAttribute('aria-checked', String(button.dataset.themeSet === getTheme())));
  };
  document.addEventListener('mos:theme', syncTheme);
  syncTheme();

  motion.checked = isMotionReduced();
  motion.addEventListener('change', () => setMotionReduced(motion.checked));
  themeButtons.forEach((button) => button.addEventListener('click', () => setTheme(button.dataset.themeSet as Theme)));

  const setOpen = (open: boolean) => {
    panel.hidden = !open;
    toggles.forEach((toggle) => toggle.setAttribute('aria-expanded', String(open)));
  };

  toggles.forEach((toggle) => toggle.addEventListener('click', () => setOpen(panel.hidden)));

  document.addEventListener('pointerdown', (event) => {
    if (panel.hidden) return;
    const target = event.target as Element;
    if (!panel.contains(target) && !target.closest('[data-cc-toggle]')) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) setOpen(false);
  });
}
