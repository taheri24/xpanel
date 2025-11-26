import { render, screen, waitFor } from '@testing-library/react';
import { XFeatureProvider } from '../../contexts/XFeatureContext';
import { XFeatureFrontendRenderer } from './XFeatureFrontendRenderer';
import type { FrontendElements } from '../../types/xfeature';

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
      fields: [
        { name: 'username', label: 'Username', type: 'Text', required: true },
        { name: 'email', label: 'Email', type: 'Email', required: true },
      ],
      buttons: [
        { type: 'Submit', label: 'Create' },
        { type: 'Cancel', label: 'Cancel' },
      ],
    },
  ],
};

describe('XFeatureFrontendRenderer', () => {
  it('renders loading state initially', () => {
    render(
      <XFeatureProvider
        onBeforeFrontend={async () => {
          // Simulate loading
          await new Promise((resolve) => setTimeout(resolve, 100));
          return mockFrontendElements;
        }}
      >
        <XFeatureFrontendRenderer featureName="user-management" />
      </XFeatureProvider>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders feature elements after loading', async () => {
    render(
      <XFeatureProvider
        onBeforeFrontend={async () => mockFrontendElements}
      >
        <XFeatureFrontendRenderer featureName="user-management" />
      </XFeatureProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('user-management')).toBeInTheDocument();
    });

    expect(screen.getByText('Version: 1.0.0')).toBeInTheDocument();
  });

  it('renders error state when loading fails', async () => {
    const errorMessage = 'Failed to load frontend elements';
    render(
      <XFeatureProvider
        onBeforeFrontend={async () => {
          throw new Error(errorMessage);
        }}
      >
        <XFeatureFrontendRenderer featureName="user-management" />
      </XFeatureProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(new RegExp(errorMessage))).toBeInTheDocument();
    });
  });

  it('renders no elements message when elements are empty', async () => {
    render(
      <XFeatureProvider
        onBeforeFrontend={async () => ({
          feature: 'empty-feature',
          version: '1.0.0',
          dataTables: [],
          forms: [],
        })}
      >
        <XFeatureFrontendRenderer featureName="empty-feature" />
      </XFeatureProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/No data tables or forms configured/)).toBeInTheDocument();
    });
  });

  it('respects autoLoad prop', async () => {
    const { rerender } = render(
      <XFeatureProvider
        onBeforeFrontend={async () => mockFrontendElements}
      >
        <XFeatureFrontendRenderer featureName="user-management" autoLoad={false} />
      </XFeatureProvider>
    );

    // Should not be loading initially
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();

    // After rerender with autoLoad=true
    rerender(
      <XFeatureProvider
        onBeforeFrontend={async () => mockFrontendElements}
      >
        <XFeatureFrontendRenderer featureName="user-management" autoLoad={true} />
      </XFeatureProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('user-management')).toBeInTheDocument();
    });
  });
});
