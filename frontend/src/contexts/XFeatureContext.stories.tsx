import type { Meta, StoryObj } from '@storybook/react';
import { XFeatureProvider, useXFeature, useXFeatureQuery, useXFeatureAction, useXFeatureFrontend } from './XFeatureContext';
import type { XFeature, QueryResponse, FrontendElements } from '../types/xfeature';
import { useState, useEffect } from 'react';

const meta = {
  title: 'Contexts/XFeatureContext',
  component: XFeatureProvider,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof XFeatureProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// COMPREHENSIVE MOCK DATA
// ============================================================================

// Sample feature with users data
const mockUserFeature: XFeature = {
  name: 'UserManagement',
  version: '1.0.0',
  backend: {
    queries: [
      {
        id: 'getUsersQuery',
        type: 'Select',
        description: 'Fetch all users with pagination support',
        sql: 'SELECT id, name, email, role, status, createdAt FROM users LIMIT :limit OFFSET :offset',
        parameters: [
          { name: 'limit', type: 'number', required: true },
          { name: 'offset', type: 'number', required: true },
          { name: 'search', type: 'string', required: false },
        ],
      },
      {
        id: 'getUserByIdQuery',
        type: 'Select',
        description: 'Fetch a specific user by ID',
        sql: 'SELECT * FROM users WHERE id = :userId',
        parameters: [{ name: 'userId', type: 'number', required: true }],
      },
    ],
    actionQueries: [
      {
        id: 'createUserAction',
        type: 'Insert',
        description: 'Create a new user',
        sql: 'INSERT INTO users (name, email, role, status) VALUES (:name, :email, :role, :status)',
        parameters: [
          { name: 'name', type: 'string', required: true },
          { name: 'email', type: 'string', required: true },
          { name: 'role', type: 'string', required: true },
          { name: 'status', type: 'string', required: true },
        ],
      },
      {
        id: 'updateUserAction',
        type: 'Update',
        description: 'Update user information',
        sql: 'UPDATE users SET name = :name, email = :email, role = :role, status = :status WHERE id = :userId',
        parameters: [
          { name: 'userId', type: 'number', required: true },
          { name: 'name', type: 'string', required: true },
          { name: 'email', type: 'string', required: true },
          { name: 'role', type: 'string', required: true },
          { name: 'status', type: 'string', required: true },
        ],
      },
      {
        id: 'deleteUserAction',
        type: 'Delete',
        description: 'Delete a user',
        sql: 'DELETE FROM users WHERE id = :userId',
        parameters: [{ name: 'userId', type: 'number', required: true }],
      },
    ],
  },
  frontend: {
    dataTables: [
      {
        id: 'usersTable',
        queryRef: 'getUsersQuery',
        title: 'Users',
        description: 'List of all users in the system',
        pagination: true,
        pageSize: 10,
        sortable: true,
        filterable: true,
        searchable: true,
        formActions: 'editUserForm,deleteUserForm',
        columns: [
          { name: 'id', label: 'ID', type: 'Number', sortable: true, filterable: false, width: '80px' },
          { name: 'name', label: 'Name', type: 'Text', sortable: true, filterable: true },
          { name: 'email', label: 'Email', type: 'Email', sortable: true, filterable: true },
          { name: 'role', label: 'Role', type: 'Badge', sortable: true, filterable: true },
          { name: 'status', label: 'Status', type: 'Badge', sortable: true, filterable: true },
          { name: 'createdAt', label: 'Created', type: 'DateTime', sortable: true, filterable: false },
        ],
      },
    ],
    forms: [
      {
        id: 'createUserForm',
        mode: 'Create',
        title: 'Create New User',
        description: 'Add a new user to the system',
        actionRef: 'createUserAction',
        dialog: true,
        fields: [
          {
            name: 'name',
            label: 'Full Name',
            type: 'Text',
            required: true,
            placeholder: 'Enter full name',
            validation: '^[a-zA-Z\\s]{3,}$',
            helperText: 'Must be at least 3 characters',
          },
          {
            name: 'email',
            label: 'Email Address',
            type: 'Email',
            required: true,
            placeholder: 'user@example.com',
            validation: '^[^@]+@[^@]+\\.[^@]+$',
            helperText: 'Must be a valid email',
          },
          {
            name: 'role',
            label: 'Role',
            type: 'Select',
            required: true,
            options: [
              { value: 'admin', label: 'Administrator' },
              { value: 'manager', label: 'Manager' },
              { value: 'user', label: 'User' },
              { value: 'guest', label: 'Guest' },
            ],
          },
          {
            name: 'status',
            label: 'Status',
            type: 'Select',
            required: true,
            defaultValue: 'active',
            options: [
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'pending', label: 'Pending' },
            ],
          },
        ],
        buttons: [
          { type: 'Submit', label: 'Create User', style: 'Primary' },
          { type: 'Cancel', label: 'Cancel', style: 'Secondary' },
        ],
        messages: [
          { type: 'Info', content: 'All fields are required', visible: true },
        ],
      },
      {
        id: 'editUserForm',
        mode: 'Edit',
        title: 'Edit User',
        description: 'Update user information',
        actionRef: 'updateUserAction',
        queryRef: 'getUserByIdQuery',
        dialog: true,
        fields: [
          {
            name: 'userId',
            label: 'User ID',
            type: 'Hidden',
          },
          {
            name: 'name',
            label: 'Full Name',
            type: 'Text',
            required: true,
          },
          {
            name: 'email',
            label: 'Email Address',
            type: 'Email',
            required: true,
          },
          {
            name: 'role',
            label: 'Role',
            type: 'Select',
            required: true,
            options: [
              { value: 'admin', label: 'Administrator' },
              { value: 'manager', label: 'Manager' },
              { value: 'user', label: 'User' },
              { value: 'guest', label: 'Guest' },
            ],
          },
          {
            name: 'status',
            label: 'Status',
            type: 'Select',
            required: true,
            options: [
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'pending', label: 'Pending' },
            ],
          },
        ],
        buttons: [
          { type: 'Submit', label: 'Update User', style: 'Primary' },
          { type: 'Cancel', label: 'Cancel', style: 'Secondary' },
        ],
      },
      {
        id: 'deleteUserForm',
        mode: 'Delete',
        title: 'Delete User',
        description: 'Confirm user deletion',
        actionRef: 'deleteUserAction',
        dialog: true,
        fields: [
          {
            name: 'userId',
            label: 'User ID',
            type: 'Hidden',
          },
          {
            name: 'confirmation',
            label: 'I understand this action cannot be undone',
            type: 'Checkbox',
            required: true,
          },
        ],
        buttons: [
          { type: 'Submit', label: 'Delete User', style: 'Danger' },
          { type: 'Cancel', label: 'Cancel', style: 'Secondary' },
        ],
        messages: [
          { type: 'Warning', content: 'This action cannot be undone', visible: true },
        ],
      },
    ],
  },
};

// Mock user data
const mockUsersData = [
  {
    id: 1,
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 2,
    name: 'Bob Smith',
    email: 'bob@example.com',
    role: 'manager',
    status: 'active',
    createdAt: '2024-02-20T14:45:00Z',
  },
  {
    id: 3,
    name: 'Carol Davis',
    email: 'carol@example.com',
    role: 'user',
    status: 'active',
    createdAt: '2024-03-10T09:15:00Z',
  },
  {
    id: 4,
    name: 'David Wilson',
    email: 'david@example.com',
    role: 'user',
    status: 'inactive',
    createdAt: '2024-03-25T11:20:00Z',
  },
  {
    id: 5,
    name: 'Emma Brown',
    email: 'emma@example.com',
    role: 'manager',
    status: 'active',
    createdAt: '2024-04-05T16:00:00Z',
  },
];

const mockFrontendElements: FrontendElements = {
  feature: 'UserManagement',
  version: '1.0.0',
  dataTables: mockUserFeature.frontend.dataTables,
  forms: mockUserFeature.frontend.forms,
};

// ============================================================================
// DEMO COMPONENTS
// ============================================================================

// Component to display context state
const ContextStateDisplay = () => {
  const context = useXFeature();
  return (
    <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '4px', marginBottom: '16px' }}>
      <h3>Context State:</h3>
      <p><strong>Loading:</strong> {context.loading ? 'Yes' : 'No'}</p>
      <p><strong>Features Cached:</strong> {context.features.size}</p>
      {context.error && <p><strong style={{ color: 'red' }}>Error:</strong> {context.error.message}</p>}
      <p><strong>Available Features:</strong> {Array.from(context.features.keys()).join(', ') || 'None'}</p>
    </div>
  );
};

// Component to test query execution
const QueryExecutionDemo = () => {
  const { data, loading, error, total, refetch } = useXFeatureQuery(
    'UserManagement',
    'getUsersQuery',
    { limit: 5, offset: 0 }
  );

  return (
    <div style={{ padding: '16px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '16px' }}>
      <h3>Query Execution Demo</h3>
      <button onClick={() => refetch()}>Refetch Data</button>
      <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
      {error && <p style={{ color: 'red' }}><strong>Error:</strong> {error.message}</p>}
      <p><strong>Total Results:</strong> {total}</p>
      <p><strong>Loaded Items:</strong> {data.length}</p>
      {data.length > 0 && (
        <ul>
          {data.map((item: any) => (
            <li key={item.id}>
              {item.name} ({item.email})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Component to test action execution
const ActionExecutionDemo = () => {
  const { execute, loading, error, success, response } = useXFeatureAction(
    'UserManagement',
    'createUserAction'
  );

  const handleCreateUser = async () => {
    try {
      await execute({
        name: 'Frank Miller',
        email: 'frank@example.com',
        role: 'user',
        status: 'active',
      });
    } catch (err) {
      // Error is handled by the hook
    }
  };

  return (
    <div style={{ padding: '16px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '16px' }}>
      <h3>Action Execution Demo</h3>
      <button onClick={handleCreateUser} disabled={loading}>
        {loading ? 'Creating...' : 'Create New User'}
      </button>
      <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
      {error && <p style={{ color: 'red' }}><strong>Error:</strong> {error.message}</p>}
      {success && <p style={{ color: 'green' }}><strong>Success!</strong> User created successfully</p>}
      {response && <p><strong>Response:</strong> {JSON.stringify(response)}</p>}
    </div>
  );
};

// Component to test frontend elements loading
const FrontendElementsDemo = () => {
  const { frontendElements, loading, error, load } = useXFeatureFrontend('UserManagement', false);

  return (
    <div style={{ padding: '16px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '16px' }}>
      <h3>Frontend Elements Demo</h3>
      <button onClick={load} disabled={loading}>
        {loading ? 'Loading...' : 'Load Frontend Elements'}
      </button>
      <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
      {error && <p style={{ color: 'red' }}><strong>Error:</strong> {error.message}</p>}
      {frontendElements && (
        <>
          <p><strong>Feature:</strong> {frontendElements.feature}</p>
          <p><strong>Version:</strong> {frontendElements.version}</p>
          <p><strong>Forms:</strong> {frontendElements.forms.length}</p>
          <p><strong>Tables:</strong> {frontendElements.dataTables.length}</p>
        </>
      )}
    </div>
  );
};

// ============================================================================
// EASY STORIES (2)
// ============================================================================

/**
 * Basic provider setup with default configuration.
 * Demonstrates the simplest way to use XFeatureProvider.
 */
export const BasicProvider: Story = {
  // @ts-expect-error - render function provides children
  args: {},
  render: () => (
    <XFeatureProvider>
      <div style={{ padding: '20px' }}>
        <h2>Basic XFeatureProvider</h2>
        <ContextStateDisplay />
        <p>Provider is ready. Use the hooks to interact with XFeatures.</p>
      </div>
    </XFeatureProvider>
  ),
};

/**
 * Provider with error handler.
 * Shows how to capture and respond to errors during operations.
 */
export const ProviderWithErrorHandling: Story = {
  // @ts-expect-error - render function provides children
  args: {},
  render: () => {
    const [errors, setErrors] = useState<string[]>([]);

    return (
      <XFeatureProvider
        onError={async (event) => {
          const errorMsg = `${event.context}: ${event.error.message}`;
          setErrors((prev) => [...prev, errorMsg]);
        }}
      >
        <div style={{ padding: '20px' }}>
          <h2>Provider with Error Handling</h2>
          <ContextStateDisplay />
          {errors.length > 0 && (
            <div style={{ padding: '12px', background: '#ffe0e0', borderRadius: '4px', marginBottom: '16px' }}>
              <h3>Captured Errors:</h3>
              <ul>
                {errors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}
          <p>Any errors will be captured and logged above.</p>
        </div>
      </XFeatureProvider>
    );
  },
};

// ============================================================================
// AVERAGE STORIES (3)
// ============================================================================

/**
 * Provider with query mocking.
 * Demonstrates intercepting queries and returning mock data.
 */
export const ProviderWithQueryMocking: Story = {
  // @ts-expect-error - render function provides children
  args: {},
  render: () => {
    const [mockEnabled, setMockEnabled] = useState(true);

    return (
      <XFeatureProvider
        onBeforeQuery={async (event) => {
          if (!mockEnabled) return undefined;

          console.log('Intercepting query:', event.queryId);

          if (event.queryId === 'getUsersQuery') {
            const response: QueryResponse = {
              data: mockUsersData,
              total: mockUsersData.length,
              page: 1,
              pageSize: 5,
            };
            return response;
          }
          return undefined;
        }}
        onAfterQuery={async (event) => {
          console.log('Query completed:', event.queryId, 'Results:', event.result.data?.length);
        }}
      >
        <div style={{ padding: '20px' }}>
          <h2>Provider with Query Mocking</h2>
          <ContextStateDisplay />
          <div style={{ padding: '12px', background: '#e8f5e9', borderRadius: '4px', marginBottom: '16px' }}>
            <label>
              <input
                type="checkbox"
                checked={mockEnabled}
                onChange={(e) => setMockEnabled(e.target.checked)}
              />
              Enable Mock Data
            </label>
          </div>
          <QueryExecutionDemo />
        </div>
      </XFeatureProvider>
    );
  },
};

/**
 * Provider with action mocking.
 * Demonstrates intercepting actions and returning mock responses.
 */
export const ProviderWithActionMocking: Story = {
  // @ts-expect-error - render function provides children
  args: {},
  render: () => {
    const [mockEnabled, setMockEnabled] = useState(true);

    return (
      <XFeatureProvider
        onBeforeAction={async (event) => {
          if (!mockEnabled) return undefined;

          console.log('Intercepting action:', event.actionId, 'Params:', event.params);

          if (event.actionId === 'createUserAction') {
            return {
              success: true,
              message: 'User created successfully (mocked)',
              data: { userId: 99, ...event.params },
            };
          }

          if (event.actionId === 'deleteUserAction') {
            return {
              success: true,
              message: 'User deleted successfully (mocked)',
            };
          }

          return undefined;
        }}
        onAfterAction={async (event) => {
          console.log('Action completed:', event.actionId, 'Success:', event.result.success);
        }}
      >
        <div style={{ padding: '20px' }}>
          <h2>Provider with Action Mocking</h2>
          <ContextStateDisplay />
          <div style={{ padding: '12px', background: '#e8f5e9', borderRadius: '4px', marginBottom: '16px' }}>
            <label>
              <input
                type="checkbox"
                checked={mockEnabled}
                onChange={(e) => setMockEnabled(e.target.checked)}
              />
              Enable Mock Actions
            </label>
          </div>
          <ActionExecutionDemo />
        </div>
      </XFeatureProvider>
    );
  },
};

/**
 * Provider with frontend elements loading.
 * Demonstrates loading and caching of frontend element definitions.
 */
export const ProviderWithFrontendLoading: Story = {
  // @ts-expect-error - render function provides children
  args: {},
  render: () => {
    return (
      <XFeatureProvider
        onBeforeFrontend={async (event) => {
          console.log('Loading frontend elements for:', event.featureName);
          // Simulate network delay
          await new Promise((resolve) => setTimeout(resolve, 500));
          return mockFrontendElements;
        }}
        onAfterFrontend={async (event) => {
          console.log('Frontend elements loaded:', event.featureName);
        }}
      >
        <div style={{ padding: '20px' }}>
          <h2>Provider with Frontend Elements Loading</h2>
          <ContextStateDisplay />
          <FrontendElementsDemo />
        </div>
      </XFeatureProvider>
    );
  },
};

// ============================================================================
// COMPLEX STORIES (5)
// ============================================================================

/**
 * Provider with complete event handling.
 * Demonstrates all event handlers working together with comprehensive logging.
 */
export const CompleteEventHandling: Story = {
  // @ts-expect-error - render function provides children
  args: {},
  render: () => {
    const [events, setEvents] = useState<{ type: string; timestamp: string; details: string }[]>([]);

    const logEvent = (type: string, details: string) => {
      setEvents((prev) => [
        { type, details, timestamp: new Date().toLocaleTimeString() },
        ...prev,
      ].slice(0, 20)); // Keep last 20 events
    };

    return (
      <XFeatureProvider
        onBeforeQuery={async (event) => {
          logEvent('Before Query', `${event.queryId} with params: ${JSON.stringify(event.params)}`);
          if (event.queryId === 'getUsersQuery') {
            return {
              data: mockUsersData.slice(0, 3),
              total: mockUsersData.length,
            };
          }
          return undefined;
        }}
        onAfterQuery={async (event) => {
          logEvent('After Query', `${event.queryId} returned ${event.result.data?.length} items`);
        }}
        onBeforeAction={async (event) => {
          logEvent('Before Action', `${event.actionId} with params: ${JSON.stringify(event.params)}`);
          return undefined;
        }}
        onAfterAction={async (event) => {
          logEvent('After Action', `${event.actionId} - Success: ${event.result.success}`);
        }}
        onBeforeFrontend={async (event) => {
          logEvent('Before Frontend', `Loading for ${event.featureName}`);
          return mockFrontendElements;
        }}
        onAfterFrontend={async (event) => {
          logEvent('After Frontend', `Loaded ${event.result.forms.length} forms, ${event.result.dataTables.length} tables`);
        }}
        onError={async (event) => {
          logEvent('Error', `${event.context}: ${event.error.message}`);
        }}
      >
        <div style={{ padding: '20px' }}>
          <h2>Complete Event Handling</h2>
          <ContextStateDisplay />
          <div style={{ marginBottom: '16px' }}>
            <QueryExecutionDemo />
            <FrontendElementsDemo />
          </div>
          <div style={{ padding: '12px', background: '#f0f0f0', borderRadius: '4px', maxHeight: '300px', overflowY: 'auto' }}>
            <h3>Event Log:</h3>
            {events.length === 0 ? (
              <p>No events yet. Try executing a query or loading frontend elements.</p>
            ) : (
              <ul style={{ fontSize: '12px' }}>
                {events.map((event, idx) => (
                  <li key={idx}>
                    <strong>[{event.timestamp}]</strong> {event.type}: {event.details}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </XFeatureProvider>
    );
  },
};

/**
 * Provider with error scenarios.
 * Demonstrates handling various error conditions.
 */
export const ErrorScenarios: Story = {
  // @ts-expect-error - render function provides children
  args: {},
  render: () => {
    const [errorType, setErrorType] = useState<'none' | 'query' | 'action' | 'feature'>('none');
    const [errors, setErrors] = useState<string[]>([]);

    const simulateError = (_type: string, message: string): undefined => {
      throw new Error(message);
    };

    return (
      <XFeatureProvider
        onBeforeQuery={async (_event) => {
          if (errorType === 'query') {
            simulateError('Query Error', 'Failed to execute query: Database connection timeout');
          }
          if ((_event).queryId === 'getUsersQuery') {
            return {
              data: mockUsersData,
              total: mockUsersData.length,
            };
          }
          return undefined;
        }}
        onBeforeAction={async (_event) => {
          if (errorType === 'action') {
            simulateError('Action Error', 'Failed to create user: Validation error');
          }
          return undefined;
        }}
        onBeforeFrontend={async (_event) => {
          if (errorType === 'feature') {
            simulateError('Frontend Error', 'Failed to load frontend elements: Network error');
          }
          return mockFrontendElements;
        }}
        onError={async (event) => {
          const errorMsg = `[${event.context}] ${event.error.message}`;
          setErrors((prev) => [errorMsg, ...prev].slice(0, 10));
        }}
      >
        <div style={{ padding: '20px' }}>
          <h2>Error Scenarios</h2>
          <ContextStateDisplay />
          <div style={{ padding: '12px', background: '#fff3e0', borderRadius: '4px', marginBottom: '16px' }}>
            <h3>Simulate Errors:</h3>
            <select
              value={errorType}
              onChange={(e) => {
                setErrorType(e.target.value as any);
                setErrors([]);
              }}
              style={{ padding: '8px', marginRight: '8px' }}
            >
              <option value="none">No Errors</option>
              <option value="query">Query Error</option>
              <option value="action">Action Error</option>
              <option value="feature">Feature Loading Error</option>
            </select>
            <p style={{ fontSize: '12px', color: '#666' }}>
              {errorType === 'none'
                ? 'Select an error type to simulate'
                : `${errorType} errors enabled - try executing operations`}
            </p>
          </div>
          {errorType !== 'none' && (
            <>
              <QueryExecutionDemo />
              <ActionExecutionDemo />
              <FrontendElementsDemo />
            </>
          )}
          {errors.length > 0 && (
            <div style={{ padding: '12px', background: '#ffebee', borderRadius: '4px' }}>
              <h3>Captured Errors:</h3>
              <ul style={{ fontSize: '12px' }}>
                {errors.map((err, idx) => (
                  <li key={idx} style={{ color: '#d32f2f' }}>
                    {err}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </XFeatureProvider>
    );
  },
};

/**
 * Comprehensive useXFeatureQuery hook demonstration.
 * Shows query execution with pagination, refetch, and error handling.
 */
export const UseXFeatureQueryHookDemo: Story = {
  // @ts-expect-error - render function provides children
  args: {},
  render: () => {
    const [page, setPage] = useState(0);
    const pageSize = 3;

    return (
      <XFeatureProvider
        onBeforeQuery={async (event) => {
          if (event.queryId === 'getUsersQuery') {
            const offset = (page * pageSize);
            const paginatedData = mockUsersData.slice(offset, offset + pageSize);
            return {
              data: paginatedData,
              total: mockUsersData.length,
              page: page + 1,
              pageSize: pageSize,
            };
          }
          return undefined;
        }}
      >
        <div style={{ padding: '20px' }}>
          <h2>useXFeatureQuery Hook Demo</h2>
          <ContextStateDisplay />
          <div style={{ padding: '16px', border: '1px solid #ddd', borderRadius: '4px' }}>
            <h3>User List with Pagination</h3>
            <QueryComponent page={page} pageSize={pageSize} onPageChange={setPage} />
          </div>
        </div>
      </XFeatureProvider>
    );
  },
};

// Helper component for query demo
function QueryComponent({
  page,
  pageSize,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  const { data, loading, error, total, refetch } = useXFeatureQuery(
    'UserManagement',
    'getUsersQuery',
    { limit: pageSize, offset: page * pageSize }
  );

  const totalPages = Math.ceil((total || 0) / pageSize);

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <button onClick={() => refetch()} disabled={loading} style={{ marginRight: '8px' }}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
        <span style={{ color: '#666' }}>
          Page {page + 1} of {totalPages} ({total} total items)
        </span>
      </div>

      {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Name</th>
            <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Email</th>
            <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Role</th>
            <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((user: any) => (
            <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px' }}>{user.name}</td>
              <td style={{ padding: '8px' }}>{user.email}</td>
              <td style={{ padding: '8px' }}>{user.role}</td>
              <td style={{ padding: '8px' }}>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: user.status === 'active' ? '#c8e6c9' : '#ffcccc',
                    fontSize: '12px',
                  }}
                >
                  {user.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0 || loading}
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1 || loading}
        >
          Next
        </button>
      </div>
    </div>
  );
}

/**
 * Comprehensive useXFeatureAction hook demonstration.
 * Shows action execution with validation and response handling.
 */
export const UseXFeatureActionHookDemo: Story = {
  // @ts-expect-error - render function provides children
  args: {},
  render: () => {
    const [createdUsers, setCreatedUsers] = useState<any[]>([]);

    return (
      <XFeatureProvider
        onBeforeAction={async (event) => {
          if (event.actionId === 'createUserAction') {
            // Simulate validation
            const { name, email } = event.params;
            if (!name || !email) {
              return { success: false, message: 'Name and email are required' };
            }
            return {
              success: true,
              message: 'User created successfully',
              data: { id: Math.random(), ...event.params },
            };
          }
          return undefined;
        }}
      >
        <div style={{ padding: '20px' }}>
          <h2>useXFeatureAction Hook Demo</h2>
          <ContextStateDisplay />
          <div style={{ padding: '16px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '16px' }}>
            <h3>Create User Form</h3>
            <ActionFormComponent onUserCreated={(user) => setCreatedUsers((prev) => [user, ...prev])} />
          </div>
          {createdUsers.length > 0 && (
            <div style={{ padding: '16px', border: '1px solid #ddd', borderRadius: '4px' }}>
              <h3>Created Users:</h3>
              <ul>
                {createdUsers.map((user, idx) => (
                  <li key={idx}>
                    {user.name} ({user.email}) - Role: {user.role}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </XFeatureProvider>
    );
  },
};

// Helper component for action demo
function ActionFormComponent({ onUserCreated }: { onUserCreated: (user: any) => void }) {
  const { execute, loading, error, success } = useXFeatureAction('UserManagement', 'createUserAction');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user',
    status: 'active',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await execute(formData);
      if (result.success) {
        onUserCreated(result.data || formData);
        setFormData({ name: '', email: '', role: 'user', status: 'active' });
      }
    } catch (err) {
      // Error is handled by hook
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '400px' }}>
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>Name:</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          disabled={loading}
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          placeholder="Full name"
        />
      </div>
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>Email:</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
          disabled={loading}
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          placeholder="user@example.com"
        />
      </div>
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>Role:</label>
        <select
          value={formData.role}
          onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
          disabled={loading}
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
        >
          <option value="user">User</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          padding: '8px',
          background: '#1976d2',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? 'Creating...' : 'Create User'}
      </button>
      {error && <p style={{ color: 'red', marginTop: '8px' }}>Error: {error.message}</p>}
      {success && <p style={{ color: 'green', marginTop: '8px' }}>User created successfully!</p>}
    </form>
  );
}

/**
 * Combined hooks demonstration.
 * Shows multiple hooks working together in a complex scenario.
 */
export const AllHooksCombined: Story = {
  // @ts-expect-error - render function provides children
  args: {},
  render: () => {
    const [selectedUser, setSelectedUser] = useState<any>(null);

    return (
      <XFeatureProvider
        onBeforeQuery={async (event) => {
          if (event.queryId === 'getUsersQuery') {
            return { data: mockUsersData, total: mockUsersData.length };
          }
          if (event.queryId === 'getUserByIdQuery') {
            const user = mockUsersData.find((u) => u.id === event.params.userId);
            return { data: user ? [user] : [] };
          }
          return undefined;
        }}
        onBeforeFrontend={async (_event) => mockFrontendElements}
        onBeforeAction={async (event) => {
          if (event.actionId === 'updateUserAction') {
            return { success: true, message: 'User updated', data: event.params };
          }
          return undefined;
        }}
      >
        <div style={{ padding: '20px' }}>
          <h2>All Hooks Combined Demo</h2>
          <ContextStateDisplay />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <CombinedHooksLeftPanel onSelectUser={setSelectedUser} />
            <CombinedHooksRightPanel selectedUser={selectedUser} />
          </div>
        </div>
      </XFeatureProvider>
    );
  },
};

// Helper component for combined hooks left panel
function CombinedHooksLeftPanel({ onSelectUser }: { onSelectUser: (user: any) => void }) {
  const { data, loading, error } = useXFeatureQuery('UserManagement', 'getUsersQuery', {
    limit: 100,
    offset: 0,
  });

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '16px' }}>
      <h3>Users List</h3>
      {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
      {loading && <p>Loading...</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {data.map((user: any) => (
          <li key={user.id} style={{ marginBottom: '8px' }}>
            <button
              onClick={() => onSelectUser(user)}
              style={{
                width: '100%',
                padding: '8px',
                background: '#f0f0f0',
                border: '1px solid #ddd',
                borderRadius: '4px',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <strong>{user.name}</strong>
              <br />
              <small>{user.email}</small>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Helper component for combined hooks right panel
function CombinedHooksRightPanel({ selectedUser }: { selectedUser: any }) {
  const { frontendElements } = useXFeatureFrontend('UserManagement', false);
  const { execute, loading: actionLoading, success } = useXFeatureAction('UserManagement', 'updateUserAction');

  useEffect(() => {
    if (selectedUser) {
      // Could load user details here
    }
  }, [selectedUser]);

  if (!selectedUser) {
    return (
      <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '16px', textAlign: 'center' }}>
        <p style={{ color: '#999' }}>Select a user to view details</p>
      </div>
    );
  }

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '16px' }}>
      <h3>User Details</h3>
      <div style={{ marginBottom: '16px', padding: '12px', background: '#f9f9f9', borderRadius: '4px' }}>
        <p><strong>Name:</strong> {selectedUser.name}</p>
        <p><strong>Email:</strong> {selectedUser.email}</p>
        <p><strong>Role:</strong> {selectedUser.role}</p>
        <p><strong>Status:</strong> {selectedUser.status}</p>
        <p><strong>Created:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
      </div>

      <button
        onClick={() => execute({ userId: selectedUser.id, ...selectedUser, name: selectedUser.name + ' (Updated)' })}
        disabled={actionLoading}
        style={{
          width: '100%',
          padding: '8px',
          background: '#4caf50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: actionLoading ? 'not-allowed' : 'pointer',
          opacity: actionLoading ? 0.6 : 1,
          marginBottom: '8px',
        }}
      >
        {actionLoading ? 'Updating...' : 'Update User'}
      </button>

      {success && <p style={{ color: 'green' }}>User updated successfully!</p>}

      {frontendElements && (
        <div style={{ marginTop: '16px', padding: '12px', background: '#e3f2fd', borderRadius: '4px', fontSize: '12px' }}>
          <p><strong>Available Forms:</strong> {frontendElements.forms.map((f) => f.id).join(', ')}</p>
          <p><strong>Available Tables:</strong> {frontendElements.dataTables.map((t) => t.id).join(', ')}</p>
        </div>
      )}
    </div>
  );
}
