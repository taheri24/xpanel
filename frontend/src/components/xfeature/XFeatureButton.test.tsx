import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { XFeatureButton } from './XFeatureButton';
import type { Button } from '../../types/xfeature';

describe('XFeatureButton', () => {
  it('renders button with correct label', () => {
    const button: Button = {
      type: 'Submit',
      label: 'Save',
      style: 'Primary',
    };

    render(<XFeatureButton definition={button} />);
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('renders default label for Submit button', () => {
    const button: Button = {
      type: 'Submit',
      style: 'Primary',
    };

    render(<XFeatureButton definition={button} />);
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const button: Button = {
      type: 'Custom',
      label: 'Click Me',
      style: 'Primary',
    };

    render(<XFeatureButton definition={button} onClick={onClick} />);
    await user.click(screen.getByText('Click Me'));
    expect(onClick).toHaveBeenCalled();
  });

  it('disables button when disabled prop is true', () => {
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

  it('renders button with correct variant based on style', () => {
    const button: Button = {
      type: 'Submit',
      label: 'Save',
      style: 'Danger',
    };

    render(<XFeatureButton definition={button} />);
    const buttonElement = screen.getByText('Save');
    expect(buttonElement).toBeInTheDocument();
  });

  it('handles Cancel button type', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const button: Button = {
      type: 'Cancel',
      style: 'Secondary',
    };

    render(<XFeatureButton definition={button} onClick={onClick} />);
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);
    expect(onClick).toHaveBeenCalled();
  });
});
