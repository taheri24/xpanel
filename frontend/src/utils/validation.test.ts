import { describe, it, expect } from 'vitest';
import { validateFormField, validateFormFields } from './validation';
import type { Field } from '../types/xfeature';

describe('Validation Utils', () => {
  describe('validateFormField', () => {
    it('validates required field', () => {
      const field: Field = {
        name: 'username',
        label: 'Username',
        type: 'Text',
        required: true,
      };

      const result = validateFormField(field, '');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('passes validation for required field with value', () => {
      const field: Field = {
        name: 'username',
        label: 'Username',
        type: 'Text',
        required: true,
      };

      const result = validateFormField(field, 'john');
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('validates email format', () => {
      const field: Field = {
        name: 'email',
        label: 'Email',
        type: 'Email',
      };

      const invalidResult = validateFormField(field, 'invalid-email');
      expect(invalidResult.valid).toBe(false);

      const validResult = validateFormField(field, 'john@example.com');
      expect(validResult.valid).toBe(true);
    });

    it('validates phone format', () => {
      const field: Field = {
        name: 'phone',
        label: 'Phone',
        type: 'Phone',
      };

      const invalidResult = validateFormField(field, 'abc');
      expect(invalidResult.valid).toBe(false);

      const validResult = validateFormField(field, '555-123-4567');
      expect(validResult.valid).toBe(true);
    });

    it('validates URL format', () => {
      const field: Field = {
        name: 'website',
        label: 'Website',
        type: 'URL',
      };

      const invalidResult = validateFormField(field, 'invalid-url');
      expect(invalidResult.valid).toBe(false);

      const validResult = validateFormField(field, 'https://example.com');
      expect(validResult.valid).toBe(true);
    });

    it('validates number format', () => {
      const field: Field = {
        name: 'age',
        label: 'Age',
        type: 'Number',
      };

      const invalidResult = validateFormField(field, 'not-a-number');
      expect(invalidResult.valid).toBe(false);

      const validResult = validateFormField(field, '25');
      expect(validResult.valid).toBe(true);
    });

    it('allows empty non-required field', () => {
      const field: Field = {
        name: 'bio',
        label: 'Bio',
        type: 'Text',
        required: false,
      };

      const result = validateFormField(field, '');
      expect(result.valid).toBe(true);
    });

    it('validates date format', () => {
      const field: Field = {
        name: 'birthDate',
        label: 'Birth Date',
        type: 'Date',
      };

      const validResult = validateFormField(field, '2000-01-15');
      expect(validResult.valid).toBe(true);

      const invalidResult = validateFormField(field, 'invalid-date');
      expect(invalidResult.valid).toBe(false);
    });
  });

  describe('validateFormFields', () => {
    it('validates multiple fields', () => {
      const fields: Field[] = [
        {
          name: 'username',
          label: 'Username',
          type: 'Text',
          required: true,
        },
        {
          name: 'email',
          label: 'Email',
          type: 'Email',
          required: true,
        },
      ];

      const values = {
        username: '',
        email: 'invalid-email',
      };

      const errors = validateFormFields(fields, values);
      expect(Object.keys(errors).length).toBe(2);
      expect(errors.username).toBeDefined();
      expect(errors.email).toBeDefined();
    });

    it('returns empty errors for valid fields', () => {
      const fields: Field[] = [
        {
          name: 'username',
          label: 'Username',
          type: 'Text',
          required: true,
        },
        {
          name: 'email',
          label: 'Email',
          type: 'Email',
          required: true,
        },
      ];

      const values = {
        username: 'john',
        email: 'john@example.com',
      };

      const errors = validateFormFields(fields, values);
      expect(Object.keys(errors).length).toBe(0);
    });
  });
});
