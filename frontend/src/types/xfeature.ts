/**
 * XFeature Type Definitions
 * Comprehensive types for XFeature specification and runtime
 */

// ============================================================================
// CORE XFEATURE TYPES
// ============================================================================

export interface XFeature {
  name: string;
  version: string;
  backend: BackendInfo;
  frontend: FrontendInfo;
  mappings?: Mapping[];
}

// ============================================================================
// BACKEND TYPES
// ============================================================================

export interface BackendInfo {
  queries: Query[];
  actionQueries: ActionQuery[];
}

export interface Query {
  id: string;
  type: 'Select';
  description?: string;
  sql: string;
  parameters?: Parameter[];
}

// ============================================================================
// PARAMETER MAPPING TYPES
// ============================================================================

export interface Mapping {
  name: string;
  dataType: string;
  label: string;
  listQuery?: ListQuery;
  options?: Options;
  required?:boolean;
  disabled?:boolean;
  placeholder?:string;
  readonly?:boolean;
  helperText?:string;
  rows?:number;
}

export interface ListQuery {
  id: string;
  type: 'Select';
  description?: string;
  sql: string;
}

export interface Options {
  items: MappingOption[];
}

export interface MappingOption {
  label: string;
  value: string;
}

export interface MappingsResponse {
  feature: string;
  version: string;
  mappings: Mapping[];
  resolvedCount: number;
}

export interface ActionQuery {
  id: string;
  type: 'Insert' | 'Update' | 'Delete';
  description?: string;
  sql: string;
  parameters?: Parameter[];
}

export interface Parameter {
  name: string;
  type?: string;
  required?: boolean;
  validation?: string;
}

// ============================================================================
// FRONTEND TYPES
// ============================================================================

export interface FrontendInfo {
  dataTables: DataTable[];
  forms: Form[];
}

// ============================================================================
// DATATABLE TYPES
// ============================================================================

export interface DataTable {
  id: string;
  queryRef: string;
  title?: string;
  description?: string;
  pagination?: boolean;
  pageSize?: number;
  sortable?: boolean;
  filterable?: boolean;
  searchable?: boolean;
  columns: Column[];
  formActions?: string; // Comma-separated form IDs
}

export interface Column {
  name: string;
  label: string;
  type: ColumnType;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  format?: string;
  align?: 'left' | 'center' | 'right';
  formActions?: string; // Comma-separated form IDs for row actions
}

export type ColumnType =
  | 'Text'
  | 'Number'
  | 'Date'
  | 'DateTime'
  | 'Boolean'
  | 'Currency'
  | 'Percentage'
  | 'Link'
  | 'Badge'
  | 'Image'
  | 'Email'
  | 'Phone'
  | 'URL';

// ============================================================================
// FORM TYPES
// ============================================================================

export interface Form {
  id: string;
  mode: FormMode;
  title?: string;
  description?: string;
  actionRef?: string;
  queryRef?: string;
  dialog?: boolean;
  fields: Mapping[];
  buttons: Button[];
  messages?: Message[];
}

export type FormMode = 'Create' | 'Edit' | 'View' | 'Delete' | 'Search';

 
export type FieldType =
  | 'Text'
  | 'Email'
  | 'Password'
  | 'Number'
  | 'Decimal'
  | 'Date'
  | 'DateTime'
  | 'Time'
  | 'Select'
  | 'MultiSelect'
  | 'Checkbox'
  | 'Radio'
  | 'Textarea'
  | 'Currency'
  | 'Phone'
  | 'URL'
  | 'File'
  | 'Hidden';

export interface Option {
  value: string | number;
  label: string;
}

export interface Button {
  id?: string;
  type: ButtonType;
  label?: string;
  style?: ButtonStyle;
  disabled?: boolean;
  onClick?: () => void;
}

export type ButtonType = 'Submit' | 'Cancel' | 'Reset' | 'Close' | 'Custom';
export type ButtonStyle = 'Primary' | 'Secondary' | 'Danger' | 'Success' | 'Warning' | 'Info';

export interface Message {
  type: MessageType;
  content: string;
  visible?: boolean;
}

export type MessageType = 'Info' | 'Warning' | 'Error' | 'Success';

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface QueryRequest {
  [key: string]: string | number | boolean | undefined;
}

export interface QueryResponse<T = Record<string, unknown>> {
  data: T[];
  total?: number;
  page?: number;
  pageSize?: number;
}

export interface ActionQueryRequest {
  [key: string]: string | number | boolean | undefined;
}

export interface ActionQueryResponse {
  success: boolean;
  message?: string;
  data?: Record<string, unknown>;
}

export interface FrontendElements {
  feature: string;
  version: string;
  dataTables: DataTable[];
  forms: Form[];
}

// ============================================================================
// COMPONENT PROPS TYPES
// ============================================================================

export interface XFeatureDataTableProps {
id:string;
  onRowAction?: (formId: string, rowData: Record<string, unknown>) => void;
  onRefresh?: () => void;
}

export interface XFeatureFormProps {
  definition: Form;
  initialData?: Record<string, unknown>;
  onSuccess?: (data: ActionQueryResponse) => void;
  onCancel?: () => void;
  onClose?: () => void;
}

export interface XFeatureFieldProps {
  value?: string | number | boolean;
  onChange: (value: string | number | boolean) => void;
  onBlur?: () => void;
  errors?: string[];
  name?:string;
  definition?:Mapping;
}

export interface XFeatureButtonProps {
  definition: Button;
  onClick?: () => void;
  loading?: boolean;
}

export interface XFeatureMessageProps {
  definition: Message;
}

// ============================================================================
// FRONTEND ELEMENTS EVENT TYPES
// ============================================================================

export interface XFeatureBeforeFrontendEvent {
  featureName: string;
}

export interface XFeatureAfterFrontendEvent {
  featureName: string;
  result: FrontendElements;
}

export type XFeatureBeforeFrontendHandler = (
  event: XFeatureBeforeFrontendEvent
) => FrontendElements | undefined | Promise<FrontendElements | undefined>;

export type XFeatureAfterFrontendHandler = (
  event: XFeatureAfterFrontendEvent
) => void | Promise<void>;

 export interface FormState {
  values: Record<string, string | number | boolean>;
  errors: Record<string, string[]>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
}

export interface DataTableState {
  data: Record<string, unknown>[];
  loading: boolean;
  error?: Error;
  page: number;
  pageSize: number;
  total: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  searchQuery?: string;
  filters?: Record<string, unknown>;
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface ValidationRule {
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  required?: boolean;
  custom?: (value: unknown) => boolean;
  message?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}
