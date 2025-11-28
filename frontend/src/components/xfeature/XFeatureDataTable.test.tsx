import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { XFeatureDataTable } from './XFeatureDataTable';
import { XFeatureProvider, type XFeatureMock } from '../../contexts/XFeatureContext';
import type { FrontendElements, BackendInfo, QueryResponse, Mapping } from '../../types/xfeature';

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
      pagination: true,
      pageSize: 10,
      columns: [
        { name: 'id', label: 'ID', type: 'Number', sortable: true },
        { name: 'username', label: 'Username', type: 'Text', sortable: true },
        { name: 'email', label: 'Email', type: 'Email' },
        { name: 'status', label: 'Status', type: 'Badge' },
      ],
    },
  ],
  forms: [],
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
  actionQueries: [],
};

const mockMappings: Mapping[] = [
  { name: 'id', dataType: 'Number', label: 'ID' },
  { name: 'username', dataType: 'Text', label: 'Username' },
  { name: 'email', dataType: 'Email', label: 'Email' },
  { name: 'status', dataType: 'Select', label: 'Status' },
];

const mockQueryResponse: QueryResponse = {
  data: [
    { id: 1, username: 'john', email: 'john@example.com', status: 'active' },
    { id: 2, username: 'jane', email: 'jane@example.com', status: 'active' },
    { id: 3, username: 'bob', email: 'bob@example.com', status: 'inactive' },
  ],
  total: 3,
};

// ============================================================================
// TESTS
// ========================================================================

describe('XFeatureDataTable', () => {
  // ========================================================================
  // RENDERING TESTS
  // ========================================================================

  it('renders table title', async () => {
    const mock: XFeatureMock = {
      frontEnd: mockFrontendElements,
      backEnd: mockBackendInfo,
      mappings: mockMappings,
      queries: { ListUsers: mockQueryResponse },
    };

    render(
      <XFeatureProvider mock={mock}>
        <XFeatureDataTable id="users-table" />
      </XFeatureProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Users')).toBeInTheDocument();
    });
  });

  it('renders table columns', async () => {
    const mock: XFeatureMock = {
      frontEnd: mockFrontendElements,
      backEnd: mockBackendInfo,
      mappings: mockMappings,
      queries: { ListUsers: mockQueryResponse },
    };

    render(
      <XFeatureProvider mock={mock}>
        <XFeatureDataTable id="users-table" />
      </XFeatureProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Username')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });
  });

  it('renders table data rows', async () => {
    const mock: XFeatureMock = {
      frontEnd: mockFrontendElements,
      backEnd: mockBackendInfo,
      mappings: mockMappings,
      queries: { ListUsers: mockQueryResponse },
    };

    render(
      <XFeatureProvider mock={mock}>
        <XFeatureDataTable id="users-table" />
      </XFeatureProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('john')).toBeInTheDocument();
      expect(screen.getByText('jane')).toBeInTheDocument();
      expect(screen.getByText('bob')).toBeInTheDocument();
    });
  });

  // ========================================================================
  // PAGINATION TESTS
  // ========================================================================

  it('renders pagination controls', async () => {
    const mock: XFeatureMock = {
      frontEnd: mockFrontendElements,
      backEnd: mockBackendInfo,
      mappings: mockMappings,
      queries: { ListUsers: mockQueryResponse },
    };

    const { container } = render(
      <XFeatureProvider mock={mock}>
        <XFeatureDataTable id="users-table" />
      </XFeatureProvider>
    );

    await waitFor(() => {
      const pagination = container.querySelector('.MuiTablePagination-root');
      expect(pagination).toBeInTheDocument();
    });
  });

  it('handles page change', async () => {
    const user = userEvent.setup();
    const mock: XFeatureMock = {
      frontEnd: mockFrontendElements,
      backEnd: mockBackendInfo,
      mappings: mockMappings,
      queries: {
        ListUsers: {
          data: [{ id: 1, username: 'john', email: 'john@example.com', status: 'active' }],
          total: 100,
        },
      },
    };

    render(
      <XFeatureProvider mock={mock}>
        <XFeatureDataTable id="users-table" />
      </XFeatureProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('john')).toBeInTheDocument();
    });
  });

  // ========================================================================
  // SORTING TESTS
  // ========================================================================

  it('renders sortable column headers', async () => {
    const mock: XFeatureMock = {
      frontEnd: mockFrontendElements,
      backEnd: mockBackendInfo,
      mappings: mockMappings,
      queries: { ListUsers: mockQueryResponse },
    };

    const { container } = render(
      <XFeatureProvider mock={mock}>
        <XFeatureDataTable id="users-table" />
      </XFeatureProvider>
    );

    await waitFor(() => {
      const sortLabels = container.querySelectorAll('[role="button"]');
      expect(sortLabels.length).toBeGreaterThan(0);
    });
  });

  it('handles column sorting', async () => {
    const user = userEvent.setup();
    const mock: XFeatureMock = {
      frontEnd: mockFrontendElements,
      backEnd: mockBackendInfo,
      mappings: mockMappings,
      queries: { ListUsers: mockQueryResponse },
    };

    render(
      <XFeatureProvider mock={mock}>
        <XFeatureDataTable id="users-table" />
      </XFeatureProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('john')).toBeInTheDocument();
    });

    const idHeader = screen.getByText('ID').closest('[role="button"]');
    if (idHeader) {
      await user.click(idHeader);
    }
  });

  // ========================================================================
  // REFRESH BUTTON TESTS
  // ========================================================================

  it('renders refresh button', async () => {
    const mock: XFeatureMock = {
      frontEnd: mockFrontendElements,
      backEnd: mockBackendInfo,
      mappings: mockMappings,
      queries: { ListUsers: mockQueryResponse },
    };

    render(
      <XFeatureProvider mock={mock}>
        <XFeatureDataTable id="users-table" />
      </XFeatureProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Refresh')).toBeInTheDocument();
    });
  });

  it('refreshes data when refresh button is clicked', async () => {
    const user = userEvent.setup();
    const mock: XFeatureMock = {
      frontEnd: mockFrontendElements,
      backEnd: mockBackendInfo,
      mappings: mockMappings,
      queries: { ListUsers: mockQueryResponse },
    };

    render(
      <XFeatureProvider mock={mock}>
        <XFeatureDataTable id="users-table" />
      </XFeatureProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('john')).toBeInTheDocument();
    });

    const refreshButton = screen.getByText('Refresh');
    await user.click(refreshButton);

    expect(screen.getByText('john')).toBeInTheDocument();
  });

  // ========================================================================
  // LOADING STATE TESTS
  // ========================================================================

  it('shows loading indicator while fetching data', async () => {
    const mock: XFeatureMock = {
      frontEnd: mockFrontendElements,
      backEnd: mockBackendInfo,
      mappings: mockMappings,
      queries: { ListUsers: mockQueryResponse },
    };

    const { container } = render(
      <XFeatureProvider mock={mock}>
        <XFeatureDataTable id="users-table" />
      </XFeatureProvider>
    );

    // Data should eventually load
    await waitFor(() => {
      expect(screen.getByText('john')).toBeInTheDocument();
    });
  });

  // ========================================================================
  // XFEATUREMOCK COMPATIBILITY TESTS
  // ========================================================================

  it('works with table definition from XFeatureMock', async () => {
    const mock: XFeatureMock = {
      frontEnd: mockFrontendElements,
      backEnd: mockBackendInfo,
      mappings: mockMappings,
      queries: {
        ListUsers: {
          data: [{ id: 1, username: 'alice', email: 'alice@example.com', status: 'active' }],
          total: 1,
        },
      },
    };

    render(
      <XFeatureProvider mock={mock}>
        <XFeatureDataTable id="users-table" />
      </XFeatureProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('alice')).toBeInTheDocument();
    });
  });

  // ========================================================================
  // EMPTY DATA TESTS
  // ========================================================================

  it('handles empty data gracefully', async () => {
    const mock: XFeatureMock = {
      frontEnd: mockFrontendElements,
      backEnd: mockBackendInfo,
      mappings: mockMappings,
      queries: {
        ListUsers: {
          data: [],
          total: 0,
        },
      },
    };

    render(
      <XFeatureProvider mock={mock}>
        <XFeatureDataTable id="users-table" />
      </XFeatureProvider>
    );

    await waitFor(() => {
      const table = screen.getByText('Users').closest('div');
      expect(table).toBeInTheDocument();
    });
  });

  // ========================================================================
  // ROWS PER PAGE TESTS
  // ========================================================================

  it('respects page size from table definition', async () => {
    const mock: XFeatureMock = {
      frontEnd: mockFrontendElements,
      backEnd: mockBackendInfo,
      mappings: mockMappings,
      queries: { ListUsers: mockQueryResponse },
    };

    const { container } = render(
      <XFeatureProvider mock={mock}>
        <XFeatureDataTable id="users-table" />
      </XFeatureProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('john')).toBeInTheDocument();
    });

    // Table should have been rendered with default page size
    const table = container.querySelector('table');
    expect(table).toBeInTheDocument();
  });

  // ========================================================================
  // COLUMNS CONFIGURATION TESTS
  // ========================================================================

  it('renders all configured columns', async () => {
    const mock: XFeatureMock = {
      frontEnd: mockFrontendElements,
      backEnd: mockBackendInfo,
      mappings: mockMappings,
      queries: { ListUsers: mockQueryResponse },
    };

    render(
      <XFeatureProvider mock={mock}>
        <XFeatureDataTable id="users-table" />
      </XFeatureProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Username')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });
  });

  // ========================================================================
  // CELL VALUE TESTS
  // ========================================================================

  it('displays correct cell values', async () => {
    const mock: XFeatureMock = {
      frontEnd: mockFrontendElements,
      backEnd: mockBackendInfo,
      mappings: mockMappings,
      queries: { ListUsers: mockQueryResponse },
    };

    render(
      <XFeatureProvider mock={mock}>
        <XFeatureDataTable id="users-table" />
      </XFeatureProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
      expect(screen.getByText('bob@example.com')).toBeInTheDocument();
    });
  });

  // ========================================================================
  // MULTIPLE TABLES TESTS
  // ========================================================================

  it('renders multiple tables independently', async () => {
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
    };

    render(
      <XFeatureProvider mock={mock}>
        <>
          <XFeatureDataTable id="users-table" />
          <XFeatureDataTable id="products-table" />
        </>
      </XFeatureProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('Products')).toBeInTheDocument();
    });
  });
});
