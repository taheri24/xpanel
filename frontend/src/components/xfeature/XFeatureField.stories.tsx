import type { Meta } from '@storybook/react';
import { useState } from 'react';
import { XFeatureField } from './XFeatureField';
import type { Field } from '../../types/xfeature';

const meta = {
  title: 'XFeature/XFeatureField',
  component: XFeatureField,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof XFeatureField>;

export default meta;

function FieldWrapper({ definition }: { definition: Field }) {
  const [value, setValue] = useState<string | number | boolean>('');
  const [errors, setErrors] = useState<string[]>([]);

  return (
    <div style={{ width: '300px' }}>
      <XFeatureField
        definition={definition}
        value={value}
        onChange={setValue}
        onBlur={() => {
          if (definition.required && !value) {
            setErrors(['This field is required']);
          } else {
            setErrors([]);
          }
        }}
        errors={errors}
      />
    </div>
  );
}

export const TextInput = {
  render: () => (
    <FieldWrapper
      definition={{
        name: 'username',
        label: 'Username',
        type: 'Text',
        placeholder: 'Enter your username',
      }}
    />
  ),
};

export const EmailInput = {

  render: () => (
    <FieldWrapper
      definition={{
        name: 'email',
        label: 'Email',
        type: 'Email',
        placeholder: 'Enter your email',
        required: true,
      }}
    />
  ),
};

export const PasswordInput = {

  render: () => (
    <FieldWrapper
      definition={{
        name: 'password',
        label: 'Password',
        type: 'Password',
        required: true,
      }}
    />
  ),
};

export const NumberInput = {

  render: () => (
    <FieldWrapper
      definition={{
        name: 'age',
        label: 'Age',
        type: 'Number',
      }}
    />
  ),
};

export const SelectField = {

  render: () => (
    <FieldWrapper
      definition={{
        name: 'role',
        label: 'Role',
        type: 'Select',
        options: [
          { value: 'admin', label: 'Administrator' },
          { value: 'user', label: 'User' },
          { value: 'guest', label: 'Guest' },
        ],
      }}
    />
  ),
};

export const CheckboxField = {

  render: () => (
    <FieldWrapper
      definition={{
        name: 'agree',
        label: 'I agree to the terms and conditions',
        type: 'Checkbox',
      }}
    />
  ),
};

export const RadioField = {

  render: () => (
    <FieldWrapper
      definition={{
        name: 'gender',
        label: 'Gender',
        type: 'Radio',
        options: [
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' },
          { value: 'other', label: 'Other' },
        ],
      }}
    />
  ),
};

export const TextareaField = {

  render: () => (
    <FieldWrapper
      definition={{
        name: 'bio',
        label: 'Biography',
        type: 'Textarea',
        rows: 4,
        placeholder: 'Tell us about yourself',
      }}
    />
  ),
};

export const DateField = {

  render: () => (
    <FieldWrapper
      definition={{
        name: 'birthDate',
        label: 'Birth Date',
        type: 'Date',
      }}
    />
  ),
};

export const ReadOnlyField = {

  render: () => (
    <FieldWrapper
      definition={{
        name: 'id',
        label: 'ID',
        type: 'Text',
        readonly: true,
        defaultValue: '12345',
      }}
    />
  ),
};

export const FieldWithError = {
  render: () => {
    const [value, setValue] = useState<string | number | boolean>('');
    return (
      <div style={{ width: '300px' }}>
        <XFeatureField
          definition={{
            name: 'email',
            label: 'Email',
            type: 'Email',
            helperText: 'Enter a valid email address',
          }}
          value={value}
          onChange={setValue}
          errors={['Invalid email format']}
        />
      </div>
    );
  },
};
