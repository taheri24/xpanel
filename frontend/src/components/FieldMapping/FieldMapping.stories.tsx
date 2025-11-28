import type { Meta, StoryObj } from '@storybook/react';
import { XFeatureProvider } from '../../contexts/XFeatureContext';
import type { MappingsResponse } from '../../types/xfeature';
import FieldMapping from './FieldMapping';

// Mock data
const mockMappingsResponse: MappingsResponse = {
  feature: 'UserManagement',
  version: '1.0',
  resolvedCount: 6,
  mappings: [
    {
      name: 'status',
      dataType: 'String',
      label: 'Status',
      options: {
        items: [
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
          { label: 'Pending', value: 'pending' },
        ],
      },
    },
    {
      name: 'role',
      dataType: 'String',
      label: 'User Role',
      options: {
        items: [
          { label: 'Admin', value: 'admin' },
          { label: 'Manager', value: 'manager' },
          { label: 'User', value: 'user' },
        ],
      },
    },
    {
      name: 'priority',
      dataType: 'Int',
      label: 'Priority Level',
      options: {
        items: [
          { label: 'Very High', value: '5' },
          { label: 'High', value: '3' },
          { label: 'Normal', value: '1' },
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
    {
      name: 'limit',
      dataType: 'Int',
      label: 'Results Limit',
    },
    {
      name: 'offset',
      dataType: 'Int',
      label: 'Results Offset',
    },
  ],
};

const meta = {
  title: 'Components/FieldMapping',
  component: FieldMapping,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <XFeatureProvider onBeforeMappings={async () => mockMappingsResponse}>
        <Story />
      </XFeatureProvider>
    ),
  ],
} satisfies Meta<typeof FieldMapping>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleField: Story = {
  args: {
    featureName: 'UserManagement',
    ids: ['status'],
  },
};

export const MultipleFields: Story = {
  args: {
    featureName: 'UserManagement',
    ids: ['status', 'role', 'priority'],
  },
};

export const FieldWithoutOptions: Story = {
  args: {
    featureName: 'UserManagement',
    ids: ['limit'],
  },
};

export const MixedFields: Story = {
  args: {
    featureName: 'UserManagement',
    ids: ['status', 'limit', 'department'],
  },
};

export const AllFields: Story = {
  args: {
    featureName: 'UserManagement',
    ids: ['status', 'role', 'priority', 'department', 'limit', 'offset'],
  },
};

export const CustomTitle: Story = {
  args: {
    featureName: 'UserManagement',
    ids: ['status', 'role'],
    title: 'User Management Configuration Fields',
  },
};

export const Empty: Story = {
  args: {
    featureName: 'UserManagement',
    ids: [],
  },
};
