# Sage Invoice Comparison Application

This directory contains the complete implementation of the Sage Invoice Comparison application, including XML feature definitions and a React frontend for data visualization.

## Directory Structure

```
sage-app/
├── x/                              # XFeature XML definitions
│   ├── SageInvoices.xml           # Invoice data table definition
│   ├── SageReceipt.xml            # Sage receipt data table definition
│   └── SageLines.xml              # Line items data table definition
│
└── frontend/                       # React application
    ├── src/
    │   ├── components/            # React components
    │   │   ├── InvoicesTable.tsx   # Invoices data table
    │   │   ├── ReceiptsTable.tsx   # Receipts data table
    │   │   └── LineItemsTable.tsx  # Line items data table
    │   ├── App.tsx                # Main application component
    │   ├── index.tsx              # Application entry point
    │   └── index.css              # Global styles
    ├── index.html                 # HTML template
    ├── vite.config.ts             # Vite configuration
    ├── tsconfig.json              # TypeScript configuration
    ├── package.json               # Dependencies and scripts
    └── .gitignore
```

## XFeature Definitions

The `x/` directory contains three XFeature.xml files that define the backend queries and frontend table structures:

### SageInvoices.xml
- **Purpose**: Manages purchase invoice data
- **Backend Queries**:
  - `ListInvoices`: Retrieves all invoices with tax and payment details
  - `GetInvoiceDetails`: Gets a single invoice by number
- **Frontend**: `InvoicesTable` DataTable with sorting and pagination

### SageReceipt.xml
- **Purpose**: Manages Sage receipt records
- **Backend Queries**:
  - `ListReceipts`: Retrieves all receipt records
  - `GetReceiptDetails`: Gets receipt details by invoice number
- **Frontend**: `ReceiptsTable` DataTable with sorting and pagination

### SageLines.xml
- **Purpose**: Manages invoice line items from both Sage and Portal sources
- **Backend Queries**:
  - `ListLineItems`: Retrieves combined line items with UNION
  - `GetLineItemsByInvoice`: Gets line items for a specific invoice
- **Frontend**: `LineItemsTable` DataTable with sorting and pagination

## React Frontend

The frontend is built with React, TypeScript, and Material-UI (MUI).

### Features
- Three DataTables with sample data
- Tab-based navigation between tables
- Sorting by clicking column headers
- Pagination with customizable page size
- Search/filter functionality for each table
- Dark theme styling

### Components

#### App.tsx
Main application component that manages tab state and renders the three data tables.

#### InvoicesTable.tsx
Displays purchase invoice data with columns:
- Vendor Tax ID
- Invoice Number
- Invoice Date
- Invoice Type
- Currency
- Total Goods/Services
- Tax Amount
- Total Payable

#### ReceiptsTable.tsx
Displays Sage receipt records with columns:
- Receipt Number
- Invoice Number
- Receipt Date

#### LineItemsTable.tsx
Displays line items from both Sage and Portal invoices with columns:
- Product Code
- Product Description
- Quantity
- Source (Sage or Portal)

### API Service

The frontend includes a complete API service (`src/services/api.ts`) that handles all communication with the backend. The service provides the following functions:

- `apiService.getInvoices()` - Fetch all invoices
- `apiService.getInvoiceDetails(invoiceNo)` - Fetch single invoice
- `apiService.getReceipts()` - Fetch all receipts
- `apiService.getReceiptDetails(invoiceNo)` - Fetch single receipt
- `apiService.getLineItems()` - Fetch all line items
- `apiService.getLineItemsByInvoice(invoiceNo)` - Fetch line items for invoice

Each component uses React hooks (`useEffect`, `useState`) to:
- Fetch data on mount
- Manage loading and error states
- Display loading spinner while fetching
- Show error alerts with retry button
- Disable search while loading

### API Configuration

Configure the API endpoint by creating a `.env` file in the `frontend` directory:

```bash
cd frontend
cp .env.example .env
```

Then edit `.env` and set the API URL:
```
REACT_APP_API_URL=http://localhost:8000/api/v1/x
```

### Required API Endpoints

The backend API should provide the following endpoints under `/api/v1/x/`:

#### Invoices
- `GET /api/v1/x/invoices` - List all invoices
- `GET /api/v1/x/invoices/:invoiceNo` - Get single invoice details

#### Receipts
- `GET /api/v1/x/receipts` - List all receipts
- `GET /api/v1/x/receipts/:invoiceNo` - Get receipt details by invoice number

#### Line Items
- `GET /api/v1/x/line-items` - List all line items
- `GET /api/v1/x/line-items/:invoiceNo` - Get line items for specific invoice

All endpoints should return responses in this format:
```json
{
  "success": true,
  "data": [...],
  "message": "optional success message"
}
```

On error:
```json
{
  "success": false,
  "error": "error message"
}
```

### Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

The application will start on `http://localhost:3000`.

### Building for Production

```bash
cd frontend
npm run build
```

Output files will be in the `dist/` directory.

## Data Sources

The application queries are designed to work with the following SQL Server tables:
- `[TR-EDOCS].[dbo].[PUR_INVH]`: Purchase invoice headers
- `[TR-EDOCS].[dbo].[PUR_INVD]`: Purchase invoice detail lines
- `[TR-EDOCS].[dbo].[sagedbLIVEPRECEIPT]`: Sage receipt headers
- `[TR-EDOCS].[dbo].[sagedbLIVEPRECEIPTD]`: Sage receipt detail lines

## Notes

- API calls are fully integrated with error handling and loading states
- Tables support sorting, pagination, and searching
- All data tables use MUI's standard DataTable components
- Features error alerts with retry functionality
- Loading spinners display while fetching data
- Full TypeScript type safety for API responses
- Environment-based API URL configuration
