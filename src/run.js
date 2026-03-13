import fs from 'fs/promises'
import path from 'path'
import os from 'os'
import theme from 'jsonresume-theme-straightforward'
import { tailorResume } from './tailor_resume.js'
import { formatResume } from './format_resume.js'

async function main () {
  // Load API key
  const apiKey = JSON.parse(
    await fs.readFile(path.join(os.homedir(), 'code', 'api_keys.json'), 'utf-8')
  ).gemini_resume

  // Load prompt components
  const inputDir = path.join(process.cwd(), 'input')
  const artifactsDir = path.join(process.cwd(), 'artifacts')

  const [
    jobPosting,
    resumeData,
    userPrompt,
    standardInstructions,
    qualityConstraints,
    responseSchema
  ] = await Promise.all([
    fs.readFile(path.join(inputDir, 'job_posting.txt'), 'utf-8'),
    fs
      .readFile(path.join(inputDir, 'base_resume.json'), 'utf-8')
      .then(JSON.parse),
    fs.readFile(path.join(inputDir, 'user_prompt.txt'), 'utf-8'),
    fs.readFile(path.join(artifactsDir, 'standard_instructions.txt'), 'utf-8'),
    fs.readFile(path.join(artifactsDir, 'quality_constraints.txt'), 'utf-8'),
    fs
      .readFile(path.join(artifactsDir, 'response_schema.json'), 'utf-8')
      .then(JSON.parse)
  ])

  // Tailor resume
  let resumeJson, prompt
  try {
    ;({ resumeJson, prompt } = await tailorResume({
      apiKey,
      jobPosting,
      resumeData,
      userPrompt,
      standardInstructions,
      qualityConstraints,
      responseSchema
    }))
  } catch (err) {
    console.error(`Error: ${err.message}`)
    process.exit(1)
  }

  // Format resume
  const html = await formatResume(resumeJson, theme)

  // Save outputs
  const outputDir = path.join(process.cwd(), 'output')
  await fs.mkdir(outputDir, { recursive: true })
  await Promise.all([
    fs.writeFile(path.join(outputDir, 'prompt.txt'), prompt, 'utf-8'),
    fs.writeFile(
      path.join(outputDir, 'resume_tailored.json'),
      resumeJson,
      'utf-8'
    ),
    fs.writeFile(path.join(outputDir, 'resume_tailored.html'), html, 'utf-8')
  ])

  console.log(`Outputs saved to ${outputDir}`)
}

await main()
