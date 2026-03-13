import { execFile } from 'child_process'
import fs from 'fs/promises'
import path from 'path'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

async function main () {
  const inputPath = path.join(
    process.cwd(),
    'model_output',
    'resume_tailored.json'
  )
  const outputDir = path.join(process.cwd(), 'formatted_resume')
  const outputPath = path.join(outputDir, 'resume_tailored.html')

  await fs.mkdir(outputDir, { recursive: true })

  const resumed = path.join(process.cwd(), 'node_modules', '.bin', 'resumed')
  await execFileAsync(resumed, [
    'render',
    inputPath,
    '--theme',
    'jsonresume-theme-straightforward',
    '--output',
    outputPath
  ])

  console.log(`Successfully saved formatted resume to ${outputPath}`)
}

await main()
