import fs from 'fs/promises'
import path from 'path'
import theme from 'jsonresume-theme-straightforward'
import { formatOutputResume } from '../src/format_output_resume.js'

async function main () {
  const outputDir = path.join(process.cwd(), 'output', 'format_resume_output')

  const resumeJson = await fs.readFile(
    path.join(outputDir, 'resume_tailored.json'),
    'utf-8'
  )

  const html = await formatOutputResume(resumeJson, theme)

  await fs.writeFile(
    path.join(outputDir, 'resume_tailored.html'),
    html,
    'utf-8'
  )

  console.log(`Outputs saved to ${outputDir}`)
}

await main()
