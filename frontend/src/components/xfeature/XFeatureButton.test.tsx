import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { XFeatureButton } from './XFeatureButton';
import type { Button } from '../../types/xfeature';
import type { XFeatureMock } from '../../contexts/XFeatureContext';

describe('XFeatureButton', () => {
  // ========================================================================
  // LABEL TESTS
  // ========================================================================

  it('renders button with custom label', () => {
    const button: Button = {
      type: 'Submit',
      label: 'Save',
      style: 'Primary',
    };

    render(<XFeatureButton definition={button} />);
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('renders default label for Submit button type', () => {
    const button: Button = {
      type: 'Submit',
      style: 'Primary',
    };

    render(<XFeatureButton definition={button} />);
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  it('renders default label for Cancel button type', () => {
    const button: Button = {
      type: 'Cancel',
      style: 'Secondary',
    };

    render(<XFeatureButton definition={button} />);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('renders default label for Reset button type', () => {
    const button: Button = {
      type: 'Reset',
      style: 'Primary',
    };

    render(<XFeatureButton definition={button} />);
    expect(screen.getByText('Reset')).toBeInTheDocument();
  });

  it('renders default label for Close button type', () => {
    const button: Button = {
      type: 'Close',
      style: 'Secondary',
    };

    render(<XFeatureButton definition={button} />);
    expect(screen.getByText('Close')).toBeInTheDocument();
  });

  it('uses custom label over default button type label', () => {
    const button: Button = {
      type: 'Submit',
      label: 'Custom Label',
      style: 'Primary',
    };

    render(<XFeatureButton definition={button} />);
    expect(screen.getByText('Custom Label')).toBeInTheDocument();
    expect(screen.queryByText('Submit')).not.toBeInTheDocument();
  });

  // ========================================================================
  // CLICK AND CALLBACK TESTS
  // ========================================================================

  it('calls onClick prop handler when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const button: Button = {
      type: 'Custom',
      label: 'Click Me',
      style: 'Primary',
    };

    render(<XFeatureButton definition={button} onClick={onClick} />);
    await user.click(screen.getByText('Click Me'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('calls definition.onClick handler when clicked', async () => {
    const user = userEvent.setup();
    const definitionOnClick = vi.fn();
    const button: Button = {
      type: 'Custom',
      label: 'Click Me',
      style: 'Primary',
      onClick: definitionOnClick,
    };

    render(<XFeatureButton definition={button} />);
    await user.click(screen.getByText('Click Me'));
    expect(definitionOnClick).toHaveBeenCalledTimes(1);
  });

  it('calls both onClick handlers when both are provided', async () => {
    const user = userEvent.setup();
    const propHandler = vi.fn();
    const defHandler = vi.fn();
    const button: Button = {
      type: 'Custom',
      label: 'Click Me',
      style: 'Primary',
      onClick: defHandler,
    };

    render(<XFeatureButton definition={button} onClick={propHandler} />);
    await user.click(screen.getByText('Click Me'));
    expect(propHandler).toHaveBeenCalledTimes(1);
    expect(defHandler).toHaveBeenCalledTimes(1);
  });

  it('handles multiple clicks correctly', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const button: Button = {
      type: 'Custom',
      label: 'Click Me',
      style: 'Primary',
    };

    render(<XFeatureButton definition={button} onClick={onClick} />);
    const buttonElement = screen.getByText('Click Me');
    await user.click(buttonElement);
    await user.click(buttonElement);
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  // ========================================================================
  // DISABLED STATE TESTS
  // ========================================================================

  it('disables button when definition.disabled is true', () => {
    const button: Button = {
      type: 'Submit',
      label: 'Save',
      disabled: true,
      style: 'Primary',
    };

    render(<XFeatureButton definition={button} />);
    expect(screen.getByText('Save')).toBeDisabled();
  });

  it('disables button when loading prop is true', () => {
    const button: Button = {
      type: 'Submit',
      label: 'Save',
      style: 'Primary',
    };

    render(<XFeatureButton definition={button} loading={true} />);
    expect(screen.getByText('Save')).toBeDisabled();
  });

  it('disables button when both loading and disabled are true', () => {
    const button: Button = {
      type: 'Submit',
      label: 'Save',
      disabled: true,
      style: 'Primary',
    };

    render(<XFeatureButton definition={button} loading={true} />);
    expect(screen.getByText('Save')).toBeDisabled();
  });

  it('disables button only by loading prop', () => {
    const button: Button = {
      type: 'Submit',
      label: 'Save',
      style: 'Primary',
    };

    render(<XFeatureButton definition={button} loading={true} />);
    expect(screen.getByText('Save')).toBeDisabled();
  });

  // ========================================================================
  // STYLE AND VARIANT TESTS
  // ========================================================================

  it('renders Primary style button', () => {
    const button: Button = {
      type: 'Custom',
      label: 'Primary',
      style: 'Primary',
    };

    render(<XFeatureButton definition={button} />);
    const buttonElement = screen.getByText('Primary');
    expect(buttonElement).toBeInTheDocument();
  });

  it('renders Secondary style button', () => {
    const button: Button = {
      type: 'Custom',
      label: 'Secondary',
      style: 'Secondary',
    };

    render(<XFeatureButton definition={button} />);
    const buttonElement = screen.getByText('Secondary');
    expect(buttonElement).toBeInTheDocument();
  });

  it('renders Danger style button', () => {
    const button: Button = {
      type: 'Custom',
      label: 'Delete',
      style: 'Danger',
    };

    render(<XFeatureButton definition={button} />);
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('renders Success style button', () => {
    const button: Button = {
      type: 'Custom',
      label: 'Approve',
      style: 'Success',
    };

    render(<XFeatureButton definition={button} />);
    expect(screen.getByText('Approve')).toBeInTheDocument();
  });

  it('renders Warning style button', () => {
    const button: Button = {
      type: 'Custom',
      label: 'Warning',
      style: 'Warning',
    };

    render(<XFeatureButton definition={button} />);
    expect(screen.getByText('Warning')).toBeInTheDocument();
  });

  it('renders Info style button', () => {
    const button: Button = {
      type: 'Custom',
      label: 'Info',
      style: 'Info',
    };

    render(<XFeatureButton definition={button} />);
    expect(screen.getByText('Info')).toBeInTheDocument();
  });

  // ========================================================================
  // BUTTON TYPE TESTS
  // ========================================================================

  it('renders Submit button type as HTML submit button', () => {
    const button: Button = {
      type: 'Submit',
      label: 'Save',
      style: 'Primary',
    };

    render(
      <form>
        <XFeatureButton definition={button} />
      </form>
    );
    const buttonElement = screen.getByText('Save') as HTMLButtonElement;
    expect(buttonElement.type).toBe('submit');
  });

  it('renders non-Submit button types as regular buttons', () => {
    const button: Button = {
      type: 'Cancel',
      style: 'Secondary',
    };

    render(<XFeatureButton definition={button} />);
    const buttonElement = screen.getByText('Cancel') as HTMLButtonElement;
    expect(buttonElement.type).toBe('button');
  });

  it('renders button with Reset type', async () => {
    const user = userEvent.setup();
    const button: Button = {
      type: 'Reset',
      style: 'Primary',
    };

    render(<XFeatureButton definition={button} />);
    const resetButton = screen.getByText('Reset');
    expect(resetButton).toBeInTheDocument();
    await user.click(resetButton);
    expect(resetButton).toBeInTheDocument();
  });

  // ========================================================================
  // XFEATUREMOCK COMPATIBILITY TESTS
  // ========================================================================

  it('works with mock button definition from XFeatureMock', () => {
    const mockButton: Button = {
      id: 'btn-submit',
      type: 'Submit',
      label: 'Create User',
      style: 'Primary',
      disabled: false,
    };

    render(<XFeatureButton definition={mockButton} />);
    expect(screen.getByText('Create User')).toBeInTheDocument();
  });

  it('handles button without id property', () => {
    const button: Button = {
      type: 'Submit',
      label: 'No ID Button',
      style: 'Primary',
    };

    render(<XFeatureButton definition={button} />);
    expect(screen.getByText('No ID Button')).toBeInTheDocument();
  });
});
