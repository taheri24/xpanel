/**
 * API Configuration
 * Switches between real API and mock API based on REACT_APP_USE_MOCK_API environment variable
 *
 * Usage in components:
 * import { api } from '../services/api.config'
 * const invoices = await api.getInvoices()
 */

import { apiService as backendedApiService } from './api'
import { mockApiService } from './api.mock'

// Check environment variable - defaults to true (use mock API)
// Set to 'false' to use real API, or omit to use mock API
const USE_MOCK_API =true;// process.env.REACT_APP_USE_MOCK_API !== 'false'
// Log which API is being used (helpful for debugging)
if (typeof window !== 'undefined') {
  console.log(
    `%c📡 API Service: ${USE_MOCK_API ? 'MOCK' : 'REAL'}`,
    'color: ' + (USE_MOCK_API ? '#FFA500' : '#00AA00') + '; font-weight: bold; font-size: 12px'
  )
}

// Export the appropriate API service
export const apiService = USE_MOCK_API ? mockApiService : backendedApiService
console.log({USE_MOCK_API,apiService})

export type { Invoice, Receipt, LineItem, ApiResponse } from './api'
