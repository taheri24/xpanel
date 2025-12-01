# API Services

This directory contains the API service layer for the Sage Invoice Comparison application.

## Files

### `api.ts`
Production API service that makes actual HTTP requests to the backend API.

**Usage:**
```typescript
import { apiService } from '../services/api'

const invoices = await apiService.getInvoices()
```

### `api.mock.ts`
Mock API service that returns sample data without making HTTP requests. Useful for development and testing.

**Usage:**
```typescript
import { mockApiService } from '../services/api.mock'

const invoices = await mockApiService.getInvoices()
```

## Switching Between Real and Mock API (Recommended)

The `api.config.ts` file provides automatic switching between real and mock APIs based on environment variables.

### Usage in Components

Import from `api.config`:
```typescript
import { api } from '../services/api.config'

// All calls automatically use the configured API
const invoices = await api.getInvoices()
const receipts = await api.getReceipts()
```

### Configuration

The `REACT_APP_USE_MOCK_API` environment variable controls which API is used:
- `true` (default) = Use mock API with sample data
- `false` = Use real API at `REACT_APP_API_URL`
- Not set = Defaults to mock API (true)

Update `.env` file:
```
REACT_APP_API_URL=http://localhost:8000/api/v1/x
REACT_APP_USE_MOCK_API=true
```

To use real API, set:
```
REACT_APP_USE_MOCK_API=false
```

### Alternative: Manual Switching (Not Recommended)

If you need to manually switch APIs during development:

```typescript
// Use mock API
import { mockApiService as apiService } from '../services/api.mock'

// Or use real API
import { apiService } from '../services/api'

const invoices = await apiService.getInvoices()
```

## Mock Data Features

The mock API service includes:
- **5 sample invoices** with varying currencies (TRY, USD, EUR)
- **5 sample receipts** with matching invoice numbers
- **8 sample line items** from both Sage and Portal sources
- **Realistic delays** (800ms) to simulate network latency

## API Response Format

Both services follow the same interface:

```typescript
// Types from api.ts
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
```

## Development Tips

1. **During development**, use the mock API to avoid dependency on backend
2. **For testing**, mock API provides consistent test data
3. **Before deployment**, ensure all components use real `apiService`
4. **Error handling** - Mock service doesn't throw errors. For error testing, modify the mock service temporarily

## Testing Error States

To test error handling, modify `api.mock.ts`:

```typescript
async getInvoices(): Promise<Invoice[]> {
  await delay()
  throw new Error('Mock API error for testing')
}
```
