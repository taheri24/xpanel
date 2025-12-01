import React, { useState } from 'react'
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
  TextField
} from '@mui/material'

interface Invoice {
  satici_vergiNo: string
  faturaNo: string
  faturaTarihi: string
  faturaTuru: string
  faturaTipi: string
  paraBirimi: string
  Toplam: number
  vergi: number
  odenecekTutar: number
}

// Sample data
const SAMPLE_INVOICES: Invoice[] = [
  {
    satici_vergiNo: '1234567890',
    faturaNo: 'INV-001',
    faturaTarihi: '2024-11-01',
    faturaTuru: 'Standard',
    faturaTipi: 'Purchase',
    paraBirimi: 'TRY',
    Toplam: 1000.00,
    vergi: 180.00,
    odenecekTutar: 1180.00
  },
  {
    satici_vergiNo: '0987654321',
    faturaNo: 'INV-002',
    faturaTarihi: '2024-11-02',
    faturaTuru: 'Credit',
    faturaTipi: 'Purchase',
    paraBirimi: 'TRY',
    Toplam: 2500.00,
    vergi: 450.00,
    odenecekTutar: 2950.00
  },
  {
    satici_vergiNo: '1122334455',
    faturaNo: 'INV-003',
    faturaTarihi: '2024-11-03',
    faturaTuru: 'Debit',
    faturaTipi: 'Purchase',
    paraBirimi: 'USD',
    Toplam: 5000.00,
    vergi: 800.00,
    odenecekTutar: 5800.00
  }
]

type Order = 'asc' | 'desc'

export default function InvoicesTable() {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [order, setOrder] = useState<Order>('desc')
  const [orderBy, setOrderBy] = useState<string>('faturaTarihi')
  const [searchTerm, setSearchTerm] = useState('')

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

  const filteredData = SAMPLE_INVOICES.filter(invoice =>
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
        />
      </Box>
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
    </Box>
  )
}
