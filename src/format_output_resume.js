import { render } from 'resumed'

export async function formatOutputResume (resumeJson, theme) {
  const resumeData =
    typeof resumeJson === 'string' ? JSON.parse(resumeJson) : resumeJson
  return render(resumeData, theme)
}
