import {
  copyFileSync,
  cpSync,
  existsSync,
  rmSync,
  writeFileSync,
} from 'node:fs';

const buildDirectory = new URL('../build/', import.meta.url);
const rootDirectory = new URL('../', import.meta.url);

if (!existsSync(new URL('index.html', buildDirectory))) {
  throw new Error('Build output is missing. Run npm run build first.');
}

for (const directory of ['static', 'learning-games']) {
  rmSync(new URL(directory, rootDirectory), { recursive: true, force: true });
  cpSync(
    new URL(directory, buildDirectory),
    new URL(directory, rootDirectory),
    { recursive: true },
  );
}

for (const file of ['index.html', 'asset-manifest.json']) {
  copyFileSync(new URL(file, buildDirectory), new URL(file, rootDirectory));
}

writeFileSync(new URL('.nojekyll', rootDirectory), '');
