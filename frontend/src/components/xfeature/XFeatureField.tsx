import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  FormHelperText,
} from '@mui/material';
import type { XFeatureFieldProps } from '../../types/xfeature';
import { useXFeatureMappings } from '../../contexts/XFeatureContext';

/**
 * XFeatureField Component
 * Renders a form field based on XFeature field definition
 */
export function XFeatureField({
  definition,
  value,
  onChange,
  onBlur,
  errors,
  featureName,
}: XFeatureFieldProps) {
  // Only fetch mappings if featureName is provided
  const { getMappingByName } = useXFeatureMappings(
    featureName || 'default',
    !!featureName // Only auto-load if featureName is provided
  );
  const hasError = errors && errors.length > 0;
  const errorMessage = errors?.[0] || '';

  // Get mapping for this field if available (only when featureName is provided)
  const mapping = featureName ? getMappingByName(definition.name) : undefined;

  const renderTextInput = () => (
    <TextField
      fullWidth
      name={definition.name}
      label={definition.label}
      type={getInputType(definition.type)}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder={definition.placeholder}
      disabled={definition.readonly}
      required={definition.required}
      error={hasError}
      helperText={errorMessage || definition.helperText}
      inputProps={getInputProps(definition.type)}
    />
  );

  const renderSelect = () => {
    // Use mapping options if available, otherwise use field options
    const options = mapping?.options?.items || definition.options;

    return (
      <FormControl fullWidth disabled={definition.readonly} error={hasError}>
        <InputLabel>{mapping?.label || definition.label}</InputLabel>
        <Select
          name={definition.name}
          value={(value as string) || ''}
          label={mapping?.label || definition.label}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          required={definition.required}
        >
          {!definition.required && (
            <MenuItem value="">
              <em>Select an option</em>
            </MenuItem>
          )}
          {options?.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        {hasError && <FormHelperText>{errorMessage}</FormHelperText>}
      </FormControl>
    );
  };

  const renderCheckbox = () => (
    <FormControlLabel
      control={
        <Checkbox
          name={definition.name}
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          disabled={definition.readonly}
        />
      }
      label={definition.label}
    />
  );

  const renderRadio = () => (
    <FormControl disabled={definition.readonly} error={hasError}>
      <InputLabel>{definition.label}</InputLabel>
      <RadioGroup
        name={definition.name}
        value={(value as string) || ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
      >
        {definition.options?.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio />}
            label={option.label}
          />
        ))}
      </RadioGroup>
      {hasError && <FormHelperText>{errorMessage}</FormHelperText>}
    </FormControl>
  );

  const renderTextarea = () => (
    <TextField
      fullWidth
      multiline
      name={definition.name}
      label={definition.label}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder={definition.placeholder}
      disabled={definition.readonly}
      required={definition.required}
      error={hasError}
      helperText={errorMessage || definition.helperText}
      rows={definition.rows || 4}
    />
  );

  const renderField = () => {
    switch (definition.type) {
      case 'Text':
      case 'Email':
      case 'Password':
      case 'Number':
      case 'Decimal':
      case 'Date':
      case 'DateTime':
      case 'Time':
      case 'Currency':
      case 'Phone':
      case 'URL':
        return renderTextInput();
      case 'Select':
        return renderSelect();
      case 'MultiSelect':
        return renderSelect(); // Could be enhanced for multiple selections
      case 'Checkbox':
        return renderCheckbox();
      case 'Radio':
        return renderRadio();
      case 'Textarea':
        return renderTextarea();
      case 'File':
        return renderTextInput();
      case 'Hidden':
        return <input type="hidden" name={definition.name} value={String(value || '')} />;
      default:
        return renderTextInput();
    }
  };

  return <div>{renderField()}</div>;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getInputType(fieldType: string): string {
  switch (fieldType) {
    case 'Email':
      return 'email';
    case 'Password':
      return 'password';
    case 'Number':
      return 'number';
    case 'Date':
      return 'date';
    case 'DateTime':
      return 'datetime-local';
    case 'Time':
      return 'time';
    case 'Currency':
      return 'number';
    case 'Phone':
      return 'tel';
    case 'URL':
      return 'url';
    case 'File':
      return 'file';
    default:
      return 'text';
  }
}

function getInputProps(fieldType: string): Record<string, unknown> {
  const props: Record<string, unknown> = {};

  switch (fieldType) {
    case 'Decimal':
    case 'Currency':
      props.step = '0.01';
      break;
    case 'Number':
      props.step = '1';
      break;
    default:
      break;
  }

  return props;
}
