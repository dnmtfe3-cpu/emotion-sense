import { cp, mkdir, rm, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const out = path.join(root, 'www');
const files = [
  'index.html',
  'styles.css',
  'brand.css',
  'app.js',
  'app-main.js',
  'app-core.js',
  'cohesion.js',
  'onboarding.js',
  'experience.js',
  'manifest.webmanifest',
  'sw.js',
  'favicon.ico',
  'favicon-32.png',
  'apple-touch-icon.png',
  'icon-192.png',
  'icon.svg',
  'logo.svg'
];

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

for (const file of files) {
  const source = path.join(root, file);
  try {
    await access(source, constants.R_OK);
    await cp(source, path.join(out, file));
  } catch {
    if (['experience.js', 'sw.js'].includes(file)) continue;
    throw new Error(`Arquivo obrigatório não encontrado: ${file}`);
  }
}

console.log(`Emotion Sense web bundle pronto em ${out}`);
