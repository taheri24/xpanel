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
  useTheme
} from '@mui/material'
import { apiService, Receipt } from '../services/api.config'

type Order = 'asc' | 'desc'
interface Props{
  invoiceRef:string;
  setReceiptRef:Function;
}

function getValue(obj:any,key:string){
  const results= Object.entries(obj).filter(([fieldName='']=['',''])=>((fieldName as string).toLowerCase()==key.toLowerCase() )).map(([_,val])=>val)
  if(results.length>0) return results[0];
  return null;
}

export default function ReceiptsTable(p:Props) {
  const theme = useTheme()
  const [data, setData] = useState<Receipt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [order, setOrder] = useState<Order>('desc')
  const [orderBy, setOrderBy] = useState<string>('RCPDAT_0')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchReceipts()
  }, [])

  const fetchReceipts = async () => {
    setLoading(true)
    setError(null)
    try {
      const receipts = await apiService.getReceipts(p.invoiceRef)
      setData(receipts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch receipts')
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

  const filteredData = data.filter(receipt =>
    Object.values(receipt).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const sortedData = [...filteredData].sort((a, b) => {
    const aVal = a[orderBy as keyof Receipt]
    const bVal = b[orderBy as keyof Receipt]

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
            <button onClick={fetchReceipts} style={{ cursor: 'pointer' }}>
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
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.mode === 'light' ? '#f5f5f5' : '#2a2a2a' }}>
              <TableCell sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>
                <TableSortLabel
                  active={orderBy === 'PTHNUM_0'}
                  direction={orderBy === 'PTHNUM_0' ? order : 'asc'}
                  onClick={() => handleRequestSort('PTHNUM_0')}
                  sx={{ color: theme.palette.text.primary }}
                >
                  Receipt Number
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>
                <TableSortLabel
                  active={orderBy === 'BPSNDE_0'}
                  direction={orderBy === 'BPSNDE_0' ? order : 'asc'}
                  onClick={() => handleRequestSort('BPSNDE_0')}
                  sx={{ color: theme.palette.text.primary }}
                >
                  Invoice Number
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>
                <TableSortLabel
                  active={orderBy === 'RCPDAT_0'}
                  direction={orderBy === 'RCPDAT_0' ? order : 'asc'}
                  onClick={() => handleRequestSort('RCPDAT_0')}
                  sx={{ color: theme.palette.text.primary }}
                >
                  Receipt Date
                </TableSortLabel>
              </TableCell>
              {['Note1','Note2','Note3','Note4','Note5'].map(fld=> <TableCell align="right" sx={{ color: theme.palette.text.primary }}>{fld} </TableCell>)}
                
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedData.map((row, index) => (
              <TableRow onClick={e=>p.setReceiptRef  instanceof Function && p.setReceiptRef(getValue(row,'ref'))} key={index} sx={{ '&:hover': { backgroundColor: theme.palette.mode === 'light' ? '#eeeeee' : '#3a3a3a' } }}>
                <TableCell sx={{ color: theme.palette.text.primary }}>{row.PTHNUM_0}</TableCell>
                <TableCell sx={{ color: theme.palette.text.primary }}>{row.BPSNDE_0}</TableCell>
                <TableCell sx={{ color: theme.palette.text.primary }}>{row.RCPDAT_0}</TableCell>
                {['Note1','Note2','Note3','Note4','Note5'].map(fld=> <TableCell align="right" sx={{ color: theme.palette.text.secondary }}>{ (getValue(row,fld))} </TableCell>)}
                
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
    </Box>
  )
}
