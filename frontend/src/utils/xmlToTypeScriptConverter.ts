/**
 * XFeature XML to TypeScript Converter
 * Converts XFeature.xml string to TypeScript XFeature interface
 *
 * Usage:
 * const xmlString = `<Feature Name="UserManagement" Version="1.9">...</Feature>`;
 * const result = convertXmlToXFeature(xmlString);
 */

import { XMLParser } from 'fast-xml-parser';
import { XFeature, BackendInfo, FrontendInfo, Query, ActionQuery, DataTable, Column, Form, Button, Mapping, Parameter, Message } from '../types/xfeature';

interface ParsedFeature {
  Feature: {
    '$': {
      Name: string;
      Version: string;
    };
    Backend?: {
      Query?: any;
      ActionQuery?: any;
    };
    Frontend?: {
      DataTable?: any;
      Form?: any;
    };
    Mapping?: any;
  };
}

/**
 * FULL IMPLEMENTATION: Converts XML string to XFeature interface
 * Uses fast-xml-parser library for robust XML parsing
 */
export function convertXmlToXFeature(xmlString: string): XFeature {
  try {
    // Configure XML parser with standard attribute prefix
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      parseTagValue: false,
      cdataTagName: '#cdata',
      cdataPositionChar: '@@',
    });

    // Parse XML string
    const parsed = parser.parse(xmlString) as any;
    const featureElement = parsed.Feature;

    if (!featureElement) {
      throw new Error('Invalid XML: Feature element not found');
    }

    // Extract Feature attributes (prefixed with @_)
    const featureName = featureElement['@_Name'] || featureElement.Name || '';
    const featureVersion = featureElement['@_Version'] || featureElement.Version || '';

    // Parse Backend section
    const backend = parseBackend(featureElement.Backend);

    // Parse Frontend section
    const frontend = parseFrontend(featureElement.Frontend);

    // Parse Mapping section
    const mappings = parseMapping(featureElement.Mapping);

    return {
      name: featureName,
      version: featureVersion,
      backend,
      frontend,
      mappings,
    };
  } catch (error) {
    throw new Error(`Failed to convert XML to XFeature: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Helper: Parse Backend section with Queries and ActionQueries
 */
function parseBackend(backendElement: any): BackendInfo {
  const result: BackendInfo = {
    queries: [],
    actionQueries: [],
  };

  if (!backendElement) {
    return result;
  }

  // Parse Query elements
  if (backendElement.Query) {
    const queries = Array.isArray(backendElement.Query) ? backendElement.Query : [backendElement.Query];
    result.queries = queries.map(parseQuery);
  }

  // Parse ActionQuery elements
  if (backendElement.ActionQuery) {
    const actionQueries = Array.isArray(backendElement.ActionQuery) ? backendElement.ActionQuery : [backendElement.ActionQuery];
    result.actionQueries = actionQueries.map(parseActionQuery);
  }

  return result;
}

/**
 * Helper: Parse Frontend section with DataTables and Forms
 */
function parseFrontend(frontendElement: any): FrontendInfo {
  const result: FrontendInfo = {
    dataTables: [],
    forms: [],
  };

  if (!frontendElement) {
    return result;
  }

  // Parse DataTable elements
  if (frontendElement.DataTable) {
    const dataTables = Array.isArray(frontendElement.DataTable) ? frontendElement.DataTable : [frontendElement.DataTable];
    result.dataTables = dataTables.map(parseDataTable);
  }

  // Parse Form elements
  if (frontendElement.Form) {
    const forms = Array.isArray(frontendElement.Form) ? frontendElement.Form : [frontendElement.Form];
    result.forms = forms.map(parseForm);
  }

  return result;
}

/**
 * Helper: Extract attributes from element
 */
function getAttributes(element: any): Record<string, string> {
  if (element && typeof element === 'object' && !Array.isArray(element)) {
    const attrs: Record<string, string> = {};
    for (const [key, value] of Object.entries(element)) {
      if (key !== '#text' && !key.startsWith('$')) {
        continue;
      }
    }
    return attrs;
  }
  return {};
}

/**
 * Helper: Extract CDATA/text content from element
 */
function extractContent(element: any): string {
  if (typeof element === 'string') {
    return element.trim();
  }
  if (element && typeof element === 'object') {
    if (element['#text']) {
      return element['#text'].trim();
    }
  }
  return '';
}

/**
 * Helper: Get attribute value with @_ prefix
 */
function getAttr(element: any, attrName: string): string | undefined {
  return element[`@_${attrName}`];
}

/**
 * Helper: Parse Query element
 */
function parseQuery(element: any): Query {
  return {
    id: getAttr(element, 'Id') || '',
    type: 'Select',
    description: getAttr(element, 'Description'),
    sql: extractContent(element),
    parameters: extractParameters(extractContent(element)),
  };
}

/**
 * Helper: Parse ActionQuery element
 */
function parseActionQuery(element: any): ActionQuery {
  return {
    id: getAttr(element, 'Id') || '',
    type: (getAttr(element, 'Type') || 'Insert') as 'Insert' | 'Update' | 'Delete',
    description: getAttr(element, 'Description'),
    sql: extractContent(element),
    parameters: extractParameters(extractContent(element)),
  };
}

/**
 * Helper: Extract SQL parameters from SQL string (e.g., :paramName)
 */
function extractParameters(sql: string): Parameter[] {
  const paramPattern = /:(\w+)/g;
  const matches = sql.match(paramPattern) || [];
  const uniqueParams = Array.from(new Set(matches.map(m => m.substring(1))));

  return uniqueParams.map(name => ({
    name,
  }));
}

/**
 * Helper: Parse Column element
 */
function parseColumn(element: any): Column {
  return {
    name: getAttr(element, 'Name') || '',
    label: getAttr(element, 'Label') || '',
    type: (getAttr(element, 'Type') || 'Text') as any,
    sortable: getAttr(element, 'Sortable') === 'true',
    filterable: getAttr(element, 'Filterable') === 'true',
    width: getAttr(element, 'Width'),
    format: getAttr(element, 'Format'),
    align: (getAttr(element, 'Align') || 'left') as 'left' | 'center' | 'right',
  };
}

/**
 * Helper: Parse DataTable element
 */
function parseDataTable(element: any): DataTable {
  const columns: Column[] = [];

  if (element.Column) {
    const columnElements = Array.isArray(element.Column) ? element.Column : [element.Column];
    columns.push(...columnElements.map(parseColumn));
  }

  return {
    id: getAttr(element, 'Id') || '',
    queryRef: getAttr(element, 'QueryRef') || '',
    title: getAttr(element, 'Title'),
    description: getAttr(element, 'Description'),
    pagination: getAttr(element, 'Pagination') === 'true',
    pageSize: getAttr(element, 'PageSize') ? parseInt(getAttr(element, 'PageSize')!, 10) : undefined,
    sortable: getAttr(element, 'Sortable') === 'true',
    filterable: getAttr(element, 'Filterable') === 'true',
    searchable: getAttr(element, 'Searchable') === 'true',
    columns,
    formActions: getAttr(element, 'FormActions'),
  };
}

/**
 * Helper: Parse Option element
 */
function parseOption(element: any): { label: string; value: string } {
  return {
    label: getAttr(element, 'Label') || '',
    value: getAttr(element, 'Value') || '',
  };
}

/**
 * Helper: Parse Form element
 */
function parseForm(element: any): Form {
  const fields: any[] = [];
  const buttons: Button[] = [];
  const messages: Message[] = [];

  // Parse Field elements
  if (element.Field) {
    const fieldElements = Array.isArray(element.Field) ? element.Field : [element.Field];
    fields.push(...fieldElements.map((field: any) => ({
      name: getAttr(field, 'Name') || '',
      dataType: getAttr(field, 'Type') || 'Text',
      label: getAttr(field, 'Label') || '',
      required: getAttr(field, 'Required') === 'true',
      disabled: getAttr(field, 'Disabled') === 'true',
      placeholder: getAttr(field, 'Placeholder'),
      readonly: getAttr(field, 'Readonly') === 'true',
      helperText: getAttr(field, 'HelperText'),
    })));
  }

  // Parse Button elements
  if (element.Button) {
    const buttonElements = Array.isArray(element.Button) ? element.Button : [element.Button];
    buttons.push(...buttonElements.map((btn: any) => ({
      id: getAttr(btn, 'Id'),
      type: (getAttr(btn, 'Type') || 'Submit') as any,
      label: getAttr(btn, 'Label'),
      style: getAttr(btn, 'Style') as any,
      disabled: getAttr(btn, 'Disabled') === 'true',
    })));
  }

  // Parse Message elements
  if (element.Message) {
    const messageElements = Array.isArray(element.Message) ? element.Message : [element.Message];
    messages.push(...messageElements.map((msg: any) => ({
      type: (getAttr(msg, 'Type') || 'Info') as any,
      content: extractContent(msg),
      visible: getAttr(msg, 'Visible') !== 'false',
    })));
  }

  return {
    id: getAttr(element, 'Id') || '',
    mode: (getAttr(element, 'Mode') || 'Create') as any,
    title: getAttr(element, 'Title'),
    description: getAttr(element, 'Description'),
    actionRef: getAttr(element, 'ActionRef'),
    queryRef: getAttr(element, 'QueryRef'),
    dialog: getAttr(element, 'Dialog') === 'true',
    fields,
    buttons,
    messages,
  };
}

/**
 * Helper: Parse Mapping elements
 */
function parseMapping(mappingElements: any): Mapping[] {
  if (!mappingElements) {
    return [];
  }

  const mappings = Array.isArray(mappingElements) ? mappingElements : [mappingElements];

  return mappings.map((mapping: any) => ({
    name: getAttr(mapping, 'Name') || '',
    dataType: getAttr(mapping, 'DataType') || '',
    label: getAttr(mapping, 'Label') || '',
    listQuery: mapping.ListQuery ? {
      id: getAttr(mapping.ListQuery, 'Id') || '',
      type: 'Select' as const,
      description: getAttr(mapping.ListQuery, 'Description'),
      sql: extractContent(mapping.ListQuery),
    } : undefined,
    options: mapping.Options ? {
      items: Array.isArray(mapping.Options.Option)
        ? mapping.Options.Option.map(parseOption)
        : [parseOption(mapping.Options.Option)],
    } : undefined,
    required: getAttr(mapping, 'Required') === 'true',
    disabled: getAttr(mapping, 'Disabled') === 'true',
    placeholder: getAttr(mapping, 'Placeholder'),
    readonly: getAttr(mapping, 'Readonly') === 'true',
    helperText: getAttr(mapping, 'HelperText'),
    rows: getAttr(mapping, 'Rows') ? parseInt(getAttr(mapping, 'Rows')!, 10) : undefined,
  }));
}
