/** Small DOM helpers shared by the desktop modules. */

export const $ = <T extends Element = HTMLElement>(selector: string, root: ParentNode = document): T | null =>
  root.querySelector<T>(selector);

export const $$ = <T extends Element = HTMLElement>(selector: string, root: ParentNode = document): T[] =>
  Array.from(root.querySelectorAll<T>(selector));

/** Like `$`, but the element is part of the page contract, so a miss is a bug. */
export const must = <T extends Element = HTMLElement>(selector: string, root: ParentNode = document): T => {
  const el = root.querySelector<T>(selector);
  if (!el) throw new Error(`Missing element: ${selector}`);
  return el;
};

export const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

export const isCompact = (): boolean => matchMedia('(max-width: 720px)').matches;

export const prefersReducedMotion = (): boolean =>
  document.documentElement.dataset.motion === 'reduced' || matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isApple = /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);

/** The modifier key label used in hints: ⌘ on Apple devices, Ctrl elsewhere. */
export const modKey = isApple ? '⌘' : 'Ctrl ';

const SVG_NS = 'http://www.w3.org/2000/svg';

/** Build an <svg><use href="#…"/></svg> that points at the shared sprite sheet. */
export function svgUse(href: string, className: string, size = 24, viewBox = '0 0 64 64', height = size): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', className);
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(height));
  svg.setAttribute('viewBox', viewBox);
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const use = document.createElementNS(SVG_NS, 'use');
  use.setAttribute('href', `#${href}`);
  svg.append(use);
  return svg;
}

export const appIcon = (name: string, size = 30): SVGSVGElement => svgUse(`app-${name}`, 'app-icon', size);
export const glyph = (name: string, size = 16): SVGSVGElement => svgUse(`g-${name}`, 'glyph', size, '0 0 24 24');

export function openExternal(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer');
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Clipboard API needs a secure context; fall back to a temporary textarea.
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.cssText = 'position:fixed;top:-100px;opacity:0';
    document.body.append(area);
    area.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    area.remove();
    return ok;
  }
}

export const isTypingTarget = (target: EventTarget | null): boolean => {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName);
};
