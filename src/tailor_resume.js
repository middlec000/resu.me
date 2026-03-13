import { GoogleGenAI } from '@google/genai'

function buildPrompt ({ jobPosting, resumeData, userPrompt, standardInstructions, qualityConstraints }) {
  return `
${userPrompt}
${standardInstructions}
${qualityConstraints}
<RESUME_JSON>
${JSON.stringify(resumeData, null, 2)}
</RESUME_JSON>
<JOB_POST>
${jobPosting}
</JOB_POST>
`
}

function stripEmpty (obj) {
  if (Array.isArray(obj)) return obj.map(stripEmpty)
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([, v]) => v !== '')
        .map(([k, v]) => [k, stripEmpty(v)])
    )
  }
  return obj
}

export async function tailorResume ({ apiKey, jobPosting, resumeData, userPrompt, standardInstructions, qualityConstraints, responseSchema }) {
  const prompt = buildPrompt({ jobPosting, resumeData, userPrompt, standardInstructions, qualityConstraints })

  const ai = new GoogleGenAI({ apiKey })
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema
    }
  })

  const resumeJson = JSON.stringify(stripEmpty(JSON.parse(response.text)), null, 2)
  return { resumeJson, prompt }
}
