const API_BASE_URL =  '/api/v1/x'

// Types
export interface Invoice {
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

export interface Receipt {
  PTHNUM_0: string
  BPSNDE_0: string
  RCPDAT_0: string
}

export interface LineItem {
  ITMREF_0: string
  ITMDES_0: string
  QTYSTU_0: number
  loc: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T[]
  error?: string
  message?: string
}

// API Service Functions
export const apiService = {
  // Invoices API
  async getInvoices(): Promise<Invoice[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/invoices`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch invoices: ${response.statusText}`)
      }

      const data: ApiResponse<Invoice> = await response.json()
      return data.data || []
    } catch (error) {
      console.error('Error fetching invoices:', error)
      throw error
    }
  },

  async getInvoiceDetails(invoiceNo: string): Promise<Invoice | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/invoices/${invoiceNo}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch invoice details: ${response.statusText}`)
      }

      const data: ApiResponse<Invoice> = await response.json()
      return data.data?.[0] || null
    } catch (error) {
      console.error('Error fetching invoice details:', error)
      throw error
    }
  },

  // Receipts API
  async getReceipts(): Promise<Receipt[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/receipts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch receipts: ${response.statusText}`)
      }

      const data: ApiResponse<Receipt> = await response.json()
      return data.data || []
    } catch (error) {
      console.error('Error fetching receipts:', error)
      throw error
    }
  },

  async getReceiptDetails(invoiceNo: string): Promise<Receipt | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/receipts/${invoiceNo}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch receipt details: ${response.statusText}`)
      }

      const data: ApiResponse<Receipt> = await response.json()
      return data.data?.[0] || null
    } catch (error) {
      console.error('Error fetching receipt details:', error)
      throw error
    }
  },

  // Line Items API
  async getLineItems(): Promise<LineItem[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/line-items`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch line items: ${response.statusText}`)
      }

      const data: ApiResponse<LineItem> = await response.json()
      return data.data || []
    } catch (error) {
      console.error('Error fetching line items:', error)
      throw error
    }
  },

  async getLineItemsByInvoice(invoiceNo: string): Promise<LineItem[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/line-items/${invoiceNo}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch line items: ${response.statusText}`)
      }

      const data: ApiResponse<LineItem> = await response.json()
      return data.data || []
    } catch (error) {
      console.error('Error fetching line items:', error)
      throw error
    }
  },
}
