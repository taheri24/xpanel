import React, { useState } from 'react'
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
  const { mode, toggleTheme } = useTheme()
  const muiTheme = useMuiTheme()

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Sage Invoice Comparison
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

      <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
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

export default function App() {
  return <AppContent />
}
