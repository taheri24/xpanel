# Full-Stack Development XML Schema Documentation

## Version 1.9

This schema provides a unified XML format for defining both backend queries and frontend forms in a single file, enabling rapid full-stack development with clear contracts between layers.

---

## Files Included

1. **feature-schema.xsd** - XML Schema Definition file for validation
2. **user-management-sample.xml** - Sample implementation demonstrating all features

---

## Schema Overview

### Root Structure

```xml
<Feature Name="FeatureName" Version="1.7">
  <Backend>
    <!-- Queries and Actions -->
  </Backend>
  <Frontend>
    <!-- Forms -->
  </Frontend>
</Feature>
```

---

## Backend Section

### Query Element (SELECT operations)

**Purpose:** Define data retrieval operations

**Structure:**
```xml
<Query Id="UniqueId" Type="Select" Description="Optional description">
  <![CDATA[
    SELECT column1, column2, column3
    FROM table_name
    WHERE condition = :parameter
  ]]>
</Query>
```

**Attributes:**
- `Id` (required): Unique identifier, PascalCase
- `Type` (required): Must be "Select"
- `Description` (optional): Human-readable description

**Parameters:**
- Use `:parameter_name` syntax in SQL
- Parameters are automatically extracted by parsers

---

### ActionQuery Element (INSERT/UPDATE/DELETE operations)

**Purpose:** Define data modification operations

**Structure:**
```xml
<ActionQuery Id="UniqueId" Type="Insert|Update|Delete" Description="Optional description">
  <![CDATA[
    INSERT INTO table_name (col1, col2)
    VALUES (:param1, :param2)
  ]]>
</ActionQuery>
```

**Attributes:**
- `Id` (required): Unique identifier, PascalCase
- `Type` (required): "Insert", "Update", or "Delete"
- `Description` (optional): Human-readable description

**Types:**
- **Insert**: CREATE operations (INSERT INTO...)
- **Update**: UPDATE operations (UPDATE ... SET...)
- **Delete**: DELETE operations (DELETE FROM... or UPDATE with status change)

---

## Frontend Section

### DataTable Element

**Purpose:** Define data tables for displaying query results

**Structure:**
```xml
<DataTable Id="UniqueId" QueryRef="QueryId" Title="Table Title"
           Pagination="true|false" PageSize="20" 
           Sortable="true|false" Filterable="true|false" 
           Searchable="true|false"
           FormActions="FormId1,FormId2,FormId3">
  <Column ... />
  <Column ... />
</DataTable>
```

**Attributes:**
- `Id` (required): Unique identifier, PascalCase
- `QueryRef` (required): References Query Id for data source
- `Title` (required): Display title for the table
- `Pagination` (optional): Enable pagination, default true
- `PageSize` (optional): Records per page, default 20
- `Sortable` (optional): Enable column sorting, default true
- `Filterable` (optional): Enable column filtering, default false
- `Searchable` (optional): Enable global search, default false
- `FormActions` (optional): Comma-separated list of Form Ids to show as row actions

**FormActions Behavior:**
- Each Form Id in the list becomes a row action button
- Forms are triggered with the row's data pre-populated
- The Form's Mode, Dialog, and Title attributes control the action behavior
- Form order in the list determines button display order

---

### Column Element

**Purpose:** Define table columns

**Structure:**
```xml
<Column Name="column_name" Label="Display Label" Type="Text"
        Sortable="true|false" Filterable="true|false"
        Width="100px" Format="format_string" Align="Left|Center|Right"/>
```

**Attributes:**
- `Name` (required): Column name (matches query result field)
- `Label` (required): Display header label
- `Type` (optional): Column data type, default "Text"
  - Text, Number, Date, DateTime, Boolean
  - Currency, Percentage, Link, Badge, Image
- `Sortable` (optional): Enable sorting for this column, default true
- `Filterable` (optional): Enable filtering for this column, default false
- `Width` (optional): Column width (e.g., "100px", "20%")
- `Format` (optional): Display format (e.g., "MM/DD/YYYY", "$0,0.00")
- `Align` (optional): Text alignment (Left, Center, Right), default Left

**Column Types:**
- **Text**: Plain text display
- **Number**: Numeric values with optional formatting
- **Date**: Date only (e.g., 01/15/2024)
- **DateTime**: Date and time (e.g., 01/15/2024 14:30)
- **Boolean**: True/false or Yes/No display
- **Currency**: Monetary values (e.g., $1,234.56)
- **Percentage**: Percentage values (e.g., 75.5%)
- **Link**: Clickable hyperlink
- **Badge**: Colored badge/pill (for status, role, etc.)
- **Image**: Display image from URL

---

### Form Element

**Purpose:** Define user interface forms

**Structure:**
```xml
<Form Id="UniqueId" Mode="Create|Edit|View|Delete|Search" 
      Dialog="true|false" Title="Form Title" 
      ActionRef="ActionQueryId" QueryRef="QueryId">
  <Field ... />
  <Field ... />
  <Button ... />
  <Button ... />
</Form>
```

**Attributes:**
- `Id` (required): Unique identifier, PascalCase
- `Mode` (required): Form operation mode
  - `Create`: New record creation
  - `Edit`: Update existing record
  - `View`: Read-only display
  - `Delete`: Deletion confirmation
  - `Search`: Search/filter interface
- `Dialog` (required): "true" for modal, "false" for inline
- `Title` (required): Display title
- `ActionRef` (optional): References ActionQuery Id for mutations
- `QueryRef` (optional): References Query Id for data loading

**Referencing Rules:**
- **Create mode**: Requires `ActionRef` (Insert)
- **Edit mode**: Requires `ActionRef` (Update), optional `QueryRef` for pre-population
- **View mode**: Requires `QueryRef` only
- **Delete mode**: Requires `ActionRef` (Delete)
- **Search mode**: Requires `QueryRef`

---

### Field Element

**Purpose:** Define form input fields

**Structure:**
```xml
<Field Name="field_name" Label="Display Label" Type="Text" 
       Required="true|false" Readonly="true|false"
       Placeholder="Hint text" Validation="rules" 
       Format="format_type" DefaultValue="default">
  <!-- For Select type only -->
  <Option Value="value1" Label="Label 1"/>
  <Option Value="value2" Label="Label 2"/>
</Field>
```

**Attributes:**
- `Name` (required): Field name (snake_case, matches database column or parameter)
- `Label` (optional): Display label for the field
- `Type` (required): Input type
  - Text, Email, Password, Tel, Number
  - Date, DateTime, Time
  - Textarea, Select, Checkbox, Radio
  - Hidden, File
- `Required` (optional): Boolean, default false
- `Readonly` (optional): Boolean, default false
- `Placeholder` (optional): Placeholder text
- `Validation` (optional): Validation rules (comma-separated)
  - Examples: "minLength:3,maxLength:50", "email", "phone", "match:password"
- `Format` (optional): Display format (e.g., "Date", "Currency")
- `DefaultValue` (optional): Default value

**Option Element (for Select fields):**
```xml
<Option Value="stored_value" Label="Display Text"/>
```

---

### Button Element

**Purpose:** Define form action buttons

**Structure:**
```xml
<Button Type="Submit|Cancel|Reset|Close|Confirm" 
        Label="Button Text" Style="Primary|Secondary|Success|Danger|Warning|Info"
        ActionRef="ActionQueryId"/>
```

**Attributes:**
- `Type` (required): Button action type
  - `Submit`: Submit form data
  - `Cancel`: Cancel and close
  - `Reset`: Clear form fields
  - `Close`: Close dialog
  - `Confirm`: Confirm action
- `Label` (required): Button text
- `Style` (required): Visual style
  - `Primary`: Main action (blue)
  - `Secondary`: Secondary action (gray)
  - `Success`: Positive action (green)
  - `Danger`: Destructive action (red)
  - `Warning`: Caution action (yellow)
  - `Info`: Informational (cyan)
- `ActionRef` (optional): Direct reference to ActionQuery

---

### Message Element

**Purpose:** Display informational messages in forms

**Structure:**
```xml
<Message Type="Info|Success|Warning|Error">
  Message text here
</Message>
```

**Attributes:**
- `Type` (required): Message severity
  - `Info`: Informational (blue)
  - `Success`: Success message (green)
  - `Warning`: Warning message (yellow)
  - `Error`: Error message (red)

---

## Design Principles

### 1. Reference System
- Backend elements have unique `Id` attributes
- Frontend elements reference backend via `ActionRef` and `QueryRef`
- Creates clear contracts between layers

### 2. Convention Over Configuration
- Parameters automatically extracted from SQL (`:param_name`)
- Field names match database columns and parameters
- Return types inferred from SELECT statements

### 3. Mode-Driven Behavior
- Form `Mode` determines required references and UI behavior
- Enables code generators to create appropriate components

### 4. Presentation Flexibility
- `Dialog` attribute controls rendering context
- Same form can be modal or inline based on attribute

### 5. Maximum Compactness
- No unnecessary wrapper elements
- Flat structure where possible
- CDATA for SQL content

---

## Usage Examples

### DataTable with Row Actions

```xml
<!-- Backend: Define query -->
<Query Id="ListProducts" Type="Select">
  <![CDATA[
    SELECT product_id, name, price, stock, status
    FROM products
    WHERE category = :category
    ORDER BY name
  ]]>
</Query>

<ActionQuery Id="DeleteProduct" Type="Delete">
  <![CDATA[UPDATE products SET status = 'deleted' WHERE product_id = :product_id]]>
</ActionQuery>

<!-- Frontend: Define table -->
<DataTable Id="ProductsTable" QueryRef="ListProducts" Title="Products"
           Pagination="true" PageSize="25" Sortable="true" Searchable="true"
           FormActions="ViewProductForm,EditProductForm,DeleteProductForm">
  <Column Name="product_id" Label="ID" Type="Number" Width="80px"/>
  <Column Name="name" Label="Product Name" Type="Text" Sortable="true"/>
  <Column Name="price" Label="Price" Type="Currency" Format="$0,0.00" Align="Right"/>
  <Column Name="stock" Label="Stock" Type="Number" Align="Center"/>
  <Column Name="status" Label="Status" Type="Badge" Filterable="true"/>
</DataTable>

<!-- Define forms that are referenced in FormActions -->
<Form Id="ViewProductForm" Mode="View" Dialog="true" QueryRef="GetProduct" Title="View Product">
  <Field Name="name" Label="Name" Type="Text" Readonly="true"/>
  <Button Type="Close" Label="Close" Style="Secondary"/>
</Form>

<Form Id="EditProductForm" Mode="Edit" Dialog="true" ActionRef="UpdateProduct" QueryRef="GetProduct" Title="Edit Product">
  <Field Name="product_id" Type="Hidden" Required="true"/>
  <Field Name="name" Label="Name" Type="Text" Required="true"/>
  <Button Type="Submit" Label="Save" Style="Primary"/>
</Form>

<Form Id="DeleteProductForm" Mode="Delete" Dialog="true" ActionRef="DeleteProduct" Title="Delete Product">
  <Field Name="product_id" Type="Hidden" Required="true"/>
  <Message Type="Warning">Delete this product?</Message>
  <Button Type="Submit" Label="Delete" Style="Danger"/>
</Form>
```

### DataTable with Different Column Types

```xml
<DataTable Id="OrdersTable" QueryRef="ListOrders" Title="Recent Orders"
           FormActions="ViewOrderForm">
  <Column Name="order_id" Label="Order #" Type="Link" Width="100px"/>
  <Column Name="customer_name" Label="Customer" Type="Text"/>
  <Column Name="order_date" Label="Date" Type="Date" Format="MM/DD/YYYY"/>
  <Column Name="total" Label="Total" Type="Currency" Format="$0,0.00" Align="Right"/>
  <Column Name="discount" Label="Discount" Type="Percentage" Format="0.0%" Align="Right"/>
  <Column Name="shipped" Label="Shipped" Type="Boolean"/>
  <Column Name="status" Label="Status" Type="Badge" Filterable="true"/>
</DataTable>
```

### Basic CRUD Pattern

```xml
<!-- Backend: Define queries -->
<Query Id="GetUser" Type="Select">
  <![CDATA[SELECT * FROM users WHERE user_id = :user_id]]>
</Query>

<ActionQuery Id="UpdateUser" Type="Update">
  <![CDATA[UPDATE users SET name = :name WHERE user_id = :user_id]]>
</ActionQuery>

<!-- Frontend: Define form -->
<Form Id="EditUserForm" Mode="Edit" Dialog="true" 
      ActionRef="UpdateUser" QueryRef="GetUser" Title="Edit User">
  <Field Name="user_id" Type="Hidden" Required="true"/>
  <Field Name="name" Label="Name" Type="Text" Required="true"/>
  <Button Type="Submit" Label="Save" Style="Primary"/>
  <Button Type="Cancel" Label="Cancel" Style="Secondary"/>
</Form>
```

### Delete Confirmation Pattern

```xml
<!-- Backend -->
<ActionQuery Id="DeleteUser" Type="Delete">
  <![CDATA[UPDATE users SET status = 'inactive' WHERE user_id = :user_id]]>
</ActionQuery>

<!-- Frontend -->
<Form Id="DeleteUserForm" Mode="Delete" Dialog="true" 
      ActionRef="DeleteUser" Title="Delete User">
  <Field Name="user_id" Type="Hidden" Required="true"/>
  <Message Type="Warning">Are you sure? This cannot be undone.</Message>
  <Button Type="Submit" Label="Delete" Style="Danger"/>
  <Button Type="Cancel" Label="Cancel" Style="Secondary"/>
</Form>
```

### Search Pattern

```xml
<!-- Backend -->
<Query Id="SearchUsers" Type="Select">
  <![CDATA[
    SELECT * FROM users 
    WHERE username LIKE :keyword OR email LIKE :keyword
  ]]>
</Query>

<!-- Frontend -->
<Form Id="SearchForm" Mode="Search" Dialog="false" 
      QueryRef="SearchUsers" Title="Search Users">
  <Field Name="keyword" Label="Search" Type="Text" Required="true" 
         Placeholder="Enter username or email"/>
  <Button Type="Submit" Label="Search" Style="Primary"/>
  <Button Type="Reset" Label="Clear" Style="Secondary"/>
</Form>
```

---

## Validation

### Using xmllint:
```bash
xmllint --noout --schema feature-schema.xsd your-file.xml
```

### Using XML editors:
Most XML editors (Visual Studio Code, IntelliJ, Eclipse) support XSD validation automatically when the schema reference is included in the XML file.

### In XML file:
```xml
<Feature xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:noNamespaceSchemaLocation="feature-schema.xsd"
         Name="YourFeature" Version="1.7">
```

---

## Code Generation Strategy

### Backend Generation
1. Parse `<Query>` and `<ActionQuery>` elements
2. Extract SQL and parameters
3. Generate:
   - Data Access Layer (DAOs)
   - API endpoints
   - Parameter validation
   - Response DTOs

### Frontend Generation
1. Parse `<DataTable>` and `<Form>` elements
2. Identify Mode, Dialog, and column settings
3. Generate:
   - Table components with sorting/filtering/pagination
   - Form components (React/Vue/Angular)
   - Validation logic
   - API client calls
   - Dialog wrappers (if Dialog="true")
   - Row action handlers

### DataTable Generation
- Create table component with QueryRef data binding
- Generate column renderers based on Type
- Implement pagination, sorting, filtering logic
- Parse FormActions to create row action buttons
- Wire each Form action to open form with row data
- Generate action button labels from Form Titles
- Apply Form Mode to determine button style (Edit=Primary, View=Info, Delete=Danger)

### Benefits
- Single source of truth
- Type-safe contracts
- Reduced boilerplate
- Consistent patterns
- Faster development

---

## Extensibility

### Adding New Field Types
Update XSD `Field/@Type` enumeration:
```xml
<xs:enumeration value="YourNewType"/>
```

### Adding New Form Modes
Update XSD `Form/@Mode` enumeration:
```xml
<xs:enumeration value="YourNewMode"/>
```

### Adding Custom Attributes
Extend element definitions in XSD:
```xml
<xs:attribute name="YourAttribute" type="xs:string" use="optional"/>
```

---

## Best Practices

### Naming Conventions
- **Ids**: PascalCase (e.g., `GetUserDetails`, `CreateUserForm`)
- **Field Names**: snake_case matching database (e.g., `user_id`, `first_name`)
- **Descriptions**: Clear, concise explanations

### SQL Guidelines
- Always use CDATA sections for SQL
- Use named parameters (`:param_name`)
- Keep queries focused and simple
- Add comments for complex logic

### Form Design
- One Form per operation (don't try to reuse Create for Edit)
- Use Hidden fields for IDs in Edit/Delete modes
- Provide clear Messages for destructive actions
- Use appropriate Button styles for user guidance

### DataTable Design
- Use descriptive column Labels (not just field names)
- Choose appropriate Column Types for data (Currency for money, Badge for status)
- Enable Sortable on columns users will want to sort
- Use Filterable sparingly (only on key columns like status, category)
- List Forms in FormActions in logical order (typically: View, Edit, Delete)
- Limit FormActions to 2-4 forms for better UX
- Ensure all Forms in FormActions are defined in Frontend section

### Reference Management
- Ensure ActionRef and QueryRef point to existing Ids
- Use QueryRef in Edit forms for data pre-population
- Match Field Names to SQL parameters exactly

---

## Version History

### v1.9 (Current)
- Removed Action element from DataTable
- Added FormActions attribute to DataTable (comma-separated Form Ids)
- Simplified row actions by referencing existing Forms
- Actions now automatically derive from Form properties (Mode, Title, Dialog)

### v1.8
- Added DataTable element to Frontend
- Added Column element for table columns
- Added Action element for row actions (now removed in v1.9)
- Support for pagination, sorting, filtering, and searching
- Multiple column types (Text, Number, Date, Currency, Badge, etc.)

### v1.7
- Unwrapped Fields and Buttons from Forms
- Flat form structure
- Maximum compactness achieved

### v1.6
- Added Dialog attribute to Forms
- Removed RowActions section

### v1.5
- Introduced Mode attribute for Forms
- Simplified Frontend to forms only

### v1.4
- Switched to PascalCase naming

### v1.3
- Unwrapped queries and action-queries containers

### v1.2
- Renamed actions to action-queries

### v1.1
- Removed parameters, response, and sql wrappers from backend

### v1.0
- Initial schema design

---

## Support and Contributions

This schema is designed to be generic and extensible. Feedback and contributions are welcome to make it even more useful for full-stack development teams.

---

## License

This schema and documentation are provided as-is for use in software development projects.
