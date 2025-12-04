/**
 * XFeature XML to TypeScript Converter
 * Converts XFeature.xml string to TypeScript XFeature interface
 *
 * Usage:
 * const xmlString = `<Feature Name="UserManagement" Version="1.9">...</Feature>`;
 * const result = convertXmlToXFeature(xmlString);
 */

import { XFeature, BackendInfo, FrontendInfo, Query, ActionQuery, DataTable, Column, Form, Button, Mapping, Parameter, Message } from '../types/xfeature';

interface RawXMLFeature {
  Feature?: {
    $: {
      Name?: string;
      Version?: string;
    };
    Backend?: {
      Query?: any[];
      ActionQuery?: any[];
    };
    Frontend?: {
      DataTable?: any[];
      Form?: any[];
    };
    Mapping?: any[];
  };
}

/**
 * PROTOTYPE: Converts XML string to XFeature interface
 * This is a basic implementation for testing
 */
export function convertXmlToXFeature(xmlString: string): XFeature {
  // NOTE: This is a prototype. In production, we'll use fast-xml-parser library
  // For now, this demonstrates the structure and expected output

  const result: XFeature = {
    name: '',
    version: '',
    backend: {
      queries: [],
      actionQueries: [],
    },
    frontend: {
      dataTables: [],
      forms: [],
    },
    mappings: [],
  };

  try {
    // TODO: Parse XML string
    // TODO: Extract Feature attributes (Name, Version)
    // TODO: Parse Backend section (Query, ActionQuery)
    // TODO: Parse Frontend section (DataTable, Form)
    // TODO: Parse Mapping section

    return result;
  } catch (error) {
    throw new Error(`Failed to convert XML to XFeature: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Helper: Extract SQL content from CDATA
 */
function extractSqlContent(element: any): string {
  if (typeof element === 'string') {
    return element.trim();
  }
  if (element?._text) {
    return element._text.trim();
  }
  return '';
}

/**
 * Helper: Extract attributes from element
 */
function getAttributes(element: any): Record<string, string> {
  if (element?.$ && typeof element.$ === 'object') {
    return element.$;
  }
  return {};
}

/**
 * Helper: Parse Query element
 */
function parseQuery(element: any): Query {
  const attrs = getAttributes(element);
  return {
    id: attrs.Id || '',
    type: 'Select',
    description: attrs.Description,
    sql: extractSqlContent(element),
    parameters: [],
  };
}

/**
 * Helper: Parse ActionQuery element
 */
function parseActionQuery(element: any): ActionQuery {
  const attrs = getAttributes(element);
  return {
    id: attrs.Id || '',
    type: (attrs.Type || 'Insert') as 'Insert' | 'Update' | 'Delete',
    description: attrs.Description,
    sql: extractSqlContent(element),
    parameters: [],
  };
}

/**
 * Helper: Parse Column element
 */
function parseColumn(element: any): Column {
  const attrs = getAttributes(element);
  return {
    name: attrs.Name || '',
    label: attrs.Label || '',
    type: (attrs.Type || 'Text') as any,
    sortable: attrs.Sortable === 'true',
    filterable: attrs.Filterable === 'true',
    width: attrs.Width,
    format: attrs.Format,
    align: (attrs.Align || 'left') as 'left' | 'center' | 'right',
  };
}

/**
 * Helper: Parse DataTable element
 */
function parseDataTable(element: any): DataTable {
  const attrs = getAttributes(element);
  const columns: Column[] = Array.isArray(element.Column)
    ? element.Column.map(parseColumn)
    : element.Column
    ? [parseColumn(element.Column)]
    : [];

  return {
    id: attrs.Id || '',
    queryRef: attrs.QueryRef || '',
    title: attrs.Title,
    description: attrs.Description,
    pagination: attrs.Pagination === 'true',
    pageSize: attrs.PageSize ? parseInt(attrs.PageSize, 10) : undefined,
    sortable: attrs.Sortable === 'true',
    filterable: attrs.Filterable === 'true',
    searchable: attrs.Searchable === 'true',
    columns,
    formActions: attrs.FormActions,
  };
}

/**
 * Helper: Parse Form element
 */
function parseForm(element: any): Form {
  const attrs = getAttributes(element);
  const fields: any[] = Array.isArray(element.Field)
    ? element.Field
    : element.Field
    ? [element.Field]
    : [];

  const buttons: Button[] = Array.isArray(element.Button)
    ? element.Button.map((btn: any) => {
        const btnAttrs = getAttributes(btn);
        return {
          id: btnAttrs.Id,
          type: btnAttrs.Type as any,
          label: btnAttrs.Label,
          style: btnAttrs.Style as any,
          disabled: btnAttrs.Disabled === 'true',
        };
      })
    : element.Button
    ? [{
        id: element.Button.$.Id,
        type: element.Button.$.Type as any,
        label: element.Button.$.Label,
        style: element.Button.$.Style as any,
        disabled: element.Button.$.Disabled === 'true',
      }]
    : [];

  const messages: Message[] = Array.isArray(element.Message)
    ? element.Message.map((msg: any) => {
        const msgAttrs = getAttributes(msg);
        return {
          type: msgAttrs.Type as any,
          content: typeof msg === 'string' ? msg : msg._text || '',
          visible: msgAttrs.Visible !== 'false',
        };
      })
    : element.Message
    ? [{
        type: element.Message.$.Type as any,
        content: typeof element.Message === 'string' ? element.Message : element.Message._text || '',
        visible: element.Message.$.Visible !== 'false',
      }]
    : [];

  return {
    id: attrs.Id || '',
    mode: (attrs.Mode || 'Create') as any,
    title: attrs.Title,
    description: attrs.Description,
    actionRef: attrs.ActionRef,
    queryRef: attrs.QueryRef,
    dialog: attrs.Dialog === 'true',
    fields: fields.map((f: any) => {
      const fieldAttrs = getAttributes(f);
      return {
        name: fieldAttrs.Name || '',
        dataType: fieldAttrs.Type || 'Text',
        label: fieldAttrs.Label || '',
        required: fieldAttrs.Required === 'true',
        placeholder: fieldAttrs.Placeholder,
      };
    }),
    buttons,
    messages,
  };
}

/**
 * Helper: Parse Mapping element
 */
function parseMapping(element: any): Mapping {
  const attrs = getAttributes(element);
  return {
    name: attrs.Name || '',
    dataType: attrs.DataType || '',
    label: attrs.Label || '',
    required: attrs.Required === 'true',
    disabled: attrs.Disabled === 'true',
    placeholder: attrs.Placeholder,
    readonly: attrs.Readonly === 'true',
    helperText: attrs.HelperText,
    rows: attrs.Rows ? parseInt(attrs.Rows, 10) : undefined,
  };
}
