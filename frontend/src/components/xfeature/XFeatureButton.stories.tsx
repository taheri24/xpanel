import type { Meta, StoryObj } from '@storybook/react';
import { XFeatureButton } from './XFeatureButton';
import type { Button } from '../../types/xfeature';

const meta = {
  title: 'XFeature/XFeatureButton',
  component: XFeatureButton,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof XFeatureButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseButton: Button = {
  type: 'Submit',
  label: 'Save',
  style: 'Primary',
};

export const Primary: Story = {
  args: {
    definition: baseButton,
  },
};

export const Secondary: Story = {
  args: {
    definition: {
      ...baseButton,
      style: 'Secondary',
      label: 'Cancel',
    },
  },
};

export const Danger: Story = {
  args: {
    definition: {
      ...baseButton,
      style: 'Danger',
      label: 'Delete',
    },
  },
};

export const Success: Story = {
  args: {
    definition: {
      ...baseButton,
      style: 'Success',
      label: 'Confirm',
    },
  },
};

export const Warning: Story = {
  args: {
    definition: {
      ...baseButton,
      style: 'Warning',
      label: 'Review',
    },
  },
};

export const Disabled: Story = {
  args: {
    definition: {
      ...baseButton,
      disabled: true,
    },
  },
};

export const Loading: Story = {
  args: {
    definition: baseButton,
    loading: true,
  },
};

export const Submit: Story = {
  args: {
    definition: {
      type: 'Submit',
      style: 'Primary',
    },
  },
};

export const Cancel: Story = {
  args: {
    definition: {
      type: 'Cancel',
      style: 'Secondary',
    },
  },
};

export const Reset: Story = {
  args: {
    definition: {
      type: 'Reset',
      style: 'Secondary',
    },
  },
};

export const Close: Story = {
  args: {
    definition: {
      type: 'Close',
      style: 'Secondary',
    },
  },
};
