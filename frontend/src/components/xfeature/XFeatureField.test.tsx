import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { XFeatureField } from './XFeatureField';
import type {   Mapping } from '../../types/xfeature';

describe('XFeatureField', () => {
  it('renders text field', () => {
    const field: Mapping = {
      name: 'username',
      label: 'Username',
      dataType: 'Text',
    };

    const onChange = vi.fn();
    render(
      <XFeatureField
        definition={field}
        value=""
        onChange={onChange}
      />
    );

    expect(screen.getByLabelText('Username')).toBeInTheDocument();
  });
 });
