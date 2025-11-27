import React from 'react';
import { Alert, CircularProgress, Container, Stack, Typography } from '@mui/material';
import { useXFeatureFrontend } from '../../contexts/XFeatureContext';
import { XFeatureDataTable } from './XFeatureDataTable';
import { XFeatureForm } from './XFeatureForm';
import type { DataTable, Form } from '../../types/xfeature';

export interface XFeatureFrontendRendererProps {
  /**
   * The name of the XFeature to render
   */
  featureName: string;

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
  featureName,
  onFormAction,
  onRefresh,
  onFormSuccess,
  maxWidth = 'lg',
  autoLoad = true,
}: XFeatureFrontendRendererProps) {
  const { frontendElements, loading, error, load } = useXFeatureFrontend(featureName, autoLoad);
  const [expandedForms, setExpandedForms] = React.useState<Set<string>>(new Set());

  const handleFormAction = (formId: string, rowData: Record<string, unknown>) => {
    // Show the form for the row action
    setExpandedForms((prev) => new Set([...prev, formId]));

    if (onFormAction) {
      onFormAction(formId, rowData);
    }
  };

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

  if (loading) {
    return (
      <Container maxWidth={maxWidth} sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth={maxWidth} sx={{ py: 4 }}>
        <Alert severity="error">
          Failed to load frontend elements for feature "{featureName}": {error.message}
        </Alert>
      </Container>
    );
  }

  if (!frontendElements) {
    return (
      <Container maxWidth={maxWidth} sx={{ py: 4 }}>
        <Alert severity="info">No frontend elements found for feature "{featureName}"</Alert>
      </Container>
    );
  }

  const { dataTables = [], forms = [] } = frontendElements;

  return (
    <Container maxWidth={maxWidth} sx={{ py: 4 }}>
      <Stack spacing={4}>
        {/* Feature Header */}
        <div>
          <Typography variant="h4" component="h1" gutterBottom>
            {frontendElements.feature}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Version: {frontendElements.version}
          </Typography>
        </div>
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
                    featureName={featureName}
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
                <XFeatureDataTable
                  definition={table}
                  featureName={featureName}
                  onRowAction={handleFormAction}
                  onRefresh={() => onRefresh?.(table.id)}
                />
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
            onClick={load}
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
