import { formatOutput } from '../tools/renderer/lib/format_output.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// load allowed themes
let ALLOWED_THEMES = new Set(['straightforward'])
try {
  const themesPath = path.join(__dirname, '..', 'shared', 'allowed_themes.json')
  const raw = fs.readFileSync(themesPath, 'utf8')
  const arr = JSON.parse(raw)
  if (Array.isArray(arr) && arr.length) ALLOWED_THEMES = new Set(arr)
} catch (e) {
  // keep default
}

export default async function handler (req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const { resumeJson, theme: themeName = 'straightforward' } = req.body
    if (!resumeJson) throw new Error('Missing resumeJson in request body')
    if (!ALLOWED_THEMES.has(themeName))
      throw new Error(`Unknown theme: ${themeName}`)

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
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.send(html)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}
