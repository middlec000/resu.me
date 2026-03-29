#!/usr/bin/env node
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { program } from 'commander'
import { tailorResume } from './lib/tailor_resume.js'
import { formatOutput } from './lib/format_output.js'
import { validateResumeSchema } from '../../shared/validate_resume_schema.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..', '..')

program
  .name('tailor')
  .description(
    'Resume Tailor — tailor a JSON Resume to a job posting using Gemini'
  )
  .requiredOption('-r, --resume <path>', 'Path to the input JSON Resume file')
  .requiredOption('-j, --job <path>', 'Path to the job posting text file')
  .option(
    '-o, --output <path>',
    'Path to write the tailored JSON Resume (default: output/tailor/<resume-basename>.json)'
  )
  .option(
    '--render',
    'Also render the tailored resume to HTML alongside the JSON output'
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

  const resumePath = path.resolve(opts.resume)
  const jobPath = path.resolve(opts.job)
  const artifactsDir = path.join(
    repoRoot,
    'artifacts',
    'tailor_resume_to_job_posting'
  )

  const [
    resumeData,
    jobPosting,
    userPrompt,
    standardInstructions,
    qualityConstraints,
    responseSchema
  ] = await Promise.all([
    fs.readFile(resumePath, 'utf-8').then(JSON.parse),
    fs.readFile(jobPath, 'utf-8'),
    fs.readFile(path.join(artifactsDir, 'agent_role_v1.txt'), 'utf-8'),
    fs.readFile(
      path.join(artifactsDir, 'standard_instructions_v1.txt'),
      'utf-8'
    ),
    fs.readFile(path.join(artifactsDir, 'quality_constraints_v1.txt'), 'utf-8'),
    fs
      .readFile(
        path.join(repoRoot, 'shared', 'json_resume_schema.json'),
        'utf-8'
      )
      .then(JSON.parse)
  ])

  // Validate input resume
  const validation = validateResumeSchema(resumeData, responseSchema)
  if (!validation.valid) {
    console.error('Error: Input resume failed schema validation:')
    validation.errors.forEach(e => console.error(' •', e))
    process.exit(1)
  }

  console.log('Sending to Gemini (resume tailoring)…')
  const { resumeJson, prompt } = await tailorResume({
    apiKey,
    jobPosting,
    resumeData,
    userPrompt,
    standardInstructions,
    qualityConstraints,
    responseSchema
  })

  const basename = path.basename(resumePath, path.extname(resumePath))
  const defaultOutputPath = path.join(
    repoRoot,
    'output',
    'tailor',
    `${basename}.json`
  )
  const outputPath = path.resolve(opts.output || defaultOutputPath)

  await fs.mkdir(path.dirname(outputPath), { recursive: true })

  const writes = [
    fs.writeFile(outputPath, resumeJson, 'utf-8'),
    fs.writeFile(outputPath.replace(/\.json$/, '.prompt.txt'), prompt, 'utf-8')
  ]

  if (opts.render) {
    console.log('Rendering HTML…')
    const { default: theme } = await import('jsonresume-theme-straightforward')
    const html = await formatOutput(resumeJson, theme)
    const htmlPath = outputPath.replace(/\.json$/, '.html')
    writes.push(fs.writeFile(htmlPath, html, 'utf-8'))
    console.log(`HTML saved to: ${htmlPath}`)
  }

  await Promise.all(writes)
  console.log(`Tailored resume saved to: ${outputPath}`)
  console.log(
    `Prompt saved to: ${outputPath.replace(/\.json$/, '.prompt.txt')}`
  )
}

main().catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})
