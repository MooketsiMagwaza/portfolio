import { $, appIcon } from './lib';

type NotifyOptions = {
  title: string;
  body: string | Node;
  /** App icon sprite name, e.g. `finder`. */
  icon?: string;
  timeout?: number;
  onClick?: () => void;
};

/** A macOS-style banner in the top-right corner. */
export function notify({ title, body, icon = 'logo', timeout = 6500, onClick }: NotifyOptions): void {
  const host = $('[data-notifications]');
  if (!host) return;

  const banner = document.createElement('button');
  banner.type = 'button';
  banner.className = 'notification';

  const heading = document.createElement('strong');
  heading.textContent = title;
  const text = document.createElement('p');
  text.append(body);
  const copy = document.createElement('div');
  copy.append(heading, text);
  banner.append(appIcon(icon, 38), copy);

  let timer = 0;
  const dismiss = () => {
    window.clearTimeout(timer);
    if (banner.classList.contains('is-leaving')) return;
    banner.classList.add('is-leaving');
    window.setTimeout(() => banner.remove(), 300);
  };

  banner.addEventListener('click', () => {
    dismiss();
    onClick?.();
  });
  banner.addEventListener('pointerenter', () => window.clearTimeout(timer));
  banner.addEventListener('pointerleave', () => {
    timer = window.setTimeout(dismiss, 2500);
  });

  host.append(banner);
  timer = window.setTimeout(dismiss, timeout);
}
