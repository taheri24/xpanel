import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';

describe('Button', () => {
  it('renders with label', () => {
    render(<Button label="Click me" />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button label="Click me" onClick={handleClick} />);

    const button = screen.getByText('Click me');
    await userEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Button label="Test" variant="contained" />);
    expect(screen.getByText('Test')).toHaveClass('MuiButton-contained');

    rerender(<Button label="Test" variant="outlined" />);
    expect(screen.getByText('Test')).toHaveClass('MuiButton-outlined');

    rerender(<Button label="Test" variant="text" />);
    expect(screen.getByText('Test')).toHaveClass('MuiButton-text');
  });

  it('can be disabled', () => {
    render(<Button label="Disabled" disabled />);
    const button = screen.getByText('Disabled');
    expect(button).toBeDisabled();
  });
});
