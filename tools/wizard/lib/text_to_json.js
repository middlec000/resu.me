import { GoogleGenAI } from '@google/genai'

function buildPrompt ({ resumeText, standardInstructions }) {
  return `${standardInstructions}

<RESUME_TEXT>
${resumeText}
</RESUME_TEXT>
`
}

export async function textToJson ({
  apiKey,
  resumeText,
  standardInstructions,
  responseSchema
}) {
  const prompt = buildPrompt({ resumeText, standardInstructions })

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
