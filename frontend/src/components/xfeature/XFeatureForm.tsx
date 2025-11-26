import React, { useState, useCallback } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  Stack,
  Alert,
} from '@mui/material';
import type { XFeatureFormProps, FormState, ActionRequest } from '../../types/xfeature';
import { useXFeatureAction } from '../../contexts/XFeatureContext';
import { XFeatureField } from './XFeatureField';
import { XFeatureButton } from './XFeatureButton';
import { XFeatureMessage } from './XFeatureMessage';
import { validateFormField } from '../../utils/validation';

/**
 * XFeatureForm Component
 * Renders a dynamic form based on XFeature form definition
 */
export function XFeatureForm({
  definition,
  featureName,
  initialData = {},
  onSuccess,
  onCancel,
  onClose,
}: XFeatureFormProps) {
  const { execute: executeAction, loading, error, success } = useXFeatureAction(
    featureName,
    definition.actionRef || ''
  );

  const [formState, setFormState] = useState<FormState>({
    values: buildInitialValues(definition, initialData),
    errors: {},
    touched: {},
    isSubmitting: false,
  });

  const [showDialog, setShowDialog] = useState(definition.dialog !== false);

  // Handle field change
  const handleFieldChange = useCallback(
    (fieldName: string, value: string | number | boolean) => {
      setFormState((prev) => ({
        ...prev,
        values: {
          ...prev.values,
          [fieldName]: value,
        },
      }));
    },
    []
  );

  // Handle field blur
  const handleFieldBlur = useCallback((fieldName: string) => {
    setFormState((prev) => ({
      ...prev,
      touched: {
        ...prev.touched,
        [fieldName]: true,
      },
    }));

    // Validate field
    const field = definition.fields.find((f) => f.name === fieldName);
    if (field) {
      const validation = validateFormField(field, formState.values[fieldName]);
      setFormState((prev) => ({
        ...prev,
        errors: {
          ...prev.errors,
          [fieldName]: validation.errors,
        },
      }));
    }
  }, [definition.fields, formState.values]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      // Validate all fields
      const newErrors: Record<string, string[]> = {};
      definition.fields.forEach((field) => {
        const validation = validateFormField(field, formState.values[field.name]);
        if (validation.errors.length > 0) {
          newErrors[field.name] = validation.errors;
        }
      });

      setFormState((prev) => ({
        ...prev,
        errors: newErrors,
      }));

      if (Object.keys(newErrors).length > 0) {
        return;
      }

      setFormState((prev) => ({
        ...prev,
        isSubmitting: true,
      }));

      try {
        const params: ActionRequest = formState.values;
        const result = await executeAction(params);

        if (result.success) {
          if (onSuccess) {
            onSuccess(result);
          }
          if (definition.dialog) {
            setShowDialog(false);
          }
        }
      } catch (err) {
        // Error is handled by the hook
        console.error('Form submission error:', err);
      } finally {
        setFormState((prev) => ({
          ...prev,
          isSubmitting: false,
        }));
      }
    },
    [definition.fields, formState.values, executeAction, onSuccess]
  );

  // Handle cancel
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    if (definition.dialog) {
      setShowDialog(false);
    }
  };

  // Handle close
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    setShowDialog(false);
  };

  const formContent = (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message}
        </Alert>
      )}

      {/* Success message */}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Operation completed successfully
        </Alert>
      )}

      {/* Custom messages */}
      {definition.messages?.map((msg, idx) => (
        <XFeatureMessage key={idx} definition={msg} />
      ))}

      {/* Form fields */}
      <Stack spacing={2} sx={{ mb: 3 }}>
        {definition.fields.map((field) => {
          const fieldErrors = formState.touched[field.name]
            ? formState.errors[field.name] || []
            : [];

          return (
            <XFeatureField
              key={field.name}
              definition={field}
              value={formState.values[field.name]}
              onChange={(value) => handleFieldChange(field.name, value)}
              onBlur={() => handleFieldBlur(field.name)}
              errors={fieldErrors}
            />
          );
        })}
      </Stack>

      {/* Form buttons */}
      <Stack
        direction="row"
        spacing={1}
        justifyContent={definition.dialog ? 'flex-end' : 'flex-start'}
      >
        {definition.buttons.map((button, idx) => (
          <XFeatureButton
            key={idx}
            definition={button}
            loading={loading || formState.isSubmitting}
            onClick={() => {
              if (button.type === 'Cancel') {
                handleCancel();
              } else if (button.type === 'Close') {
                handleClose();
              } else if (button.type === 'Reset') {
                setFormState((prev) => ({
                  ...prev,
                  values: buildInitialValues(definition, initialData),
                  errors: {},
                  touched: {},
                }));
              }
            }}
          />
        ))}
      </Stack>

      {/* Loading indicator */}
      {(loading || formState.isSubmitting) && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );

  if (definition.dialog) {
    return (
      <Dialog open={showDialog} onClose={handleClose} maxWidth="sm" fullWidth>
        {definition.title && <DialogTitle>{definition.title}</DialogTitle>}
        <DialogContent>{formContent}</DialogContent>
      </Dialog>
    );
  }

  return formContent;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function buildInitialValues(
  definition: any,
  initialData: Record<string, unknown>
): Record<string, string | number | boolean> {
  const values: Record<string, string | number | boolean> = {};

  definition.fields.forEach((field: any) => {
    if (initialData[field.name] !== undefined) {
      values[field.name] = initialData[field.name] as string | number | boolean;
    } else if (field.defaultValue !== undefined) {
      values[field.name] = field.defaultValue;
    } else {
      values[field.name] = field.type === 'Checkbox' ? false : '';
    }
  });

  return values;
}
