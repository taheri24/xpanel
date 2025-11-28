import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Stack } from '@mui/material';
import { FieldMapping } from './FieldMapping';
import type { MappingsResponse } from '../../types/xfeature';

/**
 * FieldMapping Component Story
 * Demonstrates rendering fields based on mapping definitions
 */
const meta = {
  title: 'XFeature/FieldMapping',
  component: FieldMapping,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof FieldMapping>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock mappings data for the status field
const mockMappings: MappingsResponse = {
  feature: 'TaskManagement',
  version: '1.0',
  resolvedCount: 1,
  mappings: [
    {
      name: 'status',
      dataType: 'String',
      label: 'Task Status',
      options: {
        items: [
          { label: 'Pending', value: 'pending' },
          { label: 'In Progress', value: 'in_progress' },
          { label: 'Completed', value: 'completed' },
          { label: 'Cancelled', value: 'cancelled' },
        ],
      },
    },
  ],
};

/**
 * Basic FieldMapping with status field dropdown
 */
export const Basic: Story = {
  render: () => {
    const [values, setValues] = useState({ status: '' });

    return (
      <Stack sx={{ width: '400px' }}>
        <FieldMapping
          ids={['status']}
          featureName="TaskManagement"
          values={values}
          onChange={(fieldName, value) =>
            setValues({ ...values, [fieldName]: value })
          }
        />
      </Stack>
    );
  },
  decorators: [
    (Story) => {
      // Mock the fetch for mappings
      const originalFetch = global.fetch;
      global.fetch = async (url: string | Request, ...args) => {
        const urlStr = typeof url === 'string' ? url : url.toString();
        if (urlStr.includes('/api/xfeatures/TaskManagement/mappings')) {
          return Promise.resolve(
            new Response(JSON.stringify(mockMappings), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }
        return originalFetch(url, ...args);
      };

      return <Story />;
    },
  ],
};

/**
 * FieldMapping with validation errors
 */
export const WithErrors: Story = {
  render: () => {
    const [values, setValues] = useState({ status: '' });
    const [errors, setErrors] = useState({ status: ['Status is required'] });

    return (
      <Stack sx={{ width: '400px' }}>
        <FieldMapping
          ids={['status']}
          featureName="TaskManagement"
          values={values}
          errors={errors}
          onChange={(fieldName, value) => {
            setValues({ ...values, [fieldName]: value });
            // Clear error when user selects a value
            if (value) {
              setErrors({ status: [] });
            }
          }}
        />
      </Stack>
    );
  },
  decorators: [
    (Story) => {
      const originalFetch = global.fetch;
      global.fetch = async (url: string | Request, ...args) => {
        const urlStr = typeof url === 'string' ? url : url.toString();
        if (urlStr.includes('/api/xfeatures/TaskManagement/mappings')) {
          return Promise.resolve(
            new Response(JSON.stringify(mockMappings), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }
        return originalFetch(url, ...args);
      };

      return <Story />;
    },
  ],
};

/**
 * FieldMapping with pre-filled value
 */
export const WithValue: Story = {
  render: () => {
    const [values, setValues] = useState({ status: 'in_progress' });

    return (
      <Stack sx={{ width: '400px' }}>
        <FieldMapping
          ids={['status']}
          featureName="TaskManagement"
          values={values}
          onChange={(fieldName, value) =>
            setValues({ ...values, [fieldName]: value })
          }
        />
      </Stack>
    );
  },
  decorators: [
    (Story) => {
      const originalFetch = global.fetch;
      global.fetch = async (url: string | Request, ...args) => {
        const urlStr = typeof url === 'string' ? url : url.toString();
        if (urlStr.includes('/api/xfeatures/TaskManagement/mappings')) {
          return Promise.resolve(
            new Response(JSON.stringify(mockMappings), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }
        return originalFetch(url, ...args);
      };

      return <Story />;
    },
  ],
};
