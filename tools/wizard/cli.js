#!/usr/bin/env node
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { program } from 'commander'
import { pdfToJson } from './lib/pdf_to_json.js'
import { textToJson } from './lib/text_to_json.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..', '..')

program
  .name('wizard')
  .description(
    'JSON Resume Wizard — extract a JSON Resume from a PDF or plain-text file using Gemini'
  )
  .requiredOption(
    '-i, --input <path>',
    'Path to a resume PDF (.pdf) or plain-text (.txt) file'
  )
  .option(
    '-o, --output <path>',
    'Path to write the JSON Resume (default: output/wizard/<basename>.json)'
  )
  .option(
    '-k, --api-key <key>',
    'Google Gemini API key (falls back to GEMINI_API_KEY env var)'
  )
  .parse(process.argv)

const opts = program.opts()

async function main () {
  const apiKey = opts.apiKey || process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error(
      'Error: Gemini API key is required. Use --api-key or set GEMINI_API_KEY.'
    )
    process.exit(1)
  }

  const inputPath = path.resolve(opts.input)
  const ext = path.extname(inputPath).toLowerCase()

  const responseSchema = JSON.parse(
    await fs.readFile(
      path.join(repoRoot, 'shared', 'json_resume_schema.json'),
      'utf-8'
    )
  )

  let resumeJson

  if (ext === '.pdf') {
    console.log(`Reading PDF: ${inputPath}`)
    const pdfBuffer = await fs.readFile(inputPath)
    console.log('Sending to Gemini (PDF extraction)…')
    ;({ resumeJson } = await pdfToJson({ apiKey, pdfBuffer, responseSchema }))
  } else if (ext === '.txt') {
    const artifactsDir = path.join(
      repoRoot,
      'artifacts',
      'text_to_formatted_json'
    )
    const [resumeText, standardInstructions] = await Promise.all([
      fs.readFile(inputPath, 'utf-8'),
      fs.readFile(
        path.join(artifactsDir, 'standard_instructions_v1.txt'),
        'utf-8'
      )
    ])
    console.log(`Reading text file: ${inputPath}`)
    console.log('Sending to Gemini (text extraction)…')
    ;({ resumeJson } = await textToJson({
      apiKey,
      resumeText,
      standardInstructions,
      responseSchema
    }))
  } else {
    console.error(
      `Error: Unsupported file type "${ext}". Use a .pdf or .txt file.`
    )
    process.exit(1)
  }

  const basename = path.basename(inputPath, ext)
  const defaultOutputPath = path.join(
    repoRoot,
    'output',
    'wizard',
    `${basename}.json`
  )
  const outputPath = path.resolve(opts.output || defaultOutputPath)

  await fs.mkdir(path.dirname(outputPath), { recursive: true })
  await fs.writeFile(outputPath, resumeJson, 'utf-8')
  console.log(`JSON Resume saved to: ${outputPath}`)
}

main().catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})
