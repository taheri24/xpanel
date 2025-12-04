/**
 * XFeature XML to TypeScript Converter - Unit Tests
 * 7 Basic Test Cases for Prototype Validation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { convertXmlToXFeature } from './xmlToTypeScriptConverter';
import { XFeature } from '../types/xfeature';

describe('XML to TypeScript Converter - Basic Tests', () => {
  /**
   * TEST 1: Basic Feature with minimal attributes
   * Tests parsing Feature root element with Name and Version attributes
   */
  it('TEST-1: Should parse basic Feature element with Name and Version', () => {
    const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
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
    const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
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
    const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
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
    const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
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
    const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
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
    const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
<Feature Name="UserManagement" Version="1.9">
  <Backend></Backend>
  <Frontend></Frontend>
  <Mapping Name="role" DataType="String" Label="User Role" Required="true"/>
  <Mapping Name="status" DataType="String" Label="Status" Disabled="false"/>
</Feature>`;

    const result = convertXmlToXFeature(xmlString);

    expect(result.mappings).toBeDefined();
    expect(result.mappings).toHaveLength(2);
    expect(result.mappings[0].name).toBe('role');
    expect(result.mappings[0].dataType).toBe('String');
    expect(result.mappings[0].label).toBe('User Role');
    expect(result.mappings[0].required).toBe(true);
    expect(result.mappings[1].name).toBe('status');
    expect(result.mappings[1].disabled).toBe(false);
  });

  /**
   * TEST 7: Complete Feature with all sections
   * Tests full parsing of Feature with Backend, Frontend, and Mappings
   */
  it('TEST-7: Should parse complete Feature with all sections', () => {
    const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
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
    expect(result.mappings[0].name).toBe('role');
  });
});
