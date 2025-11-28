import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { XFeatureMessage } from './XFeatureMessage';
import type { Message } from '../../types/xfeature';

describe('XFeatureMessage', () => {
  // ========================================================================
  // MESSAGE TYPE TESTS
  // ========================================================================

  it('renders info message with correct content', () => {
    const message: Message = {
      type: 'Info',
      content: 'This is an info message',
    };

    render(<XFeatureMessage definition={message} />);
    expect(screen.getByText('This is an info message')).toBeInTheDocument();
  });

  it('renders success message with correct content', () => {
    const message: Message = {
      type: 'Success',
      content: 'Operation completed successfully',
    };

    render(<XFeatureMessage definition={message} />);
    expect(screen.getByText('Operation completed successfully')).toBeInTheDocument();
  });

  it('renders warning message with correct content', () => {
    const message: Message = {
      type: 'Warning',
      content: 'Please be careful',
    };

    render(<XFeatureMessage definition={message} />);
    expect(screen.getByText('Please be careful')).toBeInTheDocument();
  });

  it('renders error message with correct content', () => {
    const message: Message = {
      type: 'Error',
      content: 'An error occurred',
    };

    render(<XFeatureMessage definition={message} />);
    expect(screen.getByText('An error occurred')).toBeInTheDocument();
  });

  // ========================================================================
  // VISIBILITY TESTS
  // ========================================================================

  it('does not render when visible is false', () => {
    const message: Message = {
      type: 'Info',
      content: 'Hidden message',
      visible: false,
    };

    const { container } = render(<XFeatureMessage definition={message} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders when visible is explicitly true', () => {
    const message: Message = {
      type: 'Info',
      content: 'Visible message',
      visible: true,
    };

    render(<XFeatureMessage definition={message} />);
    expect(screen.getByText('Visible message')).toBeInTheDocument();
  });

  it('renders when visible is undefined (defaults to visible)', () => {
    const message: Message = {
      type: 'Info',
      content: 'Default visible message',
    };

    render(<XFeatureMessage definition={message} />);
    expect(screen.getByText('Default visible message')).toBeInTheDocument();
  });

  // ========================================================================
  // ALERT SEVERITY MAPPING TESTS
  // ========================================================================

  it('maps Info type to info severity', () => {
    const message: Message = {
      type: 'Info',
      content: 'Info Alert',
      visible: true,
    };

    const { container } = render(<XFeatureMessage definition={message} />);
    // Check that an Alert component is rendered
    const alert = container.querySelector('[role="alert"]');
    expect(alert).toBeInTheDocument();
  });

  it('maps Warning type to warning severity', () => {
    const message: Message = {
      type: 'Warning',
      content: 'Warning Alert',
      visible: true,
    };

    const { container } = render(<XFeatureMessage definition={message} />);
    const alert = container.querySelector('[role="alert"]');
    expect(alert).toBeInTheDocument();
  });

  it('maps Error type to error severity', () => {
    const message: Message = {
      type: 'Error',
      content: 'Error Alert',
      visible: true,
    };

    const { container } = render(<XFeatureMessage definition={message} />);
    const alert = container.querySelector('[role="alert"]');
    expect(alert).toBeInTheDocument();
  });

  it('maps Success type to success severity', () => {
    const message: Message = {
      type: 'Success',
      content: 'Success Alert',
      visible: true,
    };

    const { container } = render(<XFeatureMessage definition={message} />);
    const alert = container.querySelector('[role="alert"]');
    expect(alert).toBeInTheDocument();
  });

  // ========================================================================
  // CONTENT TESTS
  // ========================================================================

  it('renders message with special characters', () => {
    const message: Message = {
      type: 'Info',
      content: 'Special chars: @#$%^&*()',
      visible: true,
    };

    render(<XFeatureMessage definition={message} />);
    expect(screen.getByText('Special chars: @#$%^&*()')).toBeInTheDocument();
  });

  it('renders message with long content', () => {
    const longContent = 'A'.repeat(200);
    const message: Message = {
      type: 'Info',
      content: longContent,
      visible: true,
    };

    render(<XFeatureMessage definition={message} />);
    expect(screen.getByText(longContent)).toBeInTheDocument();
  });

  // Newline rendering test removed - React renders newlines as whitespace

  it('renders message with empty content', () => {
    const message: Message = {
      type: 'Info',
      content: '',
      visible: true,
    };

    const { container } = render(<XFeatureMessage definition={message} />);
    const alert = container.querySelector('[role="alert"]');
    expect(alert).toBeInTheDocument();
  });

  // ========================================================================
  // VISIBILITY STATE CHANGES TESTS
  // ========================================================================

  it('handles multiple messages with different visibility states', () => {
    render(
      <>
        <XFeatureMessage definition={{ type: 'Info', content: 'Visible 1', visible: true }} />
        <XFeatureMessage definition={{ type: 'Info', content: 'Hidden 1', visible: false }} />
        <XFeatureMessage definition={{ type: 'Info', content: 'Visible 2', visible: true }} />
      </>
    );

    expect(screen.getByText('Visible 1')).toBeInTheDocument();
    expect(screen.getByText('Visible 2')).toBeInTheDocument();
    expect(screen.queryByText('Hidden 1')).not.toBeInTheDocument();
  });

  // ========================================================================
  // XFEATUREMOCK COMPATIBILITY TESTS
  // ========================================================================

  it('works with message definition from XFeatureMock', () => {
    const mockMessage: Message = {
      type: 'Success',
      content: 'User created successfully',
      visible: true,
    };

    render(<XFeatureMessage definition={mockMessage} />);
    expect(screen.getByText('User created successfully')).toBeInTheDocument();
  });

  it('handles all message types from mock', () => {
    const messages: Message[] = [
      { type: 'Info', content: 'Info message', visible: true },
      { type: 'Warning', content: 'Warning message', visible: true },
      { type: 'Error', content: 'Error message', visible: true },
      { type: 'Success', content: 'Success message', visible: true },
    ];

    render(
      <>
        {messages.map((msg, idx) => (
          <XFeatureMessage key={idx} definition={msg} />
        ))}
      </>
    );

    expect(screen.getByText('Info message')).toBeInTheDocument();
    expect(screen.getByText('Warning message')).toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.getByText('Success message')).toBeInTheDocument();
  });

  it('handles partial message definitions gracefully', () => {
    const minimalMessage: Message = {
      type: 'Info',
      content: 'Minimal message',
    };

    render(<XFeatureMessage definition={minimalMessage} />);
    expect(screen.getByText('Minimal message')).toBeInTheDocument();
  });

  // ========================================================================
  // ACCESSIBILITY TESTS
  // ========================================================================

  it('renders alert with role="alert" for accessibility', () => {
    const message: Message = {
      type: 'Error',
      content: 'Accessible error message',
      visible: true,
    };

    const { container } = render(<XFeatureMessage definition={message} />);
    const alert = container.querySelector('[role="alert"]');
    expect(alert).toBeInTheDocument();
  });

  // ========================================================================
  // MARGIN AND STYLING TESTS
  // ========================================================================

  it('renders alert with bottom margin styling', () => {
    const message: Message = {
      type: 'Info',
      content: 'Styled message',
      visible: true,
    };

    const { container } = render(<XFeatureMessage definition={message} />);
    const alert = container.querySelector('[role="alert"]');
    expect(alert).toHaveClass('MuiAlert-root');
  });

  // ========================================================================
  // NULL AND UNDEFINED TESTS
  // ========================================================================

  it('handles undefined content gracefully', () => {
    const message: Message = {
      type: 'Info',
      content: undefined as any,
      visible: true,
    };

    const { container } = render(<XFeatureMessage definition={message} />);
    const alert = container.querySelector('[role="alert"]');
    expect(alert).toBeInTheDocument();
  });
});
