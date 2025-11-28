import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { XFeatureProvider, type XFeatureMock } from '../../contexts/XFeatureContext';
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
  it('renders loading state initially without expect (no panic)', () => {
    const mock:XFeatureMock={
      frontEnd:mockFrontendElements
    }    
    render(
      <XFeatureProvider mock={mock}    >
        <XFeatureFrontendRenderer />
      </XFeatureProvider>
    );

  });

 });
