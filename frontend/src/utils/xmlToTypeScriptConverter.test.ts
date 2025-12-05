/**
 * XFeature XML to TypeScript Converter - Unit Tests
 * 7 Basic Test Cases for Prototype Validation
 */

import { describe, it, expect } from 'vitest';
import { convertXmlToXFeature, type XFeatureRawString } from './xmlToTypeScriptConverter';

describe('XML to TypeScript Converter - Basic Tests', () => {
  /**
   * TEST 1: Basic Feature with minimal attributes
   * Tests parsing Feature root element with Name and Version attributes
   */
  it('TEST-1: Should parse basic Feature element with Name and Version', () => {
    const xmlString :XFeatureRawString = `<?xml version="1.0" encoding="UTF-8"?>
<Feature Name="BasicFeature" Version="1.0">
  <Backend></Backend>
  <Frontend></Frontend>
</Feature>`;

    const result = convertXmlToXFeature(xmlString);

    expect(result).toBeDefined();
    expect(result.name).toBe('BasicFeature');
    expect(result.version).toBe('1.0');
    expect(result.backend).toBeDefined();
    expect(result.frontend).toBeDefined();
  });

  /**
   * TEST 2: Feature with single Query in Backend
   * Tests parsing Query element with Id, Type, Description, and SQL content
   */
  it('TEST-2: Should parse Feature with Backend Query element', () => {
    const xmlString : XFeatureRawString = `<?xml version="1.0" encoding="UTF-8"?>
<Feature Name="UserManagement" Version="1.9">
  <Backend>
    <Query Id="ListUsers" Type="Select" Description="Retrieve all users">
      <![CDATA[SELECT * FROM users WHERE status = :status]]>
    </Query>
  </Backend>
  <Frontend></Frontend>
</Feature>`;

    const result = convertXmlToXFeature(xmlString);

    expect(result.backend).toBeDefined();
    expect(result.backend.queries).toHaveLength(1);
    expect(result.backend.queries[0].id).toBe('ListUsers');
    expect(result.backend.queries[0].type).toBe('Select');
    expect(result.backend.queries[0].description).toBe('Retrieve all users');
    expect(result.backend.queries[0].sql).toContain('SELECT');
  });

  /**
   * TEST 3: Feature with ActionQuery in Backend
   * Tests parsing ActionQuery element with Insert/Update/Delete types
   */
  it('TEST-3: Should parse Feature with Backend ActionQuery element', () => {
    const xmlString : XFeatureRawString = `<?xml version="1.0" encoding="UTF-8"?>
<Feature Name="UserManagement" Version="1.9">
  <Backend>
    <ActionQuery Id="CreateUser" Type="Insert" Description="Create new user">
      <![CDATA[INSERT INTO users (username, email) VALUES (:username, :email)]]>
    </ActionQuery>
  </Backend>
  <Frontend></Frontend>
</Feature>`;

    const result = convertXmlToXFeature(xmlString);

    expect(result.backend).toBeDefined();
    expect(result.backend.actionQueries).toHaveLength(1);
    expect(result.backend.actionQueries[0].id).toBe('CreateUser');
    expect(result.backend.actionQueries[0].type).toBe('Insert');
    expect(result.backend.actionQueries[0].description).toBe('Create new user');
    expect(result.backend.actionQueries[0].sql).toContain('INSERT');
  });

  /**
   * TEST 4: Feature with DataTable in Frontend
   * Tests parsing DataTable element with attributes and Column children
   */
  it('TEST-4: Should parse Feature with Frontend DataTable element', () => {
    const xmlString : XFeatureRawString = `<?xml version="1.0" encoding="UTF-8"?>
<Feature Name="UserManagement" Version="1.9">
  <Backend></Backend>
  <Frontend>
    <DataTable Id="UsersTable" QueryRef="ListUsers" Title="Users List"
               Pagination="true" PageSize="20" Sortable="true">
      <Column Name="user_id" Label="ID" Type="Number" Width="80px" Align="Center"/>
      <Column Name="username" Label="Username" Type="Text" Sortable="true"/>
    </DataTable>
  </Frontend>
</Feature>`;

    const result = convertXmlToXFeature(xmlString);

    expect(result.frontend).toBeDefined();
    expect(result.frontend.dataTables).toHaveLength(1);
    expect(result.frontend.dataTables[0].id).toBe('UsersTable');
    expect(result.frontend.dataTables[0].queryRef).toBe('ListUsers');
    expect(result.frontend.dataTables[0].title).toBe('Users List');
    expect(result.frontend.dataTables[0].pagination).toBe(true);
    expect(result.frontend.dataTables[0].pageSize).toBe(20);
    expect(result.frontend.dataTables[0].columns).toHaveLength(2);
    expect(result.frontend.dataTables[0].columns[0].name).toBe('user_id');
    expect(result.frontend.dataTables[0].columns[0].label).toBe('ID');
    expect(result.frontend.dataTables[0].columns[0].type).toBe('Number');
  });

  /**
   * TEST 5: Feature with Form in Frontend
   * Tests parsing Form element with Mode, ActionRef, Fields, and Buttons
   */
  it('TEST-5: Should parse Feature with Frontend Form element', () => {
    const xmlString : XFeatureRawString = `<?xml version="1.0" encoding="UTF-8"?>
<Feature Name="UserManagement" Version="1.9">
  <Backend></Backend>
  <Frontend>
    <Form Id="CreateUserForm" Mode="Create" Dialog="true" ActionRef="CreateUser"
          Title="Create New User">
      <Field Name="username" Label="Username" Type="Text" Required="true"
             Placeholder="Enter username"/>
      <Field Name="email" Label="Email" Type="Email" Required="true"
             Placeholder="user@example.com"/>
      <Button Type="Submit" Label="Create User" Style="Primary"/>
      <Button Type="Cancel" Label="Cancel" Style="Secondary"/>
    </Form>
  </Frontend>
</Feature>`;

    const result = convertXmlToXFeature(xmlString);

    expect(result.frontend).toBeDefined();
    expect(result.frontend.forms).toHaveLength(1);
    expect(result.frontend.forms[0].id).toBe('CreateUserForm');
    expect(result.frontend.forms[0].mode).toBe('Create');
    expect(result.frontend.forms[0].dialog).toBe(true);
    expect(result.frontend.forms[0].actionRef).toBe('CreateUser');
    expect(result.frontend.forms[0].title).toBe('Create New User');
    expect(result.frontend.forms[0].fields).toHaveLength(2);
    expect(result.frontend.forms[0].fields[0].name).toBe('username');
    expect(result.frontend.forms[0].buttons).toHaveLength(2);
    expect(result.frontend.forms[0].buttons[0].type).toBe('Submit');
  });

  /**
   * TEST 6: Feature with Mapping elements
   * Tests parsing Mapping elements with attributes and Options children
   */
  it('TEST-6: Should parse Feature with Mapping elements', () => {
    const xmlString : XFeatureRawString = `<?xml version="1.0" encoding="UTF-8"?>
<Feature Name="UserManagement" Version="1.9">
  <Backend></Backend>
  <Frontend></Frontend>
  <Mapping Name="role" DataType="String" Label="User Role" Required="true"/>
  <Mapping Name="status" DataType="String" Label="Status" Disabled="false"/>
</Feature>`;

    const result = convertXmlToXFeature(xmlString);

    expect(result.mappings).toBeDefined();
    expect(result.mappings).toHaveLength(2);
    expect(result.mappings?.[0].name).toBe('role');
    expect(result.mappings?.[0].dataType).toBe('String');
    expect(result.mappings?.[0].label).toBe('User Role');
    expect(result.mappings?.[0].required).toBe(true);
    expect(result.mappings?.[1].name).toBe('status');
    expect(result.mappings?.[1].disabled).toBe(false);
  });

  /**
   * TEST 7: Complete Feature with all sections
   * Tests full parsing of Feature with Backend, Frontend, and Mappings
   */
  it('TEST-7: Should parse complete Feature with all sections', () => {
    const xmlString : XFeatureRawString = `<?xml version="1.0" encoding="UTF-8"?>
<Feature Name="UserManagement" Version="1.9">
  <Backend>
    <Query Id="ListUsers" Type="Select" Description="List all users">
      <![CDATA[SELECT * FROM users]]>
    </Query>
    <ActionQuery Id="CreateUser" Type="Insert" Description="Create user">
      <![CDATA[INSERT INTO users (username) VALUES (:username)]]>
    </ActionQuery>
  </Backend>
  <Frontend>
    <DataTable Id="UsersTable" QueryRef="ListUsers" Title="Users">
      <Column Name="id" Label="ID" Type="Number"/>
    </DataTable>
    <Form Id="CreateForm" Mode="Create" ActionRef="CreateUser">
      <Field Name="username" Label="Username" Type="Text" Required="true"/>
      <Button Type="Submit" Label="Create" Style="Primary"/>
    </Form>
  </Frontend>
  <Mapping Name="role" DataType="String" Label="Role"/>
</Feature>`;

    const result = convertXmlToXFeature(xmlString);

    // Validate overall structure
    expect(result).toBeDefined();
    expect(result.name).toBe('UserManagement');
    expect(result.version).toBe('1.9');

    // Validate Backend
    expect(result.backend.queries).toHaveLength(1);
    expect(result.backend.actionQueries).toHaveLength(1);

    // Validate Frontend
    expect(result.frontend.dataTables).toHaveLength(1);
    expect(result.frontend.forms).toHaveLength(1);

    // Validate Mappings
    expect(result.mappings).toHaveLength(1);
    expect(result.mappings?.[0].name).toBe('role');
  });

  /**
   * TEST 8: Multiple Query elements in Backend
   * Tests parsing of multiple Query elements
   */
  it('TEST-8: Should parse multiple Query elements', () => {
    const xmlString : XFeatureRawString = `<?xml version="1.0" encoding="UTF-8"?>
<Feature Name="MultiQuery" Version="1.0">
  <Backend>
    <Query Id="ListUsers" Type="Select" Description="List users">
      <![CDATA[SELECT * FROM users]]>
    </Query>
    <Query Id="ListRoles" Type="Select" Description="List roles">
      <![CDATA[SELECT * FROM roles]]>
    </Query>
    <Query Id="ListPermissions" Type="Select" Description="List permissions">
      <![CDATA[SELECT * FROM permissions]]>
    </Query>
  </Backend>
  <Frontend></Frontend>
</Feature>`;

    const result = convertXmlToXFeature(xmlString);

    expect(result.backend.queries).toHaveLength(3);
    expect(result.backend.queries[0].id).toBe('ListUsers');
    expect(result.backend.queries[1].id).toBe('ListRoles');
    expect(result.backend.queries[2].id).toBe('ListPermissions');
  });

  /**
   * TEST 9: Multiple ActionQuery elements with different types
   * Tests Insert, Update, and Delete query types
   */
  it('TEST-9: Should parse multiple ActionQuery with different types', () => {
    const xmlString : XFeatureRawString = `<?xml version="1.0" encoding="UTF-8"?>
<Feature Name="MultiAction" Version="1.0">
  <Backend>
    <ActionQuery Id="CreateUser" Type="Insert" Description="Create">
      <![CDATA[INSERT INTO users ...]]>
    </ActionQuery>
    <ActionQuery Id="UpdateUser" Type="Update" Description="Update">
      <![CDATA[UPDATE users ...]]>
    </ActionQuery>
    <ActionQuery Id="DeleteUser" Type="Delete" Description="Delete">
      <![CDATA[DELETE FROM users ...]]>
    </ActionQuery>
  </Backend>
  <Frontend></Frontend>
</Feature>`;

    const result = convertXmlToXFeature(xmlString);

    expect(result.backend.actionQueries).toHaveLength(3);
    expect(result.backend.actionQueries[0].type).toBe('Insert');
    expect(result.backend.actionQueries[1].type).toBe('Update');
    expect(result.backend.actionQueries[2].type).toBe('Delete');
  });

  /**
   * TEST 10: Multiple Form elements
   * Tests parsing multiple forms with different modes
   */
  it('TEST-10: Should parse multiple Form elements with different modes', () => {
    const xmlString : XFeatureRawString = `<?xml version="1.0" encoding="UTF-8"?>
<Feature Name="MultiForms" Version="1.0">
  <Backend></Backend>
  <Frontend>
    <Form Id="CreateForm" Mode="Create" ActionRef="CreateUser"/>
    <Form Id="EditForm" Mode="Edit" ActionRef="UpdateUser"/>
    <Form Id="SearchForm" Mode="Search" QueryRef="SearchUsers"/>
    <Form Id="DeleteForm" Mode="Delete" ActionRef="DeleteUser"/>
  </Frontend>
</Feature>`;

    const result = convertXmlToXFeature(xmlString);

    expect(result.frontend.forms).toHaveLength(4);
    expect(result.frontend.forms[0].mode).toBe('Create');
    expect(result.frontend.forms[1].mode).toBe('Edit');
    expect(result.frontend.forms[2].mode).toBe('Search');
    expect(result.frontend.forms[3].mode).toBe('Delete');
  });

  /**
   * TEST 11: Multiple DataTable elements
   * Tests parsing multiple data tables
   */
  it('TEST-11: Should parse multiple DataTable elements', () => {
    const xmlString : XFeatureRawString = `<?xml version="1.0" encoding="UTF-8"?>
<Feature Name="MultiTable" Version="1.0">
  <Backend></Backend>
  <Frontend>
    <DataTable Id="UsersTable" QueryRef="ListUsers" Title="Users"/>
    <DataTable Id="RolesTable" QueryRef="ListRoles" Title="Roles"/>
    <DataTable Id="PermissionsTable" QueryRef="ListPermissions" Title="Permissions"/>
  </Frontend>
</Feature>`;

    const result = convertXmlToXFeature(xmlString);

    expect(result.frontend.dataTables).toHaveLength(3);
    expect(result.frontend.dataTables[0].id).toBe('UsersTable');
    expect(result.frontend.dataTables[1].id).toBe('RolesTable');
    expect(result.frontend.dataTables[2].id).toBe('PermissionsTable');
  });

  /**
   * TEST 12: Form with Message elements
   * Tests parsing form with info, warning, and error messages
   */
  it('TEST-12: Should parse Form with Message elements', () => {
    const xmlString : XFeatureRawString = `<?xml version="1.0" encoding="UTF-8"?>
<Feature Name="FormWithMessages" Version="1.0">
  <Backend></Backend>
  <Frontend>
    <Form Id="DeleteForm" Mode="Delete" ActionRef="DeleteUser">
      <Message Type="Warning">Are you sure?</Message>
      <Message Type="Info">This will be deleted permanently</Message>
      <Button Type="Submit" Label="Delete" Style="Danger"/>
    </Form>
  </Frontend>
</Feature>`;

    const result = convertXmlToXFeature(xmlString);

    expect(result.frontend.forms).toHaveLength(1);
    expect(result.frontend.forms?.[0]?.messages).toHaveLength(2);
    expect(result.frontend.forms?.[0]?.messages?.[0].type).toBe('Warning');
    expect(result.frontend.forms?.[0]?.messages?.[0].content).toBe('Are you sure?');
    expect(result.frontend.forms?.[0]?.messages?.[1]?.type).toBe('Info');
  });

  /**
   * TEST 13: Mapping with inline Options
   * Tests parsing Mapping with Option children
   */
  it('TEST-13: Should parse Mapping with inline Options', () => {
    const xmlString : XFeatureRawString = `<?xml version="1.0" encoding="UTF-8"?>
<Feature Name="MappingWithOptions" Version="1.0">
  <Backend></Backend>
  <Frontend></Frontend>
  <Mapping Name="status" DataType="String" Label="Status">
    <Options>
      <Option Label="Active" Value="active"/>
      <Option Label="Inactive" Value="inactive"/>
      <Option Label="Pending" Value="pending"/>
    </Options>
  </Mapping>
</Feature>`;

    const result = convertXmlToXFeature(xmlString);

    expect(result.mappings).toHaveLength(1);
    expect(result.mappings?.[0]?.options).toBeDefined();
    expect(result.mappings?.[0]?.options!.items).toHaveLength(3);
    expect(result.mappings?.[0]?.options!.items[0]?.value).toBe('active');
    expect(result.mappings?.[0]?.options!.items[1]?.label).toBe('Inactive');
  });

  /**
   * TEST 14: Mapping with ListQuery
   * Tests parsing Mapping with ListQuery element
   */
  it('TEST-14: Should parse Mapping with ListQuery', () => {
    const xmlString : XFeatureRawString = `<?xml version="1.0" encoding="UTF-8"?>
<Feature Name="MappingWithQuery" Version="1.0">
  <Backend></Backend>
  <Frontend></Frontend>
  <Mapping Name="department" DataType="String" Label="Department">
    <ListQuery Id="GetDepartments" Type="Select" Description="Get all departments">
      <![CDATA[SELECT id, name FROM departments ORDER BY name]]>
    </ListQuery>
  </Mapping>
</Feature>`;

    const result = convertXmlToXFeature(xmlString);

    expect(result.mappings).toHaveLength(1);
    expect(result.mappings?.[0].listQuery).toBeDefined();
    expect(result.mappings?.[0].listQuery!.id).toBe('GetDepartments');
    expect(result.mappings?.[0].listQuery!.sql).toContain('departments');
  });

  /**
   * TEST 15: SQL with multiple parameters
   * Tests parameter extraction from complex SQL
   */
  it('TEST-15: Should extract multiple parameters from SQL', () => {
    const xmlString : XFeatureRawString = `<?xml version="1.0" encoding="UTF-8"?>
<Feature Name="ComplexSQL" Version="1.0">
  <Backend>
    <Query Id="ComplexQuery" Type="Select" Description="Complex query">
      <![CDATA[
        SELECT * FROM users
        WHERE status = :status
        AND role = :role
        AND created_at > :startDate
        AND created_at < :endDate
        AND id IN (:userIds)
      ]]>
    </Query>
  </Backend>
  <Frontend></Frontend>
</Feature>`;

    const result = convertXmlToXFeature(xmlString);

    expect(result.backend.queries[0].parameters).toBeDefined();
    const sql = result.backend.queries[0].sql;
    expect(sql).toContain('status');
    expect(sql).toContain('role');
    expect(sql).toContain('startDate');
    expect(sql).toContain('endDate');
    expect(sql).toContain('userIds');
  });

  /**
   * TEST 16: Form with hidden fields
   * Tests parsing hidden field types
   */
  it('TEST-16: Should parse Form with hidden fields', () => {
    const xmlString : XFeatureRawString = `<?xml version="1.0" encoding="UTF-8"?>
<Feature Name="HiddenFields" Version="1.0">
  <Backend></Backend>
  <Frontend>
    <Form Id="EditForm" Mode="Edit" ActionRef="UpdateUser">
      <Field Name="user_id" Type="Hidden" Required="true"/>
      <Field Name="username" Label="Username" Type="Text" Required="true"/>
      <Field Name="action_type" Type="Hidden" Required="true"/>
      <Button Type="Submit" Label="Update" Style="Primary"/>
    </Form>
  </Frontend>
</Feature>`;

    const result = convertXmlToXFeature(xmlString);

    expect(result.frontend.forms[0].fields).toHaveLength(3);
    expect(result.frontend.forms[0].fields[0].dataType).toBe('Hidden');
    expect(result.frontend.forms[0].fields[2].dataType).toBe('Hidden');
  });

  /**
   * TEST 17: DataTable with formActions attribute
   * Tests parsing form action references in DataTable
   */
  it('TEST-17: Should parse DataTable with formActions', () => {
    const xmlString : XFeatureRawString = `<?xml version="1.0" encoding="UTF-8"?>
<Feature Name="TableFormActions" Version="1.0">
  <Backend></Backend>
  <Frontend>
    <DataTable Id="UsersTable" QueryRef="ListUsers" Title="Users"
               FormActions="ViewUserForm,EditUserForm,DeleteUserForm">
      <Column Name="id" Label="ID" Type="Number"/>
      <Column Name="name" Label="Name" Type="Text"/>
    </DataTable>
  </Frontend>
</Feature>`;

    const result = convertXmlToXFeature(xmlString);

    expect(result.frontend.dataTables[0].formActions).toBe('ViewUserForm,EditUserForm,DeleteUserForm');
  });

  /**
   * TEST 18: Column with various types
   * Tests parsing different column data types
   */
  it('TEST-18: Should parse columns with various types', () => {
    const xmlString : XFeatureRawString = `<?xml version="1.0" encoding="UTF-8"?>
<Feature Name="ColumnTypes" Version="1.0">
  <Backend></Backend>
  <Frontend>
    <DataTable Id="Table1" QueryRef="Query1" Title="Test">
      <Column Name="id" Label="ID" Type="Number"/>
      <Column Name="amount" Label="Amount" Type="Currency"/>
      <Column Name="percentage" Label="Percentage" Type="Percentage"/>
      <Column Name="created" Label="Created" Type="DateTime" Format="MM/DD/YYYY HH:mm"/>
      <Column Name="email" Label="Email" Type="Email"/>
      <Column Name="is_active" Label="Active" Type="Boolean"/>
    </DataTable>
  </Frontend>
</Feature>`;

    const result = convertXmlToXFeature(xmlString);

    const columns = result.frontend.dataTables[0].columns;
    expect(columns[0].type).toBe('Number');
    expect(columns[1].type).toBe('Currency');
    expect(columns[2].type).toBe('Percentage');
    expect(columns[3].type).toBe('DateTime');
    expect(columns[3].format).toBe('MM/DD/YYYY HH:mm');
    expect(columns[4].type).toBe('Email');
    expect(columns[5].type).toBe('Boolean');
  });

  /**
   * TEST 19: Feature with empty version
   * Tests handling of minimal Feature attributes
   */
  it('TEST-19: Should handle Feature with minimal attributes', () => {
    const xmlString : XFeatureRawString = `<?xml version="1.0" encoding="UTF-8"?>
<Feature Name="MinimalFeature" Version="">
  <Backend></Backend>
  <Frontend></Frontend>
</Feature>`;

    const result = convertXmlToXFeature(xmlString);

    expect(result.name).toBe('MinimalFeature');
    expect(result.version).toBe('');
    expect(result.backend).toBeDefined();
    expect(result.frontend).toBeDefined();
  });

  /**
   * TEST 20: Complex real-world Feature
   * Tests comprehensive parsing with nested elements and multiple sections
   */
  it('TEST-20: Should parse complex real-world Feature', () => {
    const xmlString : XFeatureRawString = `<?xml version="1.0" encoding="UTF-8"?>
<Feature Name="InvoiceManagement" Version="2.1">
  <Backend>
    <Query Id="ListInvoices" Type="Select" Description="Get invoices">
      <![CDATA[SELECT id, invoice_no, customer_id, amount, status FROM invoices WHERE status = :status ORDER BY created_at DESC]]>
    </Query>
    <ActionQuery Id="CreateInvoice" Type="Insert" Description="Create invoice">
      <![CDATA[INSERT INTO invoices (customer_id, amount, status) VALUES (:customer_id, :amount, :status)]]>
    </ActionQuery>
    <ActionQuery Id="UpdateInvoiceStatus" Type="Update" Description="Update status">
      <![CDATA[UPDATE invoices SET status = :status WHERE id = :id]]>
    </ActionQuery>
  </Backend>
  <Frontend>
    <DataTable Id="InvoicesTable" QueryRef="ListInvoices" Title="Invoices List"
               Pagination="true" PageSize="25" Sortable="true" Filterable="true"
               FormActions="ViewInvoiceForm,EditInvoiceForm">
      <Column Name="id" Label="ID" Type="Number" Width="80px" Sortable="true"/>
      <Column Name="invoice_no" Label="Invoice #" Type="Text" Sortable="true"/>
      <Column Name="customer_id" Label="Customer" Type="Number" Filterable="true"/>
      <Column Name="amount" Label="Amount" Type="Currency" Format="$#,##0.00"/>
      <Column Name="status" Label="Status" Type="Badge" Filterable="true"/>
    </DataTable>
    <Form Id="CreateInvoiceForm" Mode="Create" ActionRef="CreateInvoice" Dialog="true" Title="New Invoice">
      <Field Name="customer_id" Label="Customer" Type="Number" Required="true" Placeholder="Select customer"/>
      <Field Name="amount" Label="Amount" Type="Currency" Required="true" Placeholder="0.00"/>
      <Field Name="status" Label="Status" Type="Select" Required="true">
        <Option Label="Draft" Value="draft"/>
        <Option Label="Sent" Value="sent"/>
      </Field>
      <Button Type="Submit" Label="Create" Style="Primary"/>
      <Button Type="Cancel" Label="Cancel" Style="Secondary"/>
    </Form>
  </Frontend>
  <Mapping Name="status" DataType="String" Label="Status">
    <Options>
      <Option Label="Draft" Value="draft"/>
      <Option Label="Sent" Value="sent"/>
      <Option Label="Paid" Value="paid"/>
      <Option Label="Cancelled" Value="cancelled"/>
    </Options>
  </Mapping>
</Feature>`;

    const result = convertXmlToXFeature(xmlString);

    // Comprehensive validation
    expect(result.name).toBe('InvoiceManagement');
    expect(result.version).toBe('2.1');
    expect(result.backend.queries).toHaveLength(1);
    expect(result.backend.actionQueries).toHaveLength(2);
    expect(result.frontend.dataTables).toHaveLength(1);
    expect(result.frontend.forms).toHaveLength(1);
    expect(result.mappings).toHaveLength(1);

    // Verify data table details
    const table = result.frontend.dataTables[0];
    expect(table.pagination).toBe(true);
    expect(table.pageSize).toBe(25);
    expect(table.columns).toHaveLength(5);

    // Verify form details
    const form = result.frontend.forms[0];
    expect(form.dialog).toBe(true);
    expect(form.fields).toHaveLength(3);
    expect(form.buttons).toHaveLength(2);

    // Verify mapping
    expect(result.mappings?.[0].options!.items).toHaveLength(4);
  });

  /**
   * TEST 21: Form with all field attributes
   * Tests parsing Field with complete attribute set
   */
  it('TEST-21: Should parse Form Field with all attributes', () => {
    const xmlString : XFeatureRawString = `<?xml version="1.0" encoding="UTF-8"?>
<Feature Name="FieldAttributes" Version="1.0">
  <Backend></Backend>
  <Frontend>
    <Form Id="CompleteForm" Mode="Create" ActionRef="CreateRecord">
      <Field Name="email" Label="Email Address" Type="Email" Required="true"
             Placeholder="user@example.com" Readonly="false" Disabled="false"
             HelperText="We will send you a confirmation email"/>
      <Button Type="Submit" Label="Create" Style="Primary"/>
    </Form>
  </Frontend>
</Feature>`;

    const result = convertXmlToXFeature(xmlString);

    const field = result.frontend.forms[0].fields[0];
    expect(field.name).toBe('email');
    expect(field.label).toBe('Email Address');
    expect(field.dataType).toBe('Email');
    expect(field.required).toBe(true);
    expect(field.placeholder).toBe('user@example.com');
    expect(field.readonly).toBe(false);
    expect(field.disabled).toBe(false);
    expect(field.helperText).toBe('We will send you a confirmation email');
  });

  /**
   * TEST 22: Feature with no Backend or Frontend
   * Tests graceful handling of empty sections
   */
  it('TEST-22: Should handle Feature with minimal sections', () => {
    const xmlString : XFeatureRawString = `<?xml version="1.0" encoding="UTF-8"?>
<Feature Name="SimpleFeature" Version="1.0">
  <Backend/>
  <Frontend/>
</Feature>`;

    const result = convertXmlToXFeature(xmlString);

    expect(result.name).toBe('SimpleFeature');
    expect(result.backend.queries).toHaveLength(0);
    expect(result.backend.actionQueries).toHaveLength(0);
    expect(result.frontend.dataTables).toHaveLength(0);
    expect(result.frontend.forms).toHaveLength(0);
    expect(result.mappings).toHaveLength(0);
  });
});
