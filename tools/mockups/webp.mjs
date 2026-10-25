#!/usr/bin/env node
// Converts a baked PNG to the WebP the gallery uses, keeping the transparency.
//
//   node tools/mockups/webp.mjs <baked.png> <out-dir> [--width N] [--thumb N] [--name file]
//
//   --width N   scale down to N pixels wide (never up). Leave it out to keep the size.
//   --thumb N   also write <name>-sm.webp, N pixels wide: the small cover image. Do this for
//               the project's first shot only.
//   --name x    the output name without the extension (default: the PNG's name).
//
// Prints the size to put in the project's `shots` entry. `sharp` comes in with Astro.

import { statSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const args = process.argv.slice(2);
const option = (flag) => {
  const at = args.indexOf(flag);
  return at === -1 ? undefined : args.splice(at, 2)[1];
};
const width = Number(option('--width')) || undefined;
const thumb = Number(option('--thumb')) || undefined;
const name = option('--name');
const [input, outDir] = args;
if (!input || !outDir) {
  console.error('usage: node tools/mockups/webp.mjs <baked.png> <out-dir> [--width N] [--thumb N] [--name file]');
  process.exit(2);
}

await mkdir(outDir, { recursive: true });
const base = name ?? path.basename(input, path.extname(input));
const options = { quality: 82, alphaQuality: 90, effort: 6 };

const main = path.join(outDir, `${base}.webp`);
const info = await sharp(input).resize({ width, withoutEnlargement: true }).webp(options).toFile(main);
console.log(`${base}.webp  w: ${info.width}, h: ${info.height}  ${Math.round(statSync(main).size / 1024)} KB`);

if (thumb) {
  const small = path.join(outDir, `${base}-sm.webp`);
  const t = await sharp(input).resize({ width: thumb, withoutEnlargement: true }).webp(options).toFile(small);
  console.log(`${base}-sm.webp  w: ${t.width}, h: ${t.height}  ${Math.round(statSync(small).size / 1024)} KB`);
}
