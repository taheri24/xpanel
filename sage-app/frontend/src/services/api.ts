import { GridColDef } from "@mui/x-data-grid"
import React, { useReducer } from "react"

const API_BASE_URL =  '/api/v1'

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
  saticiUrunKodu: string
  urunAdi: string
  miktar: number
  Recived_Invoice_Portal: string
  ITMREF2:string;
  INV_NO:string;
  siraNo:string;
}

export interface ApiResponse<T> {
  success: boolean
  results: T[]
  error?: string;
  message?: string;
  gridColDefs?:Array<GridColDef>;
}
 
	
// API Service Functions
export const apiService = {
  // Invoices API
  async getInvoices(): Promise<ApiResponse<Invoice>> {
    try {
      const response = await fetch(`${API_BASE_URL}/x/SageInvoices/queries/ListInvoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch invoices: ${response.statusText}`)
      }

      const data: ApiResponse<Invoice> = await response.json();
       
      return data || []
    } catch (error) {
      console.error('Error fetching invoices:', error)
      throw error
    }
  },


  // Receipts API
  async getReceipts(ref:string): Promise<ApiResponse<Receipt>> {
    try { 
      const response = await fetch(`${API_BASE_URL}/x/SageReceipt/queries/ListReceipts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body:JSON.stringify({ref})
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch receipts: ${response.statusText}`)
      }

      const data: ApiResponse<Receipt> = await response.json()
       
      return data;
    } catch (error) {
      console.error('Error fetching receipts:', error)
      throw error
    }
  },
 

  // Line Items API
  async getLineItems(ref:string): Promise<ApiResponse<LineItem>> {
    try { 
      const response = await fetch(`${API_BASE_URL}/x/SageLines/queries/ListLineItems`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body:JSON.stringify({ref})
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch line items: ${response.statusText}`)
      }

      const data: ApiResponse<LineItem> = await response.json()
      return data  ;
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
      return data.results || []
    } catch (error) {
      console.error('Error fetching line items:', error)
      throw error
    }
  },
}
