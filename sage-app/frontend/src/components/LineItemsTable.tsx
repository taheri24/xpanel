import React, { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TableSortLabel,
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
import EditIcon from '@mui/icons-material/Edit'
import { apiService, LineItem } from '../services/api.config'

type Order = 'asc' | 'desc'
interface Props{
  receiptRef:string;
}
function getValue(obj:any,key:string){
  const results= Object.entries(obj).filter(([fieldName='']=['',''])=>((fieldName as string).toLowerCase()==key.toLowerCase() )).map(([_,val])=>val)
  if(results.length>0) return results[0];
  return null;
}
export default function LineItemsTable(p:Props) {
  const theme = useTheme()
  const [data, setData] = useState<LineItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [order, setOrder] = useState<Order>('asc')
  const [orderBy, setOrderBy] = useState<string>('ITMREF_0')
  const [searchTerm, setSearchTerm] = useState('')
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [selectedRow, setSelectedRow] = useState<LineItem | null>(null)
  const [editFormData, setEditFormData] = useState<Partial<LineItem>>({})

  useEffect(() => {
    fetchLineItems()
  }, [])

  const fetchLineItems = async () => {
    setLoading(true)
    setError(null)
    try {
      const lineItems = await apiService.getLineItems(p.receiptRef)
      setData(lineItems)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch line items')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

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
      editedData: rowData,
      receiptRef: p.receiptRef
    }
    console.log('Edit Submission Log:', logEntry)
    return logEntry
  }

  const handleSaveEdit = () => {
    logEditSubmission(editFormData)
    handleCloseEditDialog()
  }

  const filteredData = data.filter(item =>
    Object.values(item).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const sortedData = [...filteredData].sort((a, b) => {
    const aVal = a[orderBy as keyof LineItem]
    const bVal = b[orderBy as keyof LineItem]

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return order === 'asc' ? aVal - bVal : bVal - aVal
    }

    const aStr = String(aVal).toLowerCase()
    const bStr = String(bVal).toLowerCase()
    return order === 'asc'
      ? aStr.localeCompare(bStr)
      : bStr.localeCompare(aStr)
  })

  const displayedData = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
          <Box sx={{ mt: 1 }}>
            <button onClick={fetchLineItems} style={{ cursor: 'pointer' }}>
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
            setPage(0)
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
        <>
          <TableContainer component={Paper} sx={{ backgroundColor: theme.palette.background.paper }}>
        <Table sx={{ minWidth: 750 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.mode === 'light' ? '#f5f5f5' : '#2a2a2a' }}>
              <TableCell sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>
                <TableSortLabel
                  active={orderBy === 'ITMREF_0'}
                  direction={orderBy === 'ITMREF_0' ? order : 'asc'}
                  onClick={() => handleRequestSort('ITMREF_0')}
                  sx={{ color: theme.palette.text.primary }}
                >
                  Product Code
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>
                <TableSortLabel
                  active={orderBy === 'ITMDES_0'}
                  direction={orderBy === 'ITMDES_0' ? order : 'asc'}
                  onClick={() => handleRequestSort('ITMDES_0')}
                  sx={{ color: theme.palette.text.primary }}
                >
                  Product Description
                </TableSortLabel>
              </TableCell>
              <TableCell align="right" sx={{ color: '#fff', fontWeight: 'bold' }}>
                <TableSortLabel
                  active={orderBy === 'QTYSTU_0'}
                  direction={orderBy === 'QTYSTU_0' ? order : 'asc'}
                  onClick={() => handleRequestSort('QTYSTU_0')}
                  sx={{ color: theme.palette.text.primary }}
                >
                  Quantity
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>
                <TableSortLabel
                  active={orderBy === 'loc'}
                  direction={orderBy === 'loc' ? order : 'asc'}
                  onClick={() => handleRequestSort('loc')}
                  sx={{ color: theme.palette.text.primary }}
                >
                  Source
                </TableSortLabel>
              </TableCell>
              {['Note1','Note2','Note3','Note4','Note5'].map(fld=> <TableCell align="right" sx={{  color: theme.palette.text.primary,fontWeight:'bold' }}>{fld} </TableCell>)}
              <TableCell sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>Actions</TableCell>

            </TableRow>
          </TableHead>
          <TableBody>
            {displayedData.map((row, index) => (
              <TableRow key={index} sx={{ '&:hover': { backgroundColor: theme.palette.mode === 'light' ? '#eeeeee' : '#3a3a3a' } }}>
                <TableCell sx={{ color: theme.palette.text.primary }}>{row.saticiUrunKodu}</TableCell>
                <TableCell sx={{ color: theme.palette.text.primary }}>{row.urunAdi}</TableCell>
                <TableCell align="right" sx={{ color: '#ccc' }}>{row.miktar}</TableCell>
                <TableCell sx={{ color: theme.palette.text.primary }}>{row.Recived_Invoice_Portal}</TableCell>
                {['Note1','Note2','Note3','Note4','Note5'].map(fld=> <TableCell align="right" sx={{ color: theme.palette.text.secondary }}>{ (getValue(row,fld))} </TableCell>)}
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => handleOpenEditDialog(row)}
                    sx={{ color: theme.palette.primary.main }}
                    title="Edit row"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{ backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary }}
          />
        </>

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
                onChange={(e) => handleEditFormChange('saticiUrunKodu', e.target.value)}
                fullWidth
                variant="outlined"
                size="small"
              />
              <TextField
                label="Product Description"
                value={editFormData.urunAdi || ''}
                onChange={(e) => handleEditFormChange('urunAdi', e.target.value)}
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
              <TextField
                label="Source"
                value={editFormData.Recived_Invoice_Portal || ''}
                onChange={(e) => handleEditFormChange('Recived_Invoice_Portal', e.target.value)}
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
