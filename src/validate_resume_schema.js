import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const schema = JSON.parse(
  readFileSync(join(__dirname, '../artifacts/json_resume_schema.json'), 'utf-8')
)

function validateNode (value, schemaDef, path, errors) {
  if (schemaDef.type) {
    const actualType = Array.isArray(value)
      ? 'array'
      : value === null
      ? 'null'
      : typeof value

    const expectedType = schemaDef.type
    const typeMatch =
      expectedType === 'integer'
        ? Number.isInteger(value)
        : actualType === expectedType

    if (!typeMatch) {
      errors.push(
        `${path}: expected ${expectedType}, got ${
          Array.isArray(value)
            ? 'array'
            : value === null
            ? 'null'
            : typeof value
        }`
      )
      return
    }
  }

  if (schemaDef.required && typeof value === 'object' && value !== null) {
    for (const field of schemaDef.required) {
      if (!(field in value)) {
        errors.push(`${path}: missing required field "${field}"`)
      }
    }
  }

  if (schemaDef.properties && typeof value === 'object' && value !== null) {
    for (const [key, propSchema] of Object.entries(schemaDef.properties)) {
      if (key in value) {
        validateNode(value[key], propSchema, `${path}.${key}`, errors)
      }
    }
  }

  if (schemaDef.items && Array.isArray(value)) {
    value.forEach((item, i) => {
      validateNode(item, schemaDef.items, `${path}[${i}]`, errors)
    })
  }
}

/**
 * Validates a JSON string against the resume schema.
 * @param {string} jsonString
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateResumeSchema (jsonString) {
  let parsed
  try {
    parsed = JSON.parse(jsonString)
  } catch (e) {
    return { valid: false, errors: [`Invalid JSON: ${e.message}`] }
  }

  const errors = []
  validateNode(parsed, schema, 'root', errors)
  return { valid: errors.length === 0, errors }
}
