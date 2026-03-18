import fs from 'fs/promises'
import path from 'path'
import os from 'os'
import { pdfToJson } from './pdf_to_json.js'

async function main () {
  // Load API key
  const apiKey = JSON.parse(
    await fs.readFile(path.join(os.homedir(), 'code', 'api_keys.json'), 'utf-8')
  ).gemini_resume

  const artifactsDir = path.join(process.cwd(), 'artifacts')

  const [pdfBuffer, responseSchema] = await Promise.all([
    fs.readFile(
      path.join(
        process.cwd(),
        'examples',
        'resume_pdf',
        'neville_longbottom.pdf'
      )
    ),
    fs
      .readFile(path.join(artifactsDir, 'resume_schema_v1.json'), 'utf-8')
      .then(JSON.parse)
  ])

  let resumeJson
  try {
    ;({ resumeJson } = await pdfToJson({ apiKey, pdfBuffer, responseSchema }))
  } catch (err) {
    console.error(`Error: ${err.message}`)
    process.exit(1)
  }

  const outputDir = path.join(process.cwd(), 'output', 'pdf_to_json')
  await fs.mkdir(outputDir, { recursive: true })
  await fs.writeFile(
    path.join(outputDir, 'neville_longbottom.json'),
    resumeJson,
    'utf-8'
  )

  console.log(`Outputs saved to ${outputDir}`)
}

await main()
