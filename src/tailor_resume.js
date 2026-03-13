import { GoogleGenAI } from "@google/genai";
import fs from "fs/promises";
import path from "path";
import os from "os";

async function getApiKey() {
  const filePath = path.join(os.homedir(), "code", "api_keys.json");
  const data = await fs.readFile(filePath, "utf-8");
  const keys = JSON.parse(data);
  return keys.gemini_resume;
}

const apiKey = await getApiKey();
const ai = new GoogleGenAI({ apiKey });

async function getPrompt(model_input_dir, artifacts_dir) {
  const jobPosting = await fs.readFile(path.join(model_input_dir, "job_posting.txt"), "utf-8");
  const resumeData = JSON.parse(await fs.readFile(path.join(model_input_dir, "base_resume.json"), "utf-8"));
  const userPrompt = await fs.readFile(path.join(model_input_dir, "user_prompt.txt"), "utf-8");
  const standardInstructions = await fs.readFile(path.join(artifacts_dir, "standard_instructions.txt"), "utf-8");
  const qualityConstraints = await fs.readFile(path.join(artifacts_dir, "quality_constraints.txt"), "utf-8");

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
`;
}

async function main() {
  const prompt = await getPrompt(
    path.join(process.cwd(), "model_input"),
    path.join(process.cwd(), "artifacts")
  );

  const outputDir = path.join(process.cwd(), "model_output");
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(path.join(outputDir, "prompt.txt"), prompt, "utf-8");

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          basics: {
            type: "object",
            properties: {
              name: { type: "string" },
              label: { type: "string" },
              image: { type: "string" },
              email: { type: "string" },
              phone: { type: "string" },
              url: { type: "string" },
              summary: { type: "string" },
              location: {
                type: "object",
                properties: {
                  address: { type: "string" },
                  postalCode: { type: "string" },
                  city: { type: "string" },
                  countryCode: { type: "string" },
                  region: { type: "string" }
                }
              },
              profiles: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    network: { type: "string" },
                    username: { type: "string" },
                    url: { type: "string" }
                  }
                }
              }
            }
          },
          work: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                position: { type: "string" },
                url: { type: "string" },
                startDate: { type: "string" },
                endDate: { type: "string" },
                summary: { type: "string" },
                highlights: { type: "array", items: { type: "string" } }
              }
            }
          },
          volunteer: {
            type: "array",
            items: {
              type: "object",
              properties: {
                organization: { type: "string" },
                position: { type: "string" },
                url: { type: "string" },
                startDate: { type: "string" },
                endDate: { type: "string" },
                summary: { type: "string" },
                highlights: { type: "array", items: { type: "string" } }
              }
            }
          },
          education: {
            type: "array",
            items: {
              type: "object",
              properties: {
                institution: { type: "string" },
                url: { type: "string" },
                area: { type: "string" },
                studyType: { type: "string" },
                startDate: { type: "string" },
                endDate: { type: "string" },
                score: { type: "string" },
                courses: { type: "array", items: { type: "string" } }
              }
            }
          },
          awards: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                date: { type: "string" },
                awarder: { type: "string" },
                summary: { type: "string" }
              }
            }
          },
          certificates: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                date: { type: "string" },
                issuer: { type: "string" },
                url: { type: "string" }
              }
            }
          },
          publications: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                publisher: { type: "string" },
                releaseDate: { type: "string" },
                url: { type: "string" },
                summary: { type: "string" }
              }
            }
          },
          skills: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                level: { type: "string" },
                keywords: { type: "array", items: { type: "string" } }
              }
            }
          },
          languages: {
            type: "array",
            items: {
              type: "object",
              properties: {
                language: { type: "string" },
                fluency: { type: "string" }
              }
            }
          },
          interests: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                keywords: { type: "array", items: { type: "string" } }
              }
            }
          },
          references: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                reference: { type: "string" }
              }
            }
          },
          projects: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                startDate: { type: "string" },
                endDate: { type: "string" },
                description: { type: "string" },
                highlights: { type: "array", items: { type: "string" } },
                url: { type: "string" }
              }
            }
          }
        }
      },
    },
  });

  const parsed = JSON.parse(response.text);

  function stripEmpty(obj) {
    if (Array.isArray(obj)) return obj.map(stripEmpty);
    if (obj && typeof obj === "object") {
      return Object.fromEntries(
        Object.entries(obj)
          .filter(([, v]) => v !== "")
          .map(([k, v]) => [k, stripEmpty(v)])
      );
    }
    return obj;
  }

  const outputPath = path.join(outputDir, "resume_tailored.json");
  await fs.writeFile(outputPath, JSON.stringify(stripEmpty(parsed), null, 2), "utf-8");
  console.log(`Successfully saved tailored resume to ${outputPath}`);
}

await main();
