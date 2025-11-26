# XFeature Components

A comprehensive React component system for rendering dynamic UIs based on XFeature specifications. XFeature is a full-stack XML-driven development framework that enables you to define both backend queries and frontend forms/tables in a single unified XML file.

## Overview

XFeature components automatically generate React UIs from XFeature definitions, supporting:
- **DataTables**: Dynamic tables with pagination, sorting, filtering
- **Forms**: Dynamic forms with validation, multiple modes (Create, Edit, View, Delete, Search)
- **Fields**: 15+ field types (Text, Email, Select, Checkbox, Date, etc.)
- **Buttons & Messages**: Styled components for form actions and feedback

## Architecture

### Type System (`types/xfeature.ts`)

Core types representing the XFeature specification:
- `XFeature`: Root feature definition
- `Backend`: Query and Action definitions
- `Frontend`: DataTable and Form definitions
- `Field`, `Column`, `Button`, `Message`: Component definitions

### Context & Hooks (`contexts/XFeatureContext.tsx`)

State management for XFeature definitions and API calls:
- `XFeatureProvider`: Context provider for managing XFeature state
- `useXFeature()`: Access XFeature context
- `useXFeatureDefinition()`: Load feature definition
- `useXFeatureQuery()`: Execute SELECT queries
- `useXFeatureAction()`: Execute INSERT/UPDATE/DELETE actions

### Components

#### 1. **XFeatureField** (`XFeatureField.tsx`)
Renders individual form fields with support for multiple types:
- Text, Email, Password, Number, Decimal
- Date, DateTime, Time
- Select, MultiSelect, Checkbox, Radio
- Textarea, Currency, Phone, URL, File
- Hidden

**Props:**
```typescript
interface XFeatureFieldProps {
  definition: Field;
  value?: string | number | boolean;
  onChange: (value: string | number | boolean) => void;
  onBlur?: () => void;
  errors?: string[];
}
```

**Usage:**
```tsx
<XFeatureField
  definition={{
    name: 'email',
    label: 'Email',
    type: 'Email',
    required: true,
  }}
  value={email}
  onChange={setEmail}
  errors={validationErrors}
/>
```

#### 2. **XFeatureButton** (`XFeatureButton.tsx`)
Renders styled buttons with different types and styles:
- Types: Submit, Cancel, Reset, Close, Custom
- Styles: Primary, Secondary, Danger, Success, Warning, Info

**Props:**
```typescript
interface XFeatureButtonProps {
  definition: Button;
  onClick?: () => void;
  loading?: boolean;
}
```

**Usage:**
```tsx
<XFeatureButton
  definition={{
    type: 'Submit',
    label: 'Save',
    style: 'Primary',
  }}
  onClick={handleSubmit}
  loading={isSubmitting}
/>
```

#### 3. **XFeatureMessage** (`XFeatureMessage.tsx`)
Renders alert/notification messages:
- Types: Info, Warning, Error, Success
- Support for conditional visibility

**Props:**
```typescript
interface XFeatureMessageProps {
  definition: Message;
}
```

**Usage:**
```tsx
<XFeatureMessage
  definition={{
    type: 'Success',
    content: 'Changes saved successfully',
  }}
/>
```

#### 4. **XFeatureForm** (`XFeatureForm.tsx`)
Dynamic form component supporting multiple modes:
- **Create**: New record creation
- **Edit**: Update existing record
- **View**: Read-only display
- **Delete**: Deletion confirmation
- **Search**: Search/filter interface

**Props:**
```typescript
interface XFeatureFormProps {
  definition: Form;
  featureName: string;
  initialData?: Record<string, unknown>;
  onSuccess?: (data: ActionResponse) => void;
  onCancel?: () => void;
  onClose?: () => void;
}
```

**Features:**
- Automatic field rendering
- Form validation
- Dialog or inline rendering
- Loading states
- Error handling

**Usage:**
```tsx
<XFeatureForm
  definition={formDefinition}
  featureName="user-management"
  initialData={userData}
  onSuccess={() => console.log('Form submitted')}
/>
```

#### 5. **XFeatureDataTable** (`XFeatureDataTable.tsx`)
Dynamic data table component with:
- Pagination
- Sorting
- Filtering
- Row actions (triggered by form interactions)
- Customizable columns

**Props:**
```typescript
interface XFeatureDataTableProps {
  definition: DataTable;
  featureName: string;
  onRowAction?: (formId: string, rowData: Record<string, unknown>) => void;
  onRefresh?: () => void;
}
```

**Usage:**
```tsx
<XFeatureDataTable
  definition={tableDefinition}
  featureName="user-management"
  onRowAction={(formId, rowData) => {
    // Handle row action (e.g., show edit form)
  }}
/>
```

#### 6. **XFeaturePageBuilder** (`XFeaturePageBuilder.tsx`)
High-level component that automatically builds complete pages:
- Loads feature definition
- Renders all datatable and forms
- Handles form-datatable integration

**Variants:**
- `XFeaturePageBuilder`: Complete page with all components
- `XFeatureDataTableOnly`: Only datatable
- `XFeatureFormOnly`: Only specific form

**Usage:**
```tsx
// Full page with datatable and forms
<XFeaturePageBuilder featureName="user-management" />

// Just the datatable
<XFeatureDataTableOnly
  featureName="user-management"
  tableId="users-table"
/>

// Just a specific form
<XFeatureFormOnly
  featureName="user-management"
  formId="create-user-form"
/>
```

## Validation

The validation utility (`utils/validation.ts`) provides:
- Required field validation
- Type-specific validation (Email, Phone, URL, Date, etc.)
- Pattern-based validation
- Custom validation rules

**Usage:**
```typescript
import { validateFormField, validateFormFields } from '@/utils/validation';

const validation = validateFormField(field, value);
if (!validation.valid) {
  console.log('Errors:', validation.errors);
}
```

## Formatting

The format utility (`utils/format.ts`) handles:
- Date/DateTime formatting
- Currency formatting
- Number formatting
- Phone number formatting
- Boolean display
- Link/Image rendering

**Usage:**
```typescript
import { formatCellValue } from '@/utils/format';

const formatted = formatCellValue(value, 'Currency');
```

## Quick Start

### 1. Setup Provider

Wrap your app with the XFeatureProvider:

```tsx
import { XFeatureProvider } from '@/contexts/XFeatureContext';

function App() {
  return (
    <XFeatureProvider>
      <YourApp />
    </XFeatureProvider>
  );
}
```

### 2. Use Components

```tsx
import { XFeaturePageBuilder } from '@/components/xfeature';

export function UserManagementPage() {
  return (
    <XFeaturePageBuilder
      featureName="user-management-sample"
    />
  );
}
```

### 3. Or Use Custom Hooks

```tsx
import { useXFeatureDefinition, useXFeatureQuery, useXFeatureAction } from '@/contexts/XFeatureContext';

function MyComponent() {
  const { feature, loading, error } = useXFeatureDefinition('user-management');
  const { data, refetch } = useXFeatureQuery('user-management', 'ListUsers');
  const { execute } = useXFeatureAction('user-management', 'CreateUser');

  // Use data, refetch, execute...
}
```

## Example: Complete User Management

```xml
<!-- user-management.xml -->
<XFeature name="user-management" version="1.9">
  <Backend>
    <Query id="ListUsers" type="Select">
      SELECT * FROM users WHERE status = :status
    </Query>
    <ActionQuery id="CreateUser" type="Insert">
      INSERT INTO users (username, email) VALUES (:username, :email)
    </ActionQuery>
  </Backend>

  <Frontend>
    <DataTable id="users-table" queryRef="ListUsers" title="Users">
      <Column name="id" label="ID" type="Number" />
      <Column name="username" label="Username" type="Text" />
      <Column name="email" label="Email" type="Email" />
      <Column name="status" label="Status" type="Badge" />
    </DataTable>

    <Form id="create-form" mode="Create" actionRef="CreateUser" dialog="true">
      <Field name="username" label="Username" type="Text" required="true" />
      <Field name="email" label="Email" type="Email" required="true" />
      <Button type="Submit" label="Create" style="Primary" />
      <Button type="Cancel" style="Secondary" />
    </Form>
  </Frontend>
</XFeature>
```

```tsx
import { XFeaturePageBuilder } from '@/components/xfeature';

export function UserManagementPage() {
  return <XFeaturePageBuilder featureName="user-management" />;
}
```

## Testing

All components include comprehensive tests using Vitest and React Testing Library:

```bash
npm test
```

Test files:
- `XFeatureButton.test.tsx`
- `XFeatureField.test.tsx`
- `XFeatureMessage.test.tsx`
- `validation.test.ts`

## Storybook

View components in Storybook:

```bash
npm run storybook
```

Story files:
- `XFeatureButton.stories.tsx`
- `XFeatureField.stories.tsx`
- `XFeatureMessage.stories.tsx`

## API Integration

The components automatically integrate with the XFeature API:

```
GET    /api/v1/xfeatures                          # List features
GET    /api/v1/xfeatures/:name                    # Get feature definition
POST   /api/v1/xfeatures/:name/queries/:queryId   # Execute query
POST   /api/v1/xfeatures/:name/actions/:actionId  # Execute action
```

API functions in `services/api.ts`:
- `getXFeatures()`: List available features
- `getXFeature(name)`: Get feature definition
- `executeXFeatureQuery(featureName, queryId, params)`: Execute SELECT query
- `executeXFeatureAction(featureName, actionId, params)`: Execute INSERT/UPDATE/DELETE

## Best Practices

1. **Always use XFeatureProvider** at the root of your app
2. **Leverage useXFeatureDefinition** to load feature definitions once
3. **Use XFeaturePageBuilder** for quick integration
4. **Customize with XFeatureDataTableOnly/FormOnly** for specific use cases
5. **Validate early** with the validation utility
6. **Test components** with provided test files as examples

## Feature Support

### Column Types
- Text, Number, Date, DateTime, Boolean
- Currency, Percentage, Link, Badge, Image
- Email, Phone, URL

### Field Types
- Text, Email, Password, Number, Decimal
- Date, DateTime, Time
- Select, MultiSelect, Checkbox, Radio
- Textarea, Currency, Phone, URL, File, Hidden

### Form Modes
- Create, Edit, View, Delete, Search

### Button Types
- Submit, Cancel, Reset, Close, Custom

### Button Styles
- Primary, Secondary, Danger, Success, Warning, Info

### Message Types
- Info, Warning, Error, Success

## Contributing

To add new field types or customize behavior:

1. Update types in `types/xfeature.ts`
2. Add field rendering in `XFeatureField.tsx`
3. Add validation in `utils/validation.ts`
4. Add formatting in `utils/format.ts`
5. Add tests and stories
6. Update this README

## License

Part of xpanel project
