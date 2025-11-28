import React from 'react';
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useXFeature } from '../../contexts/XFeatureContext';

interface FieldMappingProps {
  ids: string[];
  featureName?: string;
  onChange?: (fieldName: string, value: any) => void;
  values?: Record<string, any>;
  errors?: Record<string, string[]>;
}

/**
 * FieldMapping Component
 * Renders form fields based on mapping definitions from XFeature
 * Uses useXFeature hook to load feature definitions with embedded mappings
 */
export function FieldMapping({
  ids,
  featureName = 'default',
  onChange,
  values = {},
  errors = {},
}: FieldMappingProps) {
  const { getFeature } = useXFeature();
  const [feature, setFeature] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadFeature = async () => {
      try {
        setLoading(true);
        setError(null);
        const loadedFeature = await getFeature(featureName);
        setFeature(loadedFeature);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load feature');
      } finally {
        setLoading(false);
      }
    };

    loadFeature();
  }, [featureName, getFeature]);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">Failed to load field mappings: {error}</Alert>;
  }

  // Create mappings map from feature
  const mappingsMap = new Map();
  feature?.mappings?.forEach((mapping: any) => {
    mappingsMap.set(mapping.name, mapping);
  });

  const renderField = (fieldId: string) => {
    const mapping = mappingsMap?.get(fieldId);

    if (!mapping) {
      return null;
    }

    const fieldValue = values[fieldId] || '';
    const fieldErrors = errors[fieldId] || [];
    const hasError = fieldErrors.length > 0;
    const errorMessage = fieldErrors[0] || '';

    // Render based on field type
    if (mapping.options?.items) {
      // Dropdown/Select field
      return (
        <FormControl fullWidth key={fieldId} error={hasError}>
          <InputLabel>{mapping.label}</InputLabel>
          <Select
            name={fieldId}
            value={fieldValue}
            label={mapping.label}
            onChange={(e) => onChange?.(fieldId, e.target.value)}
          >
            <MenuItem value="">
              <em>Select an option</em>
            </MenuItem>
            {mapping.options.items.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {hasError && <FormHelperText>{errorMessage}</FormHelperText>}
        </FormControl>
      );
    }

    // Default: Text input field
    return (
      <TextField
        key={fieldId}
        fullWidth
        name={fieldId}
        label={mapping.label}
        value={fieldValue}
        onChange={(e) => onChange?.(fieldId, e.target.value)}
        error={hasError}
        helperText={errorMessage}
      />
    );
  };

  return (
    <Stack spacing={2}>
      {ids.map((fieldId) => renderField(fieldId))}
    </Stack>
  );
}
