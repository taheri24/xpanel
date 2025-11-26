import { Alert } from '@mui/material';
import type { XFeatureMessageProps } from '../../types/xfeature';

/**
 * XFeatureMessage Component
 * Renders a message/alert based on XFeature message definition
 */
export function XFeatureMessage({ definition }: XFeatureMessageProps) {
  if (definition.visible === false) {
    return null;
  }

  const getSeverity = ():
    | 'success'
    | 'info'
    | 'warning'
    | 'error' => {
    switch (definition.type) {
      case 'Info':
        return 'info';
      case 'Warning':
        return 'warning';
      case 'Error':
        return 'error';
      case 'Success':
        return 'success';
      default:
        return 'info';
    }
  };

  return (
    <Alert severity={getSeverity()} sx={{ mb: 2 }}>
      {definition.content}
    </Alert>
  );
}
