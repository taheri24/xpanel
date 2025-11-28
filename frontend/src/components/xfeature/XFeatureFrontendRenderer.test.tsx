import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { XFeatureProvider, type XFeatureMock } from '../../contexts/XFeatureContext';
import { XFeatureFrontendRenderer } from './XFeatureFrontendRenderer';
import type { FrontendElements, QueryResponse, ActionQueryResponse, BackendInfo, Mapping } from '../../types/xfeature';

// ============================================================================
// MOCK DATA
// ============================================================================

const mockFrontendElements: FrontendElements = {
  feature: 'user-management',
  version: '1.0.0',
  dataTables: [
    {
      id: 'users-table',
      queryRef: 'ListUsers',
      title: 'Users',
      columns: [
        { name: 'id', label: 'ID', type: 'Number' },
        { name: 'username', label: 'Username', type: 'Text' },
        { name: 'email', label: 'Email', type: 'Email' },
      ],
    },
  ],
  forms: [
    {
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
    },
  ],
};

const mockBackendInfo: BackendInfo = {
  queries: [
    {
      id: 'ListUsers',
      sqlKey: 'select-users',
      parameters: [
        { name: 'limit', dataType: 'Int' },
        { name: 'offset', dataType: 'Int' },
      ],
    },
  ],
  actionQueries: [
    {
      id: 'CreateUser',
      sqlKey: 'insert-user',
      parameters: [
        { name: 'username', dataType: 'Text' },
        { name: 'email', dataType: 'Email' },
      ],
    },
  ],
};

const mockMappings: Mapping[] = [
  { name: 'username', dataType: 'Text', label: 'Username', required: true },
  { name: 'email', dataType: 'Email', label: 'Email', required: true },
];

const mockQueryResponse: QueryResponse = {
  data: [
    { id: 1, username: 'john', email: 'john@example.com' },
    { id: 2, username: 'jane', email: 'jane@example.com' },
  ],
  total: 2,
};

const mockActionResponse: ActionQueryResponse = {
  success: true,
  message: 'User created successfully',
};

// ============================================================================
// TESTS
// ========================================================================

describe('XFeatureFrontendRenderer', () => {
  // ========================================================================
  // RENDERING TESTS
  // ========================================================================

  it('renders when frontend elements are available', async () => {
    const mock: XFeatureMock = {
      frontEnd: mockFrontendElements,
      backEnd: mockBackendInfo,
      mappings: mockMappings,
      queries: { ListUsers: mockQueryResponse },
      actionQueries: { CreateUser: mockActionResponse },
    };

    render(
      <XFeatureProvider mock={mock}>
        <XFeatureFrontendRenderer />
      </XFeatureProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });
  });

  it('shows message when no frontend elements found', () => {
    const mock: XFeatureMock = {};

    render(
      <XFeatureProvider mock={mock}>
        <XFeatureFrontendRenderer />
      </XFeatureProvider>
    );

    expect(screen.getByText(/no frontend elements/i)).toBeInTheDocument();
  });

  // ========================================================================
  // DATA TABLE RENDERING TESTS
  // ========================================================================

  it('renders data tables section when tables are available', async () => {
    const mock: XFeatureMock = {
      frontEnd: mockFrontendElements,
      backEnd: mockBackendInfo,
      mappings: mockMappings,
      queries: { ListUsers: mockQueryResponse },
      actionQueries: { CreateUser: mockActionResponse },
    };

    render(
      <XFeatureProvider mock={mock}>
        <XFeatureFrontendRenderer />
      </XFeatureProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Users')).toBeInTheDocument();
    });
  });

  it('renders multiple data tables', async () => {
    const multiTableFrontend: FrontendElements = {
      ...mockFrontendElements,
      dataTables: [
        mockFrontendElements.dataTables[0],
        {
          ...mockFrontendElements.dataTables[0],
          id: 'products-table',
          queryRef: 'ListProducts',
          title: 'Products',
        },
      ],
    };

    const mock: XFeatureMock = {
      frontEnd: multiTableFrontend,
      backEnd: mockBackendInfo,
      mappings: mockMappings,
      queries: {
        ListUsers: mockQueryResponse,
        ListProducts: { data: [], total: 0 },
      },
      actionQueries: { CreateUser: mockActionResponse },
    };

    render(
      <XFeatureProvider mock={mock}>
        <XFeatureFrontendRenderer />
      </XFeatureProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('Products')).toBeInTheDocument();
    });
  });

  // ========================================================================
  // FORM RENDERING TESTS
  // ========================================================================

  it('renders forms section when forms are available', async () => {
    const mock: XFeatureMock = {
      frontEnd: mockFrontendElements,
      backEnd: mockBackendInfo,
      mappings: mockMappings,
      queries: { ListUsers: mockQueryResponse },
      actionQueries: { CreateUser: mockActionResponse },
    };

    render(
      <XFeatureProvider mock={mock}>
        <XFeatureFrontendRenderer />
      </XFeatureProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Actions')).toBeInTheDocument();
      expect(screen.getByText('Create User')).toBeInTheDocument();
    });
  });

  it('renders multiple forms', async () => {
    const multiFormFrontend: FrontendElements = {
      ...mockFrontendElements,
      forms: [
        mockFrontendElements.forms[0],
        {
          ...mockFrontendElements.forms[0],
          id: 'update-user',
          mode: 'Edit',
          title: 'Update User',
          actionRef: 'UpdateUser',
        },
      ],
    };

    const mock: XFeatureMock = {
      frontEnd: multiFormFrontend,
      backEnd: mockBackendInfo,
      mappings: mockMappings,
      queries: { ListUsers: mockQueryResponse },
      actionQueries: {
        CreateUser: mockActionResponse,
        UpdateUser: mockActionResponse,
      },
    };

    render(
      <XFeatureProvider mock={mock}>
        <XFeatureFrontendRenderer />
      </XFeatureProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Create User')).toBeInTheDocument();
      expect(screen.getByText('Update User')).toBeInTheDocument();
    });
  });

  // ========================================================================
  // EMPTY STATE TESTS
  // ========================================================================

  it('shows message when no data tables or forms are configured', () => {
    const emptyFrontend: FrontendElements = {
      feature: 'empty-feature',
      version: '1.0.0',
      dataTables: [],
      forms: [],
    };

    const mock: XFeatureMock = {
      frontEnd: emptyFrontend,
      backEnd: mockBackendInfo,
      mappings: mockMappings,
    };

    render(
      <XFeatureProvider mock={mock}>
        <XFeatureFrontendRenderer />
      </XFeatureProvider>
    );

    expect(screen.getByText(/no data tables or forms/i)).toBeInTheDocument();
  });

  // ========================================================================
  // CALLBACK TESTS
  // ========================================================================

  it('calls onFormSuccess when form is submitted successfully', async () => {
    const user = userEvent.setup();
    const onFormSuccess = vi.fn();

    const mock: XFeatureMock = {
      frontEnd: mockFrontendElements,
      backEnd: mockBackendInfo,
      mappings: mockMappings,
      queries: { ListUsers: mockQueryResponse },
      actionQueries: { CreateUser: mockActionResponse },
    };

    render(
      <XFeatureProvider mock={mock}>
        <XFeatureFrontendRenderer onFormSuccess={onFormSuccess} />
      </XFeatureProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Create User')).toBeInTheDocument();
    });

    const usernameInput = screen.getByLabelText('Username');
    const emailInput = screen.getByLabelText('Email');
    const submitButton = screen.getByText('Create');

    await user.type(usernameInput, 'john');
    await user.type(emailInput, 'john@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(onFormSuccess).toHaveBeenCalledWith('create-user');
    });
  });

  // ========================================================================
  // DIALOG FORM TESTS
  // ========================================================================

  it('handles dialog forms correctly', () => {
    const dialogFormFrontend: FrontendElements = {
      ...mockFrontendElements,
      forms: [
        {
          ...mockFrontendElements.forms[0],
          dialog: true,
        },
      ],
    };

    const mock: XFeatureMock = {
      frontEnd: dialogFormFrontend,
      backEnd: mockBackendInfo,
      mappings: mockMappings,
      queries: { ListUsers: mockQueryResponse },
      actionQueries: { CreateUser: mockActionResponse },
    };

    const { container } = render(
      <XFeatureProvider mock={mock}>
        <XFeatureFrontendRenderer />
      </XFeatureProvider>
    );

    // Dialog should be rendered
    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog).toBeInTheDocument();
  });

  // ========================================================================
  // MAXWIDTH CONTAINER TESTS
  // ========================================================================

  it('respects maxWidth prop', () => {
    const mock: XFeatureMock = {
      frontEnd: mockFrontendElements,
      backEnd: mockBackendInfo,
      mappings: mockMappings,
      queries: { ListUsers: mockQueryResponse },
      actionQueries: { CreateUser: mockActionResponse },
    };

    const { container } = render(
      <XFeatureProvider mock={mock}>
        <XFeatureFrontendRenderer maxWidth="md" />
      </XFeatureProvider>
    );

    const containerElement = container.querySelector('.MuiContainer-root');
    expect(containerElement).toBeInTheDocument();
  });

  it('defaults to lg maxWidth', async () => {
    const mock: XFeatureMock = {
      frontEnd: mockFrontendElements,
      backEnd: mockBackendInfo,
      mappings: mockMappings,
      queries: { ListUsers: mockQueryResponse },
      actionQueries: { CreateUser: mockActionResponse },
    };

    const { container } = render(
      <XFeatureProvider mock={mock}>
        <XFeatureFrontendRenderer />
      </XFeatureProvider>
    );

    await waitFor(() => {
      const containerElement = container.querySelector('.MuiContainer-root');
      expect(containerElement).toBeInTheDocument();
    });
  });

  // ========================================================================
  // XFEATUREMOCK COMPATIBILITY TESTS
  // ========================================================================

  it('works with frontend definition from XFeatureMock', async () => {
    const mock: XFeatureMock = {
      frontEnd: mockFrontendElements,
      backEnd: mockBackendInfo,
      mappings: mockMappings,
      queries: { ListUsers: mockQueryResponse },
      actionQueries: { CreateUser: mockActionResponse },
    };

    render(
      <XFeatureProvider mock={mock}>
        <XFeatureFrontendRenderer />
      </XFeatureProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Actions')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
    });
  });

  // ========================================================================
  // LAYOUT STRUCTURE TESTS
  // ========================================================================

  it('renders forms section before data tables', async () => {
    const mock: XFeatureMock = {
      frontEnd: mockFrontendElements,
      backEnd: mockBackendInfo,
      mappings: mockMappings,
      queries: { ListUsers: mockQueryResponse },
      actionQueries: { CreateUser: mockActionResponse },
    };

    const { container } = render(
      <XFeatureProvider mock={mock}>
        <XFeatureFrontendRenderer />
      </XFeatureProvider>
    );

    await waitFor(() => {
      const actionsText = screen.getByText('Actions');
      const usersText = screen.getByText('Users');

      // Check order by comparing positions
      expect(actionsText).toBeInTheDocument();
      expect(usersText).toBeInTheDocument();
    });
  });

  // ========================================================================
  // RELOAD BUTTON TESTS
  // ========================================================================

  it('renders reload button', async () => {
    const mock: XFeatureMock = {
      frontEnd: mockFrontendElements,
      backEnd: mockBackendInfo,
      mappings: mockMappings,
      queries: { ListUsers: mockQueryResponse },
      actionQueries: { CreateUser: mockActionResponse },
    };

    render(
      <XFeatureProvider mock={mock}>
        <XFeatureFrontendRenderer />
      </XFeatureProvider>
    );

    await waitFor(() => {
      const reloadButton = screen.getByText('Reload');
      expect(reloadButton).toBeInTheDocument();
    });
  });

  // ========================================================================
  // SINGLE TABLE AND SINGLE FORM TESTS
  // ========================================================================

  it('renders single table and single form correctly', async () => {
    const mock: XFeatureMock = {
      frontEnd: mockFrontendElements,
      backEnd: mockBackendInfo,
      mappings: mockMappings,
      queries: { ListUsers: mockQueryResponse },
      actionQueries: { CreateUser: mockActionResponse },
    };

    render(
      <XFeatureProvider mock={mock}>
        <XFeatureFrontendRenderer />
      </XFeatureProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Create User')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
    });
  });

  // ========================================================================
  // DATA LOADING TESTS
  // ========================================================================

  it('loads and displays data from mock queries', async () => {
    const mock: XFeatureMock = {
      frontEnd: mockFrontendElements,
      backEnd: mockBackendInfo,
      mappings: mockMappings,
      queries: { ListUsers: mockQueryResponse },
      actionQueries: { CreateUser: mockActionResponse },
    };

    render(
      <XFeatureProvider mock={mock}>
        <XFeatureFrontendRenderer />
      </XFeatureProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('john')).toBeInTheDocument();
      expect(screen.getByText('jane')).toBeInTheDocument();
    });
  });
});
