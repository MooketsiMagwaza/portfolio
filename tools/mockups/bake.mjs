#!/usr/bin/env node
// Bakes the device mockups to transparent PNGs, for places that can't run CSS
// (a GitHub profile README). It renders the same markup and CSS the site uses,
// in headless Edge or Chrome.
//
//   node tools/mockups/bake.mjs <out-dir> [job-name ...]
//
// Add a job below for each image. Sources are the files in public/images/.

import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { iphone, mac } from './markup.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const css = readFileSync(path.join(here, '../../src/styles/mockups.css'), 'utf8');
const image = (file) => pathToFileURL(path.resolve(here, '../../public/images', file)).href;

// The look of the Kori phone screens (top-bar colour, bottom-bar colour, light or dark), written next to the
// captures by capture-kori.mjs, which reads it from the screenshots. A restyle of Kori then needs a re-capture
// and no edit here. The fallback is the look of the first captures (Day colours).
const koriLook = (() => {
  try {
    return JSON.parse(readFileSync(path.join(here, '../../public/images/kori/phone-colours.json'), 'utf8'));
  } catch {
    return { statusBg: '#f6f0e4', safeBg: '#fffdf8', tone: 'light' };
  }
})();
const koriPhone = { statusBg: koriLook.statusBg, safeBg: koriLook.safeBg, tone: koriLook.tone };

// Every job: the content, its width in CSS pixels, the room around it for the
// shadow, and the pixel density. `html` is what is drawn inside the padding.
const JOBS = [
  {
    name: 'zenith-decks',
    dpr: 1,
    width: 1280,
    pad: { t: 40, r: 70, b: 120, l: 70 },
    html: mac({ src: image('zenith/decks.png'), alt: 'Zenith decks view: three timed cards in a deck called Academics', title: 'Zenith — Decks', theme: 'dark' }),
  },
  {
    name: 'zenith-journal',
    dpr: 1,
    width: 1280,
    pad: { t: 40, r: 70, b: 120, l: 70 },
    html: mac({ src: image('zenith/journal.png'), alt: 'Zenith markdown journal, one document per card or deck', title: 'Zenith — Journal', theme: 'dark' }),
  },
  {
    name: 'zenith-history',
    dpr: 1,
    width: 1280,
    pad: { t: 40, r: 70, b: 120, l: 70 },
    html: mac({ src: image('zenith/history.png'), alt: 'Zenith history of past focus sessions', title: 'Zenith — History', theme: 'dark' }),
  },
  {
    name: 'zenith-zen',
    dpr: 1,
    width: 1280,
    pad: { t: 40, r: 70, b: 120, l: 70 },
    html: mac({ src: image('zenith/zen.png'), alt: 'Zenith full-screen Zen mode', title: 'Zenith — Zen', theme: 'dark' }),
  },
  // Tagwise: captures of its browser prototype's sample workspace (1440 x 900, dark).
  {
    name: 'tagwise-home',
    dpr: 1,
    width: 1280,
    pad: { t: 40, r: 70, b: 120, l: 70 },
    html: mac({ src: image('tagwise/dashboard-dark.jpg'), alt: 'Tagwise home: what needs attention, a stock-take in progress and recent activity', title: 'Tagwise — Home', theme: 'dark' }),
  },
  {
    name: 'tagwise-register',
    dpr: 1,
    width: 1280,
    pad: { t: 40, r: 70, b: 120, l: 70 },
    html: mac({ src: image('tagwise/register-dark.jpg'), alt: 'Tagwise register: a table of assets with saved views, filters and columns', title: 'Tagwise — Assets', theme: 'dark' }),
  },
  {
    name: 'tagwise-asset',
    dpr: 1,
    width: 1280,
    pad: { t: 40, r: 70, b: 120, l: 70 },
    html: mac({ src: image('tagwise/asset-dark.jpg'), alt: 'Tagwise asset page: details, custody and a QR label', title: 'Tagwise — Asset', theme: 'dark' }),
  },
  {
    name: 'tagwise-import',
    dpr: 1,
    width: 1280,
    pad: { t: 40, r: 70, b: 120, l: 70 },
    html: mac({ src: image('tagwise/import-dark.jpg'), alt: 'Tagwise spreadsheet import: rows checked, with problems marked', title: 'Tagwise — Import', theme: 'dark' }),
  },
  {
    name: 'tagwise-sites',
    dpr: 1,
    width: 1280,
    pad: { t: 40, r: 70, b: 120, l: 70 },
    html: mac({ src: image('tagwise/sites-dark.jpg'), alt: 'Tagwise sites: six places on a map of Botswana, with a list beside it', title: 'Tagwise — Sites', theme: 'dark' }),
  },
  // A phone screen is 390 CSS pixels wide, captured at 2x (780 px), so bake at 2x as well.
  {
    name: 'tagwise-phone',
    dpr: 2,
    width: 414,
    pad: { t: 30, r: 60, b: 110, l: 60 },
    html: iphone({ src: image('tagwise/phone-home-dark.jpg'), alt: 'Tagwise home on a phone: what needs attention', statusBg: '#131313', safeBg: '#151515', tone: 'dark' }),
  },
  // Kori: captures of its web apps' sample reserve (the desktop ones 1440 x 900, the phone ones 390 x 844 at 2x), taken by
  // capture-kori.mjs. To re-take and re-bake them after a restyle, see tools/mockups/README.md.
  {
    name: 'kori-landing',
    dpr: 1,
    width: 1280,
    pad: { t: 40, r: 70, b: 120, l: 70 },
    html: mac({ src: image('kori/landing.png'), alt: 'The Kori landing page: wildlife sightings that keep working where the signal ends', title: 'Kori', theme: koriLook.tone }),
  },
  {
    name: 'kori-review',
    dpr: 1,
    width: 1280,
    pad: { t: 40, r: 70, b: 120, l: 70 },
    html: mac({ src: image('kori/review.png'), alt: 'The Kori review console: a queue of sightings waiting for review, with one open on a map', title: 'Kori — Review', theme: koriLook.tone }),
  },
  {
    name: 'kori-phone-home',
    dpr: 2,
    width: 414,
    pad: { t: 30, r: 60, b: 110, l: 60 },
    html: iphone({ src: image('kori/phone-home.png'), alt: 'The Kori field app home screen on a phone', ...koriPhone }),
  },
  {
    name: 'kori-phone-map',
    dpr: 2,
    width: 414,
    pad: { t: 30, r: 60, b: 110, l: 60 },
    html: iphone({ src: image('kori/phone-map.png'), alt: 'The Kori field app map on a phone, drawn from a downloaded park pack', ...koriPhone }),
  },
  {
    name: 'kori-phone-log',
    dpr: 2,
    width: 414,
    pad: { t: 30, r: 60, b: 110, l: 60 },
    html: iphone({ src: image('kori/phone-log.png'), alt: 'The Kori field app log-a-sighting form on a phone', ...koriPhone }),
  },
  // The three phone screens side by side, which fits the gallery's wide stage better than three tall images.
  {
    name: 'kori-phones',
    dpr: 2,
    width: 1040,
    pad: { t: 20, r: 40, b: 80, l: 40 },
    html: `<div style="display:flex;gap:70px;align-items:flex-start">${[
      ['kori/phone-home.png', 'The Kori field app home screen on a phone'],
      ['kori/phone-map.png', 'The Kori field app map on a phone, drawn from a downloaded park pack'],
      ['kori/phone-log.png', 'The Kori field app log-a-sighting form on a phone'],
    ]
      .map(([file, alt]) => `<div style="width:300px">${iphone({ src: image(file), alt, ...koriPhone })}</div>`)
      .join('')}</div>`,
  },
];

const only = process.argv.slice(3);
const outDir = process.argv[2];
if (!outDir) {
  console.error('usage: node tools/mockups/bake.mjs <out-dir> [job-name ...]');
  process.exit(2);
}
mkdirSync(outDir, { recursive: true });

const exe = [process.env.BROWSER_PATH, 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome', '/usr/bin/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome']
  .filter(Boolean)
  .find(existsSync);
if (!exe) {
  console.error('No Edge or Chrome found. Set BROWSER_PATH.');
  process.exit(1);
}

const PORT = 9445;
const profile = mkdtempSync(path.join(tmpdir(), 'mockups-'));
const browser = spawn(exe, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--hide-scrollbars', '--force-color-profile=srgb', '--disable-gpu', '--allow-file-access-from-files', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let wsUrl;
for (let i = 0; i < 80 && !wsUrl; i++) {
  try {
    wsUrl = (await (await fetch(`http://127.0.0.1:${PORT}/json`)).json()).find((t) => t.type === 'page')?.webSocketDebuggerUrl;
  } catch {
    /* not up yet */
  }
  if (!wsUrl) await sleep(250);
}
if (!wsUrl) throw new Error('the browser did not start');

const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let nextId = 1;
const waiting = new Map();
ws.addEventListener('message', (m) => {
  const msg = JSON.parse(m.data);
  if (msg.id && waiting.has(msg.id)) {
    const { resolve, reject } = waiting.get(msg.id);
    waiting.delete(msg.id);
    msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
  }
});
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = nextId++;
    const timer = setTimeout(() => reject(new Error(`${method} timed out`)), 30000);
    waiting.set(id, { resolve: (v) => (clearTimeout(timer), resolve(v)), reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
const evaluate = async (expression) => (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result.value;

try {
  await send('Page.enable');
  await send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
  for (const job of JOBS) {
    if (only.length && !only.includes(job.name)) continue;
    const { t, r, b, l } = job.pad;
    const page = `<!doctype html><meta charset="utf-8"><style>${css}
html,body{margin:0;background:transparent}
.job{display:inline-block;padding:${t}px ${r}px ${b}px ${l}px}
.job__inner{width:${job.width}px}</style><body><div class="job"><div class="job__inner">${job.html}</div></div></body>`;
    const file = path.join(profile, `${job.name}.html`);
    writeFileSync(file, page);
    await send('Emulation.setDeviceMetricsOverride', { width: job.width + l + r, height: 1400, deviceScaleFactor: job.dpr, mobile: false });
    await send('Page.navigate', { url: pathToFileURL(file).href });
    await sleep(400);
    for (let i = 0; i < 60 && !(await evaluate("document.readyState === 'complete' && [...document.images].every((i) => i.complete && i.naturalWidth > 0)")); i++) await sleep(150);
    await sleep(300);
    const rect = await evaluate("(() => { const r = document.querySelector('.job').getBoundingClientRect(); return { x: r.x, y: r.y, width: Math.ceil(r.width), height: Math.ceil(r.height) }; })()");
    await send('Emulation.setDeviceMetricsOverride', { width: rect.width, height: rect.height, deviceScaleFactor: job.dpr, mobile: false });
    await sleep(250);
    const { data } = await send('Page.captureScreenshot', { format: 'png', clip: { ...rect, x: 0, y: 0, scale: 1 }, fromSurface: true });
    const target = path.join(outDir, `${job.name}.png`);
    writeFileSync(target, Buffer.from(data, 'base64'));
    console.log(`${job.name}.png  ${Math.round(rect.width * job.dpr)}x${Math.round(rect.height * job.dpr)}  ${Math.round(statSync(target).size / 1024)} KB`);
  }
} finally {
  ws.close();
  browser.kill();
}
