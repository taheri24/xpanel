import React from 'react';
import { Alert,   Container, Stack, Typography } from '@mui/material';
import { XFeatureDataTable } from './XFeatureDataTable';
import { XFeatureForm } from './XFeatureForm';
import type { DataTable, Form } from '../../types/xfeature';
import { useXFeature } from '../../contexts/XFeatureContext';

export interface XFeatureFrontendRendererProps {
 
  /**
   * Callback when a form action is triggered from a data table row
   */
  onFormAction?: (formId: string, rowData: Record<string, unknown>) => void;

  /**
   * Callback when a data table needs to refresh
   */
  onRefresh?: (tableId: string) => void;

  /**
   * Callback when a form is submitted successfully
   */
  onFormSuccess?: (formId: string) => void;

  /**
   * Max width for the container
   */
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;

  /**
   * Whether to automatically load frontend elements on mount
   */
  autoLoad?: boolean;
}

/**
 * Component that renders all frontend elements (DataTables and Forms) for an XFeature
 * This component loads the feature definition from the API and renders all UI elements
 */
export function XFeatureFrontendRenderer({

   onFormSuccess,
  maxWidth = 'lg',
}: XFeatureFrontendRendererProps) {
  const  x = useXFeature();
  const [expandedForms, setExpandedForms] = React.useState<Set<string>>(new Set());


  const handleFormSuccess = (formId: string) => {
    // Close the form after success
    setExpandedForms((prev) => {
      const next = new Set(prev);
      next.delete(formId);
      return next;
    });

    if (onFormSuccess) {
      onFormSuccess(formId);
    }
  };

  const handleFormCancel = (formId: string) => {
    setExpandedForms((prev) => {
      const next = new Set(prev);
      next.delete(formId);
      return next;
    });
  };


  if (!x.frontendElements) {
    return (
      <Container maxWidth={maxWidth} sx={{ py: 4 }}>
        <Alert severity="info">No frontend elements found for feature </Alert>
      </Container>
    );
  }

  const { dataTables = [], forms = [] } = x.frontendElements;

  return (
    <Container maxWidth={maxWidth} sx={{ py: 4 }}>
      <Stack spacing={4}>
        {/* Render Forms */}
        {forms.length > 0 && (
          <Stack spacing={3}>
            <Typography variant="h5">Actions</Typography>
            {forms.map((form: Form) => (
              <React.Fragment key={form.id}>
                {/* Show form if it's a standalone form or if it's expanded due to row action */}
                {(!form.dialog || expandedForms.has(form.id)) && (
                  <XFeatureForm
                    definition={form}
                    onSuccess={() => handleFormSuccess(form.id)}
                    onCancel={() => handleFormCancel(form.id)}
                  />
                )}
              </React.Fragment>
            ))}
          </Stack>
        )}

        {/* Render Data Tables */}
        {dataTables.length > 0 && (
          <Stack spacing={3}>
            {dataTables.map((table: DataTable) => (
              <React.Fragment key={table.id}>
                <XFeatureDataTable id={table.id} />
              </React.Fragment>
            ))}
          </Stack>
        )}


        {/* No Elements */}
        {dataTables.length === 0 && forms.length === 0 && (
          <Alert severity="info">No data tables or forms configured for this feature</Alert>
        )}

        {/* Reload Button */}
        <div>
          <Typography
            variant="body2"
            component="button"
            sx={{
              cursor: 'pointer',
              color: 'primary.main',
              textDecoration: 'underline',
              border: 'none',
              backgroundColor: 'transparent',
              padding: 0,
              '&:hover': {
                textDecoration: 'none',
              },
            }}
          >
            Reload
          </Typography>
        </div>
      </Stack>
    </Container>
  );
}
