import React, { useMemo, useState } from 'react'
import {
  Box,
  TextField,
  CircularProgress,
  Alert,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton
} from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import { LineItem } from '../services/api.config'
import { apiService } from '@/services/api'

interface Props {
  data: LineItem[]
  loading: boolean
  error: string | null
  onRetry: () => void;
  gridColumns:Array<GridColDef>;
}

function getValue(obj:any,key:string):React.ReactNode{
  const results= Object.entries(obj).filter(([fieldName='']=['',''])=>((fieldName as string).toLowerCase()==key.toLowerCase() )).map(([_,val])=>val)
  if(results?.length>0) return results[0] as any;
  return null;
}
const upsertMap= new Map();

export default function LineItemsTable({ data,gridColumns, loading, error, onRetry }: Props) {
  const data2 = [];
  const theme = useTheme()
  const [searchTerm, setSearchTerm] = useState('')
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [selectedRow, setSelectedRow] = useState<LineItem | null>(null)
  const [editFormData, setEditFormData] = useState<Partial<LineItem>>({})
  const [selectedRow1, setSelectedRow1] = useState<number | null>(null)
  const [selectedRow2, setSelectedRow2] = useState<number | null>(null);
  const eventRef=React.useRef(null as any);

  const columns=useMemo(function(){
    return [{
      field: 'actions',
      headerName: 'Actions',
      width: 80,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          sx={{ color: 'primary.main' }}
          title="Edit row"
          onClick={(e) => {
            e.stopPropagation();
            handleOpenEditDialog(params.row);
            eventRef.current= ()=>params.api.dataSource.fetchRows();
          }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      ),
    } as GridColDef,...gridColumns].map(c=>({...c,type:c.type=='date'? 'string':c.type}));
  },[gridColumns?.length]);

   const handleOpenEditDialog = (row: LineItem) => {
    setSelectedRow(row)
    setEditFormData(row)
    setOpenEditDialog(true)
  }

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false)
    setSelectedRow(null)
    setEditFormData({})
  }

  const handleEditFormChange = (field: keyof LineItem, value: any) => {
    setEditFormData(prev => ({ ...prev, [field]: value }))
  }

  const logEditSubmission = (rowData: Partial<LineItem>) => {
    const timestamp = new Date().toISOString()
    const logEntry = {
      action: 'LINE_ITEM_EDIT',
      timestamp,
      originalData: selectedRow,
      editedData: rowData
    }
    console.log('Edit Submission Log:', logEntry)
    return logEntry
  }

  const logPairingAction = (row1: LineItem | null, row2: LineItem | null) => {
    const timestamp = new Date().toISOString()
    const logEntry = {
      action: 'ROW_PAIRING',
      timestamp,
      pairedRows: {
        datagrid1: row1,
        datagrid2: row2
      }
    }
    console.log('Row Pairing Log:', logEntry)
    return logEntry
  }

  const handleSaveEdit =async () => {
    logEditSubmission(editFormData);
    const {siraNo,INV_NO,ITMREF2}=editFormData as any;
    const body={  ITMREF2:ITMREF2?.toString(),siraNo:siraNo?.toString(),INV_NO:INV_NO?.toString()};
    //    alert(JSON.stringify(body);
 
    const url=`/api/v1/x/SageLines/actions/Update`;
    const serverResult=await fetch(url,{method:'POST',body:JSON.stringify(body) }).then(x=>true,console.error);
    const eventFn= eventRef.current as Function;
    if (serverResult===true  && eventFn instanceof Function){
      upsertMap.set(`${body.INV_NO}:${body.siraNo}`,body);
      eventFn();
    }
    handleCloseEditDialog();
  }
const filteredData2:any[]=[];
  const handlePairRows = () => {
    if (selectedRow1 !== null && selectedRow2 !== null) {
      const row1 = filteredData[selectedRow1]
      const row2 = filteredData2[selectedRow2]
      logPairingAction(row1, row2)
      setSelectedRow1(null)
      setSelectedRow2(null)
    }
  }

  const filteredData = data.filter(item =>
    Object.values(item).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  ).map((item, index) => ({ ...item,...(upsertMap.get(`${item.INV_NO}:${item.siraNo}`) || {}), id: index }))

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
          <Box sx={{ mt: 1 }}>
            <button onClick={onRetry} style={{ cursor: 'pointer' }}>
              Retry
            </button>
          </Box>
        </Alert>
      )}
      <Box sx={{ mb: 2 }}>
        <TextField
          placeholder="Search line items..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
          }}
          sx={{ width: '100%', maxWidth: 300 }}
          disabled={loading}
        />
      </Box>
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}
      {!loading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Box sx={{ fontSize: '0.875rem', fontWeight: 600, mb: 1, color: theme.palette.text.secondary }}>
              Datagrid 1
            </Box>
            <Box sx={{ height: 400, width: '100%', border: `1px solid ${theme.palette.divider}` }}>
              <DataGrid autoHeight
                key={columns?.length}
                rows={filteredData}
                columns={columns}
                pageSizeOptions={[5, 10, 25]}
                initialState={{
                  pagination: {
                    paginationModel: {
                      pageSize: 10,
                    },
                  },
                }}
                onRowClick={(params) => setSelectedRow1(params.id as number)}
                sx={{
                  backgroundColor: theme.palette.background.paper,
                  color: theme.palette.text.primary,
                  '& .MuiDataGrid-columnHeader': {
                    backgroundColor: theme.palette.mode === 'light' ? '#f5f5f5' : '#2a2a2a',
                  },
                  '& .MuiDataGrid-row:hover': {
                    backgroundColor: theme.palette.mode === 'light' ? '#eeeeee' : '#3a3a3a',
                  },
                  '& .MuiDataGrid-row.Mui-selected': {
                    backgroundColor: theme.palette.action.selected,
                    '&:hover': {
                      backgroundColor: theme.palette.action.selected,
                    }
                  }
                }}
              />
            </Box>
            <Box sx={{ mt: 1, fontSize: '0.75rem', color: theme.palette.text.secondary }}>
              Selected: {selectedRow1 !== null ? `Row ${selectedRow1}` : 'None'}
            </Box>
          </Box>

          
          {data2.length > 0 && (
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
              <Button
                onClick={handlePairRows}
                variant="contained"
                color="primary"
                disabled={selectedRow1 === null || selectedRow2 === null}
              >
                Pair Selected Rows
              </Button>
              {selectedRow1 !== null && selectedRow2 !== null && (
                <Box sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary, display: 'flex', alignItems: 'center' }}>
                  Ready to pair: Row {selectedRow1} ↔ Row {selectedRow2}
                </Box>
              )}
            </Box>
          )}
        </Box>
      )}

      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: theme.palette.mode === 'dark' ? '#2a2a2a' : '#f5f5f5', color: theme.palette.text.primary }}>
          Edit Line Item
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: theme.palette.background.paper, mt: 2 }}>
          {selectedRow && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Product Code"
                value={editFormData.saticiUrunKodu || ''}
                 fullWidth
                disabled
                variant="outlined"
                size="small"
              />
              <TextField
                label="Product Description"
                value={editFormData.urunAdi || ''}
                 fullWidth
                variant="outlined"
                size="small"
                disabled
              />
              <TextField
                label="New Product Code"
                value={editFormData.ITMREF2}
                onChange={(e) => handleEditFormChange('ITMREF2', e.target.value)}

                 fullWidth
                variant="outlined"
                size="small"
                 
              />
              <TextField
                label="Quantity"
                type="number"
                value={editFormData.miktar || ''}
                onChange={(e) => handleEditFormChange('miktar', e.target.value)}
                fullWidth
                variant="outlined"
                size="small"
              />
             </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ backgroundColor: theme.palette.mode === 'dark' ? '#2a2a2a' : '#f5f5f5', p: 2 }}>
          <Button onClick={handleCloseEditDialog} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSaveEdit} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
