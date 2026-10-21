const TYPE_CHECKS = {
  object: (value) => value !== null && typeof value === "object" && !Array.isArray(value),
  array: Array.isArray,
  string: (value) => typeof value === "string",
  number: (value) => typeof value === "number" && Number.isFinite(value),
  integer: (value) => Number.isInteger(value),
  boolean: (value) => typeof value === "boolean",
  null: (value) => value === null,
};

function matchesType(value, type) {
  if (Array.isArray(type)) return type.some((entry) => matchesType(value, entry));
  return TYPE_CHECKS[type]?.(value) ?? true;
}

function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function formatPath(base, key) {
  if (typeof key === "number") return `${base}[${key}]`;
  return `${base}.${key}`;
}

function addError(errors, path, message) {
  errors.push(`${path}: ${message}`);
}

function checkString(value, schema, path, errors) {
  if (schema.minLength !== undefined && value.length < schema.minLength) {
    addError(errors, path, `must contain at least ${schema.minLength} characters`);
  }
  if (schema.maxLength !== undefined && value.length > schema.maxLength) {
    addError(errors, path, `must contain at most ${schema.maxLength} characters`);
  }
  if (schema.pattern !== undefined) {
    let pattern;
    try {
      pattern = new RegExp(schema.pattern);
    } catch {
      addError(errors, path, `has an invalid schema pattern: ${schema.pattern}`);
      return;
    }
    if (!pattern.test(value)) addError(errors, path, `must match ${schema.pattern}`);
  }
}

function checkNumber(value, schema, path, errors) {
  if (schema.minimum !== undefined && value < schema.minimum) {
    addError(errors, path, `must be greater than or equal to ${schema.minimum}`);
  }
  if (schema.maximum !== undefined && value > schema.maximum) {
    addError(errors, path, `must be less than or equal to ${schema.maximum}`);
  }
  if (schema.exclusiveMinimum !== undefined && value <= schema.exclusiveMinimum) {
    addError(errors, path, `must be greater than ${schema.exclusiveMinimum}`);
  }
  if (schema.exclusiveMaximum !== undefined && value >= schema.exclusiveMaximum) {
    addError(errors, path, `must be less than ${schema.exclusiveMaximum}`);
  }
}

function checkObject(value, schema, path, errors) {
  const properties = schema.properties ?? {};
  for (const required of schema.required ?? []) {
    if (!(required in value)) addError(errors, path, `is missing required property "${required}"`);
  }
  if (schema.minProperties !== undefined && Object.keys(value).length < schema.minProperties) {
    addError(errors, path, `must contain at least ${schema.minProperties} properties`);
  }
  if (schema.maxProperties !== undefined && Object.keys(value).length > schema.maxProperties) {
    addError(errors, path, `must contain at most ${schema.maxProperties} properties`);
  }
  for (const [key, entry] of Object.entries(value)) {
    if (key in properties) {
      validateAgainstSchema(entry, properties[key], formatPath(path, key), errors);
      continue;
    }
    if (schema.additionalProperties === false) {
      addError(errors, formatPath(path, key), "is not an allowed property");
    } else if (schema.additionalProperties && typeof schema.additionalProperties === "object") {
      validateAgainstSchema(entry, schema.additionalProperties, formatPath(path, key), errors);
    }
  }
}

function checkArray(value, schema, path, errors) {
  if (schema.minItems !== undefined && value.length < schema.minItems) {
    addError(errors, path, `must contain at least ${schema.minItems} items`);
  }
  if (schema.maxItems !== undefined && value.length > schema.maxItems) {
    addError(errors, path, `must contain at most ${schema.maxItems} items`);
  }
  if (schema.uniqueItems) {
    const seen = new Set();
    for (const item of value) {
      const key = JSON.stringify(item);
      if (seen.has(key)) addError(errors, path, "must contain unique items");
      seen.add(key);
    }
  }
  if (schema.items) {
    value.forEach((item, index) => {
      validateAgainstSchema(item, schema.items, formatPath(path, index), errors);
    });
  }
}

export function validateAgainstSchema(value, schema, path = "$", errors = []) {
  if (!schema || typeof schema !== "object") return errors;
  if (schema.type !== undefined && !matchesType(value, schema.type)) {
    addError(errors, path, `must be of type ${Array.isArray(schema.type) ? schema.type.join(" or ") : schema.type}`);
    return errors;
  }
  if (schema.const !== undefined && !deepEqual(value, schema.const)) {
    addError(errors, path, `must equal ${JSON.stringify(schema.const)}`);
  }
  if (Array.isArray(schema.enum) && !schema.enum.some((entry) => deepEqual(entry, value))) {
    addError(errors, path, `must be one of: ${schema.enum.map((entry) => JSON.stringify(entry)).join(", ")}`);
  }
  if (value === null || value === undefined) return errors;
  if (typeof value === "string") checkString(value, schema, path, errors);
  if (typeof value === "number") checkNumber(value, schema, path, errors);
  if (Array.isArray(value)) checkArray(value, schema, path, errors);
  else if (typeof value === "object") checkObject(value, schema, path, errors);
  return errors;
}
