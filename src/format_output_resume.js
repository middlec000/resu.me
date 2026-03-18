import { render } from 'resumed'

export async function formatOutputResume (resumeJson, theme) {
  const resumeData =
    typeof resumeJson === 'string' ? JSON.parse(resumeJson) : resumeJson
  const { schema_version: _, ...resumeDataWithoutVersion } = resumeData
  return render(resumeDataWithoutVersion, theme)
}
