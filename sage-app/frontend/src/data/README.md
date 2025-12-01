# Mock Data Files

This directory contains JSON files with mock data used by the mock API service for development and testing.

## Files

### `mock-invoices.json`
Contains sample invoice data from the PUR_INVH table.

**Schema:**
```json
{
  "satici_vergiNo": "string",      // Vendor tax ID
  "faturaNo": "string",            // Invoice number
  "faturaTarihi": "string",        // Invoice date (YYYY-MM-DD)
  "faturaTuru": "string",          // Invoice type (Standard, Credit, Debit)
  "faturaTipi": "string",          // Invoice category
  "paraBirimi": "string",          // Currency (TRY, USD, EUR)
  "Toplam": "number",              // Total goods/services
  "vergi": "number",               // Tax amount
  "odenecekTutar": "number"        // Total amount payable
}
```

**Current Sample Data:**
- 5 invoices (INV-001 to INV-005)
- Multiple currencies: TRY, USD, EUR
- Various amounts and tax calculations

### `mock-receipts.json`
Contains sample receipt records from the sagedbLIVEPRECEIPT table.

**Schema:**
```json
{
  "PTHNUM_0": "string",            // Receipt number
  "BPSNDE_0": "string",            // Invoice number (links to invoices)
  "RCPDAT_0": "string"             // Receipt date (YYYY-MM-DD)
}
```

**Current Sample Data:**
- 5 receipts (RCP-2024-001 to RCP-2024-005)
- Linked to invoice numbers
- Matching dates with invoices

### `mock-line-items.json`
Contains sample line items from both Sage (sagedbLIVEPRECEIPTD) and Portal (PUR_INVD) sources.

**Schema:**
```json
{
  "ITMREF_0": "string",            // Product/item code
  "ITMDES_0": "string",            // Product/item description
  "QTYSTU_0": "number",            // Quantity
  "loc": "string"                  // Source location (Recipt_Sage or Recived_Invoice_Portal)
}
```

**Current Sample Data:**
- 8 line items (ITEM-001 to ITEM-008)
- Mixed sources: Sage and Portal
- Various product types and quantities

## Usage

The mock data is imported in `src/services/api.mock.ts`:

```typescript
import mockInvoices from '../data/mock-invoices.json'
import mockReceipts from '../data/mock-receipts.json'
import mockLineItems from '../data/mock-line-items.json'
```

## Adding or Modifying Mock Data

To add or modify mock data:

1. Edit the corresponding JSON file
2. Ensure data structure matches the schema
3. The changes will automatically be picked up by the mock API service
4. No need to rebuild - Vite will hot-reload the changes

## Testing with Different Data

To test with different mock data:

1. Create a new JSON file in this directory
2. Import it in `api.mock.ts`
3. Use it in the mock service methods

Example:
```typescript
import alternativeInvoices from '../data/alternative-invoices.json'
const MOCK_INVOICES = process.env.REACT_APP_USE_ALTERNATIVE_DATA
  ? alternativeInvoices
  : mockInvoices
```

## Notes

- All timestamps should be in `YYYY-MM-DD` format
- Currency codes follow ISO 4217 standard (TRY, USD, EUR, etc.)
- Numeric fields use decimal notation (e.g., 1000.00)
- Location strings should match expected values: `Recipt_Sage` or `Recived_Invoice_Portal`
- Keep file sizes reasonable for fast loading during development
