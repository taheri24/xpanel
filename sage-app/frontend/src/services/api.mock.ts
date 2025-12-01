import { Invoice, Receipt, LineItem } from './api'
import mockInvoices from '../data/mock-invoices.json'
import mockReceipts from '../data/mock-receipts.json'
import mockLineItems from '../data/mock-line-items.json'

// Type casting for JSON imports
const MOCK_INVOICES: Invoice[] = mockInvoices
const MOCK_RECEIPTS: Receipt[] = mockReceipts
const MOCK_LINE_ITEMS: LineItem[] = mockLineItems

// Simulated delay for realistic API behavior
const delay = (ms: number = 800): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Mock API Service
export const mockApiService = {
  // Invoices API
  async getInvoices(): Promise<Invoice[]> {
    await delay()
    return [...MOCK_INVOICES]
  },

  async getInvoiceDetails(invoiceNo: string): Promise<Invoice | null> {
    await delay()
    return MOCK_INVOICES.find(inv => inv.faturaNo === invoiceNo) || null
  },

  // Receipts API
  async getReceipts(): Promise<Receipt[]> {
    await delay()
    return [...MOCK_RECEIPTS]
  },

  async getReceiptDetails(invoiceNo: string): Promise<Receipt | null> {
    await delay()
    return MOCK_RECEIPTS.find(rcp => rcp.BPSNDE_0 === invoiceNo) || null
  },

  // Line Items API
  async getLineItems(): Promise<LineItem[]> {
    await delay()
    return [...MOCK_LINE_ITEMS]
  },

  async getLineItemsByInvoice(invoiceNo: string): Promise<LineItem[]> {
    await delay()
    // Filter line items that match the invoice (simplified logic)
    return MOCK_LINE_ITEMS.slice(0, Math.ceil(MOCK_LINE_ITEMS.length / 2))
  },
}

// Export for use in development
export default mockApiService
