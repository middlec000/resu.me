import http from 'http'
import fs from 'fs/promises'
import fsSync from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { formatOutput } from './tools/renderer/lib/format_output.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 8080

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
}

// Load allowed themes from shared/allowed_themes.json when available.
let ALLOWED_THEMES = new Set(['straightforward'])
try {
  const themesPath = path.join(__dirname, 'shared', 'allowed_themes.json')
  const raw = fsSync.readFileSync(themesPath, 'utf8')
  const arr = JSON.parse(raw)
  if (Array.isArray(arr) && arr.length) ALLOWED_THEMES = new Set(arr)
} catch (e) {
  // fallback to default set above
}

async function readBody (req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  return Buffer.concat(chunks).toString('utf-8')
}

const server = http.createServer(async (req, res) => {
  // ── API: POST /api/render ──────────────────────────────────────
  if (req.method === 'POST' && req.url === '/api/render') {
    try {
      const body = JSON.parse(await readBody(req))
      const { resumeJson, theme: themeName = 'straightforward' } = body
      if (!resumeJson) throw new Error('Missing resumeJson in request body')
      if (!ALLOWED_THEMES.has(themeName)) {
        throw new Error(`Unknown theme: ${themeName}`)
      }
      // prefer the compiled dist build to avoid importing .jsx sources
      let theme
      try {
        const mod = await import(`jsonresume-theme-${themeName}/dist`)
        theme = mod.default || mod
      } catch (e) {
        const mod = await import(`jsonresume-theme-${themeName}`)
        theme = mod.default || mod
      }
      const html = await formatOutput(resumeJson, theme)
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end(html)
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: err.message }))
    }
    return
  }

  // ── Static file serving ────────────────────────────────────────
  let urlPath = req.url.split('?')[0]
  if (urlPath === '/') urlPath = '/index.html'

  const filePath = path.join(__dirname, urlPath)
  try {
    const data = await fs.readFile(filePath)
    const ext = path.extname(filePath).toLowerCase()
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream'
    })
    res.end(data)
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end('Not found')
  }
})

server.listen(PORT, () => {
  console.log(`Serving at http://localhost:${PORT}`)
})
