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
  Alert
} from '@mui/material'
import { apiService, Invoice } from '../services/api.config'

type Order = 'asc' | 'desc'

export default function InvoicesTable() {
  const [data, setData] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [order, setOrder] = useState<Order>('desc')
  const [orderBy, setOrderBy] = useState<string>('faturaTarihi')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    setLoading(true)
    setError(null)
    try {
      const invoices = await apiService.getInvoices()
      setData(invoices)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invoices')
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

  const filteredData = data.filter(invoice =>
    Object.values(invoice).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const sortedData = [...filteredData].sort((a, b) => {
    const aVal = a[orderBy as keyof Invoice]
    const bVal = b[orderBy as keyof Invoice]

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
            <button onClick={fetchInvoices} style={{ cursor: 'pointer' }}>
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
          <TableContainer component={Paper} sx={{ backgroundColor: '#2a2a2a' }}>
            <Table sx={{ minWidth: 750 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#1a1a1a' }}>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>
                <TableSortLabel
                  active={orderBy === 'satici_vergiNo'}
                  direction={orderBy === 'satici_vergiNo' ? order : 'asc'}
                  onClick={() => handleRequestSort('satici_vergiNo')}
                  sx={{ color: '#fff' }}
                >
                  Vendor Tax ID
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>
                <TableSortLabel
                  active={orderBy === 'faturaNo'}
                  direction={orderBy === 'faturaNo' ? order : 'asc'}
                  onClick={() => handleRequestSort('faturaNo')}
                  sx={{ color: '#fff' }}
                >
                  Invoice No
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>
                <TableSortLabel
                  active={orderBy === 'faturaTarihi'}
                  direction={orderBy === 'faturaTarihi' ? order : 'asc'}
                  onClick={() => handleRequestSort('faturaTarihi')}
                  sx={{ color: '#fff' }}
                >
                  Invoice Date
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>
                <TableSortLabel
                  active={orderBy === 'faturaTuru'}
                  direction={orderBy === 'faturaTuru' ? order : 'asc'}
                  onClick={() => handleRequestSort('faturaTuru')}
                  sx={{ color: '#fff' }}
                >
                  Type
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>
                <TableSortLabel
                  active={orderBy === 'paraBirimi'}
                  direction={orderBy === 'paraBirimi' ? order : 'asc'}
                  onClick={() => handleRequestSort('paraBirimi')}
                  sx={{ color: '#fff', textAlign: 'center' }}
                >
                  Currency
                </TableSortLabel>
              </TableCell>
              <TableCell align="right" sx={{ color: '#fff', fontWeight: 'bold' }}>
                <TableSortLabel
                  active={orderBy === 'Toplam'}
                  direction={orderBy === 'Toplam' ? order : 'asc'}
                  onClick={() => handleRequestSort('Toplam')}
                  sx={{ color: '#fff' }}
                >
                  Total Goods/Services
                </TableSortLabel>
              </TableCell>
              <TableCell align="right" sx={{ color: '#fff', fontWeight: 'bold' }}>
                <TableSortLabel
                  active={orderBy === 'vergi'}
                  direction={orderBy === 'vergi' ? order : 'asc'}
                  onClick={() => handleRequestSort('vergi')}
                  sx={{ color: '#fff' }}
                >
                  Tax Amount
                </TableSortLabel>
              </TableCell>
              <TableCell align="right" sx={{ color: '#fff', fontWeight: 'bold' }}>
                <TableSortLabel
                  active={orderBy === 'odenecekTutar'}
                  direction={orderBy === 'odenecekTutar' ? order : 'asc'}
                  onClick={() => handleRequestSort('odenecekTutar')}
                  sx={{ color: '#fff' }}
                >
                  Total Payable
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedData.map((row, index) => (
              <TableRow key={index} sx={{ '&:hover': { backgroundColor: '#3a3a3a' } }}>
                <TableCell sx={{ color: '#ccc' }}>{row.satici_vergiNo}</TableCell>
                <TableCell sx={{ color: '#ccc' }}>{row.faturaNo}</TableCell>
                <TableCell sx={{ color: '#ccc' }}>{row.faturaTarihi}</TableCell>
                <TableCell sx={{ color: '#ccc' }}>{row.faturaTuru}</TableCell>
                <TableCell align="center" sx={{ color: '#ccc' }}>{row.paraBirimi}</TableCell>
                <TableCell align="right" sx={{ color: '#ccc' }}>{row.Toplam.toFixed(2)}</TableCell>
                <TableCell align="right" sx={{ color: '#ccc' }}>{row.vergi.toFixed(2)}</TableCell>
                <TableCell align="right" sx={{ color: '#ccc' }}>{row.odenecekTutar.toFixed(2)}</TableCell>
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
            sx={{ backgroundColor: '#2a2a2a', color: '#ccc' }}
          />
        </>
      )}
    </Box>
  )
}
