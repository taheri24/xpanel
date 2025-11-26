import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { XFeatureMessage } from './XFeatureMessage';
import type { Message } from '../../types/xfeature';

describe('XFeatureMessage', () => {
  it('renders info message', () => {
    const message: Message = {
      type: 'Info',
      content: 'This is an info message',
    };

    render(<XFeatureMessage definition={message} />);
    expect(screen.getByText('This is an info message')).toBeInTheDocument();
  });

  it('renders success message', () => {
    const message: Message = {
      type: 'Success',
      content: 'Operation completed successfully',
    };

    render(<XFeatureMessage definition={message} />);
    expect(screen.getByText('Operation completed successfully')).toBeInTheDocument();
  });

  it('renders warning message', () => {
    const message: Message = {
      type: 'Warning',
      content: 'Please be careful',
    };

    render(<XFeatureMessage definition={message} />);
    expect(screen.getByText('Please be careful')).toBeInTheDocument();
  });

  it('renders error message', () => {
    const message: Message = {
      type: 'Error',
      content: 'An error occurred',
    };

    render(<XFeatureMessage definition={message} />);
    expect(screen.getByText('An error occurred')).toBeInTheDocument();
  });

  it('does not render when visible is false', () => {
    const message: Message = {
      type: 'Info',
      content: 'Hidden message',
      visible: false,
    };

    const { container } = render(<XFeatureMessage definition={message} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders when visible is true', () => {
    const message: Message = {
      type: 'Info',
      content: 'Visible message',
      visible: true,
    };

    render(<XFeatureMessage definition={message} />);
    expect(screen.getByText('Visible message')).toBeInTheDocument();
  });
});
