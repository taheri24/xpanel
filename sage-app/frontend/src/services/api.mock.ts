import { Invoice, Receipt, LineItem, ApiResponse } from './api'

// Mock data
const MOCK_INVOICES: Invoice[] = [
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
  },
  {
    satici_vergiNo: '5566778899',
    faturaNo: 'INV-004',
    faturaTarihi: '2024-11-04',
    faturaTuru: 'Standard',
    faturaTipi: 'Purchase',
    paraBirimi: 'EUR',
    Toplam: 3250.00,
    vergi: 585.00,
    odenecekTutar: 3835.00
  },
  {
    satici_vergiNo: '9988776655',
    faturaNo: 'INV-005',
    faturaTarihi: '2024-11-05',
    faturaTuru: 'Credit',
    faturaTipi: 'Purchase',
    paraBirimi: 'TRY',
    Toplam: 1500.00,
    vergi: 270.00,
    odenecekTutar: 1770.00
  }
]

const MOCK_RECEIPTS: Receipt[] = [
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
  },
  {
    PTHNUM_0: 'RCP-2024-005',
    BPSNDE_0: 'INV-005',
    RCPDAT_0: '2024-11-05'
  }
]

const MOCK_LINE_ITEMS: LineItem[] = [
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
  },
  {
    ITMREF_0: 'ITEM-006',
    ITMDES_0: 'Furniture',
    QTYSTU_0: 8,
    loc: 'Recipt_Sage'
  },
  {
    ITMREF_0: 'ITEM-007',
    ITMDES_0: 'Printing Services',
    QTYSTU_0: 500,
    loc: 'Recived_Invoice_Portal'
  },
  {
    ITMREF_0: 'ITEM-008',
    ITMDES_0: 'Travel & Accommodation',
    QTYSTU_0: 3,
    loc: 'Recipt_Sage'
  }
]

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
