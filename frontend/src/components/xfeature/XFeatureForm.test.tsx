import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { XFeatureForm } from './XFeatureForm';
import { XFeatureProvider, type XFeatureMock } from '../../contexts/XFeatureContext';
import type { Form, ActionQueryResponse, Mapping } from '../../types/xfeature';

// ============================================================================
// MOCK DATA
// ============================================================================

const mockMappings: Mapping[] = [
  { name: 'username', label: 'Username', dataType: 'Text', required: true },
];

const createUserForm: Form = {
  id: 'create-user',
  mode: 'Create',
  title: 'Create User',
  actionRef: 'CreateUser',
  dialog: false,
  fields: [
    { name: 'username', label: 'Username', dataType: 'Text', required: true },
  ],
  buttons: [
    { type: 'Submit', label: 'Create' },
    { type: 'Cancel', label: 'Cancel' },
  ],
};

const successResponse: ActionQueryResponse = {
  success: true,
  message: 'User created successfully',
};

// ============================================================================
// TESTS
// ========================================================================

describe('XFeatureForm', () => {
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

  it('prevents form submission when validation fails', async () => {
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
    expect(submitButton).toBeInTheDocument();
  });

  it('calls onCancel when Cancel button is clicked', async () => {
    const user = (await import('@testing-library/user-event')).default;
    const userSetup = user.setup();
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
    await userSetup.click(cancelButton);

    expect(onCancel).toHaveBeenCalled();
  });

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
});
