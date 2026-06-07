import theme from 'jsonresume-theme-straightforward'
import { formatOutput } from '../tools/renderer/lib/format_output.js'

export default async function handler (req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const { resumeJson } = req.body
    if (!resumeJson) throw new Error('Missing resumeJson in request body')
    const html = await formatOutput(resumeJson, theme)
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.send(html)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}
