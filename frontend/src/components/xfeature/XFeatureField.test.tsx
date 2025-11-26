import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { XFeatureField } from './XFeatureField';
import type { Field } from '../../types/xfeature';

describe('XFeatureField', () => {
  it('renders text field', () => {
    const field: Field = {
      name: 'username',
      label: 'Username',
      type: 'Text',
    };

    const onChange = vi.fn();
    render(
      <XFeatureField
        definition={field}
        value=""
        onChange={onChange}
      />
    );

    expect(screen.getByLabelText('Username')).toBeInTheDocument();
  });

  it('renders email field', () => {
    const field: Field = {
      name: 'email',
      label: 'Email',
      type: 'Email',
    };

    const onChange = vi.fn();
    render(
      <XFeatureField
        definition={field}
        value=""
        onChange={onChange}
      />
    );

    const input = screen.getByLabelText('Email') as HTMLInputElement;
    expect(input.type).toBe('email');
  });

  it('renders password field', () => {
    const field: Field = {
      name: 'password',
      label: 'Password',
      type: 'Password',
    };

    const onChange = vi.fn();
    render(
      <XFeatureField
        definition={field}
        value=""
        onChange={onChange}
      />
    );

    const input = screen.getByLabelText('Password') as HTMLInputElement;
    expect(input.type).toBe('password');
  });

  it('renders number field', () => {
    const field: Field = {
      name: 'age',
      label: 'Age',
      type: 'Number',
    };

    const onChange = vi.fn();
    render(
      <XFeatureField
        definition={field}
        value=""
        onChange={onChange}
      />
    );

    const input = screen.getByLabelText('Age') as HTMLInputElement;
    expect(input.type).toBe('number');
  });

  it('renders checkbox field', () => {
    const field: Field = {
      name: 'agree',
      label: 'I Agree',
      type: 'Checkbox',
    };

    const onChange = vi.fn();
    render(
      <XFeatureField
        definition={field}
        value={false}
        onChange={onChange}
      />
    );

    expect(screen.getByLabelText('I Agree')).toBeInTheDocument();
  });

  it('renders select field with options', () => {
    const field: Field = {
      name: 'role',
      label: 'Role',
      type: 'Select',
      options: [
        { value: 'admin', label: 'Admin' },
        { value: 'user', label: 'User' },
      ],
    };

    const onChange = vi.fn();
    render(
      <XFeatureField
        definition={field}
        value=""
        onChange={onChange}
      />
    );

    // MUI Select uses aria-labelledby, so we use getByRole instead
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders textarea field', () => {
    const field: Field = {
      name: 'bio',
      label: 'Bio',
      type: 'Textarea',
      rows: 4,
    };

    const onChange = vi.fn();
    render(
      <XFeatureField
        definition={field}
        value=""
        onChange={onChange}
      />
    );

    expect(screen.getByLabelText('Bio')).toBeInTheDocument();
  });

  it('calls onChange when field value changes', async () => {
    const user = userEvent.setup();
    const field: Field = {
      name: 'username',
      label: 'Username',
      type: 'Text',
    };

    const onChange = vi.fn();
    render(
      <XFeatureField
        definition={field}
        value=""
        onChange={onChange}
      />
    );

    const input = screen.getByLabelText('Username');
    await user.type(input, 'testuser');
    expect(onChange).toHaveBeenCalled();
  });

  it('calls onBlur when field loses focus', async () => {
    const user = userEvent.setup();
    const field: Field = {
      name: 'username',
      label: 'Username',
      type: 'Text',
    };

    const onChange = vi.fn();
    const onBlur = vi.fn();
    render(
      <XFeatureField
        definition={field}
        value=""
        onChange={onChange}
        onBlur={onBlur}
      />
    );

    const input = screen.getByLabelText('Username');
    await user.click(input);
    await user.tab();
    expect(onBlur).toHaveBeenCalled();
  });

  it('displays error message when provided', () => {
    const field: Field = {
      name: 'username',
      label: 'Username',
      type: 'Text',
    };

    const onChange = vi.fn();
    render(
      <XFeatureField
        definition={field}
        value=""
        onChange={onChange}
        errors={['Username is required']}
      />
    );

    expect(screen.getByText('Username is required')).toBeInTheDocument();
  });

  it('disables field when readonly is true', () => {
    const field: Field = {
      name: 'username',
      label: 'Username',
      type: 'Text',
      readonly: true,
    };

    const onChange = vi.fn();
    render(
      <XFeatureField
        definition={field}
        value="john"
        onChange={onChange}
      />
    );

    const input = screen.getByLabelText('Username') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it('displays placeholder when provided', () => {
    const field: Field = {
      name: 'username',
      label: 'Username',
      type: 'Text',
      placeholder: 'Enter your username',
    };

    const onChange = vi.fn();
    render(
      <XFeatureField
        definition={field}
        value=""
        onChange={onChange}
      />
    );

    expect(screen.getByPlaceholderText('Enter your username')).toBeInTheDocument();
  });
});
