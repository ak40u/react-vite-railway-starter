# React starter for Railway

A React 19 single-page app built with Vite and served as static files.

## Why this exists

The Create React App template on Railway still builds with `react-scripts@5.0.1`
and React 18, from a repository last touched in July 2024. Two problems:

- **Create React App is deprecated.** The React team retired it in February 2025
  and now points people at Vite for exactly this kind of app. `react-scripts`
  drags in a large tree of unmaintained transitive dependencies, and Railway
  refuses to build when the committed lockfile carries a HIGH advisory.
- **There is nothing to run after the build.** That project defines only `dev`
  and `build` scripts — no `start` — so even a successful build has no server to
  hand the platform.

This starter builds with Vite and ships a `start` script that serves the built
output.

## What's in here

| File | Why it exists |
|------|---------------|
| `src/` | The app: `main.tsx`, `App.tsx`, a little CSS |
| `server.js` | 60 lines of Node that serve `dist/` — content types, SPA fallback, `/healthz` |
| `vite.config.ts` | Vite with the React plugin |
| `railway.json` | Health check on `/healthz`, restart on failure |
| `package-lock.json` | Committed, audited clean |

**Why a hand-written server instead of `serve` or `nginx`.** A built React app
needs exactly three things: correct content types, a fallback to `index.html` so
client-side routes survive a refresh, and a port it can be told about. That is
short enough to read in one sitting, and keeping it dependency-free means nothing
can quietly pull an advisory into the lockfile and block a future build.

Two details in it worth knowing:

- Assets under `/assets` are fingerprinted by Vite, so they are served
  `immutable`. `index.html` is served `no-cache`, otherwise a deploy leaves
  browsers pinned to the previous build.
- Paths are normalised before joining, so `..` cannot escape `dist/`.

## Run locally

```bash
npm ci
npm run dev        # http://localhost:5173
```

Production build, served the way Railway serves it:

```bash
npm run build && npm start
```

## Configuration

| Variable | Required | Purpose |
|----------|----------|---------|
| `PORT` | no | Defaults to 8080 |

## License

MIT
