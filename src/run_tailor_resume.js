import fs from 'fs/promises'
import path from 'path'
import os from 'os'
import theme from 'jsonresume-theme-straightforward'
import { tailorResumeToJobPosting } from './tailor_resume_to_job_posting.js'
import { formatOutputResume } from './format_output_resume.js'
import { validateResumeSchema } from './validate_resume_schema.js'

async function main () {
  // Load API key
  const apiKey = JSON.parse(
    await fs.readFile(path.join(os.homedir(), 'code', 'api_keys.json'), 'utf-8')
  ).gemini_resume

  // Load prompt components
  const inputDir = path.join(process.cwd(), 'examples')
  const artifactsDir = path.join(process.cwd(), 'artifacts')

  const [
    jobPosting,
    resumeData,
    userPrompt,
    standardInstructions,
    qualityConstraints,
    responseSchema
  ] = await Promise.all([
    fs.readFile(
      path.join(inputDir, 'job_postings', 'cryptofaunal_field_researcher.txt'),
      'utf-8'
    ),
    fs
      .readFile(
        path.join(inputDir, 'resumes_json', 'neville_longbottom.json'),
        'utf-8'
      )
      .then(JSON.parse),
    fs.readFile(
      path.join(
        artifactsDir,
        'tailor_resume_to_job_posting',
        'agent_role_v1.txt'
      ),
      'utf-8'
    ),
    fs.readFile(
      path.join(
        artifactsDir,
        'tailor_resume_to_job_posting',
        'standard_instructions_v1.txt'
      ),
      'utf-8'
    ),
    fs.readFile(
      path.join(
        artifactsDir,
        'tailor_resume_to_job_posting',
        'quality_constraints_v1.txt'
      ),
      'utf-8'
    ),
    fs
      .readFile(path.join(artifactsDir, 'resume_schema_v1.json'), 'utf-8')
      .then(JSON.parse)
  ])

  // Tailor resume
  let resumeJson, prompt
  try {
    const validation = validateResumeSchema(JSON.stringify(resumeData))
    if (!validation.valid) {
      throw new Error(
        `Resume failed schema validation:\n${validation.errors.join('\n')}`
      )
    }
    ;({ resumeJson, prompt } = await tailorResumeToJobPosting({
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
  const html = await formatOutputResume(resumeJson, theme)

  // Save outputs
  const outputDir = path.join(process.cwd(), 'output')
  await fs.mkdir(outputDir, { recursive: true })
  await Promise.all([
    fs.writeFile(
      path.join(outputDir, 'prompt_tailor_resume_to_job_posting.txt'),
      prompt,
      'utf-8'
    ),
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
