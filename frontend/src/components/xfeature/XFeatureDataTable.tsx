import React, { useState, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  CircularProgress,
  Box,
  Stack,
  Alert,
  Button,
  Menu,
  MenuItem,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import type { XFeatureDataTableProps, QueryRequest } from '../../types/xfeature';
import { useXFeatureQuery, useXFeature } from '../../contexts/XFeatureContext';
import { formatCellValue } from '../../utils/format';

/**
 * XFeatureDataTable Component
 * Renders a dynamic data table based on XFeature datatable definition
 */
export function XFeatureDataTable({
  definition,
  featureName,
  onRowAction,
}: XFeatureDataTableProps) {
  const { getForm } = useXFeature();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(definition.pageSize || 10);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<Record<string, unknown> | null>(null);

  // Build query parameters
  const queryParams: QueryRequest = {
    limit: rowsPerPage,
    offset: page * rowsPerPage,
    ...(sortBy && { sortBy, sortOrder }),
  };

  // Fetch data
  const { data, loading, error, total, refetch } = useXFeatureQuery(
    featureName,
    definition.queryRef,
    queryParams,
    true
  );

  // Handle page change
  const handleChangePage = useCallback(
    (_event: unknown, newPage: number) => {
      setPage(newPage);
    },
    []
  );

  // Handle rows per page change
  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    },
    []
  );

  // Handle sort
  const handleSort = useCallback((columnName: string) => {
    setSortBy(columnName);
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    setPage(0);
  }, []);

  // Handle row action menu
  const handleRowActionClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    rowData: Record<string, unknown>
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(rowData);
  };

  const handleRowActionClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleFormAction = (formId: string) => {
    if (selectedRow && onRowAction) {
      onRowAction(formId, selectedRow);
    }
    handleRowActionClose();
  };

  // Refresh data
  
  const getFormActionIds = (): string[] => {
    if (!definition.formActions) return [];
    return definition.formActions.split(',').map((s) => s.trim());
  };

  const getColumnFormActionIds = (colFormActions?: string): string[] => {
    if (!colFormActions) return [];
    return colFormActions.split(',').map((s) => s.trim());
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      {/* Header with title and actions */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <h2>{definition.title || 'Data Table'}</h2>
          <Button
            variant="outlined"
            size="small"
            onClick={() => refetch(queryParams)}
            disabled={loading}
          >
            Refresh
          </Button>
        </Stack>
      </Box>

      {/* Error message */}
      {error && (
        <Box sx={{ p: 2 }}>
          <Alert severity="error">{error.message}</Alert>
        </Box>
      )}

      {/* Loading state */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Table */}
      {!loading && (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  {definition.columns.map((column) => (
                    <TableCell
                      key={column.name}
                      align={column.align || 'left'}
                      width={column.width}
                      sortDirection={
                        sortBy === column.name ? sortOrder : false
                      }
                    >
                      {column.sortable ? (
                        <TableSortLabel
                          active={sortBy === column.name}
                          direction={sortOrder}
                          onClick={() => handleSort(column.name)}
                        >
                          {column.label}
                        </TableSortLabel>
                      ) : (
                        column.label
                      )}
                    </TableCell>
                  ))}
                  {getFormActionIds().length > 0 && (
                    <TableCell align="center">Actions</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row, idx) => (
                  <TableRow key={idx} hover>
                    {definition.columns.map((column) => {
                      const cellValue = row[column.name];
                      const columnFormActions = getColumnFormActionIds(
                        column.formActions
                      );

                      return (
                        <TableCell
                          key={column.name}
                          align={column.align || 'left'}
                        >
                          {columnFormActions.length > 0 ? (
                            <Button
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRowActionClick(e, row);
                              }}
                            >
                              {formatCellValue(cellValue, column.type, column.format)}
                            </Button>
                          ) : (
                            formatCellValue(cellValue, column.type, column.format)
                          )}
                        </TableCell>
                      );
                    })}
                    {getFormActionIds().length > 0 && (
                      <TableCell align="center">
                        <Button
                          size="small"
                          onClick={(e) => handleRowActionClick(e, row)}
                        >
                          <MoreVertIcon />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {definition.pagination !== false && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={total || 0}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          )}

          {/* Row action menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleRowActionClose}
          >
            {getFormActionIds().map((formId) => (
              <MenuItem
                key={formId}
                onClick={() => handleFormAction(formId)}
              >
                {getForm(featureName, formId)?.title || formId}
              </MenuItem>
            ))}
          </Menu>
        </>
      )}
    </Paper>
  );
}
