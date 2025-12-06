import React, { useState } from 'react'
import {
  Box,
  TextField,
  CircularProgress,
  Alert,
  useTheme
} from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { Receipt } from '../services/api.config'

interface Props {
  data: Receipt[]
  loading: boolean
  error: string | null
  onRetry: () => void
  setReceiptRef: Function
}

function getValue(obj:any,key:string){
  const results= Object.entries(obj).filter(([fieldName='']=['',''])=>((fieldName as string).toLowerCase()==key.toLowerCase() )).map(([_,val])=>val)
  if(results.length>0) return results[0];
  return null;
}

const columns: GridColDef[] = [
  { field: 'PTHNUM_0', headerName: 'Receipt Number', width: 150, sortable: true },
  { field: 'BPSNDE_0', headerName: 'Invoice Number', width: 150, sortable: true },
  { field: 'RCPDAT_0', headerName: 'Receipt Date', width: 150, sortable: true },
  { field: 'Note1', headerName: 'Note1', width: 100, sortable: false },
  { field: 'Note2', headerName: 'Note2', width: 100, sortable: false },
  { field: 'Note3', headerName: 'Note3', width: 100, sortable: false },
  { field: 'Note4', headerName: 'Note4', width: 100, sortable: false },
  { field: 'Note5', headerName: 'Note5', width: 100, sortable: false },
]

export default function ReceiptsTable({ data, loading, error, onRetry, setReceiptRef }: Props) {
  const theme = useTheme()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredData = data.filter(receipt =>
    Object.values(receipt).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  ).map((item, index) => ({ ...item, id: index }))

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
          placeholder="Search receipts..."
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
        <Box sx={{ height: 400, width: '100%' }}>
          <DataGrid
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
            onRowClick={(params) => setReceiptRef instanceof Function && setReceiptRef(getValue(params.row, 'ref'))}
            sx={{
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.text.primary,
              '& .MuiDataGrid-columnHeader': {
                backgroundColor: theme.palette.mode === 'light' ? '#f5f5f5' : '#2a2a2a',
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: theme.palette.mode === 'light' ? '#eeeeee' : '#3a3a3a',
              },
            }}
          />
        </Box>
      )}
    </Box>
  )
}
