# XFeature Web Component Support Specification

**Version**: 1.0.0
**Status**: Draft
**Document Type**: Product Specification (Design Only)
**Last Updated**: November 29, 2025

---

## ⚠️ IMPORTANT NOTICES

### This Document is a SPECIFICATION ONLY
- **NOT** an implementation plan or development roadmap
- **NOT** committed to development
- Serves as a design reference for future consideration
- For architecture discussion and requirements gathering only

### Out of Scope - What This Document Does NOT Cover
- Backend API design or changes
- Database schema modifications
- Server-side implementation details
- Backend XFeature processing logic
- REST/GraphQL endpoint specifications
- Authentication and authorization details

### Assumes
- Current XFeature backend APIs remain unchanged
- Web Components consume existing backend endpoints
- Frontend-only specification and design
- Future implementation may differ significantly from this spec

---

## 1. Executive Summary

This specification defines the architecture and implementation guidelines for extending XFeature's component system to support **Web Components** (Custom Elements) alongside the existing React-based implementation. This enables XFeature to be used in React, Vue, Angular, vanilla JavaScript, and any other web framework or application.

### Goals
- **Framework Agnostic**: Support XFeature components in any JavaScript framework or vanilla JS
- **Zero Dependencies**: Web components work without React, MUI, or other framework dependencies
- **Unified API**: Single XML specification drives both React and Web Component implementations
- **Progressive Enhancement**: Enable gradual migration from React components to Web Components
- **Type Safety**: Maintain TypeScript support and type contracts

### Non-Goals
- Complete feature parity with React components in v1.0 (phase-based rollout)
- Replacing React components in existing projects (coexistence model)
- Custom styling engine (uses CSS Custom Properties and CSS slots)
- Server-side rendering of Web Components

---

## 2. Architecture Overview

### 2.1 Current State (React-only)

```
XFeature XML Definition
        ↓
Backend Handler (Go)
        ↓
XFeatureProvider (React Context)
        ↓
XFeature React Components
  ├── XFeatureFrontendRenderer
  ├── XFeatureDataTable
  ├── XFeatureForm
  ├── XFeatureField
  ├── XFeatureButton
  └── XFeatureMessage
        ↓
MUI (Material-UI) + Emotion CSS
        ↓
Rendered HTML/DOM
```

### 2.2 Proposed Architecture (Multi-Implementation)

```
XFeature XML Definition (Single Source of Truth)
        ↓
┌───────┴────────────────────────┐
│                                │
↓                                ↓
Backend Handler (Go)         Frontend Loader
        ↓                        ↓
    API Endpoints          ┌─────┴─────────┐
    ├── /queries                │             │
    ├── /actions            React      Web Components
    └── /frontendElements    Provider   Custom Elements
                                │             │
                            React Ctx    Shadow DOM
                            Hooks        Attributes/Events
                                │             │
                            React Comps   <x-feature-*>
                            (MUI)         (Framework-agnostic)
                                │             │
                                └─────┬───────┘
                                      ↓
                                  Rendered UI
```

### 2.3 Component Implementation Models

#### Model 1: Wrapper Web Components (v1.0 - Recommended)
- Web Components **wrap** existing React components
- React component rendered inside Web Component shadow DOM
- Requires React in the page (shared library)
- Faster to implement, easier to maintain
- Good for gradual migration

```html
<x-feature-form
  id="user-form"
  feature="UserManagement"
  form-id="CreateForm"
  theme="light"
></x-feature-form>

<!-- Internally renders React component -->
```

#### Model 2: Native Web Components (v2.0 - Future)
- Web Components implemented without React dependency
- Custom Elements with Shadow DOM and LitElement/Lit
- Zero React dependencies
- More complex to implement, full control over implementation
- Ideal for framework-agnostic applications

```html
<!-- Same external API -->
<x-feature-form
  id="user-form"
  feature="UserManagement"
  form-id="CreateForm"
></x-feature-form>

<!-- Internally pure Web Component, no React -->
```

**This specification focuses on Model 1 (v1.0). Model 2 is a future enhancement.**

---

## 3. Web Component Design

### 3.1 Custom Element Naming Convention

All XFeature Web Components follow the **`x-feature-*`** naming convention (required by Web Components standard).

```
<x-feature-renderer>        <!-- Main orchestrator -->
<x-feature-data-table>      <!-- Table component -->
<x-feature-form>            <!-- Form component -->
<x-feature-field>           <!-- Individual field -->
<x-feature-button>          <!-- Button element -->
<x-feature-message>         <!-- Message/alert -->
```

### 3.2 Web Component Lifecycle & Attributes

#### XFeatureRenderer (`<x-feature-renderer>`)
Main orchestrator component that loads and renders all XFeature elements.

**Attributes**:
```html
<x-feature-renderer
  feature="UserManagement"           <!-- Feature name (required) -->
  api-base="/api/v1"                 <!-- API base URL (optional, defaults to /api/v1) -->
  theme="light|dark"                 <!-- Theme variant (optional, default: light) -->
  max-width="1200px"                 <!-- Maximum width (optional) -->
  loading-indicator="spinner|skeleton" <!-- Loading UI (optional) -->
></x-feature-renderer>
```

**Properties** (JavaScript API):
```javascript
const renderer = document.querySelector('x-feature-renderer');

// Get current state
renderer.isLoading          // boolean
renderer.isError           // boolean
renderer.error             // Error | null
renderer.featureDefinition // XFeature object | null

// Methods
renderer.reload()          // Reload feature definition
renderer.setTheme('dark')  // Change theme
renderer.addEventListener('feature-loaded', (e) => {})
renderer.addEventListener('feature-error', (e) => {})
renderer.addEventListener('form-submitted', (e) => {})
renderer.addEventListener('data-refreshed', (e) => {})
```

**Events**:
```
- feature-loaded: Feature definition loaded
- feature-error: Error loading feature
- form-submitted: Form action completed
- form-validation-error: Form validation failed
- data-refreshed: DataTable data refreshed
- form-action: User triggered form action (view/edit/delete)
```

#### XFeatureDataTable (`<x-feature-data-table>`)
Dynamic table based on DataTable definition.

**Attributes**:
```html
<x-feature-data-table
  feature="UserManagement"           <!-- Feature name (required) -->
  table-id="UsersTable"              <!-- Table definition ID (required) -->
  api-base="/api/v1"                 <!-- API base URL (optional) -->
  theme="light|dark"                 <!-- Theme (optional) -->
  page-size="10|25|50|100"           <!-- Rows per page (optional, default: 10) -->
  allow-search="true|false"          <!-- Enable search (optional, default: true) -->
  allow-sort="true|false"            <!-- Enable sorting (optional, default: true) -->
  allow-export="true|false"          <!-- Enable export (optional, default: false) -->
></x-feature-data-table>
```

**Properties**:
```javascript
const table = document.querySelector('x-feature-data-table');

table.isLoading          // boolean
table.isError           // boolean
table.data              // Array of objects
table.currentPage       // number
table.totalPages        // number
table.totalRecords      // number
table.sortField         // string | null
table.sortDirection     // 'asc' | 'desc' | null
table.searchQuery       // string

// Methods
table.reload()
table.setPageSize(25)
table.goToPage(2)
table.sort('name', 'asc')
table.search('query text')
table.export('csv|xlsx|json')
```

**Events**:
```
- data-loaded: Data fetched successfully
- data-error: Error loading data
- page-changed: User changed page
- row-clicked: User clicked a row
- row-action: User triggered row action (edit/view/delete)
- search-changed: User changed search query
- sort-changed: User changed sort column/direction
```

#### XFeatureForm (`<x-feature-form>`)
Dynamic form based on Form definition.

**Attributes**:
```html
<x-feature-form
  feature="UserManagement"           <!-- Feature name (required) -->
  form-id="CreateForm"               <!-- Form definition ID (required) -->
  api-base="/api/v1"                 <!-- API base URL (optional) -->
  theme="light|dark"                 <!-- Theme (optional) -->
  initial-data='{}'                  <!-- JSON string of initial values (optional) -->
  show-reset-button="true|false"     <!-- Show reset button (optional, default: false) -->
  auto-close="true|false"            <!-- Auto-close on success (optional, default: false) -->
></x-feature-form>
```

**Properties**:
```javascript
const form = document.querySelector('x-feature-form');

form.isLoading           // boolean
form.isSubmitting       // boolean
form.isError           // boolean
form.values            // { [key: string]: any }
form.errors            // { [key: string]: string }
form.touched           // { [key: string]: boolean }
form.isDirty           // boolean
form.isValid           // boolean

// Methods
form.reset()
form.setFieldValue('email', 'user@example.com')
form.setFieldError('email', 'Invalid email')
form.submit()
form.clear()
form.setInitialData({ name: 'John', email: 'john@example.com' })
```

**Events**:
```
- form-loaded: Form definition loaded
- field-changed: Field value changed
- field-blurred: Field lost focus
- form-submitted: Form submitted successfully
- form-submission-error: Submission failed
- form-validation-error: Validation failed
- form-reset: Form reset to initial state
```

#### XFeatureField (`<x-feature-field>`)
Individual form input field (used inside Form).

**Attributes**:
```html
<x-feature-field
  name="email"                       <!-- Field name (required) -->
  label="Email Address"              <!-- Display label (required) -->
  type="text|email|number|date|select|textarea|checkbox|radio"
  required="true|false"              <!-- Mark as required (optional, default: false) -->
  placeholder="Enter email..."       <!-- Placeholder text (optional) -->
  disabled="true|false"              <!-- Disable field (optional, default: false) -->
  readonly="true|false"              <!-- Read-only mode (optional, default: false) -->
  value="current value"              <!-- Initial value (optional) -->
  error="Error message"              <!-- Error message (optional) -->
  help-text="Help message"           <!-- Help/hint text (optional) -->
></x-feature-field>
```

**Properties**:
```javascript
const field = document.querySelector('x-feature-field');

field.value                // any
field.error               // string | null
field.isDirty            // boolean
field.isTouched          // boolean
field.isValid            // boolean

// Methods
field.focus()
field.blur()
field.setValue('new value')
field.setError('Invalid input')
field.clearError()
```

**Events**:
```
- field-change: Field value changed
- field-blur: Field lost focus
- field-focus: Field gained focus
- field-input: User typing/interacting
```

#### XFeatureButton (`<x-feature-button>`)
Action button (typically used inside Form).

**Attributes**:
```html
<x-feature-button
  type="submit|cancel|reset|close|custom"  <!-- Button type (required) -->
  label="Save"                              <!-- Display text (required) -->
  variant="primary|secondary|success|danger|warning|info"
  disabled="true|false"                     <!-- Disable button (optional, default: false) -->
  loading="true|false"                      <!-- Show loading state (optional, default: false) -->
  icon="save"                               <!-- Icon name (optional) -->
  full-width="true|false"                   <!-- Full width (optional, default: false) -->
></x-feature-button>
```

**Properties**:
```javascript
const button = document.querySelector('x-feature-button');

button.isLoading      // boolean
button.isDisabled     // boolean

// Methods
button.disable()
button.enable()
button.setLoading(true)
```

**Events**:
```
- button-click: User clicked button
```

#### XFeatureMessage (`<x-feature-message>`)
Information message/alert.

**Attributes**:
```html
<x-feature-message
  type="info|success|warning|error"  <!-- Message type (required) -->
  message="Operation successful"      <!-- Message text (required) -->
  closeable="true|false"              <!-- Show close button (optional, default: true) -->
  auto-dismiss="5000"                 <!-- Auto-dismiss time in ms (optional) -->
></x-feature-message>
```

**Properties**:
```javascript
const message = document.querySelector('x-feature-message');

message.type          // string
message.message       // string

// Methods
message.show()
message.hide()
message.setMessage('New message')
```

**Events**:
```
- message-closed: Message closed
- message-dismissed: Message auto-dismissed
```

---

## 4. API Integration & Data Flow

### 4.1 Data Loading & Caching

**Feature Definition Loading**:
```
Web Component Mount
    ↓
Load from API: GET /api/v1/xfeatures/{feature}/frontend
    ↓
Cache in IndexedDB (optional, configurable)
    ↓
Parse XML/JSON definition
    ↓
Render with current data
```

**Query Execution**:
```
User triggers query (search, pagination, sort)
    ↓
POST /api/v1/xfeatures/{feature}/queries/{queryId}
    ↓
Backend executes SQL with parameters
    ↓
Response formatted according to schema
    ↓
Update component state + emit data-loaded event
```

**Action Execution**:
```
User submits form
    ↓
Validate form fields
    ↓
POST /api/v1/xfeatures/{feature}/actions/{actionId}
    ↓
Backend executes INSERT/UPDATE/DELETE
    ↓
Success: emit form-submitted event, optionally close form
    ↓
Error: emit form-submission-error event, show error messages
```

### 4.2 Request/Response Format

**Query Request**:
```json
{
  "parameters": {
    "status": "active",
    "page": 1,
    "pageSize": 10,
    "sort": { "field": "name", "direction": "asc" },
    "search": "john"
  }
}
```

**Query Response**:
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "John", "email": "john@example.com" },
    { "id": 2, "name": "Jane", "email": "jane@example.com" }
  ],
  "metadata": {
    "totalRecords": 2,
    "totalPages": 1,
    "currentPage": 1,
    "pageSize": 10
  }
}
```

**Action Request**:
```json
{
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "status": "active"
  }
}
```

**Action Response**:
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 123,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

## 5. Styling & Theming

### 5.1 CSS Slots & Shadow DOM

Web Components use **CSS Slots** and **CSS Custom Properties** for styling, avoiding style conflicts with host application.

```css
/* Host application defines theme variables */
:root {
  --xf-color-primary: #2196F3;
  --xf-color-success: #4CAF50;
  --xf-color-error: #f44336;
  --xf-color-warning: #ff9800;

  --xf-spacing-xs: 4px;
  --xf-spacing-sm: 8px;
  --xf-spacing-md: 16px;
  --xf-spacing-lg: 24px;

  --xf-font-family: 'Roboto', sans-serif;
  --xf-font-size-base: 14px;
  --xf-border-radius: 4px;
}

/* Web Component respects theme variables */
x-feature-form::part(form-container) {
  padding: var(--xf-spacing-md);
  background: var(--xf-background-primary);
}

x-feature-button::part(button) {
  background-color: var(--xf-color-primary);
  border-radius: var(--xf-border-radius);
}
```

### 5.2 Slot Usage

```html
<!-- Custom header and footer -->
<x-feature-form
  feature="UserManagement"
  form-id="CreateForm"
>
  <div slot="form-header">
    <h2>Create New User</h2>
  </div>

  <!-- Default slot for form fields renders here -->

  <div slot="form-footer">
    <p>Required fields marked with *</p>
  </div>
</x-feature-form>
```

### 5.3 CSS Parts

Components expose CSS parts for external styling:

```html
<x-feature-form
  feature="UserManagement"
  form-id="CreateForm"
></x-feature-form>

<style>
  x-feature-form::part(form-container) {
    background: white;
    border: 1px solid #ddd;
  }

  x-feature-form::part(form-title) {
    font-size: 20px;
    color: #333;
  }

  x-feature-form::part(form-actions) {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #ddd;
  }

  x-feature-button::part(button) {
    min-width: 100px;
    padding: 10px 20px;
  }
</style>
```

**Available Parts**:
- `form-container`, `form-title`, `form-fields`, `form-actions`
- `field-wrapper`, `field-label`, `field-input`, `field-error`, `field-help`
- `table-container`, `table-header`, `table-body`, `table-footer`
- `button`, `button-label`, `button-icon`
- `message-container`, `message-icon`, `message-text`

---

## 6. Usage Examples

### 6.1 Basic Form Usage

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    :root {
      --xf-color-primary: #2196F3;
      --xf-spacing-md: 16px;
    }
  </style>
</head>
<body>
  <!-- Load Web Component library -->
  <script src="/js/xfeature-web-components.js"></script>

  <!-- Create User Form -->
  <x-feature-form
    id="createUserForm"
    feature="UserManagement"
    form-id="CreateForm"
    theme="light"
    auto-close="true"
  ></x-feature-form>

  <script>
    const form = document.getElementById('createUserForm');

    form.addEventListener('form-submitted', (event) => {
      console.log('User created:', event.detail.data);
    });

    form.addEventListener('form-submission-error', (event) => {
      console.error('Error:', event.detail.error);
    });
  </script>
</body>
</html>
```

### 6.2 Data Table with Row Actions

```html
<x-feature-data-table
  id="usersTable"
  feature="UserManagement"
  table-id="UsersTable"
  theme="light"
  page-size="25"
  allow-export="true"
></x-feature-data-table>

<x-feature-form
  id="editUserForm"
  feature="UserManagement"
  form-id="EditForm"
  theme="light"
></x-feature-form>

<script>
  const table = document.getElementById('usersTable');
  const form = document.getElementById('editUserForm');

  table.addEventListener('row-action', (event) => {
    const { action, rowData } = event.detail;

    if (action === 'edit') {
      form.setInitialData(rowData);
      form.style.display = 'block';
    } else if (action === 'view') {
      // Show read-only view
    } else if (action === 'delete') {
      // Handle delete
    }
  });

  form.addEventListener('form-submitted', () => {
    table.reload();
    form.style.display = 'none';
  });
</script>
```

### 6.3 Full CRUD Feature

```html
<div class="feature-container">
  <!-- Renderer loads all components -->
  <x-feature-renderer
    id="userFeature"
    feature="UserManagement"
    theme="light"
    max-width="1200px"
  ></x-feature-renderer>
</div>

<script>
  const renderer = document.getElementById('userFeature');

  renderer.addEventListener('feature-loaded', (event) => {
    console.log('Feature loaded:', event.detail.feature);
  });

  renderer.addEventListener('form-submitted', (event) => {
    const { formId, data } = event.detail;
    console.log(`Form ${formId} submitted with data:`, data);

    // Reload data tables after form action
    const tables = document.querySelectorAll('x-feature-data-table');
    tables.forEach(table => table.reload());
  });

  renderer.addEventListener('data-refreshed', (event) => {
    console.log(`Data refreshed for:`, event.detail.tableId);
  });
</script>
```

### 6.4 Integration with React

```jsx
import React, { useEffect, useRef } from 'react';

export function UserManagementPage() {
  const rendererRef = useRef(null);

  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;

    const handleFormSubmitted = (event) => {
      console.log('Form submitted:', event.detail);
      // Update parent state or perform additional actions
    };

    renderer.addEventListener('form-submitted', handleFormSubmitted);

    return () => {
      renderer.removeEventListener('form-submitted', handleFormSubmitted);
    };
  }, []);

  return (
    <div>
      <h1>User Management</h1>
      <x-feature-renderer
        ref={rendererRef}
        feature="UserManagement"
        theme="light"
      />
    </div>
  );
}
```

### 6.5 Integration with Vue

```vue
<template>
  <div>
    <h1>User Management</h1>
    <x-feature-renderer
      ref="renderer"
      feature="UserManagement"
      theme="light"
      @form-submitted="onFormSubmitted"
      @form-submission-error="onFormSubmissionError"
    />
  </div>
</template>

<script>
export default {
  name: 'UserManagement',
  mounted() {
    const renderer = this.$refs.renderer;
    // Web Component is accessible as native DOM element
  },
  methods: {
    onFormSubmitted(event) {
      console.log('Form submitted:', event.detail);
    },
    onFormSubmissionError(event) {
      console.error('Error:', event.detail.error);
    }
  }
}
</script>
```

### 6.6 Vanilla JavaScript

```javascript
// Load feature dynamically
async function initializeFeature() {
  const renderer = document.createElement('x-feature-renderer');
  renderer.setAttribute('feature', 'UserManagement');
  renderer.setAttribute('theme', 'light');
  renderer.setAttribute('api-base', '/api/v1');

  renderer.addEventListener('feature-loaded', (event) => {
    console.log('Feature ready');
  });

  renderer.addEventListener('form-submitted', (event) => {
    const { formId, data } = event.detail;
    fetch('/api/audit-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: `form_${formId}`,
        timestamp: new Date(),
        data: data
      })
    });
  });

  document.body.appendChild(renderer);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeFeature);
} else {
  initializeFeature();
}
```

---

## 7. Implementation Timeline & Phases

> ⚠️ **NOTE**: This timeline is **CONCEPTUAL ONLY** and is **NOT** a committed development plan or roadmap. It represents a theoretical phased approach if Web Components were to be implemented. Actual implementation may differ significantly or may not occur at all.

### Phase 1: Foundation (v1.0 - Weeks 1-4) [HYPOTHETICAL]
- [ ] Create wrapper Web Components for basic forms
- [ ] Implement attribute-based API
- [ ] Add event emission system
- [ ] Create documentation and examples

**Components**:
- `x-feature-form` (wrapper)
- `x-feature-data-table` (wrapper)
- CSS Custom Properties support

**Tests**:
- Component lifecycle tests
- API contract tests
- Event emission tests

### Phase 2: Advanced Features (v1.1 - Weeks 5-8)
- [ ] XFeatureRenderer orchestrator
- [ ] Form validation with error handling
- [ ] Table pagination, sorting, filtering
- [ ] Keyboard accessibility
- [ ] Screen reader support (ARIA)

**Components**:
- `x-feature-renderer`
- `x-feature-field`
- `x-feature-button`
- `x-feature-message`

**Features**:
- Full keyboard navigation
- WCAG 2.1 AA compliance
- Custom theming system

### Phase 3: Native Implementation (v2.0 - Q1 2026)
- [ ] Rewrite Web Components without React dependency
- [ ] Use Lit or LitElement for implementation
- [ ] Optimize bundle size
- [ ] Add micro-interactions and animations

**Goals**:
- Bundle size < 200KB gzipped
- Zero external dependencies
- Same API as v1.0

### Phase 4: Framework Integrations (v2.1+)
- [ ] React integration package
- [ ] Vue integration package
- [ ] Angular integration package
- [ ] Svelte integration package

---

## 8. Browser Support & Compatibility

### Minimum Requirements
- Chrome/Edge 77+ (Custom Elements v1, Shadow DOM v1)
- Firefox 63+
- Safari 14+
- Node.js 16+ (for build tooling)

### Polyfills (if needed)
- Web Components polyfill for IE11 (not recommended)
- Custom Elements polyfill

### Development Environment
- Node.js 18+
- pnpm 8+
- TypeScript 5.x
- Vite 7.x

---

## 9. Accessibility (A11y)

### WCAG 2.1 AA Compliance

All Web Components must support:
- **Keyboard Navigation**: Tab, Shift+Tab, Enter, Escape, Arrow keys
- **Screen Readers**: ARIA labels, roles, live regions
- **High Contrast**: Support system high-contrast mode
- **Focus Management**: Visible focus indicators, focus trapping in dialogs
- **Color**: No information conveyed by color alone

### Implementation Requirements

```html
<!-- Example: Accessible form field -->
<x-feature-field
  id="email-field"
  name="email"
  label="Email Address"
  type="email"
  required="true"
  aria-describedby="email-help"
>
  <span id="email-help" slot="help-text">
    Enter a valid email address
  </span>
</x-feature-field>

<!-- Component renders accessible HTML -->
<!--
<div class="field-wrapper">
  <label for="email-input">Email Address *</label>
  <input
    id="email-input"
    type="email"
    required
    aria-describedby="email-help"
  />
  <span id="email-help" class="help-text">Enter a valid email address</span>
</div>
-->
```

---

## 10. Testing Strategy

### Unit Tests (Vitest + React Testing Library)

```javascript
describe('x-feature-form', () => {
  it('loads form definition from API', async () => {
    const form = document.createElement('x-feature-form');
    form.setAttribute('feature', 'UserManagement');
    form.setAttribute('form-id', 'CreateForm');
    document.body.appendChild(form);

    await waitFor(() => {
      expect(form.isLoading).toBe(false);
    });
  });

  it('emits form-submitted event on successful submission', async () => {
    const form = document.createElement('x-feature-form');
    const listener = jest.fn();
    form.addEventListener('form-submitted', listener);

    // Simulate form submission...
    expect(listener).toHaveBeenCalled();
  });

  it('validates required fields', async () => {
    const form = document.createElement('x-feature-form');
    // Set up and test validation...
  });
});
```

### Integration Tests

```javascript
describe('UserManagement feature', () => {
  it('performs full CRUD workflow', async () => {
    // 1. Load feature
    // 2. Create user via form
    // 3. Verify in table
    // 4. Edit user
    // 5. Delete user
  });

  it('handles network errors gracefully', async () => {
    // Mock API errors
    // Verify error UI shown
    // Verify user can retry
  });
});
```

### E2E Tests (Playwright)

```javascript
test('create user workflow', async ({ page }) => {
  await page.goto('/users');
  await page.fill('x-feature-form', 'John Doe');
  await page.click('x-feature-button[type="submit"]');

  const success = page.locator('x-feature-message[type="success"]');
  await expect(success).toBeVisible();
});
```

---

## 11. Migration Path

### For Existing React Projects

**Step 1**: Import Web Component library
```javascript
import '@xfeature/web-components';
```

**Step 2**: Add Web Components alongside React components
```jsx
<div>
  {/* Existing React component */}
  <XFeatureFrontendRenderer feature="UserManagement" />

  {/* New Web Component */}
  <x-feature-renderer feature="UserManagement" />
</div>
```

**Step 3**: Gradually replace React components
```jsx
// Before
<XFeatureForm formId="CreateForm" />

// After
<x-feature-form form-id="CreateForm" />
```

### For New Projects

Use Web Components directly without React:
```html
<!DOCTYPE html>
<html>
<head>
  <script src="/js/xfeature-web-components.js"></script>
  <link rel="stylesheet" href="/css/xfeature-theme.css">
</head>
<body>
  <x-feature-renderer
    feature="UserManagement"
    theme="light"
  ></x-feature-renderer>
</body>
</html>
```

---

## 12. Bundle & Performance

### Bundle Size Targets (v1.0)

| Component | Size | Notes |
|-----------|------|-------|
| Web Components wrapper | 45KB | Includes React runtime |
| React components | 120KB | Shared dependency |
| MUI styles | 85KB | Shared dependency |
| **Total** | **250KB** | Gzipped with dependencies |

### Performance Targets

- **Initial Load**: < 2s for feature definition
- **Form Submission**: < 500ms (API dependent)
- **Table Pagination**: < 1s (API dependent)
- **Time to Interactive**: < 3s

### Optimization Strategies

1. **Code Splitting**: Load components on-demand
2. **Caching**: IndexedDB cache for feature definitions
3. **Lazy Loading**: Load components only when visible
4. **Tree Shaking**: Remove unused components from bundle
5. **Compression**: Gzip all assets

---

## 13. Error Handling & Debugging

### Error Types

```javascript
// Network errors
form.addEventListener('form-submission-error', (e) => {
  const { error, code } = e.detail;
  // code: 'NETWORK_ERROR', 'API_ERROR', 'VALIDATION_ERROR', 'TIMEOUT'
  console.error(error.message);
});

// Loading errors
renderer.addEventListener('feature-error', (e) => {
  const { error, featureName } = e.detail;
  console.error(`Failed to load feature: ${error.message}`);
});
```

### Debug Mode

```html
<x-feature-renderer
  feature="UserManagement"
  debug="true"
></x-feature-renderer>

<!-- Console logs events and state changes -->
```

### Error Boundaries

Web Components automatically render error messages in components. Graceful fallback UI is shown on critical errors.

---

## 14. Future Enhancements (Post v1.0)

- [ ] Real-time form collaboration (WebSockets)
- [ ] File upload support
- [ ] Advanced filtering UI generator
- [ ] Chart/visualization components
- [ ] Multi-step form wizard component
- [ ] Bulk actions for tables
- [ ] Custom validation rules in XML
- [ ] Offline support with sync
- [ ] Internationalization (i18n) support
- [ ] Audit logging integration

---

## 15. FAQ

**Q: Do I need to rewrite my React components?**
A: No. Web Components wrap existing React components. You can use both React and Web Components in the same application.

**Q: Can I use Web Components in a React app?**
A: Yes! Web Components work seamlessly with React. See integration examples in Section 6.4.

**Q: What about TypeScript support?**
A: Full TypeScript support. Type definitions included in the package.

**Q: Can I customize component styles?**
A: Yes. Use CSS Custom Properties and ::part() selectors for styling.

**Q: How do I handle authentication?**
A: Authentication tokens can be provided via:
1. HTTP headers (intercepted by API layer)
2. Cookie (automatic with credentials)
3. Custom auth handler in renderer initialization

**Q: Does this work with existing CSS frameworks?**
A: Yes. Shadow DOM isolates component styles from global styles, preventing conflicts.

---

## 16. Appendix: Sample Feature Definition

### user-management.xml
```xml
<?xml version="1.0" encoding="utf-8"?>
<Feature Name="UserManagement" Version="1.9">
  <Backend>
    <Query Id="ListUsers" Type="Select">
      SELECT id, name, email, status, created_at FROM users
      WHERE status = :status
      ORDER BY created_at DESC
      OFFSET (:page - 1) * :pageSize ROWS
      FETCH NEXT :pageSize ROWS ONLY
    </Query>

    <Query Id="GetUserById" Type="Select">
      SELECT id, name, email, status, created_at FROM users
      WHERE id = :id
    </Query>

    <ActionQuery Id="CreateUser" Type="Insert">
      INSERT INTO users (name, email, status) VALUES (:name, :email, :status);
      SELECT CAST(SCOPE_IDENTITY() as int) as id;
    </ActionQuery>

    <ActionQuery Id="UpdateUser" Type="Update">
      UPDATE users SET name = :name, email = :email, status = :status
      WHERE id = :id
    </ActionQuery>

    <ActionQuery Id="DeleteUser" Type="Delete">
      DELETE FROM users WHERE id = :id
    </ActionQuery>
  </Backend>

  <Frontend>
    <DataTable Id="UsersTable" QueryRef="ListUsers" Title="Users"
               FormActions="ViewForm,EditForm,DeleteForm">
      <Column Name="id" Label="ID" Type="Number" Sortable="true"/>
      <Column Name="name" Label="Name" Type="Text" Searchable="true" Sortable="true"/>
      <Column Name="email" Label="Email" Type="Email" Searchable="true"/>
      <Column Name="status" Label="Status" Type="Badge"
              BadgeConfig="active:success,inactive:secondary,suspended:danger"/>
      <Column Name="created_at" Label="Created" Type="Date" Format="MM/dd/yyyy" Sortable="true"/>
      <Filter Name="status" Label="Filter by Status" Type="Select"
              Options="active,inactive,suspended"/>
    </DataTable>

    <Form Id="CreateForm" Mode="Create" Dialog="true"
          ActionRef="CreateUser" Title="Create User">
      <Field Name="name" Label="Name" Type="Text" Required="true"
             MinLength="2" MaxLength="100" Placeholder="Enter full name"/>
      <Field Name="email" Label="Email" Type="Email" Required="true"
             Placeholder="user@example.com" Pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"/>
      <Field Name="status" Label="Status" Type="Select" Required="true"
             Options="active,inactive,suspended"/>
      <Message Type="Info">
        User will receive a welcome email at the provided address.
      </Message>
      <Button Type="Submit" Label="Create" Style="Primary"/>
      <Button Type="Cancel" Label="Cancel" Style="Secondary"/>
    </Form>

    <Form Id="EditForm" Mode="Edit" Dialog="true"
          ActionRef="UpdateUser" Title="Edit User">
      <Field Name="id" Type="Hidden"/>
      <Field Name="name" Label="Name" Type="Text" Required="true"/>
      <Field Name="email" Label="Email" Type="Email" Required="true"/>
      <Field Name="status" Label="Status" Type="Select" Required="true"
             Options="active,inactive,suspended"/>
      <Button Type="Submit" Label="Save" Style="Primary"/>
      <Button Type="Cancel" Label="Cancel" Style="Secondary"/>
    </Form>

    <Form Id="ViewForm" Mode="View" Dialog="true"
          Title="View User">
      <Field Name="id" Label="ID" Type="Text" ReadOnly="true"/>
      <Field Name="name" Label="Name" Type="Text" ReadOnly="true"/>
      <Field Name="email" Label="Email" Type="Email" ReadOnly="true"/>
      <Field Name="status" Label="Status" Type="Select" ReadOnly="true"/>
      <Field Name="created_at" Label="Created" Type="Date" ReadOnly="true"
             Format="MMMM dd, yyyy HH:mm:ss"/>
      <Button Type="Close" Label="Close" Style="Secondary"/>
    </Form>

    <Form Id="DeleteForm" Mode="Delete" Dialog="true"
          ActionRef="DeleteUser" Title="Delete User">
      <Message Type="Warning">
        Are you sure you want to delete this user? This action cannot be undone.
      </Message>
      <Field Name="id" Type="Hidden"/>
      <Button Type="Submit" Label="Delete" Style="Danger"/>
      <Button Type="Cancel" Label="Cancel" Style="Secondary"/>
    </Form>

    <Form Id="SearchForm" Mode="Search" Dialog="false"
          Title="Search Users">
      <Field Name="status" Label="Filter by Status" Type="Select"
             Options="active,inactive,suspended"/>
      <Button Type="Submit" Label="Search" Style="Primary"/>
      <Button Type="Reset" Label="Reset" Style="Secondary"/>
    </Form>
  </Frontend>
</Feature>
```

---

## 17. References & Related Documentation

- [Web Components MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
- [Custom Elements Specification](https://html.spec.whatwg.org/multipage/custom-elements.html)
- [Shadow DOM Specification](https://dom.spec.whatwg.org/#shadow-trees)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [XFeature Architecture Documentation](./README.md)
- [XFeature XML Schema](./feature-schema.xsd)

---

## Disclaimer

This specification document is provided **"as-is"** for architectural discussion and future planning purposes only. It represents a theoretical design for potential Web Component support for XFeature.

**This document does NOT:**
- Commit to implementation
- Represent a development roadmap
- Include backend API design or changes
- Guarantee any feature will be developed
- Represent current product direction

**This document is:**
- For reference only
- Subject to change without notice
- A design exercise for requirements gathering
- Open to discussion and feedback

---

**Document Version**: 1.0.0
**Last Updated**: November 29, 2025
**Document Type**: Design Specification (Not a Development Plan)
**Status**: Draft - For Discussion Only
