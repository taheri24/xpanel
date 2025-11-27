import type { Meta, StoryObj } from '@storybook/react';
import { XFeatureProvider } from '../../contexts/XFeatureContext';
import { XFeatureDataTable } from './XFeatureDataTable';
import type { DataTable, QueryResponse, MappingsResponse } from '../../types/xfeature';

const meta = {
  title: 'XFeature/DataTable with Mappings',
  component: XFeatureDataTable,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof XFeatureDataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// MOCK DATA
// ============================================================================

const mockDataTableDefinition: DataTable = {
  id: 'UsersTable',
  queryRef: 'ListUsers',
  title: 'Users List',
  pagination: true,
  pageSize: 10,
  sortable: true,
  searchable: true,
  columns: [
    { name: 'user_id', label: 'ID', type: 'Number', width: '80px', align: 'center' },
    { name: 'username', label: 'Username', type: 'Text', sortable: true },
    { name: 'email', label: 'Email', type: 'Text', sortable: true },
    { name: 'role', label: 'Role', type: 'Badge', sortable: true, filterable: true },
    { name: 'status', label: 'Status', type: 'Badge', sortable: true, filterable: true },
    { name: 'created_at', label: 'Created', type: 'Date', format: 'MM/DD/YYYY', sortable: true },
  ],
  formActions: 'ViewUserForm,EditUserForm,DeleteUserForm',
};

const mockUsersData: QueryResponse = {
  data: [
    {
      user_id: 1,
      username: 'john.doe',
      email: 'john@example.com',
      role: 'admin',
      status: 'active',
      created_at: '2024-01-15',
    },
    {
      user_id: 2,
      username: 'jane.smith',
      email: 'jane@example.com',
      role: 'user',
      status: 'active',
      created_at: '2024-02-20',
    },
    {
      user_id: 3,
      username: 'bob.wilson',
      email: 'bob@example.com',
      role: 'manager',
      status: 'inactive',
      created_at: '2024-01-10',
    },
  ],
  total: 3,
  page: 0,
  pageSize: 10,
};

const mockMappings: MappingsResponse = {
  feature: 'UserManagement',
  version: '1.9',
  resolvedCount: 6,
  mappings: [
    {
      name: 'status',
      dataType: 'String',
      label: 'User Status',
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
      label: 'Priority',
      options: {
        items: [
          { label: 'High', value: '5' },
          { label: 'Medium', value: '3' },
          { label: 'Low', value: '1' },
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
      label: 'Offset',
    },
    {
      name: 'ParamName',
      dataType: 'Int',
      label: 'Name Parameter',
    },
  ],
};

const mockLocalizedMappings: MappingsResponse = {
  feature: 'UserManagement',
  version: '1.9',
  resolvedCount: 5,
  mappings: [
    {
      name: 'status',
      dataType: 'String',
      label: 'وضعیت',
      options: {
        items: [
          { label: 'فعال', value: 'active' },
          { label: 'غیرفعال', value: 'inactive' },
          { label: 'در انتظار', value: 'pending' },
        ],
      },
    },
    {
      name: 'role',
      dataType: 'String',
      label: 'نقش',
      options: {
        items: [
          { label: 'کاربر', value: 'user' },
          { label: 'مدیر', value: 'manager' },
          { label: 'ادمین', value: 'admin' },
        ],
      },
    },
    {
      name: 'priority',
      dataType: 'String',
      label: 'اولویت',
      options: {
        items: [
          { label: 'بالا', value: '5' },
          { label: 'متوسط', value: '3' },
          { label: 'پایین', value: '1' },
        ],
      },
    },
    {
      name: 'limit',
      dataType: 'Int',
      label: 'محدودیت',
    },
    {
      name: 'offset',
      dataType: 'Int',
      label: 'جابجایی',
    },
  ],
};

// ============================================================================
// STORY 9: DataTable with Query Parameters (Mappings)
// ============================================================================

export const DataTableWithQueryParameters: Story = {
  args: {} as any,
  render: () => (
    <XFeatureProvider
      onBeforeQuery={async () => mockUsersData}
      onBeforeMappings={async () => mockMappings}
    >
      <div style={{ padding: '20px' }}>
        <XFeatureDataTable
          definition={mockDataTableDefinition}
          featureName="UserManagement"
        />
      </div>
    </XFeatureProvider>
  ),
};

// ============================================================================
// STORY 10: DataTable with Localized Parameters
// ============================================================================

export const DataTableWithLocalizedParameters: Story = {
  args: {} as any,
  render: () => (
    <XFeatureProvider
      onBeforeQuery={async () => mockUsersData}
      onBeforeMappings={async () => mockLocalizedMappings}
    >
      <div style={{ padding: '20px' }}>
        <XFeatureDataTable
          definition={mockDataTableDefinition}
          featureName="UserManagement"
        />
      </div>
    </XFeatureProvider>
  ),
};

// ============================================================================
// STORY 11: DataTable with No Mappings
// ============================================================================

export const DataTableWithNoMappings: Story = {
  args: {} as any,
  render: () => (
    <XFeatureProvider
      onBeforeQuery={async () => mockUsersData}
      onBeforeMappings={async () => ({
        feature: 'UserManagement',
        version: '1.9',
        resolvedCount: 0,
        mappings: [],
      })}
    >
      <div style={{ padding: '20px' }}>
        <h3 style={{ marginBottom: '10px' }}>DataTable Without Mappings</h3>
        <p style={{ marginBottom: '20px', color: '#666' }}>
          When no mappings are available, the query parameters section is hidden.
        </p>
        <XFeatureDataTable
          definition={mockDataTableDefinition}
          featureName="UserManagement"
        />
      </div>
    </XFeatureProvider>
  ),
};

// ============================================================================
// STORY 12: DataTable with Loading State
// ============================================================================

export const DataTableWithLoadingMappings: Story = {
  args: {} as any,
  render: () => (
    <XFeatureProvider
      onBeforeQuery={async () => mockUsersData}
      onBeforeMappings={async () => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return mockMappings;
      }}
    >
      <div style={{ padding: '20px' }}>
        <h3 style={{ marginBottom: '10px' }}>DataTable with Slow Loading Mappings</h3>
        <p style={{ marginBottom: '20px', color: '#666' }}>
          Demonstrates behavior when mappings take time to load (2 second delay).
        </p>
        <XFeatureDataTable
          definition={mockDataTableDefinition}
          featureName="UserManagement"
        />
      </div>
    </XFeatureProvider>
  ),
};

// ============================================================================
// STORY 13: DataTable with All Parameter Types
// ============================================================================

const mockAllParameterTypes: MappingsResponse = {
  feature: 'Products',
  version: '1.0',
  resolvedCount: 5,
  mappings: [
    {
      name: 'status',
      dataType: 'String',
      label: 'Product Status',
      options: {
        items: [
          { label: 'Available', value: 'available' },
          { label: 'Out of Stock', value: 'out_of_stock' },
          { label: 'Discontinued', value: 'discontinued' },
        ],
      },
    },
    {
      name: 'priority',
      dataType: 'String',
      label: 'Priority',
      options: {
        items: [
          { label: 'Featured', value: '5' },
          { label: 'Regular', value: '1' },
        ],
      },
    },
    {
      name: 'limit',
      dataType: 'Int',
      label: 'Max Results',
    },
    {
      name: 'offset',
      dataType: 'Int',
      label: 'Skip Records',
    },
    {
      name: 'role',
      dataType: 'String',
      label: 'Category',
      options: {
        items: [
          { label: 'Electronics', value: 'electronics' },
          { label: 'Books', value: 'books' },
          { label: 'Clothing', value: 'clothing' },
        ],
      },
    },
  ],
};

export const DataTableWithAllParameterTypes: Story = {
  args: {} as any,
  render: () => (
    <XFeatureProvider
      onBeforeQuery={async () => mockUsersData}
      onBeforeMappings={async () => mockAllParameterTypes}
    >
      <div style={{ padding: '20px' }}>
        <h3 style={{ marginBottom: '10px' }}>DataTable with All Parameter Types</h3>
        <p style={{ marginBottom: '20px', color: '#666' }}>
          Shows both select dropdowns and text inputs for different parameter types.
        </p>
        <XFeatureDataTable
          definition={mockDataTableDefinition}
          featureName="Products"
        />
      </div>
    </XFeatureProvider>
  ),
};

// ============================================================================
// STORY 14: Interactive DataTable with Mappings
// ============================================================================

export const InteractiveDataTableWithMappings: Story = {
  args: {} as any,
  render: () => (
    <XFeatureProvider
      onBeforeQuery={async (event) => {
        console.log('Query params:', event.params);
        return mockUsersData;
      }}
      onBeforeMappings={async () => mockMappings}
      onAfterMappings={async (event) => {
        console.log('Mappings loaded:', event.result);
      }}
    >
      <div style={{ padding: '20px' }}>
        <h3 style={{ marginBottom: '10px' }}>Interactive DataTable</h3>
        <p style={{ marginBottom: '20px', color: '#666' }}>
          Change query parameters and check the console to see the updated query params.
        </p>
        <XFeatureDataTable
          definition={mockDataTableDefinition}
          featureName="UserManagement"
        />
      </div>
    </XFeatureProvider>
  ),
};
