// The mockups' markup, as plain strings, for baking images outside Astro. The
// site's own components (src/components/MacWindow.astro, IPhone.astro) render
// the same structure with the same CSS (src/styles/mockups.css).

export const esc = (text) => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

const STATUS_ICONS = `<svg viewBox="0 0 18 12" aria-hidden="true"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>
<svg viewBox="0 0 17 12" aria-hidden="true"><path d="M8.5 2.4c2.3 0 4.4.9 6 2.4l.9-1A10.3 10.3 0 0 0 8.5 1 10.3 10.3 0 0 0 1.6 3.8l.9 1a8.9 8.9 0 0 1 6-2.4Zm0 3.6c1.4 0 2.6.5 3.6 1.4l.9-1A7.3 7.3 0 0 0 8.5 4.6c-1.9 0-3.7.7-4.5 1.8l.9 1c1-.9 2.2-1.4 3.6-1.4Zm0 3.5a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2Z" transform="translate(0 -1)"/></svg>
<svg viewBox="0 0 27 12" aria-hidden="true"><rect x="0.5" y="0.5" width="22" height="11" rx="3.2" fill="none" stroke="currentColor" opacity=".45"/><rect x="2" y="2" width="19" height="8" rx="2"/><rect x="24" y="4" width="2" height="4" rx="1" opacity=".5"/></svg>`;

/** A Mac window: traffic lights, a centred title, and the screenshot. `theme` is 'light' or 'dark'. */
export function mac({ src, alt, title = '', theme = 'light' }) {
  return `<div class="mac-wrap"><figure class="mac mac--${theme}">
  <div class="mac__bar"><span class="mac__lights" aria-hidden="true"><i></i><i></i><i></i></span><span class="mac__title">${esc(title)}</span></div>
  <img class="mac__screen" src="${esc(src)}" alt="${esc(alt)}">
</figure></div>`;
}

/** An iPhone with a Dynamic Island. The screenshot is a 390-wide phone screen; `statusBg` is the app's top-bar colour. */
export function iphone({ src, alt, statusBg = '#000', time = '9:41' }) {
  return `<div class="iphone-wrap"><figure class="iphone" style="--status-bg:${esc(statusBg)}">
  <div class="iphone__screen">
    <div class="iphone__status"><span>${esc(time)}</span><span class="iphone__island"></span><span class="iphone__icons">${STATUS_ICONS}</span></div>
    <img class="iphone__screenshot" src="${esc(src)}" alt="${esc(alt)}">
    <div class="iphone__safe"><span class="iphone__home"></span></div>
  </div>
</figure></div>`;
}
