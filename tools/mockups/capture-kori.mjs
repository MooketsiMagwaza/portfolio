#!/usr/bin/env node
// Takes the Kori screens from the running web apps, with headless Edge or Chrome over the Chrome
// DevTools Protocol, and writes them to public/images/kori/ (the sources of the Kori bake jobs).
//
//   node tools/mockups/capture-kori.mjs [--scheme light|dark] [--out <dir>]
//
// Start the apps first, in the Kori repository (nothing in it is changed):
//   apps/field    npm run build && npm start    http://localhost:3100   (phone-first)
//   apps/landing  npm run build && npm start    http://localhost:3000
//   apps/review   npm run build && npm start    http://localhost:3300
// Override the addresses with KORI_FIELD_URL, KORI_LANDING_URL and KORI_REVIEW_URL.
//
// What it writes:
//   landing.png, review.png          1440 x 900, 1x     (desktop; Mac window in the bake)
//   phone-home.png, phone-map.png,   390 x 844 at 2x    (780 x 1688; iPhone in the bake)
//   phone-log.png
//   phone-colours.json               the apps' top-bar and bottom-bar colours and whether the look is
//                                    light or dark, which tools/mockups/bake.mjs reads for the
//                                    status bar, the home strip and the Mac window theme
//
// The map shot clicks "Download the sample pack" and waits for the map to draw, so it needs a fresh
// browser profile: the script always starts one. Headless Edge enforces a minimum window width, so the
// phone size is emulated (Emulation.setDeviceMetricsOverride) rather than set with --window-size.

import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = path.dirname(fileURLToPath(import.meta.url));
const flag = (name, fallback) => {
  const at = process.argv.indexOf(name);
  return at === -1 ? fallback : process.argv[at + 1];
};
const scheme = flag('--scheme', 'light');
const out = path.resolve(flag('--out', path.join(here, '../../public/images/kori')));
const FIELD = process.env.KORI_FIELD_URL ?? 'http://localhost:3100';
const LANDING = process.env.KORI_LANDING_URL ?? 'http://localhost:3000';
const REVIEW = process.env.KORI_REVIEW_URL ?? 'http://localhost:3300';

const DESKTOP = { w: 1440, h: 900, dpr: 1, mobile: false };
const PHONE = { w: 390, h: 844, dpr: 2, mobile: true };
// Hides the visually-hidden "skip to content" link, whose shadow can leak a smudge into the top-left corner.
const HIDE_SKIP_LINK = `document.head.appendChild(Object.assign(document.createElement('style'), { textContent: '.skip-link{display:none!important}' })), 'ok'`;

// Steps: goto, wait (ms), click (text of a button or link), type (into a selector), eval, blur, shot (file name).
const SHOTS = [
  { ...DESKTOP, steps: [{ goto: `${LANDING}/` }, { wait: 2500 }, { eval: HIDE_SKIP_LINK }, { shot: 'landing' }] },
  { ...DESKTOP, steps: [{ goto: `${REVIEW}/` }, { wait: 2500 }, { eval: HIDE_SKIP_LINK }, { shot: 'review' }] },
  { ...PHONE, steps: [{ goto: `${FIELD}/` }, { wait: 2500 }, { eval: HIDE_SKIP_LINK }, { shot: 'phone-home' }] },
  // The map starts empty; the pack download fills it.
  { ...PHONE, steps: [{ goto: `${FIELD}/map` }, { wait: 2000 }, { click: 'Download the sample pack' }, { wait: 6000 }, { eval: HIDE_SKIP_LINK }, { shot: 'phone-map' }] },
  // Search for a species and pick it, so the rest of the form (how many, when, where) fits on the screen.
  {
    ...PHONE,
    steps: [
      { goto: `${FIELD}/log` },
      { wait: 2500 },
      { type: { selector: 'input[type=search], input[type=text], input:not([type])', text: 'leopard' } },
      { wait: 800 },
      { click: 'Leopard' },
      { wait: 800 },
      { blur: true },
      { eval: HIDE_SKIP_LINK },
      { wait: 500 },
      { shot: 'phone-log' },
    ],
  },
];

const exe = [process.env.BROWSER_PATH, 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome', '/usr/bin/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome']
  .filter(Boolean)
  .find(existsSync);
if (!exe) {
  console.error('No Edge or Chrome found. Set BROWSER_PATH.');
  process.exit(1);
}
mkdirSync(out, { recursive: true });

const PORT = 9447;
const profile = mkdtempSync(path.join(tmpdir(), 'kori-capture-'));
const browser = spawn(exe, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--hide-scrollbars', '--force-color-profile=srgb', '--disable-gpu', '--enable-unsafe-swiftshader', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
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
const consoleLines = [];
ws.addEventListener('message', (m) => {
  const msg = JSON.parse(m.data);
  if (msg.id && waiting.has(msg.id)) {
    const { resolve, reject } = waiting.get(msg.id);
    waiting.delete(msg.id);
    msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
  } else if (msg.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(msg.params.type)) {
    consoleLines.push(`${msg.params.type}: ${msg.params.args.map((a) => a.value ?? a.description).join(' ')}`);
  } else if (msg.method === 'Runtime.exceptionThrown') {
    consoleLines.push(`exception: ${msg.params.exceptionDetails.text} ${msg.params.exceptionDetails.exception?.description ?? ''}`);
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

const hex = (r, g, b) => `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
const luminance = (r, g, b) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
const pixel = (raw, x, y) => {
  const i = (y * raw.info.width + x) * raw.info.channels;
  return [raw.data[i], raw.data[i + 1], raw.data[i + 2]];
};

try {
  await send('Page.enable');
  await send('Runtime.enable');
  for (const shot of SHOTS) {
    await send('Emulation.setDeviceMetricsOverride', { width: shot.w, height: shot.h, deviceScaleFactor: shot.dpr, mobile: shot.mobile });
    await send('Emulation.setTouchEmulationEnabled', { enabled: shot.mobile });
    if (shot.mobile) await send('Emulation.setUserAgentOverride', { userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36' });
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: scheme }] });
    consoleLines.length = 0;
    for (const step of shot.steps) {
      if (step.goto) {
        await send('Page.navigate', { url: step.goto });
        await sleep(800);
        for (let i = 0; i < 60 && (await evaluate('document.readyState')) !== 'complete'; i++) await sleep(150);
      } else if (step.wait) {
        await sleep(step.wait);
      } else if (step.click) {
        const ok = await evaluate(`(() => { const t = ${JSON.stringify(step.click)}.toLowerCase(); const el = [...document.querySelectorAll('button, a, [role=button]')].find((e) => e.textContent.trim().toLowerCase().includes(t)); if (!el) return false; el.scrollIntoView({ block: 'center' }); el.click(); return true; })()`);
        if (!ok) console.warn(`  could not find "${step.click}" to click`);
      } else if (step.type) {
        await evaluate(`document.querySelector(${JSON.stringify(step.type.selector)}).focus()`);
        await send('Input.insertText', { text: step.type.text });
      } else if (step.blur) {
        await evaluate('document.activeElement && document.activeElement.blur(), true');
      } else if (step.eval) {
        await evaluate(step.eval);
      } else if (step.shot) {
        const { data } = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
        const file = path.join(out, `${step.shot}.png`);
        writeFileSync(file, Buffer.from(data, 'base64'));
        console.log(`${step.shot}.png  ${shot.w * shot.dpr}x${shot.h * shot.dpr}`);
      }
    }
    if (consoleLines.length) console.log(`  console messages:\n    ${consoleLines.join('\n    ')}`);
  }
} finally {
  ws.close();
  browser.kill();
}

// The look of the phone app, for the bake: the top bar's colour (behind the status bar), the bottom bar's
// colour (the strip under it), and whether the app is light or dark (so the status text is dark or white).
const home = await sharp(path.join(out, 'phone-home.png')).raw().toBuffer({ resolveWithObject: true });
const top = pixel(home, Math.floor(home.info.width / 2), 2);
const bottom = pixel(home, Math.floor(home.info.width / 2), home.info.height - 4);
const colours = { scheme, statusBg: hex(...top), safeBg: hex(...bottom), tone: luminance(...top) > 0.5 ? 'light' : 'dark' };
writeFileSync(path.join(out, 'phone-colours.json'), `${JSON.stringify(colours, null, 2)}\n`);
console.log('phone-colours.json', JSON.stringify(colours));
