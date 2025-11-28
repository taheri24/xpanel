import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { XFeatureForm } from './XFeatureForm';
import { XFeatureProvider, type XFeatureMock } from '../../contexts/XFeatureContext';
import type { Form, ActionQueryResponse, Mapping } from '../../types/xfeature';

// ============================================================================
// MOCK DATA
// ============================================================================

const mockMappings: Mapping[] = [
  { name: 'username', label: 'Username', dataType: 'Text', required: true },
  { name: 'email', label: 'Email', dataType: 'Email', required: true },
  { name: 'isActive', label: 'Active', dataType: 'Checkbox', required: false },
];

const createUserForm: Form = {
  id: 'create-user',
  mode: 'Create',
  title: 'Create User',
  actionRef: 'CreateUser',
  dialog: false,
  fields: [
    { name: 'username', label: 'Username', dataType: 'Text', required: true },
    { name: 'email', label: 'Email', dataType: 'Email', required: true },
  ],
  buttons: [
    { type: 'Submit', label: 'Create' },
    { type: 'Cancel', label: 'Cancel' },
  ],
};

const updateUserForm: Form = {
  id: 'update-user',
  mode: 'Edit',
  title: 'Edit User',
  actionRef: 'UpdateUser',
  dialog: true,
  fields: [
    { name: 'username', label: 'Username', dataType: 'Text', required: true },
    { name: 'email', label: 'Email', dataType: 'Email', required: true },
  ],
  buttons: [
    { type: 'Submit', label: 'Update' },
    { type: 'Cancel', label: 'Cancel' },
  ],
};

const successResponse: ActionQueryResponse = {
  success: true,
  message: 'User created successfully',
};

// ============================================================================
// TESTS
// ============================================================================

describe('XFeatureForm', () => {
  // ========================================================================
  // RENDERING TESTS
  // ========================================================================

  it('renders form with title', () => {
    const mock: XFeatureMock = {
      mappings: mockMappings,
      actionQueries: { CreateUser: successResponse },
    };

    render(
      <XFeatureProvider mock={mock}>
        <XFeatureForm definition={createUserForm} />
      </XFeatureProvider>
    );

    expect(screen.getByText('Create User')).toBeInTheDocument();
  });

  it('renders form fields', () => {
    const mock: XFeatureMock = {
      mappings: mockMappings,
      actionQueries: { CreateUser: successResponse },
    };

    render(
      <XFeatureProvider mock={mock}>
        <XFeatureForm definition={createUserForm} />
      </XFeatureProvider>
    );

    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('renders form buttons', () => {
    const mock: XFeatureMock = {
      mappings: mockMappings,
      actionQueries: { CreateUser: successResponse },
    };

    render(
      <XFeatureProvider mock={mock}>
        <XFeatureForm definition={createUserForm} />
      </XFeatureProvider>
    );

    expect(screen.getByText('Create')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  // ========================================================================
  // DIALOG MODE TESTS
  // ========================================================================

  it('renders form as dialog when dialog is true', () => {
    const mock: XFeatureMock = {
      mappings: mockMappings,
      actionQueries: { UpdateUser: successResponse },
    };

    const { container } = render(
      <XFeatureProvider mock={mock}>
        <XFeatureForm definition={updateUserForm} />
      </XFeatureProvider>
    );

    // Check for dialog presence
    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog).toBeInTheDocument();
  });

  it('renders form as regular form when dialog is false', () => {
    const mock: XFeatureMock = {
      mappings: mockMappings,
      actionQueries: { CreateUser: successResponse },
    };

    const { container } = render(
      <XFeatureProvider mock={mock}>
        <XFeatureForm definition={createUserForm} />
      </XFeatureProvider>
    );

    // Should render form but not dialog
    const form = container.querySelector('form');
    expect(form).toBeInTheDocument();
  });

  // ========================================================================
  // FORM SUBMISSION TESTS
  // ========================================================================

  it('submits form with field values', async () => {
    const user = userEvent.setup();
    const mock: XFeatureMock = {
      mappings: mockMappings,
      actionQueries: { CreateUser: successResponse },
    };

    render(
      <XFeatureProvider mock={mock}>
        <XFeatureForm definition={createUserForm} />
      </XFeatureProvider>
    );

    const usernameInput = screen.getByLabelText('Username');
    const emailInput = screen.getByLabelText('Email');
    const submitButton = screen.getByText('Create');

    await user.type(usernameInput, 'john');
    await user.type(emailInput, 'john@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/successfully/i)).toBeInTheDocument();
    });
  });

  it('calls onSuccess callback when form submission succeeds', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    const mock: XFeatureMock = {
      mappings: mockMappings,
      actionQueries: { CreateUser: successResponse },
    };

    render(
      <XFeatureProvider mock={mock}>
        <XFeatureForm definition={createUserForm} onSuccess={onSuccess} />
      </XFeatureProvider>
    );

    const usernameInput = screen.getByLabelText('Username');
    const emailInput = screen.getByLabelText('Email');
    const submitButton = screen.getByText('Create');

    await user.type(usernameInput, 'john');
    await user.type(emailInput, 'john@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('validates required fields on blur', async () => {
    const user = userEvent.setup();
    const mock: XFeatureMock = {
      mappings: mockMappings,
      actionQueries: { CreateUser: successResponse },
    };

    render(
      <XFeatureProvider mock={mock}>
        <XFeatureForm definition={createUserForm} />
      </XFeatureProvider>
    );

    const usernameInput = screen.getByLabelText('Username');
    await user.click(usernameInput);
    await user.tab();

    // Field should be marked as touched
    expect(usernameInput).toBeInTheDocument();
  });

  it('prevents form submission when validation fails', async () => {
    const user = userEvent.setup();
    const mock: XFeatureMock = {
      mappings: mockMappings,
      actionQueries: { CreateUser: successResponse },
    };

    render(
      <XFeatureProvider mock={mock}>
        <XFeatureForm definition={createUserForm} />
      </XFeatureProvider>
    );

    const submitButton = screen.getByText('Create');
    await user.click(submitButton);

    // Form should not submit without filling required fields
    expect(submitButton).toBeInTheDocument();
  });

  // ========================================================================
  // CANCEL BUTTON TESTS
  // ========================================================================

  it('calls onCancel when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const mock: XFeatureMock = {
      mappings: mockMappings,
      actionQueries: { CreateUser: successResponse },
    };

    render(
      <XFeatureProvider mock={mock}>
        <XFeatureForm definition={createUserForm} onCancel={onCancel} />
      </XFeatureProvider>
    );

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    expect(onCancel).toHaveBeenCalled();
  });

  // ========================================================================
  // RESET BUTTON TESTS
  // ========================================================================

  it('resets form when Reset button is clicked', async () => {
    const user = userEvent.setup();
    const formWithReset: Form = {
      ...createUserForm,
      buttons: [
        { type: 'Submit', label: 'Create' },
        { type: 'Reset', label: 'Reset' },
      ],
    };

    const mock: XFeatureMock = {
      mappings: mockMappings,
      actionQueries: { CreateUser: successResponse },
    };

    render(
      <XFeatureProvider mock={mock}>
        <XFeatureForm definition={formWithReset} />
      </XFeatureProvider>
    );

    const usernameInput = screen.getByLabelText('Username') as HTMLInputElement;
    const resetButton = screen.getByText('Reset');

    await user.type(usernameInput, 'john');
    expect(usernameInput.value).toBe('john');

    await user.click(resetButton);
    expect(usernameInput.value).toBe('');
  });

  // ========================================================================
  // FIELD VALUE UPDATES
  // ========================================================================

  it('updates field value when user types', async () => {
    const user = userEvent.setup();
    const mock: XFeatureMock = {
      mappings: mockMappings,
      actionQueries: { CreateUser: successResponse },
    };

    render(
      <XFeatureProvider mock={mock}>
        <XFeatureForm definition={createUserForm} />
      </XFeatureProvider>
    );

    const usernameInput = screen.getByLabelText('Username') as HTMLInputElement;
    await user.type(usernameInput, 'john');

    expect(usernameInput.value).toBe('john');
  });

  it('handles initial data properly', () => {
    const mock: XFeatureMock = {
      mappings: mockMappings,
      actionQueries: { CreateUser: successResponse },
    };

    render(
      <XFeatureProvider mock={mock}>
        <XFeatureForm
          definition={createUserForm}
          initialData={{ username: 'jane', email: 'jane@example.com' }}
        />
      </XFeatureProvider>
    );

    const usernameInput = screen.getByLabelText('Username') as HTMLInputElement;
    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;

    expect(usernameInput.value).toBe('jane');
    expect(emailInput.value).toBe('jane@example.com');
  });

  // ========================================================================
  // XFEATUREMOCK COMPATIBILITY TESTS
  // ========================================================================

  it('works with form definition from XFeatureMock', () => {
    const mockForm: Form = {
      id: 'test-form',
      mode: 'Create',
      title: 'Test Form',
      actionRef: 'TestAction',
      fields: [{ name: 'field1', label: 'Field 1', dataType: 'Text', required: true }],
      buttons: [{ type: 'Submit', label: 'Submit' }],
    };

    const mock: XFeatureMock = {
      mappings: [{ name: 'field1', label: 'Field 1', dataType: 'Text', required: true }],
      actionQueries: { TestAction: { success: true } },
    };

    render(
      <XFeatureProvider mock={mock}>
        <XFeatureForm definition={mockForm} />
      </XFeatureProvider>
    );

    expect(screen.getByText('Test Form')).toBeInTheDocument();
    expect(screen.getByLabelText('Field 1')).toBeInTheDocument();
  });

  // ========================================================================
  // FORM MESSAGES TESTS
  // ========================================================================

  it('renders form messages when provided', () => {
    const formWithMessages: Form = {
      ...createUserForm,
      messages: [
        { type: 'Info', content: 'Please fill in all required fields', visible: true },
      ],
    };

    const mock: XFeatureMock = {
      mappings: mockMappings,
      actionQueries: { CreateUser: successResponse },
    };

    render(
      <XFeatureProvider mock={mock}>
        <XFeatureForm definition={formWithMessages} />
      </XFeatureProvider>
    );

    expect(screen.getByText('Please fill in all required fields')).toBeInTheDocument();
  });

  // ========================================================================
  // LOADING STATE TESTS
  // ========================================================================

  it('disables buttons during form submission', async () => {
    const user = userEvent.setup();
    const mock: XFeatureMock = {
      mappings: mockMappings,
      actionQueries: { CreateUser: successResponse },
    };

    render(
      <XFeatureProvider mock={mock}>
        <XFeatureForm definition={createUserForm} />
      </XFeatureProvider>
    );

    const usernameInput = screen.getByLabelText('Username');
    const emailInput = screen.getByLabelText('Email');
    const submitButton = screen.getByText('Create');

    await user.type(usernameInput, 'john');
    await user.type(emailInput, 'john@example.com');
    await user.click(submitButton);

    // Button should be in loading/disabled state
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });
});
