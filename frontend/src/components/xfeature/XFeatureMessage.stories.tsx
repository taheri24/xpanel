import type { Meta, StoryObj } from '@storybook/react';
import { XFeatureMessage } from './XFeatureMessage';

const meta = {
  title: 'XFeature/XFeatureMessage',
  component: XFeatureMessage,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof XFeatureMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InfoMessage: Story = {
  args: {
    definition: {
      type: 'Info',
      content: 'This is an informational message',
    },
  },
};

export const SuccessMessage: Story = {
  args: {
    definition: {
      type: 'Success',
      content: 'Your changes have been saved successfully',
    },
  },
};

export const WarningMessage: Story = {
  args: {
    definition: {
      type: 'Warning',
      content: 'Please review your changes before submitting',
    },
  },
};

export const ErrorMessage: Story = {
  args: {
    definition: {
      type: 'Error',
      content: 'An error occurred while processing your request',
    },
  },
};

export const HiddenMessage: Story = {
  args: {
    definition: {
      type: 'Info',
      content: 'This message is hidden',
      visible: false,
    },
  },
};
