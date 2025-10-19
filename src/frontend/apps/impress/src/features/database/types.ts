/**
 * Database types for Known
 * Inspired by Notion's database system
 */

export enum PropertyType {
  TEXT = 'text',
  NUMBER = 'number',
  SELECT = 'select',
  MULTI_SELECT = 'multi_select',
  DATE = 'date',
  CHECKBOX = 'checkbox',
  URL = 'url',
  EMAIL = 'email',
  PHONE = 'phone',
  RELATION = 'relation',
  CREATED_TIME = 'created_time',
  UPDATED_TIME = 'updated_time',
}

export enum ViewType {
  TABLE = 'table',
  BOARD = 'board',
  LIST = 'list',
  CALENDAR = 'calendar',
  GALLERY = 'gallery',
}

export enum FilterOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  STARTS_WITH = 'starts_with',
  ENDS_WITH = 'ends_with',
  IS_EMPTY = 'is_empty',
  IS_NOT_EMPTY = 'is_not_empty',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  GREATER_THAN_OR_EQUAL = 'greater_than_or_equal',
  LESS_THAN_OR_EQUAL = 'less_than_or_equal',
  IS_CHECKED = 'is_checked',
  IS_NOT_CHECKED = 'is_not_checked',
}

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export interface SelectOption {
  id: string;
  value: string;
  color: string;
}

export interface PropertyConfig {
  id: string;
  name: string;
  type: PropertyType;
  options?: SelectOption[]; // For SELECT and MULTI_SELECT
  relationTo?: string; // For RELATION type
}

export interface PropertyValue {
  propertyId: string;
  value: any; // Type depends on PropertyType
}

export interface DatabaseRow {
  id: string;
  properties: Record<string, any>; // propertyId -> value
  createdAt: string;
  updatedAt: string;
  pageId?: string; // Optional link to a page
}

export interface Filter {
  id: string;
  propertyId: string;
  operator: FilterOperator;
  value?: any;
}

export interface Sort {
  propertyId: string;
  direction: SortDirection;
}

export interface ViewConfig {
  id: string;
  name: string;
  type: ViewType;
  filters: Filter[];
  sorts: Sort[];
  visibleProperties: string[]; // Array of property IDs
  // Board-specific
  groupByProperty?: string; // For BOARD view
  // Calendar-specific
  dateProperty?: string; // For CALENDAR view
  // Gallery-specific
  coverProperty?: string; // For GALLERY view
}

export interface Database {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  cover?: string;
  properties: PropertyConfig[];
  rows: DatabaseRow[];
  views: ViewConfig[];
  activeViewId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseBlock {
  type: 'database';
  databaseId: string;
  viewId?: string; // Optional: specific view to display
}

// Color palette for select options
export const SELECT_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#FFA07A', // Orange
  '#98D8C8', // Mint
  '#F7DC6F', // Yellow
  '#BB8FCE', // Purple
  '#85C1E2', // Sky Blue
  '#F8B739', // Gold
  '#52B788', // Green
  '#E76F51', // Coral
  '#2A9D8F', // Dark Teal
];

