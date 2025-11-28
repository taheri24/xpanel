import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { XFeatureProvider } from '../../contexts/XFeatureContext';
import FieldMapping from './FieldMapping';
import type { MappingsResponse } from '../../types/xfeature';

// Mock mappings data
const mockMappingsResponse: MappingsResponse = {
  feature: 'TestFeature',
  version: '1.0',
  resolvedCount: 3,
  mappings: [
    {
      name: 'status',
      dataType: 'String',
      label: 'Status',
      options: {
        items: [
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
        ],
      },
    },
    {
      name: 'priority',
      dataType: 'Int',
      label: 'Priority Level',
      options: {
        items: [
          { label: 'High', value: '1' },
          { label: 'Medium', value: '2' },
          { label: 'Low', value: '3' },
        ],
      },
    },
    {
      name: 'owner',
      dataType: 'String',
      label: 'Owner',
    },
  ],
};

describe('FieldMapping', () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <XFeatureProvider onBeforeMappings={async () => mockMappingsResponse}>
        {component}
      </XFeatureProvider>
    );
  };

  it('renders with default title', async () => {
    renderWithProvider(<FieldMapping featureName="TestFeature" ids={['status']} />);

    await waitFor(() => {
      expect(screen.getByText('Field Mappings')).toBeInTheDocument();
    });
  });

  it('renders with custom title', async () => {
    renderWithProvider(
      <FieldMapping featureName="TestFeature" ids={['status']} title="Custom Title" />
    );

    await waitFor(() => {
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });
  });

  it('displays selected mapping information', async () => {
    renderWithProvider(<FieldMapping featureName="TestFeature" ids={['status']} />);

    await waitFor(() => {
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('String')).toBeInTheDocument();
      expect(screen.getByText('status')).toBeInTheDocument();
    });
  });

  it('displays options for mappings with options', async () => {
    renderWithProvider(<FieldMapping featureName="TestFeature" ids={['status']} />);

    await waitFor(() => {
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });
  });

  it('displays multiple mappings', async () => {
    renderWithProvider(<FieldMapping featureName="TestFeature" ids={['status', 'priority']} />);

    await waitFor(() => {
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Priority Level')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('High')).toBeInTheDocument();
    });
  });

  it('displays warning when no mappings found', async () => {
    renderWithProvider(<FieldMapping featureName="TestFeature" ids={['nonexistent']} />);

    await waitFor(() => {
      expect(screen.getByText(/No mappings found for: nonexistent/)).toBeInTheDocument();
    });
  });

  it('displays mappings without options', async () => {
    renderWithProvider(<FieldMapping featureName="TestFeature" ids={['owner']} />);

    await waitFor(() => {
      expect(screen.getByText('Owner')).toBeInTheDocument();
      expect(screen.getByText('String')).toBeInTheDocument();
    });
  });

  it('filters out non-existent mappings from mixed ids', async () => {
    renderWithProvider(
      <FieldMapping featureName="TestFeature" ids={['status', 'nonexistent', 'owner']} />
    );

    await waitFor(() => {
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Owner')).toBeInTheDocument();
      // nonexistent should not be rendered
      const cards = screen.getAllByRole('region'); // CardContent has role="region"
      expect(cards.length).toBe(2);
    });
  });

  it('shows loading state initially', () => {
    const slowMockHandler = async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return mockMappingsResponse;
    };

    render(
      <XFeatureProvider onBeforeMappings={slowMockHandler}>
        <FieldMapping featureName="TestFeature" ids={['status']} />
      </XFeatureProvider>
    );

    // Should show loading spinner initially
    const spinner = screen.getByRole('progressbar');
    expect(spinner).toBeInTheDocument();
  });
});
