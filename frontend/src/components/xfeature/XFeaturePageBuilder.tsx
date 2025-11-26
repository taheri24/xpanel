import { useState, useCallback } from 'react';
import { Box, Container, CircularProgress, Alert, Stack } from '@mui/material';
import type { ActionResponse } from '../../types/xfeature';
import { useXFeatureDefinition, useXFeature } from '../../contexts/XFeatureContext';
import { XFeatureDataTable } from './XFeatureDataTable';
import { XFeatureForm } from './XFeatureForm';

/**
 * XFeaturePageBuilder Component
 * Automatically builds a page based on XFeature definition
 * Renders all datatable and form components defined in the feature
 */
interface XFeaturePageBuilderProps {
  featureName: string;
  selectedDataTable?: string;
  selectedForm?: string;
}

export function XFeaturePageBuilder({
  featureName,
  selectedDataTable,
  selectedForm,
}: XFeaturePageBuilderProps) {
  const { feature, loading, error } = useXFeatureDefinition(featureName);
  const { getForm } = useXFeature();
  const [activeForm, setActiveForm] = useState<{
    formId: string;
    rowData?: Record<string, unknown>;
  } | null>(selectedForm ? { formId: selectedForm } : null);

  const handleRowAction = useCallback((formId: string, rowData: Record<string, unknown>) => {
    setActiveForm({ formId, rowData });
  }, []);

  const handleFormSuccess = useCallback((response: ActionResponse) => {
    console.log('Form submitted successfully:', response);
    setActiveForm(null);
    // Could trigger a refresh of the datatable here if needed
  }, []);

  const handleFormCancel = useCallback(() => {
    setActiveForm(null);
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 2 }}>
        <Alert severity="error">Failed to load feature: {error.message}</Alert>
      </Container>
    );
  }

  if (!feature) {
    return (
      <Container maxWidth="lg" sx={{ mt: 2 }}>
        <Alert severity="warning">Feature not found: {featureName}</Alert>
      </Container>
    );
  }

  const { frontend } = feature;
  const dataTableToRender = selectedDataTable
    ? frontend.dataTables.find((dt) => dt.id === selectedDataTable)
    : frontend.dataTables[0];

  const activeFormDef = activeForm
    ? getForm(featureName, activeForm.formId)
    : null;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={4}>
        {/* DataTable Section */}
        {dataTableToRender && (
          <XFeatureDataTable
            definition={dataTableToRender}
            featureName={featureName}
            onRowAction={handleRowAction}
          />
        )}

        {/* All Forms Section */}
        {!activeForm &&
          frontend.forms.map((form) => {
            if (form.dialog) {
              return null; // Dialog forms are handled separately
            }
            return (
              <XFeatureForm
                key={form.id}
                definition={form}
                featureName={featureName}
                onSuccess={handleFormSuccess}
                onCancel={handleFormCancel}
              />
            );
          })}

        {/* Active Dialog Form */}
        {activeForm && activeFormDef && (
          <XFeatureForm
            definition={activeFormDef}
            featureName={featureName}
            initialData={activeForm.rowData}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        )}
      </Stack>
    </Container>
  );
}

/**
 * Simple XFeatureDataTableOnly Component
 * Renders only a specific datatable from an XFeature
 */
export function XFeatureDataTableOnly({
  featureName,
  tableId,
}: {
  featureName: string;
  tableId: string;
}) {
  const { feature, loading, error } = useXFeatureDefinition(featureName);
  const [selectedForm, setSelectedForm] = useState<{
    formId: string;
    rowData?: Record<string, unknown>;
  } | null>(null);
  const { getForm } = useXFeature();

  const table = feature?.frontend.dataTables.find((t) => t.id === tableId);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Failed to load feature: {error.message}</Alert>;
  }

  if (!table) {
    return <Alert severity="warning">Table not found: {tableId}</Alert>;
  }

  const activeFormDef = selectedForm ? getForm(featureName, selectedForm.formId) : null;

  return (
    <>
      <XFeatureDataTable
        definition={table}
        featureName={featureName}
        onRowAction={(formId, rowData) => setSelectedForm({ formId, rowData })}
      />

      {selectedForm && activeFormDef && (
        <XFeatureForm
          definition={activeFormDef}
          featureName={featureName}
          initialData={selectedForm.rowData}
          onSuccess={() => setSelectedForm(null)}
          onCancel={() => setSelectedForm(null)}
        />
      )}
    </>
  );
}

/**
 * Simple XFeatureFormOnly Component
 * Renders only a specific form from an XFeature
 */
export function XFeatureFormOnly({
  featureName,
  formId,
  initialData,
}: {
  featureName: string;
  formId: string;
  initialData?: Record<string, unknown>;
}) {
  const { feature, loading, error } = useXFeatureDefinition(featureName);

  const form = feature?.frontend.forms.find((f) => f.id === formId);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Failed to load feature: {error.message}</Alert>;
  }

  if (!form) {
    return <Alert severity="warning">Form not found: {formId}</Alert>;
  }

  return (
    <XFeatureForm
      definition={form}
      featureName={featureName}
      initialData={initialData}
    />
  );
}
