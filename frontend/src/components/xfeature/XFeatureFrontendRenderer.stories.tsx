import type { Meta, StoryObj } from '@storybook/react';
import { XFeatureProvider } from '../../contexts/XFeatureContext';
import { createStorybookMockProvider } from '../../contexts/XFeatureContext.examples';
import { XFeatureFrontendRenderer } from './XFeatureFrontendRenderer';
import type { FrontendElements } from '../../types/xfeature';

const meta = {
  title: 'XFeature/XFeatureFrontendRenderer',
  component: XFeatureFrontendRenderer,
  decorators: [
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Story: any) => {
      const mockConfig = createStorybookMockProvider();
      return (
        <XFeatureProvider {...mockConfig}>
          <Story />
        </XFeatureProvider>
      );
    },
  ],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof XFeatureFrontendRenderer>;

export default meta;
type Story = StoryObj<typeof XFeatureFrontendRenderer>;

const mockFrontendElements: FrontendElements = {
  feature: 'user-management',
  version: '1.0.0',
  dataTables: [],
  forms: [],
};

export const Default: Story = {
  args: {
    featureName: 'user-management',
  },
};

export const WithAutoLoadDisabled: Story = {
  args: {
    featureName: 'user-management',
    autoLoad: false,
  },
};

export const LoadingState: Story = {
  args: {
    featureName: 'user-management',
  },
  decorators: [
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Story: any) => (
      <XFeatureProvider 
        onBeforeFrontend={async () => {
          // Simulate loading delay
          return mockFrontendElements;
        }}
      >
        <Story />
      </XFeatureProvider>
    ),
  ],
};

export const ErrorState: Story = {
  args: {
    featureName: 'non-existent-feature',
  },
  decorators: [
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Story: any) => (
      <XFeatureProvider
        onBeforeFrontend={async () => {
          throw new Error('Failed to load frontend elements');
        }}
      >
        <Story />
      </XFeatureProvider>
    ),
  ],
};
