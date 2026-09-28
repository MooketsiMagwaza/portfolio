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

// Every job: the content, its width in CSS pixels, the room around it for the
// shadow, and the pixel density. `html` is what is drawn inside the padding.
const JOBS = [
  {
    name: 'stocklink-store-order-dark',
    dpr: 1,
    width: 1280,
    pad: { t: 40, r: 70, b: 120, l: 70 },
    html: mac({ src: image('stocklink/store-order-dark.png'), alt: 'StockLink retail store view: an order in transit', title: 'StockLink — Order', theme: 'dark' }),
  },
  {
    name: 'stocklink-driver-phones-dark',
    dpr: 2,
    width: 720,
    pad: { t: 30, r: 50, b: 100, l: 50 },
    html: `<div style="display:flex;gap:60px;align-items:flex-start">
      <div style="width:330px">${iphone({ src: image('stocklink/driver-pickup-screen-dark.png'), alt: 'StockLink driver app: collecting with the pickup code', statusBg: '#161617' })}</div>
      <div style="width:330px">${iphone({ src: image('stocklink/driver-road-screen-dark.png'), alt: 'StockLink driver app: on the road', statusBg: '#161617' })}</div>
    </div>`,
  },
  {
    name: 'stocklink-public-tracking-dark',
    dpr: 1,
    width: 620,
    pad: { t: 30, r: 70, b: 100, l: 70 },
    html: mac({ src: image('stocklink/public-tracking-dark.png'), alt: 'StockLink public tracking page', title: 'Track a parcel', theme: 'dark' }),
  },
  {
    name: 'tsela-rider-routes',
    dpr: 1,
    width: 1280,
    pad: { t: 40, r: 70, b: 120, l: 70 },
    html: mac({ src: image('tsela/rider-routes.jpg'), alt: 'Tsela rider app: every mapped route in Gaborone, with search', title: 'Tsela — Explore every route', theme: 'light' }),
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
