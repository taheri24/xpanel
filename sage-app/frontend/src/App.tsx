import React, { useEffect, useState } from 'react'
import {
  Container,
  Paper,
  Tabs,
  Tab,
  Box,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  useTheme as useMuiTheme
} from '@mui/material'
import { Brightness4, Brightness7 } from '@mui/icons-material'
import { useTheme } from './context/ThemeProvider'
import { apiService, Invoice, Receipt, LineItem } from './services/api.config'
import InvoicesTable from './components/InvoicesTable'
import ReceiptsTable from './components/ReceiptsTable'
import LineItemsTable from './components/LineItemsTable'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  )
}

function AppContent() {
  const [tabValue, setTabValue] = useState(0)
  const { mode, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme()

  // Tab and selection state
  const [invoiceRef, setInvoiceRef] = useState('');
  const [receiptRef, setReceiptRef] = useState('');

  // Invoices data state
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [invoicesLoading, setInvoicesLoading] = useState(true)
  const [invoicesError, setInvoicesError] = useState<string | null>(null)

  // Receipts data state
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [receiptsLoading, setReceiptsLoading] = useState(true)
  const [receiptsError, setReceiptsError] = useState<string | null>(null)

  // Line items data state
  const [lineItems, setLineItems] = useState<LineItem[]>([])
  const [lineItemsLoading, setLineItemsLoading] = useState(true)
  const [lineItemsError, setLineItemsError] = useState<string | null>(null)

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  // Fetch invoices on component mount
  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    setInvoicesLoading(true)
    setInvoicesError(null)
    try {
      const data = await apiService.getInvoices()
      setInvoices(data)
    } catch (err) {
      setInvoicesError(err instanceof Error ? err.message : 'Failed to fetch invoices')
      console.error(err)
    } finally {
      setInvoicesLoading(false)
    }
  }

  // Fetch receipts when invoiceRef changes
  useEffect(() => {
    if (invoiceRef) {
      fetchReceipts()
    }
  }, [invoiceRef])

  const fetchReceipts = async () => {
    setReceiptsLoading(true)
    setReceiptsError(null)
    try {
      const data = await apiService.getReceipts(invoiceRef)
      setReceipts(data)
    } catch (err) {
      setReceiptsError(err instanceof Error ? err.message : 'Failed to fetch receipts')
      console.error(err)
    } finally {
      setReceiptsLoading(false)
    }
  }

  // Fetch line items when receiptRef changes
  useEffect(() => {
    if (receiptRef) {
      fetchLineItems()
    }
  }, [receiptRef])

  const fetchLineItems = async () => {
    setLineItemsLoading(true)
    setLineItemsError(null)
    try {
      const data = await apiService.getLineItems(receiptRef)
      setLineItems(data)
    } catch (err) {
      setLineItemsError(err instanceof Error ? err.message : 'Failed to fetch line items')
      console.error(err)
    } finally {
      setLineItemsLoading(false)
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar sx={{background:'#333'}}>
          <Typography variant="h6"  color='green' component="div" sx={{ flexGrow: 1 }}>
          SAGE X3 E-Purchase invoice
          </Typography>
          <IconButton
            onClick={toggleTheme}
            color="inherit"
            aria-label={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
            sx={{
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'rotate(20deg)',
              },
            }}
          >
            {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4, flex: 1 }}>
        <Paper
          sx={{
            backgroundColor: muiTheme.palette.background.paper,
            borderRadius: 2,
            boxShadow: muiTheme.palette.mode === 'light' ? '0 2px 8px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="invoice data tables"
            sx={{
              borderBottom: `1px solid ${muiTheme.palette.divider}`,
              backgroundColor: muiTheme.palette.mode === 'light' ? '#f5f5f5' : '#2a2a2a',
            }}
          >
            {/*Tab1 = Received invoices  Tab2= Pending Receipts and POs   Tab3: Mapping Items*/}
            <Tab label="Received invoices" id="tab-0" aria-controls="tabpanel-0" />
            <Tab label={(!!invoiceRef ? '✅ '  : '' )+"Pending Receipts and POs"}   id="tab-1" aria-controls="tabpanel-1" />
            <Tab label={(!!receiptRef? '✅ ' : '' )+"Mapping Items"}   id="tab-2" aria-controls="tabpanel-2" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <InvoicesTable
              data={invoices}
              loading={invoicesLoading}
              error={invoicesError}
              onRetry={fetchInvoices}
              setRef={setInvoiceRef}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <ReceiptsTable
              data={receipts}
              loading={receiptsLoading}
              error={receiptsError}
              onRetry={fetchReceipts}
              setReceiptRef={setReceiptRef}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <LineItemsTable
              data={lineItems}
              data2={lineItems}
              loading={lineItemsLoading}
              error={lineItemsError}
              onRetry={fetchLineItems}
            />
          </TabPanel>
        </Paper>
      </Container>
    </Box>
  )
}

export default function App() {
  return <AppContent />
}
