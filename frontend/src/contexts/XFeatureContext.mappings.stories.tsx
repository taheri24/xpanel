import type { Meta, StoryObj } from '@storybook/react';
import { XFeatureProvider } from './XFeatureContext';
import type { MappingsResponse } from '../types/xfeature';

const meta = {
  title: 'XFeature/Mappings Integration',
  component: XFeatureProvider,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof XFeatureProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// MOCK DATA
// ============================================================================

const mockMappingsResponse: MappingsResponse = {
  feature: 'UserManagement',
  version: '1.9',
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
          { label: 'User', value: 'user' },
          { label: 'Manager', value: 'manager' },
          { label: 'Administrator', value: 'admin' },
        ],
      },
    },
    {
      name: 'priority',
      dataType: 'String',
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
      name: 'limit',
      dataType: 'Int',
      label: 'Results Limit',
    },
    {
      name: 'offset',
      dataType: 'Int',
      label: 'Results Offset',
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

const mockMappingsWithListQuery: MappingsResponse = {
  feature: 'UserManagement',
  version: '1.9',
  resolvedCount: 3,
  mappings: [
    {
      name: 'status',
      dataType: 'String',
      label: 'User Status',
      listQuery: {
        id: 'GetStatusValues',
        type: 'Select',
        description: 'Retrieve available status values',
        sql: 'SELECT DISTINCT status FROM users ORDER BY status',
      },
      options: {
        items: [
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
        ],
      },
    },
    {
      name: 'role',
      dataType: 'String',
      label: 'Role',
      options: {
        items: [
          { label: 'User', value: 'user' },
          { label: 'Admin', value: 'admin' },
        ],
      },
    },
    {
      name: 'limit',
      dataType: 'Int',
      label: 'Limit',
    },
  ],
};

const mockLocalizedMappings: MappingsResponse = {
  feature: 'UserManagement',
  version: '1.9',
  resolvedCount: 4,
  mappings: [
    {
      name: 'status',
      dataType: 'String',
      label: 'وضعیت', // Persian for "Status"
      options: {
        items: [
          { label: 'فعال', value: 'active' }, // Active
          { label: 'غیرفعال', value: 'inactive' }, // Inactive
        ],
      },
    },
    {
      name: 'role',
      dataType: 'String',
      label: 'نقش', // Persian for "Role"
      options: {
        items: [
          { label: 'کاربر', value: 'user' }, // User
          { label: 'مدیر', value: 'manager' }, // Manager
          { label: 'ادمین', value: 'admin' }, // Admin
        ],
      },
    },
    {
      name: 'priority',
      dataType: 'String',
      label: 'اولویت', // Persian for "Priority"
      options: {
        items: [
          { label: 'خیلی مهم', value: '5' }, // Very Important
          { label: 'مهم', value: '3' }, // Important
          { label: 'عادی', value: '1' }, // Normal
        ],
      },
    },
    {
      name: 'limit',
      dataType: 'Int',
      label: 'محدودیت', // Persian for "Limit"
    },
  ],
};

const mockEmptyMappings: MappingsResponse = {
  feature: 'EmptyFeature',
  version: '1.0',
  resolvedCount: 0,
  mappings: [],
};

// ============================================================================
// STORY 1: Basic Mappings Mocking
// ============================================================================

export const BasicMappingsMock: Story = {
  args: {
    onBeforeMappings: async () => mockMappingsResponse,
    children: (
      <div style={{ padding: '20px' }}>
        <h2>Basic Mappings Mock</h2>
        <p>This demonstrates basic mocking of mappings API response.</p>
        <div style={{ marginTop: '20px' }}>
          <code>
            <pre>{JSON.stringify(mockMappingsResponse, null, 2)}</pre>
          </code>
        </div>
      </div>
    ),
  },
};

// ============================================================================
// STORY 2: Mappings with ListQuery
// ============================================================================

export const MappingsWithListQuery: Story = {
  args: {
    onBeforeMappings: async () => mockMappingsWithListQuery,
    children: (
      <div style={{ padding: '20px' }}>
        <h2>Mappings with ListQuery</h2>
        <p>Demonstrates mappings that have both ListQuery and resolved Options.</p>
        <div style={{ marginTop: '20px' }}>
          <code>
            <pre>{JSON.stringify(mockMappingsWithListQuery, null, 2)}</pre>
          </code>
        </div>
      </div>
    ),
  },
};

// ============================================================================
// STORY 3: Localized Mappings (Persian)
// ============================================================================

export const LocalizedMappings: Story = {
  args: {
    onBeforeMappings: async () => mockLocalizedMappings,
    children: (
      <div style={{ padding: '20px' }}>
        <h2>Localized Mappings (Persian)</h2>
        <p>Demonstrates mappings with Persian labels for internationalization.</p>
        <div style={{ marginTop: '20px', direction: 'rtl' }}>
          <code>
            <pre>{JSON.stringify(mockLocalizedMappings, null, 2)}</pre>
          </code>
        </div>
      </div>
    ),
  },
};

// ============================================================================
// STORY 4: Empty Mappings
// ============================================================================

export const EmptyMappings: Story = {
  args: {
    onBeforeMappings: async () => mockEmptyMappings,
    children: (
      <div style={{ padding: '20px' }}>
        <h2>Empty Mappings</h2>
        <p>Demonstrates behavior when no mappings are available.</p>
        <div style={{ marginTop: '20px' }}>
          <code>
            <pre>{JSON.stringify(mockEmptyMappings, null, 2)}</pre>
          </code>
        </div>
      </div>
    ),
  },
};

// ============================================================================
// STORY 5: Mappings Loading State
// ============================================================================

export const MappingsLoadingState: Story = {
  args: {
    onBeforeMappings: async () => {
      // Simulate slow loading
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return mockMappingsResponse;
    },
    children: (
      <div style={{ padding: '20px' }}>
        <h2>Mappings Loading State</h2>
        <p>Demonstrates slow loading of mappings (2 second delay).</p>
      </div>
    ),
  },
};

// ============================================================================
// STORY 6: Mappings After Load Callback
// ============================================================================

export const MappingsAfterLoadCallback: Story = {
  args: {
    onBeforeMappings: async () => mockMappingsResponse,
    onAfterMappings: async (event) => {
      console.log('Mappings loaded successfully:', event);
      alert(`Loaded ${event.result.resolvedCount} mappings for feature: ${event.result.feature}`);
    },
    children: (
      <div style={{ padding: '20px' }}>
        <h2>Mappings After Load Callback</h2>
        <p>Demonstrates the onAfterMappings callback (check console and alert).</p>
      </div>
    ),
  },
};

// ============================================================================
// STORY 7: Multiple Data Types
// ============================================================================

const mockMultipleDataTypes: MappingsResponse = {
  feature: 'Products',
  version: '1.0',
  resolvedCount: 5,
  mappings: [
    {
      name: 'price_min',
      dataType: 'Decimal',
      label: 'Minimum Price',
    },
    {
      name: 'quantity',
      dataType: 'Int',
      label: 'Quantity',
    },
    {
      name: 'category',
      dataType: 'String',
      label: 'Category',
      options: {
        items: [
          { label: 'Electronics', value: 'electronics' },
          { label: 'Clothing', value: 'clothing' },
          { label: 'Food', value: 'food' },
        ],
      },
    },
    {
      name: 'in_stock',
      dataType: 'Boolean',
      label: 'In Stock',
      options: {
        items: [
          { label: 'Yes', value: 'true' },
          { label: 'No', value: 'false' },
        ],
      },
    },
    {
      name: 'search_term',
      dataType: 'String',
      label: 'Search',
    },
  ],
};

export const MultipleDateTypes: Story = {
  args: {
    onBeforeMappings: async () => mockMultipleDataTypes,
    children: (
      <div style={{ padding: '20px' }}>
        <h2>Multiple Data Types</h2>
        <p>Demonstrates mappings with different data types (String, Int, Decimal, Boolean).</p>
        <div style={{ marginTop: '20px' }}>
          <code>
            <pre>{JSON.stringify(mockMultipleDataTypes, null, 2)}</pre>
          </code>
        </div>
      </div>
    ),
  },
};

// ============================================================================
// STORY 8: Large Option List
// ============================================================================

const mockLargeOptionList: MappingsResponse = {
  feature: 'Countries',
  version: '1.0',
  resolvedCount: 1,
  mappings: [
    {
      name: 'country',
      dataType: 'String',
      label: 'Country',
      options: {
        items: [
          { label: 'United States', value: 'US' },
          { label: 'United Kingdom', value: 'UK' },
          { label: 'Canada', value: 'CA' },
          { label: 'Germany', value: 'DE' },
          { label: 'France', value: 'FR' },
          { label: 'Italy', value: 'IT' },
          { label: 'Spain', value: 'ES' },
          { label: 'Japan', value: 'JP' },
          { label: 'China', value: 'CN' },
          { label: 'India', value: 'IN' },
          { label: 'Brazil', value: 'BR' },
          { label: 'Australia', value: 'AU' },
        ],
      },
    },
  ],
};

export const LargeOptionList: Story = {
  args: {
    onBeforeMappings: async () => mockLargeOptionList,
    children: (
      <div style={{ padding: '20px' }}>
        <h2>Large Option List</h2>
        <p>Demonstrates a mapping with many options.</p>
      </div>
    ),
  },
};
