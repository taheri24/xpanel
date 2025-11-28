import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
  FormHelperText,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useXFeatureMappings } from '../../contexts/XFeatureContext';

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
 * Uses useXFeatureMappings to load mapping data dynamically
 */
export function FieldMapping({
  ids,
  featureName = 'default',
  onChange,
  values = {},
  errors = {},
}: FieldMappingProps) {
  const { mappingsMap, loading, error } = useXFeatureMappings(featureName, true);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">Failed to load field mappings: {error}</Alert>;
  }

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
