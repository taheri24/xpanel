import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Stack,
} from '@mui/material';
import { useXFeatureMappings } from '../../contexts/XFeatureContext';
import type { Mapping } from '../../types/xfeature';

export interface FieldMappingProps {
  /**
   * Name of the feature to load mappings from
   */
  featureName: string;
  /**
   * Array of mapping names to display
   */
  ids: string[];
  /**
   * Optional title for the component
   */
  title?: string;
}

const FieldMapping: React.FC<FieldMappingProps> = ({ featureName, ids, title = 'Field Mappings' }) => {
  const { mappings, loading, error, getMappingByName } = useXFeatureMappings(featureName);

  // Get the specific mappings requested, preserving the field ID
  const selectedMappings: Array<{ fieldId: string; mapping: Mapping }> = ids
    .map((id) => {
      const mapping = getMappingByName(id);
      return mapping ? { fieldId: id, mapping } : null;
    })
    .filter((item): item is { fieldId: string; mapping: Mapping } => item !== null);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Failed to load field mappings: {error.message}</Alert>;
  }

  if (selectedMappings.length === 0) {
    return (
      <Alert severity="warning">
        No mappings found for: {ids.join(', ')}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Stack spacing={2}>
        {selectedMappings.map(({ fieldId, mapping }) => (
          <Card key={mapping.name} variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {fieldId}: {mapping.label}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {mapping.name}
                  </Typography>
                </Box>
                <Chip label={mapping.dataType} size="small" color="primary" variant="outlined" />
              </Box>

              {mapping.options?.items && mapping.options.items.length > 0 && (
                <Box>
                  <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 1 }}>
                    Available Options:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {mapping.options.items.map((option) => (
                      <Chip
                        key={option.value}
                        label={option.label}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {mapping.listQuery && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="textSecondary" display="block">
                    List Query: <code>{mapping.listQuery.id}</code>
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};

export default FieldMapping;
