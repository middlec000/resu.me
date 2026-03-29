import { GoogleGenAI } from '@google/genai'

export async function pdfToJson ({ apiKey, pdfBuffer, responseSchema }) {
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
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: 'application/pdf',
                data: pdfBuffer.toString('base64')
              }
            },
            {
              text: 'Extract all resume information from this PDF and structure it as JSON conforming exactly to the provided schema. Preserve all content faithfully — do not summarise, embellish, or omit anything.'
            }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema
      }
    }),
    timeout
  ])

  const resumeJson = JSON.stringify(JSON.parse(response.text), null, 2)
  return { resumeJson }
}
