# Kodu - React Hello App

A simple React application that displays a friendly greeting.

## 🚀 Live Demo

The app is automatically deployed to GitHub Pages: https://andresnamm.github.io/kodu

## 🔄 Automated Deployment

This project uses GitHub Actions to automatically deploy to GitHub Pages whenever code is pushed to the `master` branch.

### Workflow Features
- **Automatic triggers**: Deploys on every push to `master`
- **Manual deployment**: Can be triggered manually via GitHub Actions UI
- **Build verification**: Validates build output before deployment
- **Latest actions**: Uses the most recent GitHub Actions versions

### GitHub Pages Setup Requirements

To enable GitHub Pages deployment for this repository:

1. Go to repository **Settings**
2. Navigate to **Pages** section
3. Set **Source** to "GitHub Actions"
4. The workflow will handle the rest automatically

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Deploy to GitHub Pages (manual)
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
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Pages deployment workflow
├── public/
│   └── index.html         # HTML template
├── src/
│   ├── App.js            # Main App component
│   └── index.js          # React entry point
└── package.json          # Dependencies and scripts
```

## 🔧 Technologies

- React 18
- Create React App
- GitHub Actions
- GitHub Pages