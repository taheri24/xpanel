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

## Switching Between Real and Mock API

### Option 1: Create an environment-based API selector

Create a new file `api.config.ts`:

```typescript
import { apiService } from './api'
import { mockApiService } from './api.mock'

const USE_MOCK_API = process.env.REACT_APP_USE_MOCK_API === 'true'

export const api = USE_MOCK_API ? mockApiService : apiService
```

Then use in components:
```typescript
import { api } from '../services/api.config'

const invoices = await api.getInvoices()
```

### Option 2: Manual switching in components

In development, temporarily import mock service:

```typescript
// Comment out real API
// import { apiService } from '../services/api'

// Use mock API instead
import { mockApiService as apiService } from '../services/api.mock'
```

### Option 3: Environment variable approach (Recommended)

Add to `.env` file:
```
REACT_APP_USE_MOCK_API=true
```

Then create `api.config.ts`:

```typescript
import { apiService } from './api'
import { mockApiService } from './api.mock'

const API = process.env.REACT_APP_USE_MOCK_API === 'true' ? mockApiService : apiService

export { API }
```

Update `.env.example`:
```
REACT_APP_API_URL=http://localhost:8000/api/v1/x
REACT_APP_USE_MOCK_API=false
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
