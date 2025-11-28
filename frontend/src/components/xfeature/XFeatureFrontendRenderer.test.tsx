import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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
  it('shows message when no frontend elements found', () => {
    const mock: XFeatureMock = {};

    render(
      <XFeatureProvider mock={mock}>
        <XFeatureFrontendRenderer />
      </XFeatureProvider>
    );

    expect(screen.getByText(/no frontend elements/i)).toBeInTheDocument();
  });

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
});
