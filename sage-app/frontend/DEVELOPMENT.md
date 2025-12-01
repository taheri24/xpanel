# Development Guide

## Running with Mock API

For local development without a backend server, use the mock API:

### Step 1: Copy environment file
```bash
cp .env.example .env
```

### Step 2: Enable mock API
Edit `.env`:
```
REACT_APP_USE_MOCK_API=true
REACT_APP_API_URL=http://localhost:8000/api
```

### Step 3: Start development server
```bash
npm run dev
```

The application will now use mock data with realistic 800ms delays to simulate network latency.

## Using the API Configuration

The `src/services/api.config.ts` file provides automatic switching between real and mock APIs:

```typescript
// In your components, import from api.config instead of api
import { api } from '../services/api.config'

// All calls automatically use the configured API
const invoices = await api.getInvoices()
const receipts = await api.getReceipts()
const lineItems = await api.getLineItems()
```

The environment variable `REACT_APP_USE_MOCK_API` controls which API is used:
- `false` (default) = Use real API at `REACT_APP_API_URL`
- `true` = Use mock API with sample data

## Running with Real Backend

### Step 1: Start your backend server
Make sure your backend API is running on the configured URL

### Step 2: Update environment
Ensure `.env` has the correct API URL and mock disabled:
```
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_USE_MOCK_API=false
```

### Step 3: Start development server
```bash
npm run dev
```

## Mock Data Details

When using the mock API, you get:

### Invoices (5 samples)
- INV-001 to INV-005
- Multiple currencies: TRY, USD, EUR
- Various amounts and tax calculations

### Receipts (5 samples)
- RCP-2024-001 to RCP-2024-005
- Linked to invoice numbers

### Line Items (8 samples)
- Mixed Sage and Portal sources
- Various product types and quantities

## Debugging

### Check which API is active
Open browser console - you'll see a log message:
```
📡 API Service: MOCK    (orange color)
📡 API Service: REAL    (green color)
```

### Test error handling
Modify `src/services/api.mock.ts` to simulate errors:

```typescript
async getInvoices(): Promise<Invoice[]> {
  await delay()
  throw new Error('Simulated API error')
}
```

### Network throttling
Mock API includes 800ms delay to simulate real network conditions.
To adjust, edit `src/services/api.mock.ts`:

```typescript
const delay = (ms: number = 500): Promise<void> => { // Change 800 to 500
  return new Promise(resolve => setTimeout(resolve, ms))
}
```

## Building for Production

Before deploying, ensure:
1. `.env` has `REACT_APP_USE_MOCK_API=false`
2. `REACT_APP_API_URL` points to production backend
3. Backend API is running and accessible

```bash
npm run build
```

Output will be in `dist/` directory.

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `REACT_APP_API_URL` | `http://localhost:8000/api` | Backend API endpoint |
| `REACT_APP_USE_MOCK_API` | `false` | Enable mock API for development |

## Troubleshooting

### Components not updating after API change
- Clear browser cache
- Restart development server
- Check environment variables are correct

### Still seeing mock data after disabling mock API
- Verify `.env` file has `REACT_APP_USE_MOCK_API=false`
- Check backend API is running and accessible
- Check `REACT_APP_API_URL` is correct
- Restart development server

### Backend API errors
Check browser console for detailed error messages. The components display error alerts with retry buttons.

## Quick Command Reference

```bash
# Install dependencies
npm install

# Run with development server (uses configured API)
npm run dev

# Run type checking
npm run type-check

# Build for production
npm run build

# Preview production build locally
npm run preview

# Lint code
npm run lint
```
