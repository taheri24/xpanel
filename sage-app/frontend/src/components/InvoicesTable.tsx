import React, { useState } from 'react'
import {
  Box,
  TextField,
  CircularProgress,
  Alert,
  useTheme
} from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { Invoice } from '../services/api.config'
import { apiService } from '@/services/api'

const formatValue=(s:number | string)=>{
  if (typeof s=='string'){
    return s
  }
  if (typeof s=='number'){
    return s.toFixed(2);
  }
}

function getValue(obj:any,key:string){
  const results= Object.entries(obj).filter(([fieldName='']=['',''])=>((fieldName as string).toLowerCase()==key.toLowerCase() )).map(([_,val])=>val)
  if(results.length>0) return results[0];
  return null;
}

interface Props {
  data: Invoice[]
  loading: boolean
  error: string | null
  onRetry: () => void
  setRef: Function
  gridColumns?:Array<GridColDef>;
}
/*
const columns: GridColDef[] = [
  { field: 'satici_vergiNo', headerName: 'Vendor Tax ID', width: 150, sortable: true },
  { field: 'faturaNo', headerName: 'Invoice No', width: 150, sortable: true },
  { field: 'faturaTarihi', headerName: 'Invoice Date', width: 150, sortable: true },
  { field: 'faturaTuru', headerName: 'Type', width: 120, sortable: true },
  { field: 'paraBirimi', headerName: 'Currency', width: 120, sortable: true, align: 'center', headerAlign: 'center' },
  { field: 'Toplam', headerName: 'Total Goods/Services', width: 150, sortable: true, type: 'number', align: 'right', headerAlign: 'right' },
  { field: 'vergi', headerName: 'Tax Amount', width: 150, sortable: true, type: 'number', align: 'right', headerAlign: 'right' },
  { field: 'odenecekTutar', headerName: 'Total Payable', width: 150, sortable: true, type: 'number', align: 'right', headerAlign: 'right' },
  { field: 'Note1', headerName: 'Note1', width: 100, sortable: false },
  { field: 'Note2', headerName: 'Note2', width: 100, sortable: false },
  { field: 'Note3', headerName: 'Note3', width: 100, sortable: false },
  { field: 'Note4', headerName: 'Note4', width: 100, sortable: false },
  { field: 'Note5', headerName: 'Note5', width: 100, sortable: false },
]
  */
export default function InvoicesTable({ gridColumns,data, loading, error, onRetry, setRef }: Props) {
  const theme = useTheme()
  const [searchTerm, setSearchTerm] = useState('')
  const cols=gridColumns?.map(c=>({...c,type:c.type=='date'? 'string':c.type}));
  const filteredData = data.filter(invoice =>
    Object.values(invoice).some(val =>
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
          placeholder="Search invoices..."
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
            autoHeight
            key={cols?.length}
            columns={cols || []}
            pageSizeOptions={[5, 10, 25]}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 10,
                },
              },
            }}
            onRowClick={(params) => setRef && setRef(getValue(params.row, 'ref'))}
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
