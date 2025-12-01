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

interface LineItem {
  ITMREF_0: string
  ITMDES_0: string
  QTYSTU_0: number
  loc: string
}

// Sample data
const SAMPLE_LINE_ITEMS: LineItem[] = [
  {
    ITMREF_0: 'ITEM-001',
    ITMDES_0: 'Office Supplies',
    QTYSTU_0: 100,
    loc: 'Recipt_Sage'
  },
  {
    ITMREF_0: 'ITEM-002',
    ITMDES_0: 'Electronic Equipment',
    QTYSTU_0: 5,
    loc: 'Recipt_Sage'
  },
  {
    ITMREF_0: 'ITEM-003',
    ITMDES_0: 'Consulting Services',
    QTYSTU_0: 40,
    loc: 'Recived_Invoice_Portal'
  },
  {
    ITMREF_0: 'ITEM-004',
    ITMDES_0: 'Software Licenses',
    QTYSTU_0: 25,
    loc: 'Recipt_Sage'
  },
  {
    ITMREF_0: 'ITEM-005',
    ITMDES_0: 'Hardware Components',
    QTYSTU_0: 15,
    loc: 'Recived_Invoice_Portal'
  }
]

type Order = 'asc' | 'desc'

export default function LineItemsTable() {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [order, setOrder] = useState<Order>('asc')
  const [orderBy, setOrderBy] = useState<string>('ITMREF_0')
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

  const filteredData = SAMPLE_LINE_ITEMS.filter(item =>
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
        />
      </Box>
      <TableContainer component={Paper} sx={{ backgroundColor: '#2a2a2a' }}>
        <Table sx={{ minWidth: 750 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#1a1a1a' }}>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>
                <TableSortLabel
                  active={orderBy === 'ITMREF_0'}
                  direction={orderBy === 'ITMREF_0' ? order : 'asc'}
                  onClick={() => handleRequestSort('ITMREF_0')}
                  sx={{ color: '#fff' }}
                >
                  Product Code
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>
                <TableSortLabel
                  active={orderBy === 'ITMDES_0'}
                  direction={orderBy === 'ITMDES_0' ? order : 'asc'}
                  onClick={() => handleRequestSort('ITMDES_0')}
                  sx={{ color: '#fff' }}
                >
                  Product Description
                </TableSortLabel>
              </TableCell>
              <TableCell align="right" sx={{ color: '#fff', fontWeight: 'bold' }}>
                <TableSortLabel
                  active={orderBy === 'QTYSTU_0'}
                  direction={orderBy === 'QTYSTU_0' ? order : 'asc'}
                  onClick={() => handleRequestSort('QTYSTU_0')}
                  sx={{ color: '#fff' }}
                >
                  Quantity
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>
                <TableSortLabel
                  active={orderBy === 'loc'}
                  direction={orderBy === 'loc' ? order : 'asc'}
                  onClick={() => handleRequestSort('loc')}
                  sx={{ color: '#fff' }}
                >
                  Source
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedData.map((row, index) => (
              <TableRow key={index} sx={{ '&:hover': { backgroundColor: '#3a3a3a' } }}>
                <TableCell sx={{ color: '#ccc' }}>{row.ITMREF_0}</TableCell>
                <TableCell sx={{ color: '#ccc' }}>{row.ITMDES_0}</TableCell>
                <TableCell align="right" sx={{ color: '#ccc' }}>{row.QTYSTU_0}</TableCell>
                <TableCell sx={{ color: '#ccc' }}>{row.loc}</TableCell>
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
