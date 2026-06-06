#!/usr/bin/env node
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { program } from 'commander'
import { formatOutput } from './lib/format_output.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..', '..')

program
  .name('renderer')
  .description('Resume Renderer — render a JSON Resume to HTML using a theme')
  .requiredOption('-r, --resume <path>', 'Path to the input JSON Resume file')
  .option(
    '-t, --theme <name>',
    'Theme name to use for rendering (default: straightforward)',
    'straightforward'
  )
  .option(
    '-o, --output <path>',
    'Path to write the HTML file (default: output/renderer/<resume-basename>.html)'
  )
  .parse(process.argv)

const opts = program.opts()

async function main () {
  const resumePath = path.resolve(opts.resume)
  const resumeJson = await fs.readFile(resumePath, 'utf-8')

  const themeName = opts.theme
  const { default: theme } = await import(`jsonresume-theme-${themeName}`)

  console.log(`Rendering with theme: ${themeName}…`)
  const html = await formatOutput(resumeJson, theme)

  const basename = path.basename(resumePath, path.extname(resumePath))
  const defaultOutputPath = path.join(
    repoRoot,
    'output',
    'renderer',
    `${basename}.html`
  )
  const outputPath = path.resolve(opts.output || defaultOutputPath)

  await fs.mkdir(path.dirname(outputPath), { recursive: true })
  await fs.writeFile(outputPath, html, 'utf-8')
  console.log(`HTML saved to: ${outputPath}`)
}

main().catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})
