import { createServer } from "node:http"
import { readFile, stat } from "node:fs/promises"
import { extname, join, normalize } from "node:path"

// A built React app is static files, so serving it needs no framework - just the
// two things a single-page app actually requires: correct content types, and a
// fallback to index.html so client-side routes survive a page refresh.
//
// Keeping this in the repo rather than adding a static-server dependency means
// nothing else can pull an advisory into the lockfile and block the build.

const root = join(import.meta.dirname, "dist")
const port = Number(process.env.PORT ?? 8080)

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
}

async function send(res, path, status = 200) {
  const body = await readFile(path)
  const ext = extname(path)
  res.writeHead(status, {
    "content-type": types[ext] ?? "application/octet-stream",
    // Vite fingerprints filenames under /assets, so those are safe to cache hard.
    // index.html must not be, or a deploy leaves browsers on the previous build.
    "cache-control": path.includes(`${join("/", "assets", "/")}`)
      ? "public, max-age=31536000, immutable"
      : "no-cache",
  })
  res.end(body)
}

const server = createServer(async (req, res) => {
  if (req.url === "/healthz") {
    res.writeHead(200, { "content-type": "application/json" })
    return res.end(JSON.stringify({ status: "ok" }))
  }

  // normalize() collapses ".." so a request cannot escape dist/
  const rel = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^(\.\.[/\\])+/, "")
  const file = join(root, rel)

  try {
    const info = await stat(file)
    if (info.isFile()) return await send(res, file)
  } catch {
    // fall through to the SPA fallback
  }

  try {
    await send(res, join(root, "index.html"))
  } catch {
    res.writeHead(500, { "content-type": "text/plain" })
    res.end("dist/index.html is missing - run `npm run build` first")
  }
})

server.listen(port, () => console.log(`serving dist on ${port}`))

for (const signal of ["SIGTERM", "SIGINT"]) {
  process.on(signal, () => server.close(() => process.exit(0)))
}
