# xpanel Frontend

Frontend application for xpanel built with React, TypeScript, and Vite.

## Tech Stack

- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Router**: TanStack Router
- **UI Library**: Material-UI (MUI)
- **HTTP Client**: ky.js
- **Testing**: Vitest + React Testing Library
- **Component Development**: Storybook

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   └── Button/
│   │       ├── Button.tsx
│   │       ├── Button.stories.tsx
│   │       ├── Button.test.tsx
│   │       └── index.ts
│   ├── pages/               # Page components
│   │   ├── HomePage.tsx
│   │   ├── UsersPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── services/            # API services
│   │   └── api.ts
│   ├── theme/               # MUI theme configuration
│   │   └── theme.ts
│   ├── test/                # Test setup
│   │   └── setup.ts
│   ├── App.tsx              # Root component
│   ├── main.tsx             # Entry point
│   └── router.tsx           # Router configuration
├── .storybook/              # Storybook configuration
├── public/                  # Static assets
├── .env.example             # Environment variables example
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Prerequisites

- Node.js 18+ or higher
- npm or yarn

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd xpanel/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API endpoint
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## Available Scripts

### Development

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint
```

### Testing

```bash
npm run test             # Run tests in watch mode
npm run test:ui          # Run tests with UI
npm run test:coverage    # Run tests with coverage report
```

### Storybook

```bash
npm run storybook        # Start Storybook dev server
npm run build-storybook  # Build Storybook for production
```

## Environment Variables

### Development

In development mode, API requests are proxied through Vite's dev server. The proxy configuration in `vite.config.ts` forwards:
- `/api/v1/*` → `http://localhost:8080/api/v1/*`
- `/health` → `http://localhost:8080/health`
- `/ready` → `http://localhost:8080/ready`

No environment variables are required for development.

### Production

For production builds, you can optionally configure the API base URL:

| Variable            | Description                | Example                          |
|---------------------|----------------------------|----------------------------------|
| VITE_API_BASE_URL   | Backend API base URL       | https://api.example.com          |

If not set, the app will make requests to the same origin where it's hosted.

## Development Guidelines

### Component Structure

All components should follow this structure:

```
ComponentName/
├── ComponentName.tsx          # Component implementation
├── ComponentName.stories.tsx  # Storybook stories
├── ComponentName.test.tsx     # Component tests
└── index.ts                   # Barrel export
```

### React Functional Components

All components **must** use the `React.FC` type:

```typescript
import React from 'react';

interface MyComponentProps {
  title: string;
  onClick?: () => void;
}

const MyComponent: React.FC<MyComponentProps> = ({ title, onClick }) => {
  return (
    <div onClick={onClick}>
      <h1>{title}</h1>
    </div>
  );
};

export default MyComponent;
```

### Writing Tests

Use Vitest and React Testing Library for testing:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    render(<MyComponent title="Test" onClick={handleClick} />);

    await userEvent.click(screen.getByText('Test'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Writing Storybook Stories

Create stories for each component:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import MyComponent from './MyComponent';

const meta: Meta<typeof MyComponent> = {
  title: 'Components/MyComponent',
  component: MyComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MyComponent>;

export const Default: Story = {
  args: {
    title: 'Hello World',
  },
};
```

### API Service

All API calls should go through the `services/api.ts` module, which uses **ky.js** for HTTP requests:

```typescript
import { getUsers, createUser, ApiError } from './services/api';

// In your component or hook
try {
  const users = await getUsers();
  const newUser = await createUser({ username: 'john', email: 'john@example.com' });
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`API Error: ${error.status} - ${error.message}`);
  }
}
```

#### ky.js Benefits

- **Automatic JSON handling**: Request and response bodies are automatically serialized/deserialized
- **Consistent error handling**: All HTTP errors are caught and converted to `ApiError`
- **Type-safe**: Full TypeScript support with generic type parameters
- **Minimal overhead**: Lightweight HTTP client (~2KB gzipped)
- **Better DX**: Cleaner API compared to native fetch

#### Adding New API Endpoints

When adding new endpoints, follow the pattern in `services/api.ts`:

```typescript
import { api } from './api';

export async function newEndpoint(param: string): Promise<YourType> {
  return api.get(`your-path/${param}`).json<YourType>();
}

export async function createResource(data: CreateRequest): Promise<YourType> {
  return api.post('resource', { json: data }).json<YourType>();
}
```

### Routing

Use TanStack Router for navigation:

```typescript
import { Link } from '@tanstack/react-router';

// In your component
<Link to="/users">Go to Users</Link>
```

## XFeature System

The XFeature system enables dynamic UI generation from feature definitions. Features are defined as XML and include backend queries/actions and frontend forms/tables.

### API Endpoints

#### Get Feature Definition
```
GET /api/v1/xfeatures/:name
```

Returns complete XFeature definition including backend queries/actions and frontend forms/tables.

#### Get All Frontend Elements
```
GET /api/v1/xfeatures/:name/frontend
```

Returns only frontend elements (forms and data tables) for a feature. Useful for rendering complete UI without backend logic definitions.

**Response:**
```json
{
  "feature": "user-management",
  "version": "1.0.0",
  "dataTables": [
    {
      "id": "users-table",
      "queryRef": "ListUsers",
      "title": "Users",
      "columns": [
        {
          "name": "id",
          "label": "ID",
          "type": "Number"
        }
      ]
    }
  ],
  "forms": [
    {
      "id": "create-user",
      "mode": "Create",
      "title": "Create User",
      "actionRef": "CreateUser",
      "fields": []
    }
  ]
}
```

### Using XFeature Components

#### Setup Provider

Wrap your app with XFeatureProvider:

```typescript
import { XFeatureProvider } from './contexts/XFeatureContext';
import { createStorybookMockProvider } from './contexts/XFeatureContext.examples';

function App() {
  const mockConfig = createStorybookMockProvider();

  return (
    <XFeatureProvider {...mockConfig}>
      <YourApp />
    </XFeatureProvider>
  );
}
```

#### Render All Frontend Elements

Use XFeatureFrontendRenderer to display all forms and tables for a feature:

```typescript
import { XFeatureFrontendRenderer } from './components/xfeature/XFeatureFrontendRenderer';

function MyPage() {
  return (
    <XFeatureFrontendRenderer
      featureName="user-management"
      onFormSuccess={(formId) => console.log(`Form ${formId} submitted`)}
      onRefresh={(tableId) => console.log(`Table ${tableId} refreshed`)}
    />
  );
}
```

#### Use Custom Hooks

Load and execute queries, actions, and frontend elements:

```typescript
import {
  useXFeatureQuery,
  useXFeatureAction,
  useXFeatureFrontend,
} from './contexts/XFeatureContext';

function MyComponent() {
  // Load data from a query
  const { data, loading, refetch } = useXFeatureQuery(
    'user-management',
    'ListUsers',
    {},
    true // autoLoad
  );

  // Execute an action
  const { execute, loading: actionLoading } = useXFeatureAction(
    'user-management',
    'CreateUser'
  );

  // Load all frontend elements
  const { frontendElements, loading: elementsLoading } = useXFeatureFrontend(
    'user-management'
  );

  return (
    <div>
      {/* Render your UI */}
    </div>
  );
}
```

### Event Customization

Add event handlers for mocking, logging, and custom business logic:

```typescript
import {
  createMockQueryHandler,
  createLoggingActionHandler,
  createErrorLoggingHandler,
} from './contexts/XFeatureContext.examples';

function App() {
  return (
    <XFeatureProvider
      onBeforeQuery={createMockQueryHandler({ id: 1, name: 'Test' })}
      onAfterAction={createLoggingActionHandler()}
      onError={createErrorLoggingHandler()}
    >
      <YourApp />
    </XFeatureProvider>
  );
}
```

#### Available Event Handlers

- **onBeforeQuery**: Called before executing a query (can return mocked response)
- **onAfterQuery**: Called after query completes successfully
- **onBeforeAction**: Called before executing an action (can return mocked response)
- **onAfterAction**: Called after action completes successfully
- **onBeforeFrontend**: Called before loading frontend elements (can return mocked elements)
- **onAfterFrontend**: Called after frontend elements load successfully
- **onError**: Called when any operation fails

## Material-UI (MUI) Usage

### Theme

The application uses a custom MUI theme defined in `src/theme/theme.ts`. All components automatically have access to the theme through the ThemeProvider.

### Using MUI Components

```typescript
import React from 'react';
import { Button, Box, Typography } from '@mui/material';

const MyPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        My Page
      </Typography>
      <Button variant="contained" color="primary">
        Click Me
      </Button>
    </Box>
  );
};

export default MyPage;
```

## Building for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

The build output will be in the `dist/` directory.

## Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Test Coverage

Coverage reports are generated in the `coverage/` directory.

## Storybook

### Running Storybook

```bash
npm run storybook
```

Storybook will be available at `http://localhost:6006`

### Building Storybook

```bash
npm run build-storybook
```

The build output will be in the `storybook-static/` directory.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Copyright © 2025 xpanel. All rights reserved.
