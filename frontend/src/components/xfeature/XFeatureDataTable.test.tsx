import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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
];

const mockQueryResponse: QueryResponse = {
  data: [
    { id: 1, username: 'john', email: 'john@example.com' },
    { id: 2, username: 'jane', email: 'jane@example.com' },
  ],
  total: 2,
};

// ============================================================================
// TESTS
// ========================================================================

describe('XFeatureDataTable', () => {
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
    });
  });

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
    });
  });

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
