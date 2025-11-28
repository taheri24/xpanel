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
import { useXFeature } from '../../contexts/XFeatureContext';

/**
 * XFeatureField Component
 * Renders a form field based on XFeature field definition
 */
export function XFeatureField({
  name,
  value,
  onChange,
  onBlur,
  errors,
   
}: XFeatureFieldProps) {
  // Only fetch mappings if featureName is provided
   const hasError = errors && errors.length > 0;
  const errorMessage = errors?.[0] || '';
  const x=useXFeature();
  // Get mapping for this field if available (only when featureName is provided)
  const mapping =  x?.getMappingByName(name) ;
  if (!mapping) return<></>
  const renderTextInput = () => (
    <TextField
      fullWidth
      name={mapping.name}
      label={mapping.label}
      type={getInputType(mapping?.dataType)}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder={mapping.placeholder}
      disabled={mapping.readonly}
      required={mapping.required}
      error={hasError}
      helperText={errorMessage || mapping.helperText}
      inputProps={getInputProps(mapping.dataType)}
    />
  );

  const renderSelect = () => {
    // Use mapping options if available, otherwise use field options
    const options = mapping?.options?.items || mapping.options;

    return (
      <FormControl fullWidth disabled={mapping.readonly} error={hasError}>
        <InputLabel>{mapping?.label || mapping.label}</InputLabel>
        <Select
          name={mapping.name}
          value={(value as string) || ''}
          label={mapping?.label || mapping.label}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          required={mapping.required}
        >
          {!mapping.required && (
            <MenuItem value="">
              <em>Select an option</em>
            </MenuItem>
          )}
          {Array.isArray(options) &&  options?.map((option) => (
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
          name={mapping.name}
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          disabled={mapping.readonly}
        />
      }
      label={mapping.label}
    />
  );

  const renderRadio = () => (
    <FormControl disabled={mapping.readonly} error={hasError}>
      <InputLabel>{mapping.label}</InputLabel>
      <RadioGroup
        name={mapping.name}
        value={(value as string) || ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
      >
        {Array.isArray(mapping?.options) &&  mapping?.options?.map((option) => (
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
      name={mapping?.name}
      label={mapping?.label}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder={mapping?.placeholder}
      disabled={mapping?.readonly}
      required={mapping?.required}
      error={hasError}
      helperText={errorMessage || mapping.helperText}
      rows={mapping?.rows || 4}
    />
  );

  const renderField = () => {
    switch (mapping?.dataType) {
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
        return <input type="hidden" name={mapping?.name} value={String(value || '')} />;
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
