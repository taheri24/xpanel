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

interface Receipt {
  PTHNUM_0: string
  BPSNDE_0: string
  RCPDAT_0: string
}

// Sample data
const SAMPLE_RECEIPTS: Receipt[] = [
  {
    PTHNUM_0: 'RCP-2024-001',
    BPSNDE_0: 'INV-001',
    RCPDAT_0: '2024-11-01'
  },
  {
    PTHNUM_0: 'RCP-2024-002',
    BPSNDE_0: 'INV-002',
    RCPDAT_0: '2024-11-02'
  },
  {
    PTHNUM_0: 'RCP-2024-003',
    BPSNDE_0: 'INV-003',
    RCPDAT_0: '2024-11-03'
  },
  {
    PTHNUM_0: 'RCP-2024-004',
    BPSNDE_0: 'INV-004',
    RCPDAT_0: '2024-11-04'
  }
]

type Order = 'asc' | 'desc'

export default function ReceiptsTable() {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [order, setOrder] = useState<Order>('desc')
  const [orderBy, setOrderBy] = useState<string>('RCPDAT_0')
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

  const filteredData = SAMPLE_RECEIPTS.filter(receipt =>
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
        />
      </Box>
      <TableContainer component={Paper} sx={{ backgroundColor: '#2a2a2a' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#1a1a1a' }}>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>
                <TableSortLabel
                  active={orderBy === 'PTHNUM_0'}
                  direction={orderBy === 'PTHNUM_0' ? order : 'asc'}
                  onClick={() => handleRequestSort('PTHNUM_0')}
                  sx={{ color: '#fff' }}
                >
                  Receipt Number
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>
                <TableSortLabel
                  active={orderBy === 'BPSNDE_0'}
                  direction={orderBy === 'BPSNDE_0' ? order : 'asc'}
                  onClick={() => handleRequestSort('BPSNDE_0')}
                  sx={{ color: '#fff' }}
                >
                  Invoice Number
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>
                <TableSortLabel
                  active={orderBy === 'RCPDAT_0'}
                  direction={orderBy === 'RCPDAT_0' ? order : 'asc'}
                  onClick={() => handleRequestSort('RCPDAT_0')}
                  sx={{ color: '#fff' }}
                >
                  Receipt Date
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedData.map((row, index) => (
              <TableRow key={index} sx={{ '&:hover': { backgroundColor: '#3a3a3a' } }}>
                <TableCell sx={{ color: '#ccc' }}>{row.PTHNUM_0}</TableCell>
                <TableCell sx={{ color: '#ccc' }}>{row.BPSNDE_0}</TableCell>
                <TableCell sx={{ color: '#ccc' }}>{row.RCPDAT_0}</TableCell>
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
