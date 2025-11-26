import { Button as MuiButton } from '@mui/material';
import type { XFeatureButtonProps } from '../../types/xfeature';

/**
 * XFeatureButton Component
 * Renders a button based on XFeature button definition
 */
export function XFeatureButton({
  definition,
  onClick,
  loading,
}: XFeatureButtonProps) {
  const getButtonVariant = (): 'contained' | 'outlined' | 'text' => {
    switch (definition.style) {
      case 'Primary':
      case 'Danger':
      case 'Success':
      case 'Warning':
        return 'contained';
      case 'Secondary':
        return 'outlined';
      default:
        return 'contained';
    }
  };

  const getButtonColor = (): 'primary' | 'secondary' | 'error' | 'success' | 'warning' | 'info' => {
    switch (definition.style) {
      case 'Primary':
        return 'primary';
      case 'Secondary':
        return 'secondary';
      case 'Danger':
        return 'error';
      case 'Success':
        return 'success';
      case 'Warning':
        return 'warning';
      case 'Info':
        return 'info';
      default:
        return 'primary';
    }
  };

  const getButtonLabel = (): string => {
    if (definition.label) {
      return definition.label;
    }

    switch (definition.type) {
      case 'Submit':
        return 'Submit';
      case 'Cancel':
        return 'Cancel';
      case 'Reset':
        return 'Reset';
      case 'Close':
        return 'Close';
      default:
        return 'Button';
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    if (definition.onClick) {
      definition.onClick();
    }
  };

  return (
    <MuiButton
      variant={getButtonVariant()}
      color={getButtonColor()}
      onClick={handleClick}
      disabled={definition.disabled || loading}
      type={definition.type === 'Submit' ? 'submit' : 'button'}
    >
      {getButtonLabel()}
    </MuiButton>
  );
}
