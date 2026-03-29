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
 * Validates a parsed resume object against the provided schema.
 * @param {object} obj  - Already-parsed resume object
 * @param {object} schema - JSON Schema object to validate against
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateResumeSchema (obj, schema) {
  const errors = []
  validateNode(obj, schema, 'root', errors)
  return { valid: errors.length === 0, errors }
}
