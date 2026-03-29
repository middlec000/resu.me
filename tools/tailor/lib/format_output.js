import { render } from 'resumed'

function removeEmptyJSONEntries (obj) {
  if (Array.isArray(obj)) return obj.map(removeEmptyJSONEntries)
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([, v]) => v !== '')
        .map(([k, v]) => [k, removeEmptyJSONEntries(v)])
    )
  }
  return obj
}

export async function formatOutput (resumeJson, theme) {
  const resumeData =
    typeof resumeJson === 'string' ? JSON.parse(resumeJson) : resumeJson
  const { schema_version: _, ...resumeDataWithoutVersion } = resumeData
  return render(removeEmptyJSONEntries(resumeDataWithoutVersion), theme)
}
