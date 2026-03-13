import fs from 'fs/promises'
import path from 'path'
import { render } from 'resumed'
import theme from 'jsonresume-theme-straightforward'

async function main () {
  const inputPath = path.join(
    process.cwd(),
    'model_output',
    'resume_tailored.json'
  )
  const outputDir = path.join(process.cwd(), 'formatted_resume')
  const outputPath = path.join(outputDir, 'resume_tailored.html')

  const resumeData = JSON.parse(await fs.readFile(inputPath, 'utf-8'))
  await fs.mkdir(outputDir, { recursive: true })

  const html = await render(resumeData, theme)
  await fs.writeFile(outputPath, html, 'utf-8')

  console.log(`Successfully saved formatted resume to ${outputPath}`)
}

await main()
