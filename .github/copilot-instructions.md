# Kodu Copilot Instructions

## Quick facts
- React 18 + TypeScript (strict) created with CRA; entry at `src/index.tsx`, routing lives in `src/App.tsx`.
- Only three routes today: `/` (`Welcome`), `/number-game`, `/log-hackaton`; all components live under `src/components`.
- Inline styles are the norm—no CSS files—so prefer extending existing style objects instead of introducing new stylesheets unless necessary.

## Architecture & flows
- `Welcome.tsx` is the landing menu and the single place that links to new tools/screens; keep button sizing and hover behavior consistent when adding entries.
- `NumberGame.tsx` drives all gameplay state locally (React hooks + `Set` tracking). It injects global `@keyframes` styles inside the component and listens to `window` arrow keys; keep cleanup logic symmetrical when adding listeners/timeouts.
- `LogHackaton.tsx` simulates a timer/log counter with paired `setInterval` calls. Always clear both intervals in the `useEffect` cleanup when adjusting cadence logic.

## Routing conventions
- `BrowserRouter` is configured without a `basename` because the site is served from the custom domain in `public/CNAME`; keep absolute paths (e.g., `navigate('/foo')`).
- When adding pages: create the component under `src/components`, add a `<Route>` in `App.tsx`, and expose a navigation button in `Welcome.tsx` so the feature stays discoverable.

## Assets & static files
- Images belong in `public/` (e.g., `public/otter.jpg`) and are referenced with root-relative URLs like `/otter.jpg` so CRA copies them during build.
- `static/` contains generated bundles tracked for GitHub Pages; do not edit by hand.
- Preserve the root `CNAME` and `public/CNAME` files—GitHub Pages relies on them for the `andres.dataleaper.com` custom domain.

## Tooling & scripts
- Install/build/test using the standard CRA scripts in `package.json`: `npm install`, `npm start`, `npm run build`, `npm test`.
- Manual deploys use `npm run deploy`, which runs `build` then publishes `build/` via `gh-pages`.
- CI (`.github/workflows/deploy.yml`) triggers on pushes to `gh-pages`, runs `npm ci`, `npx tsc --noEmit`, `npm run build`, validates `build/index.html`, then deploys with `actions/deploy-pages`.

## Working notes
- Type definitions come from `@types/*`; keep components typed (`React.ReactElement`, explicit `useState<number>` etc.).
- Browser-only APIs (e.g., `window.addEventListener`) need guards/cleanup because the workflow’s type-check step (`tsc --noEmit`) will fail on missing DOM types.
- Tests are not customized; if you add logic that warrants coverage, place CRA tests under `src/` alongside the component.
