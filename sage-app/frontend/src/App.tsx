import React, { useState } from 'react'
import {
  Container,
  Paper,
  Tabs,
  Tab,
  Box,
  Typography,
  AppBar,
  Toolbar
} from '@mui/material'
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

export default function App() {
  const [tabValue, setTabValue] = useState(0)

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Sage Invoice Comparison
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
        <Paper sx={{ backgroundColor: '#333', borderRadius: 2 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="invoice data tables"
            sx={{
              borderBottom: '1px solid #555',
              backgroundColor: '#2a2a2a'
            }}
          >
            <Tab label="Invoices" id="tab-0" aria-controls="tabpanel-0" />
            <Tab label="Receipts" id="tab-1" aria-controls="tabpanel-1" />
            <Tab label="Line Items" id="tab-2" aria-controls="tabpanel-2" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <InvoicesTable />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <ReceiptsTable />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <LineItemsTable />
          </TabPanel>
        </Paper>
      </Container>
    </Box>
  )
}
