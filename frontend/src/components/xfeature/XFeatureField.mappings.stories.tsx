import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { XFeatureProvider } from '../../contexts/XFeatureContext';
import { XFeatureField } from './XFeatureField';
import type { Field, MappingsResponse } from '../../types/xfeature';

const meta = {
  title: 'XFeature/Field with Mappings',
  component: XFeatureField,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof XFeatureField>;

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
          { label: 'Super Admin', value: 'superadmin' },
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
          { label: 'Pending Approval', value: 'pending' },
          { label: 'Suspended', value: 'suspended' },
        ],
      },
    },
    {
      name: 'department',
      dataType: 'String',
      label: 'Department',
      options: {
        items: [
          { label: 'Engineering', value: 'engineering' },
          { label: 'Sales', value: 'sales' },
          { label: 'Marketing', value: 'marketing' },
          { label: 'Human Resources', value: 'hr' },
          { label: 'Finance', value: 'finance' },
        ],
      },
    },
  ],
};

const mockLocalizedMappings: MappingsResponse = {
  feature: 'UserManagement',
  version: '1.9',
  resolvedCount: 2,
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
          { label: 'در انتظار تایید', value: 'pending' },
        ],
      },
    },
  ],
};

// ============================================================================
// STORY 15: Select Field with Mapping Options
// ============================================================================

export const SelectFieldWithMapping: Story = {
  args: {} as any,
  render: () => {
    const [value, setValue] = useState<string>('');
    const fieldDef: Field = {
      name: 'role',
      label: 'Role (from XML)',
      type: 'Select',
      required: true,
      options: [
        { label: 'Default User', value: 'user' },
        { label: 'Default Admin', value: 'admin' },
      ],
    };

    return (
      <XFeatureProvider onBeforeMappings={async () => mockMappings}>
        <div style={{ padding: '20px', maxWidth: '400px' }}>
          <h3>Select Field with Mapping</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Field has default options in XML, but mappings override with more options and a
            different label.
          </p>
          <XFeatureField
            definition={fieldDef}
            value={value}
            onChange={(v) => setValue(v as string)}
            featureName="UserManagement"
          />
          <div style={{ marginTop: '20px', padding: '10px', background: '#f5f5f5' }}>
            <strong>Selected Value:</strong> {value || 'None'}
          </div>
        </div>
      </XFeatureProvider>
    );
  },
};

// ============================================================================
// STORY 16: Multiple Select Fields with Different Mappings
// ============================================================================

export const MultipleSelectFieldsWithMappings: Story = {
  args: {} as any,
  render: () => {
    const [roleValue, setRoleValue] = useState<string>('');
    const [statusValue, setStatusValue] = useState<string>('');
    const [deptValue, setDeptValue] = useState<string>('');

    const roleField: Field = {
      name: 'role',
      label: 'Role',
      type: 'Select',
      required: true,
    };

    const statusField: Field = {
      name: 'status',
      label: 'Status',
      type: 'Select',
      required: true,
    };

    const deptField: Field = {
      name: 'department',
      label: 'Department',
      type: 'Select',
      required: false,
    };

    return (
      <XFeatureProvider onBeforeMappings={async () => mockMappings}>
        <div style={{ padding: '20px', maxWidth: '400px' }}>
          <h3>Multiple Select Fields</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Each field gets its options from the mappings API.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <XFeatureField
              definition={roleField}
              value={roleValue}
              onChange={(v) => setRoleValue(v as string)}
              featureName="UserManagement"
            />
            <XFeatureField
              definition={statusField}
              value={statusValue}
              onChange={(v) => setStatusValue(v as string)}
              featureName="UserManagement"
            />
            <XFeatureField
              definition={deptField}
              value={deptValue}
              onChange={(v) => setDeptValue(v as string)}
              featureName="UserManagement"
            />
          </div>
          <div style={{ marginTop: '20px', padding: '10px', background: '#f5f5f5' }}>
            <div>
              <strong>Role:</strong> {roleValue || 'None'}
            </div>
            <div>
              <strong>Status:</strong> {statusValue || 'None'}
            </div>
            <div>
              <strong>Department:</strong> {deptValue || 'None'}
            </div>
          </div>
        </div>
      </XFeatureProvider>
    );
  },
};

// ============================================================================
// STORY 17: Localized Select Field
// ============================================================================

export const LocalizedSelectField: Story = {
  args: {} as any,
  render: () => {
    const [value, setValue] = useState<string>('');
    const fieldDef: Field = {
      name: 'role',
      label: 'Role',
      type: 'Select',
      required: true,
    };

    return (
      <XFeatureProvider onBeforeMappings={async () => mockLocalizedMappings}>
        <div style={{ padding: '20px', maxWidth: '400px', direction: 'rtl' }}>
          <h3>فیلد با برچسب فارسی</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            برچسب‌ها و گزینه‌ها به زبان فارسی هستند.
          </p>
          <XFeatureField
            definition={fieldDef}
            value={value}
            onChange={(v) => setValue(v as string)}
            featureName="UserManagement"
          />
          <div style={{ marginTop: '20px', padding: '10px', background: '#f5f5f5' }}>
            <strong>مقدار انتخاب شده:</strong> {value || 'هیچ'}
          </div>
        </div>
      </XFeatureProvider>
    );
  },
};

// ============================================================================
// STORY 18: Field Without Matching Mapping
// ============================================================================

export const FieldWithoutMatchingMapping: Story = {
  args: {} as any,
  render: () => {
    const [value, setValue] = useState<string>('');
    const fieldDef: Field = {
      name: 'nonexistent_field',
      label: 'Non-existent Field',
      type: 'Select',
      required: true,
      options: [
        { label: 'Option 1', value: '1' },
        { label: 'Option 2', value: '2' },
      ],
    };

    return (
      <XFeatureProvider onBeforeMappings={async () => mockMappings}>
        <div style={{ padding: '20px', maxWidth: '400px' }}>
          <h3>Field Without Matching Mapping</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            When no mapping exists for a field, it falls back to the options defined in the field
            definition.
          </p>
          <XFeatureField
            definition={fieldDef}
            value={value}
            onChange={(v) => setValue(v as string)}
            featureName="UserManagement"
          />
          <div style={{ marginTop: '20px', padding: '10px', background: '#f5f5f5' }}>
            <strong>Selected Value:</strong> {value || 'None'}
          </div>
        </div>
      </XFeatureProvider>
    );
  },
};

// ============================================================================
// STORY 19: Select Field with Empty Mappings
// ============================================================================

export const SelectFieldWithEmptyMappings: Story = {
  args: {} as any,
  render: () => {
    const [value, setValue] = useState<string>('');
    const fieldDef: Field = {
      name: 'role',
      label: 'Role',
      type: 'Select',
      required: true,
      options: [
        { label: 'User', value: 'user' },
        { label: 'Admin', value: 'admin' },
      ],
    };

    return (
      <XFeatureProvider
        onBeforeMappings={async () => ({
          feature: 'UserManagement',
          version: '1.9',
          resolvedCount: 0,
          mappings: [],
        })}
      >
        <div style={{ padding: '20px', maxWidth: '400px' }}>
          <h3>Select Field with Empty Mappings</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            When mappings array is empty, the field uses its default options.
          </p>
          <XFeatureField
            definition={fieldDef}
            value={value}
            onChange={(v) => setValue(v as string)}
            featureName="UserManagement"
          />
          <div style={{ marginTop: '20px', padding: '10px', background: '#f5f5f5' }}>
            <strong>Selected Value:</strong> {value || 'None'}
          </div>
        </div>
      </XFeatureProvider>
    );
  },
};

// ============================================================================
// STORY 20: Field with Mapping Label Override
// ============================================================================

export const FieldWithMappingLabelOverride: Story = {
  args: {} as any,
  render: () => {
    const [value, setValue] = useState<string>('');
    const fieldDef: Field = {
      name: 'role',
      label: 'Original Label from XML',
      type: 'Select',
      required: true,
      helperText: 'This label comes from the field definition',
    };

    return (
      <XFeatureProvider onBeforeMappings={async () => mockMappings}>
        <div style={{ padding: '20px', maxWidth: '400px' }}>
          <h3>Mapping Label Override</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            The mapping label "User Role" overrides the field's original label "Original Label
            from XML".
          </p>
          <XFeatureField
            definition={fieldDef}
            value={value}
            onChange={(v) => setValue(v as string)}
            featureName="UserManagement"
          />
          <div style={{ marginTop: '20px', padding: '10px', background: '#f5f5f5' }}>
            <div>
              <strong>Field Definition Label:</strong> "Original Label from XML"
            </div>
            <div>
              <strong>Mapping Label:</strong> "User Role"
            </div>
            <div>
              <strong>Displayed Label:</strong> The mapping label is used
            </div>
          </div>
        </div>
      </XFeatureProvider>
    );
  },
};

// ============================================================================
// STORY 21: Complete Form with Mappings
// ============================================================================

export const CompleteFormWithMappings: Story = {
  args: {} as any,
  render: () => {
    const [formData, setFormData] = useState({
      username: '',
      email: '',
      role: '',
      status: '',
      department: '',
    });

    const fields: Field[] = [
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
    ];

    return (
      <XFeatureProvider onBeforeMappings={async () => mockMappings}>
        <div style={{ padding: '20px', maxWidth: '500px' }}>
          <h3>Complete Form with Mappings</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            A complete user form where select fields are populated from mappings.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {fields.map((field) => (
              <XFeatureField
                key={field.name}
                definition={field}
                value={formData[field.name as keyof typeof formData]}
                onChange={(v) =>
                  setFormData((prev) => ({
                    ...prev,
                    [field.name]: v,
                  }))
                }
                featureName="UserManagement"
              />
            ))}
          </div>
          <div style={{ marginTop: '30px', padding: '15px', background: '#f5f5f5', borderRadius: '4px' }}>
            <h4>Form Data:</h4>
            <pre style={{ fontSize: '12px', margin: '10px 0 0 0' }}>
              {JSON.stringify(formData, null, 2)}
            </pre>
          </div>
        </div>
      </XFeatureProvider>
    );
  },
};
