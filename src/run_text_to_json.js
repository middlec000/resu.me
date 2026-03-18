import fs from 'fs/promises'
import path from 'path'
import os from 'os'
import { textToStandardJson } from './text_to_standard_json.js'

async function main () {
  // Load API key
  const apiKey = JSON.parse(
    await fs.readFile(path.join(os.homedir(), 'code', 'api_keys.json'), 'utf-8')
  ).gemini_resume

  const inputDir = path.join(process.cwd(), 'examples')
  const artifactsDir = path.join(process.cwd(), 'artifacts')

  const [resumeText, standardInstructions, responseSchema] = await Promise.all([
    fs.readFile(
      path.join(inputDir, 'resumes_txt', 'neville_longbottom.txt'),
      'utf-8'
    ),
    fs.readFile(
      path.join(artifactsDir, 'text_to_formatted_json', 'standard_instructions_v1.txt'),
      'utf-8'
    ),
    fs
      .readFile(path.join(artifactsDir, 'resume_schema_v1.json'), 'utf-8')
      .then(JSON.parse)
  ])

  let resumeJson, prompt
  try {
    ;({ resumeJson, prompt } = await textToStandardJson({
      apiKey,
      resumeText,
      standardInstructions,
      responseSchema
    }))
  } catch (err) {
    console.error(`Error: ${err.message}`)
    process.exit(1)
  }

  const outputDir = path.join(process.cwd(), 'output')
  await fs.mkdir(outputDir, { recursive: true })
  await Promise.all([
    fs.writeFile(
      path.join(outputDir, 'prompt_text_to_json.txt'),
      prompt,
      'utf-8'
    ),
    fs.writeFile(
      path.join(outputDir, 'resume_formatted.json'),
      resumeJson,
      'utf-8'
    )
  ])

  console.log(`Outputs saved to ${outputDir}`)
}

await main()
