import { GoogleGenAI } from '@google/genai'

function buildPrompt ({
  jobPosting,
  resumeData,
  userPrompt,
  standardInstructions,
  qualityConstraints
}) {
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

export async function tailorResumeToJobPosting ({
  apiKey,
  jobPosting,
  resumeData,
  userPrompt,
  standardInstructions,
  qualityConstraints,
  responseSchema
}) {
  const prompt = buildPrompt({
    jobPosting,
    resumeData,
    userPrompt,
    standardInstructions,
    qualityConstraints
  })

  const ai = new GoogleGenAI({ apiKey })

  const timeout = new Promise((_, reject) =>
    setTimeout(
      () => reject(new Error('Gemini API request timed out after 1 minute')),
      60_000
    )
  )

  const response = await Promise.race([
    ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema
      }
    }),
    timeout
  ])

  const resumeJson = JSON.stringify(JSON.parse(response.text), null, 2)
  return { resumeJson, prompt }
}
