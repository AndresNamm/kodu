# Kodu - React Hello App

A simple React application that displays a friendly greeting.

## 🚀 Live Demo

The app is deployed to GitHub Pages: https://andres.dataleaper.com

## 🔄 Deployment

GitHub Pages serves the root of the `gh-pages` branch. Build and synchronize
the production files before committing:

```bash
npm run deploy
git add -A
git commit
git push origin gh-pages
```

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Build and synchronize GitHub Pages files
npm run deploy
```

## 🖼️ Image Downloader Script

Python helpers live under `scripts/`. To use the image downloader:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python scripts/download_images.py "cute otter" --c 5
```

- Downloads land under `downloads/<keyword-slug>` by default (override with `--out <dir>`).
- Uses Bing Images HTML search behind the scenes, so results depend on what Bing surfaces for the given keywords.
- Use `--c`/`--count` to control how many JPGs to fetch; the script converts non-JPEG sources automatically.

## 📁 Project Structure

```
kodu/
├── public/
│   └── learning-games/   # Six-game browser application and assets
├── scripts/
│   └── sync-pages.mjs    # Copies the production build to the served branch root
├── src/
│   ├── App.tsx           # Fullscreen game host
│   └── index.tsx         # React entry point
└── package.json
```

## 🔧 Technologies

- React 18
- Create React App
- GitHub Pages

## Laste õppemängud

Rakendus koosneb nüüd ainult uuest kuue täisekraanimängu komplektist:

- numbrite tundmine;
- plokkide liitmine ja lahutamine;
- kuueastmeline lugemisõpe: häälikud, silbid, sõnad, puuduv täht ja sõna–pildi sobitamine;
- mesilase labürint;
- suundade õppimine eesti keeles;
- mesilane ja lilled.

Veebimängude lähtekood ja litsentsitud meedia asuvad kaustas
`public/learning-games/`. Mängukomplekt avaneb aadressil
`/learning-games/index.html`.

Varasemad eraldiseisvad numbrite, värvide ja tähtede mängud ning nende meedia
on eemaldatud.

Mänguloogika testid:

```bash
npm run test:games
```
