import type { Meta, StoryObj } from '@storybook/react';
import { XFeatureProvider } from '../../contexts/XFeatureContext';
import { XFeatureForm } from './XFeatureForm';
import type { Form, MappingsResponse, ActionResponse } from '../../types/xfeature';

const meta = {
  title: 'XFeature/Form with Mappings',
  component: XFeatureForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof XFeatureForm>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// MOCK DATA
// ============================================================================

const mockMappings: MappingsResponse = {
  feature: 'UserManagement',
  version: '1.9',
  resolvedCount: 3,
  mappings: [
    {
      name: 'role',
      dataType: 'String',
      label: 'User Role',
      options: {
        items: [
          { label: 'User', value: 'user' },
          { label: 'Manager', value: 'manager' },
          { label: 'Administrator', value: 'admin' },
        ],
      },
    },
    {
      name: 'status',
      dataType: 'String',
      label: 'Account Status',
      options: {
        items: [
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
          { label: 'Pending', value: 'pending' },
        ],
      },
    },
    {
      name: 'department',
      dataType: 'String',
      label: 'Department',
      options: {
        items: [
          { label: 'Engineering', value: 'eng' },
          { label: 'Sales', value: 'sales' },
          { label: 'Marketing', value: 'marketing' },
          { label: 'HR', value: 'hr' },
        ],
      },
    },
  ],
};

const mockLocalizedMappings: MappingsResponse = {
  feature: 'UserManagement',
  version: '1.9',
  resolvedCount: 3,
  mappings: [
    {
      name: 'role',
      dataType: 'String',
      label: 'نقش کاربر',
      options: {
        items: [
          { label: 'کاربر', value: 'user' },
          { label: 'مدیر', value: 'manager' },
          { label: 'ادمین', value: 'admin' },
        ],
      },
    },
    {
      name: 'status',
      dataType: 'String',
      label: 'وضعیت حساب',
      options: {
        items: [
          { label: 'فعال', value: 'active' },
          { label: 'غیرفعال', value: 'inactive' },
        ],
      },
    },
    {
      name: 'department',
      dataType: 'String',
      label: 'بخش',
      options: {
        items: [
          { label: 'مهندسی', value: 'eng' },
          { label: 'فروش', value: 'sales' },
          { label: 'بازاریابی', value: 'marketing' },
        ],
      },
    },
  ],
};

const createUserFormDefinition: Form = {
  id: 'CreateUserForm',
  mode: 'Create',
  title: 'Create New User',
  dialog: false,
  actionRef: 'CreateUser',
  fields: [
    {
      name: 'username',
      label: 'Username',
      type: 'Text',
      required: true,
      placeholder: 'Enter username',
    },
    {
      name: 'email',
      label: 'Email',
      type: 'Email',
      required: true,
      placeholder: 'user@example.com',
    },
    {
      name: 'role',
      label: 'Role',
      type: 'Select',
      required: true,
      options: [
        { label: 'User', value: 'user' },
        { label: 'Admin', value: 'admin' },
      ],
    },
    {
      name: 'status',
      label: 'Status',
      type: 'Select',
      required: true,
    },
    {
      name: 'department',
      label: 'Department',
      type: 'Select',
      required: false,
    },
  ],
  buttons: [
    { type: 'Submit', label: 'Create User', style: 'Primary' },
    { type: 'Cancel', label: 'Cancel', style: 'Secondary' },
  ],
};

const editUserFormDefinition: Form = {
  id: 'EditUserForm',
  mode: 'Edit',
  title: 'Edit User',
  dialog: false,
  actionRef: 'UpdateUser',
  fields: [
    {
      name: 'user_id',
      label: 'User ID',
      type: 'Hidden',
      required: true,
    },
    {
      name: 'username',
      label: 'Username',
      type: 'Text',
      required: true,
      readonly: true,
    },
    {
      name: 'email',
      label: 'Email',
      type: 'Email',
      required: true,
    },
    {
      name: 'role',
      label: 'Role',
      type: 'Select',
      required: true,
    },
    {
      name: 'status',
      label: 'Status',
      type: 'Select',
      required: true,
    },
    {
      name: 'department',
      label: 'Department',
      type: 'Select',
      required: false,
    },
  ],
  buttons: [
    { type: 'Submit', label: 'Save Changes', style: 'Primary' },
    { type: 'Reset', label: 'Reset', style: 'Secondary' },
  ],
};

const mockActionSuccess: ActionResponse = {
  success: true,
  message: 'User created successfully',
  data: { userId: 123 },
};

// ============================================================================
// STORY 22: Create Form with Mappings
// ============================================================================

export const CreateFormWithMappings: Story = {
  args: {} as any,
  render: () => (
    <XFeatureProvider
      onBeforeAction={async () => mockActionSuccess}
      onBeforeMappings={async () => mockMappings}
    >
      <div style={{ padding: '20px', maxWidth: '600px' }}>
        <h3 style={{ marginBottom: '10px' }}>Create User Form with Mappings</h3>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Role field has default options, but mappings provide additional options. Status and
          Department get their options entirely from mappings.
        </p>
        <XFeatureForm
          definition={createUserFormDefinition}
          featureName="UserManagement"
          onSuccess={(data) => console.log('Form submitted:', data)}
          onCancel={() => console.log('Form cancelled')}
        />
      </div>
    </XFeatureProvider>
  ),
};

// ============================================================================
// STORY 23: Edit Form with Pre-filled Data and Mappings
// ============================================================================

export const EditFormWithMappings: Story = {
  args: {} as any,
  render: () => (
    <XFeatureProvider
      onBeforeAction={async () => mockActionSuccess}
      onBeforeMappings={async () => mockMappings}
    >
      <div style={{ padding: '20px', maxWidth: '600px' }}>
        <h3 style={{ marginBottom: '10px' }}>Edit User Form with Mappings</h3>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Form pre-filled with user data. Select fields populated from mappings.
        </p>
        <XFeatureForm
          definition={editUserFormDefinition}
          featureName="UserManagement"
          initialData={{
            user_id: 42,
            username: 'john.doe',
            email: 'john@example.com',
            role: 'manager',
            status: 'active',
            department: 'eng',
          }}
          onSuccess={(data) => console.log('Form submitted:', data)}
        />
      </div>
    </XFeatureProvider>
  ),
};

// ============================================================================
// STORY 24: Localized Form with Mappings
// ============================================================================

export const LocalizedFormWithMappings: Story = {
  args: {} as any,
  render: () => (
    <XFeatureProvider
      onBeforeAction={async () => mockActionSuccess}
      onBeforeMappings={async () => mockLocalizedMappings}
    >
      <div style={{ padding: '20px', maxWidth: '600px', direction: 'rtl' }}>
        <h3 style={{ marginBottom: '10px' }}>فرم با برچسب‌های فارسی</h3>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          فیلدهای انتخابی از نگاشت‌های محلی‌سازی شده استفاده می‌کنند.
        </p>
        <XFeatureForm
          definition={createUserFormDefinition}
          featureName="UserManagement"
          onSuccess={(data) => console.log('Form submitted:', data)}
          onCancel={() => console.log('Form cancelled')}
        />
      </div>
    </XFeatureProvider>
  ),
};

// ============================================================================
// STORY 25: Form with Loading Mappings
// ============================================================================

export const FormWithLoadingMappings: Story = {
  args: {} as any,
  render: () => (
    <XFeatureProvider
      onBeforeAction={async () => mockActionSuccess}
      onBeforeMappings={async () => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return mockMappings;
      }}
    >
      <div style={{ padding: '20px', maxWidth: '600px' }}>
        <h3 style={{ marginBottom: '10px' }}>Form with Slow Loading Mappings</h3>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Mappings take 2 seconds to load. Notice how select fields initially show without
          options, then populate once mappings load.
        </p>
        <XFeatureForm
          definition={createUserFormDefinition}
          featureName="UserManagement"
          onSuccess={(data) => console.log('Form submitted:', data)}
        />
      </div>
    </XFeatureProvider>
  ),
};

// ============================================================================
// STORY 26: Form with Empty Mappings (Fallback)
// ============================================================================

export const FormWithEmptyMappings: Story = {
  args: {} as any,
  render: () => (
    <XFeatureProvider
      onBeforeAction={async () => mockActionSuccess}
      onBeforeMappings={async () => ({
        feature: 'UserManagement',
        version: '1.9',
        resolvedCount: 0,
        mappings: [],
      })}
    >
      <div style={{ padding: '20px', maxWidth: '600px' }}>
        <h3 style={{ marginBottom: '10px' }}>Form with Empty Mappings</h3>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          When mappings are empty, fields fall back to their defined options. Role field shows
          its default options; Status and Department have no options.
        </p>
        <XFeatureForm
          definition={createUserFormDefinition}
          featureName="UserManagement"
          onSuccess={(data) => console.log('Form submitted:', data)}
        />
      </div>
    </XFeatureProvider>
  ),
};

// ============================================================================
// STORY 27: Interactive Form with Mapping Callbacks
// ============================================================================

export const InteractiveFormWithCallbacks: Story = {
  args: {} as any,
  render: () => (
    <XFeatureProvider
      onBeforeAction={async (event) => {
        console.log('Action params:', event.params);
        alert(`Submitting with params: ${JSON.stringify(event.params, null, 2)}`);
        return mockActionSuccess;
      }}
      onBeforeMappings={async (event) => {
        console.log('Loading mappings for:', event.featureName);
        return mockMappings;
      }}
      onAfterMappings={async (event) => {
        console.log('Mappings loaded:', event.result);
      }}
    >
      <div style={{ padding: '20px', maxWidth: '600px' }}>
        <h3 style={{ marginBottom: '10px' }}>Interactive Form with Callbacks</h3>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Submit the form and check the console to see all callbacks being triggered. An alert
          will show the submitted data.
        </p>
        <XFeatureForm
          definition={createUserFormDefinition}
          featureName="UserManagement"
          onSuccess={(data) => {
            console.log('Form success callback:', data);
            alert('Form submitted successfully!');
          }}
          onCancel={() => {
            console.log('Form cancelled');
            alert('Form cancelled');
          }}
        />
      </div>
    </XFeatureProvider>
  ),
};

// ============================================================================
// STORY 28: Multi-Step Form Simulation
// ============================================================================

const step1Fields: Form = {
  id: 'Step1Form',
  mode: 'Create',
  title: 'Step 1: Basic Information',
  dialog: false,
  actionRef: 'CreateUser',
  fields: [
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
  ],
  buttons: [{ type: 'Submit', label: 'Next', style: 'Primary' }],
};

const step2Fields: Form = {
  id: 'Step2Form',
  mode: 'Create',
  title: 'Step 2: Role and Permissions',
  dialog: false,
  actionRef: 'CreateUser',
  fields: [
    {
      name: 'role',
      label: 'Role',
      type: 'Select',
      required: true,
    },
    {
      name: 'department',
      label: 'Department',
      type: 'Select',
      required: true,
    },
    {
      name: 'status',
      label: 'Initial Status',
      type: 'Select',
      required: true,
    },
  ],
  buttons: [
    { type: 'Submit', label: 'Complete', style: 'Primary' },
    { type: 'Cancel', label: 'Back', style: 'Secondary' },
  ],
};

export const MultiStepFormWithMappings: Story = {
  args: {} as any,
  render: () => (
    <XFeatureProvider
      onBeforeAction={async () => mockActionSuccess}
      onBeforeMappings={async () => mockMappings}
    >
      <div style={{ padding: '20px', maxWidth: '800px' }}>
        <h3 style={{ marginBottom: '20px' }}>Multi-Step Form Simulation</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          <div>
            <XFeatureForm definition={step1Fields} featureName="UserManagement" />
          </div>
          <div>
            <XFeatureForm definition={step2Fields} featureName="UserManagement" />
          </div>
        </div>
      </div>
    </XFeatureProvider>
  ),
};
