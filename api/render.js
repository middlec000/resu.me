import { formatOutput } from '../tools/renderer/lib/format_output.js'

const ALLOWED_THEMES = new Set(['straightforward'])

export default async function handler (req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const { resumeJson, theme: themeName = 'straightforward' } = req.body
    if (!resumeJson) throw new Error('Missing resumeJson in request body')
    if (!ALLOWED_THEMES.has(themeName)) {
      throw new Error(`Unknown theme: ${themeName}`)
    }
    const { default: theme } = await import(`jsonresume-theme-${themeName}`)
    const html = await formatOutput(resumeJson, theme)
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.send(html)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}
