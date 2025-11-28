import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { XFeatureField } from './XFeatureField';
import type { Mapping, Options } from '../../types/xfeature';
import type { XFeatureMock } from '../../contexts/XFeatureContext';

describe('XFeatureField', () => {
  // ========================================================================
  // TEXT FIELD TESTS
  // ========================================================================

  it('renders text field with label', () => {
    const field: Mapping = {
      name: 'username',
      label: 'Username',
      dataType: 'Text',
    };

    const onChange = vi.fn();
    render(<XFeatureField definition={field} value="" onChange={onChange} />);

    expect(screen.getByLabelText('Username')).toBeInTheDocument();
  });

  it('renders text field with initial value', () => {
    const field: Mapping = {
      name: 'username',
      label: 'Username',
      dataType: 'Text',
    };

    const onChange = vi.fn();
    render(<XFeatureField definition={field} value="john" onChange={onChange} />);

    const input = screen.getByLabelText('Username') as HTMLInputElement;
    expect(input.value).toBe('john');
  });

  it('calls onChange when text field value changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field: Mapping = {
      name: 'username',
      label: 'Username',
      dataType: 'Text',
    };

    render(<XFeatureField definition={field} value="" onChange={onChange} />);

    const input = screen.getByLabelText('Username');
    await user.type(input, 'john');
    expect(onChange).toHaveBeenCalled();
  });

  it('renders email field with correct input type', () => {
    const field: Mapping = {
      name: 'email',
      label: 'Email',
      dataType: 'Email',
    };

    const onChange = vi.fn();
    render(<XFeatureField definition={field} value="" onChange={onChange} />);

    const input = screen.getByLabelText('Email') as HTMLInputElement;
    expect(input.type).toBe('email');
  });

  it('renders password field with correct input type', () => {
    const field: Mapping = {
      name: 'password',
      label: 'Password',
      dataType: 'Password',
    };

    const onChange = vi.fn();
    render(<XFeatureField definition={field} value="" onChange={onChange} />);

    const input = screen.getByLabelText('Password') as HTMLInputElement;
    expect(input.type).toBe('password');
  });

  it('renders number field with correct input type', () => {
    const field: Mapping = {
      name: 'age',
      label: 'Age',
      dataType: 'Number',
    };

    const onChange = vi.fn();
    render(<XFeatureField definition={field} value="" onChange={onChange} />);

    const input = screen.getByLabelText('Age') as HTMLInputElement;
    expect(input.type).toBe('number');
  });

  it('renders date field with correct input type', () => {
    const field: Mapping = {
      name: 'birthDate',
      label: 'Birth Date',
      dataType: 'Date',
    };

    const onChange = vi.fn();
    render(<XFeatureField definition={field} value="" onChange={onChange} />);

    const input = screen.getByLabelText('Birth Date') as HTMLInputElement;
    expect(input.type).toBe('date');
  });

  it('renders datetime field with correct input type', () => {
    const field: Mapping = {
      name: 'createdAt',
      label: 'Created At',
      dataType: 'DateTime',
    };

    const onChange = vi.fn();
    render(<XFeatureField definition={field} value="" onChange={onChange} />);

    const input = screen.getByLabelText('Created At') as HTMLInputElement;
    expect(input.type).toBe('datetime-local');
  });

  it('renders time field with correct input type', () => {
    const field: Mapping = {
      name: 'time',
      label: 'Time',
      dataType: 'Time',
    };

    const onChange = vi.fn();
    render(<XFeatureField definition={field} value="" onChange={onChange} />);

    const input = screen.getByLabelText('Time') as HTMLInputElement;
    expect(input.type).toBe('time');
  });

  it('renders phone field with tel input type', () => {
    const field: Mapping = {
      name: 'phone',
      label: 'Phone',
      dataType: 'Phone',
    };

    const onChange = vi.fn();
    render(<XFeatureField definition={field} value="" onChange={onChange} />);

    const input = screen.getByLabelText('Phone') as HTMLInputElement;
    expect(input.type).toBe('tel');
  });

  it('renders URL field with url input type', () => {
    const field: Mapping = {
      name: 'website',
      label: 'Website',
      dataType: 'URL',
    };

    const onChange = vi.fn();
    render(<XFeatureField definition={field} value="" onChange={onChange} />);

    const input = screen.getByLabelText('Website') as HTMLInputElement;
    expect(input.type).toBe('url');
  });

  // ========================================================================
  // SELECT FIELD TESTS
  // ========================================================================

  it('renders select field with options', () => {
    const options: Options = {
      items: [
        { value: 'admin', label: 'Administrator' },
        { value: 'user', label: 'User' },
        { value: 'guest', label: 'Guest' },
      ],
    };

    const field: Mapping = {
      name: 'role',
      label: 'Role',
      dataType: 'Select',
      options,
    };

    const onChange = vi.fn();
    render(<XFeatureField definition={field} value="" onChange={onChange} />);

    expect(screen.getByLabelText('Role')).toBeInTheDocument();
  });

  it('renders select field with placeholder when not required', () => {
    const options: Options = {
      items: [
        { value: 'admin', label: 'Administrator' },
        { value: 'user', label: 'User' },
      ],
    };

    const field: Mapping = {
      name: 'role',
      label: 'Role',
      dataType: 'Select',
      options,
      required: false,
    };

    const onChange = vi.fn();
    render(<XFeatureField definition={field} value="" onChange={onChange} />);

    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });

  it('does not render placeholder when required', () => {
    const options: Options = {
      items: [
        { value: 'admin', label: 'Administrator' },
      ],
    };

    const field: Mapping = {
      name: 'role',
      label: 'Role',
      dataType: 'Select',
      options,
      required: true,
    };

    const onChange = vi.fn();
    render(<XFeatureField definition={field} value="" onChange={onChange} />);

    expect(screen.queryByText('Select an option')).not.toBeInTheDocument();
  });

  // ========================================================================
  // CHECKBOX FIELD TESTS
  // ========================================================================

  it('renders checkbox field', () => {
    const field: Mapping = {
      name: 'isActive',
      label: 'Active',
      dataType: 'Checkbox',
    };

    const onChange = vi.fn();
    render(<XFeatureField definition={field} value={false} onChange={onChange} />);

    expect(screen.getByLabelText('Active')).toBeInTheDocument();
  });

  it('checkbox renders unchecked when value is false', () => {
    const field: Mapping = {
      name: 'isActive',
      label: 'Active',
      dataType: 'Checkbox',
    };

    const onChange = vi.fn();
    render(<XFeatureField definition={field} value={false} onChange={onChange} />);

    const checkbox = screen.getByLabelText('Active') as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
  });

  it('checkbox renders checked when value is true', () => {
    const field: Mapping = {
      name: 'isActive',
      label: 'Active',
      dataType: 'Checkbox',
    };

    const onChange = vi.fn();
    render(<XFeatureField definition={field} value={true} onChange={onChange} />);

    const checkbox = screen.getByLabelText('Active') as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  // ========================================================================
  // RADIO FIELD TESTS
  // ========================================================================

  it('renders radio field with options', () => {
    const field: Mapping = {
      name: 'status',
      label: 'Status',
      dataType: 'Radio',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ],
    };

    const onChange = vi.fn();
    render(<XFeatureField definition={field} value="" onChange={onChange} />);

    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  // ========================================================================
  // TEXTAREA FIELD TESTS
  // ========================================================================

  it('renders textarea field', () => {
    const field: Mapping = {
      name: 'description',
      label: 'Description',
      dataType: 'Textarea',
    };

    const onChange = vi.fn();
    render(<XFeatureField definition={field} value="" onChange={onChange} />);

    const textarea = screen.getByLabelText('Description');
    expect(textarea.tagName).toBe('TEXTAREA');
  });

  it('textarea has default rows', () => {
    const field: Mapping = {
      name: 'description',
      label: 'Description',
      dataType: 'Textarea',
    };

    const onChange = vi.fn();
    render(<XFeatureField definition={field} value="" onChange={onChange} />);

    const textarea = screen.getByLabelText('Description') as HTMLTextAreaElement;
    expect(textarea.rows).toBe(4);
  });

  it('textarea respects custom rows', () => {
    const field: Mapping = {
      name: 'description',
      label: 'Description',
      dataType: 'Textarea',
      rows: 10,
    };

    const onChange = vi.fn();
    render(<XFeatureField definition={field} value="" onChange={onChange} />);

    const textarea = screen.getByLabelText('Description') as HTMLTextAreaElement;
    expect(textarea.rows).toBe(10);
  });

  // ========================================================================
  // VALIDATION AND ERROR TESTS
  // ========================================================================

  it('displays error message when errors are provided', () => {
    const field: Mapping = {
      name: 'email',
      label: 'Email',
      dataType: 'Email',
    };

    const onChange = vi.fn();
    render(
      <XFeatureField
        definition={field}
        value=""
        onChange={onChange}
        errors={['Invalid email format']}
      />
    );

    expect(screen.getByText('Invalid email format')).toBeInTheDocument();
  });

  it('displays helper text when no errors', () => {
    const field: Mapping = {
      name: 'email',
      label: 'Email',
      dataType: 'Email',
      helperText: 'Enter a valid email address',
    };

    const onChange = vi.fn();
    render(
      <XFeatureField
        definition={field}
        value=""
        onChange={onChange}
        errors={[]}
      />
    );

    expect(screen.getByText('Enter a valid email address')).toBeInTheDocument();
  });

  it('renders required indicator', () => {
    const field: Mapping = {
      name: 'username',
      label: 'Username',
      dataType: 'Text',
      required: true,
    };

    const onChange = vi.fn();
    render(<XFeatureField definition={field} value="" onChange={onChange} />);

    const input = screen.getByLabelText('Username') as HTMLInputElement;
    expect(input.required).toBe(true);
  });

  // ========================================================================
  // PLACEHOLDER AND DISABLED TESTS
  // ========================================================================

  it('renders field with placeholder', () => {
    const field: Mapping = {
      name: 'username',
      label: 'Username',
      dataType: 'Text',
      placeholder: 'Enter your username',
    };

    const onChange = vi.fn();
    render(<XFeatureField definition={field} value="" onChange={onChange} />);

    const input = screen.getByLabelText('Username') as HTMLInputElement;
    expect(input.placeholder).toBe('Enter your username');
  });

  it('renders readonly field as disabled', () => {
    const field: Mapping = {
      name: 'id',
      label: 'ID',
      dataType: 'Text',
      readonly: true,
    };

    const onChange = vi.fn();
    render(<XFeatureField definition={field} value="123" onChange={onChange} />);

    const input = screen.getByLabelText('ID') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  // ========================================================================
  // XFEATUREMOCK COMPATIBILITY TESTS
  // ========================================================================

  it('works with mapping from XFeatureMock', () => {
    const mockMapping: Mapping = {
      name: 'username',
      dataType: 'Text',
      label: 'Username',
      required: true,
      placeholder: 'Enter username',
    };

    const onChange = vi.fn();
    render(<XFeatureField definition={mockMapping} value="" onChange={onChange} />);

    expect(screen.getByLabelText('Username')).toBeInTheDocument();
  });

  it('handles field with all properties from mock', () => {
    const mockMapping: Mapping = {
      name: 'email',
      dataType: 'Email',
      label: 'Email Address',
      required: true,
      placeholder: 'user@example.com',
      readonly: false,
      disabled: false,
      helperText: 'We will send confirmation to this email',
    };

    const onChange = vi.fn();
    render(<XFeatureField definition={mockMapping} value="" onChange={onChange} />);

    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByText('We will send confirmation to this email')).toBeInTheDocument();
  });

  it('renders hidden field type', () => {
    const field: Mapping = {
      name: 'referrer',
      dataType: 'Hidden',
    };

    const onChange = vi.fn();
    render(<XFeatureField definition={field} value="home" onChange={onChange} />);

    const input = document.querySelector('input[type="hidden"]') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.value).toBe('home');
  });

  it('handles empty/missing definition gracefully', () => {
    const onChange = vi.fn();
    const { container } = render(
      <XFeatureField definition={undefined as any} value="" onChange={onChange} />
    );

    expect(container.querySelector('div')?.textContent).toBe('');
  });

  it('renders field with currency datatype', () => {
    const field: Mapping = {
      name: 'price',
      label: 'Price',
      dataType: 'Currency',
    };

    const onChange = vi.fn();
    render(<XFeatureField definition={field} value="" onChange={onChange} />);

    const input = screen.getByLabelText('Price') as HTMLInputElement;
    expect(input.type).toBe('number');
  });

  it('renders field with decimal datatype', () => {
    const field: Mapping = {
      name: 'rate',
      label: 'Rate',
      dataType: 'Decimal',
    };

    const onChange = vi.fn();
    render(<XFeatureField definition={field} value="" onChange={onChange} />);

    const input = screen.getByLabelText('Rate') as HTMLInputElement;
    expect(input.type).toBe('number');
  });
});
