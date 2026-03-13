import fs from 'fs/promises'
import path from 'path'
import { render } from 'resumed'

async function main () {
  const inputPath = path.join(
    process.cwd(),
    'model_output',
    'resume_tailored.json'
  )
  const outputDir = path.join(process.cwd(), 'formatted_resume')
  const outputPath = path.join(outputDir, 'resume_tailored.html')

  await fs.mkdir(outputDir, { recursive: true })

  await render(inputPath, {
    theme: 'jsonresume-theme-straightforward',
    output: outputPath
  })

  console.log(`Successfully saved formatted resume to ${outputPath}`)
}

await main()
