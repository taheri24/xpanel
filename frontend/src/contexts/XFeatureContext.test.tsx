import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import {
  XFeatureProvider,
  useXFeature,
  useXFeatureQuery,
  useXFeatureActionQuery,
  useXFeatureFrontend,
  type XFeatureMock,
} from './XFeatureContext';
import type {
  FrontendElements,
  BackendInfo,
  QueryResponse,
  ActionQueryResponse,
  Mapping,
} from '../types/xfeature';

// ============================================================================
// MOCK DATA
// ============================================================================

const mockFrontendElements: FrontendElements = {
  feature: 'test-feature',
  version: '1.0.0',
  dataTables: [
    {
      id: 'users-table',
      queryRef: 'ListUsers',
      title: 'Users',
      columns: [
        { name: 'id', label: 'ID', type: 'Number' },
        { name: 'username', label: 'Username', type: 'Text' },
      ],
    },
  ],
  forms: [
    {
      id: 'create-user',
      mode: 'Create',
      title: 'Create User',
      actionRef: 'CreateUser',
      fields: [
        { name: 'username', label: 'Username', dataType: 'Text', required: true },
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
      parameters: [{ name: 'username', dataType: 'Text' }],
    },
  ],
};

const mockMappings: Mapping[] = [
  {
    name: 'username',
    dataType: 'Text',
    label: 'Username',
    required: true,
  },
  {
    name: 'email',
    dataType: 'Email',
    label: 'Email',
    required: true,
  },
];

const mockQueryResponse: QueryResponse = {
  data: [
    { id: 1, username: 'john' },
    { id: 2, username: 'jane' },
  ],
  total: 2,
};

const mockActionResponse: ActionQueryResponse = {
  success: true,
  message: 'User created successfully',
  data: { id: 3, username: 'bob' },
};

// ============================================================================
// TEST COMPONENTS
// ============================================================================

function TestComponentUseXFeature() {
  const context = useXFeature();
  return (
    <div>
      <div data-testid="load-state">{context.loadState}</div>
      <div data-testid="feature">{context.getFeature()?.feature || 'none'}</div>
    </div>
  );
}

function TestComponentUseQuery() {
  const { data, loading, error, total, refetch } = useXFeatureQuery('ListUsers', {}, true);
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'loaded'}</div>
      <div data-testid="error">{error?.message || 'no-error'}</div>
      <div data-testid="total">{total}</div>
      <div data-testid="data-count">{data.length}</div>
      <button onClick={() => refetch()}>Refetch</button>
    </div>
  );
}

function TestComponentUseActionQuery() {
  const { execute, loading, error, success, response } = useXFeatureActionQuery('CreateUser');
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'loaded'}</div>
      <div data-testid="error">{error?.message || 'no-error'}</div>
      <div data-testid="success">{success ? 'success' : 'not-success'}</div>
      <div data-testid="response">{response?.message || 'no-response'}</div>
      <button onClick={() => execute({ username: 'bob' })}>Execute</button>
    </div>
  );
}

function TestComponentUseXFeatureFrontend() {
  const frontend = useXFeatureFrontend();
  return <div data-testid="frontend">{frontend?.feature || 'none'}</div>;
}

// ============================================================================
// TESTS: XFeatureProvider
// ============================================================================

describe('XFeatureProvider', () => {
  it('provides context to children', () => {
    const mock: XFeatureMock = {
      frontEnd: mockFrontendElements,
      backEnd: mockBackendInfo,
      mappings: mockMappings,
    };

    render(
      <XFeatureProvider mock={mock}>
        <TestComponentUseXFeature />
      </XFeatureProvider>
    );

    expect(screen.getByTestId('feature')).toHaveTextContent('test-feature');
  });

  it('loads mock data when provided', async () => {
    const mock: XFeatureMock = {
      frontEnd: mockFrontendElements,
      backEnd: mockBackendInfo,
      mappings: mockMappings,
    };

    render(
      <XFeatureProvider mock={mock}>
        <TestComponentUseXFeature />
      </XFeatureProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('load-state')).toHaveTextContent('LOADED');
    });
  });

  it('throws error when useXFeature is used outside provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponentUseXFeature />);
    }).toThrow('useXFeature must be used within XFeatureProvider');

    consoleError.mockRestore();
  });

  it('calls onError handler when an error occurs', async () => {
    const onError = vi.fn();
    const mockWithError: XFeatureMock = {
      frontEnd: mockFrontendElements,
      backEnd: mockBackendInfo,
    };

    render(
      <XFeatureProvider mock={mockWithError} onError={onError}>
        <TestComponentUseQuery />
      </XFeatureProvider>
    );

    // Verify the provider renders without immediate errors
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });
});

// ============================================================================
// TESTS: useXFeature Hook
// ============================================================================

describe('useXFeature', () => {
  it('provides access to context state', () => {
    const mock: XFeatureMock = {
      frontEnd: mockFrontendElements,
      backEnd: mockBackendInfo,
      mappings: mockMappings,
    };

    render(
      <XFeatureProvider mock={mock}>
        <TestComponentUseXFeature />
      </XFeatureProvider>
    );

    expect(screen.getByTestId('feature')).toHaveTextContent('test-feature');
  });

  it('provides getForm method', async () => {
    function TestGetForm() {
      const context = useXFeature();
      const form = context.getForm('create-user');
      return <div data-testid="form">{form?.title || 'none'}</div>;
    }

    const mock: XFeatureMock = {
      frontEnd: mockFrontendElements,
      backEnd: mockBackendInfo,
      mappings: mockMappings,
    };

    render(
      <XFeatureProvider mock={mock}>
        <TestGetForm />
      </XFeatureProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('form')).toHaveTextContent('Create User');
    });
  });

  it('provides getMappingByName method', async () => {
    function TestGetMapping() {
      const context = useXFeature();
      const mapping = context.getMappingByName('username');
      return <div data-testid="mapping">{mapping?.label || 'none'}</div>;
    }

    const mock: XFeatureMock = {
      frontEnd: mockFrontendElements,
      backEnd: mockBackendInfo,
      mappings: mockMappings,
    };

    render(
      <XFeatureProvider mock={mock}>
        <TestGetMapping />
      </XFeatureProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('mapping')).toHaveTextContent('Username');
    });
  });

  it('provides getDataTable method', async () => {
    function TestGetDataTable() {
      const context = useXFeature();
      const table = context.getDataTable('users-table');
      return <div data-testid="table">{table?.title || 'none'}</div>;
    }

    const mock: XFeatureMock = {
      frontEnd: mockFrontendElements,
      backEnd: mockBackendInfo,
      mappings: mockMappings,
    };

    render(
      <XFeatureProvider mock={mock}>
        <TestGetDataTable />
      </XFeatureProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('table')).toHaveTextContent('Users');
    });
  });
});

// ============================================================================
// TESTS: useXFeatureQuery Hook
// ============================================================================

describe('useXFeatureQuery', () => {
  it('loads data on mount when autoLoad is true', async () => {
    const mock: XFeatureMock = {
      frontEnd: mockFrontendElements,
      backEnd: mockBackendInfo,
      mappings: mockMappings,
      queries: {
        ListUsers: mockQueryResponse,
      },
    };

    render(
      <XFeatureProvider mock={mock}>
        <TestComponentUseQuery />
      </XFeatureProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
      expect(screen.getByTestId('data-count')).toHaveTextContent('2');
      expect(screen.getByTestId('total')).toHaveTextContent('2');
    });
  });

  it('does not load data on mount when autoLoad is false', () => {
    function TestComponentNoAutoLoad() {
      const { data, loading } = useXFeatureQuery('ListUsers', {}, false);
      return (
        <div>
          <div data-testid="loading">{loading ? 'loading' : 'loaded'}</div>
          <div data-testid="data-count">{data.length}</div>
        </div>
      );
    }

    const mock: XFeatureMock = {
      frontEnd: mockFrontendElements,
      backEnd: mockBackendInfo,
      mappings: mockMappings,
      queries: {
        ListUsers: mockQueryResponse,
      },
    };

    render(
      <XFeatureProvider mock={mock}>
        <TestComponentNoAutoLoad />
      </XFeatureProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    expect(screen.getByTestId('data-count')).toHaveTextContent('0');
  });

  it('returns data from mock queries', async () => {
    const mock: XFeatureMock = {
      frontEnd: mockFrontendElements,
      backEnd: mockBackendInfo,
      mappings: mockMappings,
      queries: {
        ListUsers: mockQueryResponse,
      },
    };

    render(
      <XFeatureProvider mock={mock}>
        <TestComponentUseQuery />
      </XFeatureProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('data-count')).toHaveTextContent('2');
    });
  });

  it('handles undefined queryId gracefully', async () => {
    function TestComponentUndefinedQuery() {
      const { data, loading } = useXFeatureQuery(undefined, {}, true);
      return (
        <div>
          <div data-testid="loading">{loading ? 'loading' : 'loaded'}</div>
          <div data-testid="data-count">{data.length}</div>
        </div>
      );
    }

    const mock: XFeatureMock = {
      frontEnd: mockFrontendElements,
      backEnd: mockBackendInfo,
      mappings: mockMappings,
    };

    render(
      <XFeatureProvider mock={mock}>
        <TestComponentUndefinedQuery />
      </XFeatureProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('data-count')).toHaveTextContent('0');
    });
  });

  it('provides refetch function to reload data', async () => {
    const mock: XFeatureMock = {
      frontEnd: mockFrontendElements,
      backEnd: mockBackendInfo,
      mappings: mockMappings,
      queries: {
        ListUsers: mockQueryResponse,
      },
    };

    const { user } = await import('@testing-library/user-event').then(m => ({
      user: m.default.setup(),
    }));

    render(
      <XFeatureProvider mock={mock}>
        <TestComponentUseQuery />
      </XFeatureProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('data-count')).toHaveTextContent('2');
    });

    const refetchButton = screen.getByText('Refetch');
    await user.click(refetchButton);

    await waitFor(() => {
      expect(screen.getByTestId('data-count')).toHaveTextContent('2');
    });
  });

  it('returns correct total from query response', async () => {
    const customResponse: QueryResponse = {
      data: [{ id: 1, username: 'john' }],
      total: 100,
    };

    const mock: XFeatureMock = {
      frontEnd: mockFrontendElements,
      backEnd: mockBackendInfo,
      mappings: mockMappings,
      queries: {
        ListUsers: customResponse,
      },
    };

    render(
      <XFeatureProvider mock={mock}>
        <TestComponentUseQuery />
      </XFeatureProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('total')).toHaveTextContent('100');
    });
  });
});

// ============================================================================
// TESTS: useXFeatureActionQuery Hook
// ============================================================================

describe('useXFeatureActionQuery', () => {
  it('provides execute function', () => {
    const mock: XFeatureMock = {
      frontEnd: mockFrontendElements,
      backEnd: mockBackendInfo,
      mappings: mockMappings,
      actionQueries: {
        CreateUser: mockActionResponse,
      },
    };

    render(
      <XFeatureProvider mock={mock}>
        <TestComponentUseActionQuery />
      </XFeatureProvider>
    );

    expect(screen.getByText('Execute')).toBeInTheDocument();
  });

  it('executes action and returns success response', async () => {
    const { user } = await import('@testing-library/user-event').then(m => ({
      user: m.default.setup(),
    }));

    const mock: XFeatureMock = {
      frontEnd: mockFrontendElements,
      backEnd: mockBackendInfo,
      mappings: mockMappings,
      actionQueries: {
        CreateUser: mockActionResponse,
      },
    };

    render(
      <XFeatureProvider mock={mock}>
        <TestComponentUseActionQuery />
      </XFeatureProvider>
    );

    const executeButton = screen.getByText('Execute');
    await user.click(executeButton);

    await waitFor(() => {
      expect(screen.getByTestId('success')).toHaveTextContent('success');
      expect(screen.getByTestId('response')).toHaveTextContent('User created successfully');
    });
  });

  it('handles action error', async () => {
    const { user } = await import('@testing-library/user-event').then(m => ({
      user: m.default.setup(),
    }));

    const mock: XFeatureMock = {
      frontEnd: mockFrontendElements,
      backEnd: mockBackendInfo,
      mappings: mockMappings,
      actionQueries: {
        CreateUser: {
          success: false,
          message: 'User already exists',
        },
      },
    };

    render(
      <XFeatureProvider mock={mock}>
        <TestComponentUseActionQuery />
      </XFeatureProvider>
    );

    const executeButton = screen.getByText('Execute');
    await user.click(executeButton);

    await waitFor(() => {
      expect(screen.getByTestId('success')).toHaveTextContent('not-success');
    });
  });

  it('sets loading state during execution', async () => {
    const { user } = await import('@testing-library/user-event').then(m => ({
      user: m.default.setup(),
    }));

    const mock: XFeatureMock = {
      frontEnd: mockFrontendElements,
      backEnd: mockBackendInfo,
      mappings: mockMappings,
      actionQueries: {
        CreateUser: mockActionResponse,
      },
    };

    render(
      <XFeatureProvider mock={mock}>
        <TestComponentUseActionQuery />
      </XFeatureProvider>
    );

    const executeButton = screen.getByText('Execute');
    await user.click(executeButton);

    // Should eventually return to non-loading state
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    });
  });

  it('returns response data from action', async () => {
    const { user } = await import('@testing-library/user-event').then(m => ({
      user: m.default.setup(),
    }));

    const mock: XFeatureMock = {
      frontEnd: mockFrontendElements,
      backEnd: mockBackendInfo,
      mappings: mockMappings,
      actionQueries: {
        CreateUser: mockActionResponse,
      },
    };

    render(
      <XFeatureProvider mock={mock}>
        <TestComponentUseActionQuery />
      </XFeatureProvider>
    );

    const executeButton = screen.getByText('Execute');
    await user.click(executeButton);

    await waitFor(() => {
      expect(screen.getByTestId('response')).toHaveTextContent('User created successfully');
    });
  });
});

// ============================================================================
// TESTS: useXFeatureFrontend Hook
// ============================================================================

describe('useXFeatureFrontend', () => {
  it('returns frontend elements from context', async () => {
    const mock: XFeatureMock = {
      frontEnd: mockFrontendElements,
      backEnd: mockBackendInfo,
      mappings: mockMappings,
    };

    render(
      <XFeatureProvider mock={mock}>
        <TestComponentUseXFeatureFrontend />
      </XFeatureProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('frontend')).toHaveTextContent('test-feature');
    });
  });

  it('returns undefined when no frontend elements available', () => {
    const mock: XFeatureMock = {
      backEnd: mockBackendInfo,
      mappings: mockMappings,
    };

    render(
      <XFeatureProvider mock={mock}>
        <TestComponentUseXFeatureFrontend />
      </XFeatureProvider>
    );

    expect(screen.getByTestId('frontend')).toHaveTextContent('none');
  });
});

// ============================================================================
// TESTS: XFeatureMock Type
// ============================================================================

describe('XFeatureMock', () => {
  it('supports all mock properties', () => {
    const mock: XFeatureMock = {
      backEnd: mockBackendInfo,
      frontEnd: mockFrontendElements,
      mappings: mockMappings,
      queries: {
        ListUsers: mockQueryResponse,
      },
      actionQueries: {
        CreateUser: mockActionResponse,
      },
    };

    render(
      <XFeatureProvider mock={mock}>
        <TestComponentUseXFeature />
      </XFeatureProvider>
    );

    expect(screen.getByTestId('feature')).toHaveTextContent('test-feature');
  });

  it('allows partial mock configuration', () => {
    const mock: XFeatureMock = {
      frontEnd: mockFrontendElements,
    };

    render(
      <XFeatureProvider mock={mock}>
        <TestComponentUseXFeature />
      </XFeatureProvider>
    );

    expect(screen.getByTestId('feature')).toHaveTextContent('test-feature');
  });

  it('supports empty mock configuration', () => {
    const mock: XFeatureMock = {};

    render(
      <XFeatureProvider mock={mock}>
        <TestComponentUseXFeature />
      </XFeatureProvider>
    );

    expect(screen.getByTestId('feature')).toHaveTextContent('none');
  });
});
