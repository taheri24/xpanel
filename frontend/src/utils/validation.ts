import type { Field, ValidationResult } from '../types/xfeature';

/**
 * Validation Utilities
 * Functions for validating form fields based on XFeature definitions
 */

const VALIDATION_PATTERNS: Record<string, RegExp> = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\d\s\-\+\(\)]+$/,
  url: /^https?:\/\/.+/,
  number: /^-?\d+(\.\d+)?$/,
  integer: /^-?\d+$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
};

export function validateFormField(
  field: Field,
  value: unknown
): ValidationResult {
  const errors: string[] = [];

  // Check required
  if (field.required && !value) {
    errors.push(`${field.label} is required`);
    return { valid: false, errors };
  }

  if (!value) {
    return { valid: true, errors };
  }

  const stringValue = String(value);

  // Type-specific validation
  switch (field.type) {
    case 'Email':
      if (!VALIDATION_PATTERNS.email.test(stringValue)) {
        errors.push(`${field.label} must be a valid email address`);
      }
      break;

    case 'Phone':
      if (!VALIDATION_PATTERNS.phone.test(stringValue)) {
        errors.push(`${field.label} must be a valid phone number`);
      }
      break;

    case 'URL':
      if (!VALIDATION_PATTERNS.url.test(stringValue)) {
        errors.push(`${field.label} must be a valid URL`);
      }
      break;

    case 'Number':
    case 'Decimal':
    case 'Currency':
      if (!VALIDATION_PATTERNS.number.test(stringValue)) {
        errors.push(`${field.label} must be a valid number`);
      }
      break;

    case 'Date':
      if (!isValidDate(stringValue)) {
        errors.push(`${field.label} must be a valid date`);
      }
      break;

    case 'DateTime':
      if (!isValidDateTime(stringValue)) {
        errors.push(`${field.label} must be a valid date and time`);
      }
      break;

    default:
      break;
  }

  // Check custom validation pattern
  if (field.validation && !field.validation.includes('|')) {
    try {
      const pattern = new RegExp(field.validation);
      if (!pattern.test(stringValue)) {
        errors.push(`${field.label} format is invalid`);
      }
    } catch {
      console.warn(`Invalid validation pattern for ${field.name}:`, field.validation);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateFormFields(
  fields: Field[],
  values: Record<string, unknown>
): Record<string, string[]> {
  const errors: Record<string, string[]> = {};

  fields.forEach((field) => {
    const validation = validateFormField(field, values[field.name]);
    if (validation.errors.length > 0) {
      errors[field.name] = validation.errors;
    }
  });

  return errors;
}

function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

function isValidDateTime(dateTimeString: string): boolean {
  const date = new Date(dateTimeString);
  return !isNaN(date.getTime());
}
