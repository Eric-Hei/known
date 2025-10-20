import {
  DatabaseRow,
  Filter,
  FilterOperator,
  Sort,
  SortDirection,
  PropertyType,
  PropertyConfig,
} from '../types';

/**
 * Apply a single filter to a row
 */
export const applyFilter = (
  row: DatabaseRow,
  filter: Filter,
  property: PropertyConfig
): boolean => {
  const value = row.properties[filter.propertyId];

  switch (filter.operator) {
    case FilterOperator.IS_EMPTY:
      if (Array.isArray(value)) {
        return value.length === 0;
      }
      return value === undefined || value === null || value === '';

    case FilterOperator.IS_NOT_EMPTY:
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== undefined && value !== null && value !== '';

    case FilterOperator.EQUALS:
      // For MULTI_SELECT (array), check if array contains the value
      if (Array.isArray(value)) {
        return value.includes(filter.value);
      }
      return value === filter.value;

    case FilterOperator.NOT_EQUALS:
      // For MULTI_SELECT (array), check if array does NOT contain the value
      if (Array.isArray(value)) {
        return !value.includes(filter.value);
      }
      return value !== filter.value;

    case FilterOperator.CONTAINS:
      // For MULTI_SELECT (array), check if array contains the value
      if (Array.isArray(value)) {
        return value.includes(filter.value);
      }
      // For TEXT fields, check if string contains the filter value
      if (typeof value !== 'string') return false;
      return value.toLowerCase().includes(String(filter.value).toLowerCase());

    case FilterOperator.NOT_CONTAINS:
      // For MULTI_SELECT (array), check if array does NOT contain the value
      if (Array.isArray(value)) {
        return !value.includes(filter.value);
      }
      // For TEXT fields, check if string does NOT contain the filter value
      if (typeof value !== 'string') return true;
      return !value.toLowerCase().includes(String(filter.value).toLowerCase());

    case FilterOperator.STARTS_WITH:
      if (typeof value !== 'string') return false;
      return value.toLowerCase().startsWith(String(filter.value).toLowerCase());

    case FilterOperator.ENDS_WITH:
      if (typeof value !== 'string') return false;
      return value.toLowerCase().endsWith(String(filter.value).toLowerCase());

    case FilterOperator.GREATER_THAN:
      if (property.type === PropertyType.NUMBER) {
        return Number(value) > Number(filter.value);
      }
      if (property.type === PropertyType.DATE) {
        return new Date(value) > new Date(filter.value);
      }
      return false;

    case FilterOperator.LESS_THAN:
      if (property.type === PropertyType.NUMBER) {
        return Number(value) < Number(filter.value);
      }
      if (property.type === PropertyType.DATE) {
        return new Date(value) < new Date(filter.value);
      }
      return false;

    case FilterOperator.GREATER_THAN_OR_EQUAL:
      if (property.type === PropertyType.NUMBER) {
        return Number(value) >= Number(filter.value);
      }
      if (property.type === PropertyType.DATE) {
        return new Date(value) >= new Date(filter.value);
      }
      return false;

    case FilterOperator.LESS_THAN_OR_EQUAL:
      if (property.type === PropertyType.NUMBER) {
        return Number(value) <= Number(filter.value);
      }
      if (property.type === PropertyType.DATE) {
        return new Date(value) <= new Date(filter.value);
      }
      return false;

    case FilterOperator.IS_CHECKED:
      return value === true;

    case FilterOperator.IS_NOT_CHECKED:
      return value !== true;

    default:
      return true;
  }
};

/**
 * Apply all filters to rows
 */
export const applyFilters = (
  rows: DatabaseRow[],
  filters: Filter[],
  properties: PropertyConfig[]
): DatabaseRow[] => {
  if (filters.length === 0) return rows;

  return rows.filter((row) => {
    return filters.every((filter) => {
      const property = properties.find((p) => p.id === filter.propertyId);
      if (!property) return true;
      return applyFilter(row, filter, property);
    });
  });
};

/**
 * Compare two values for sorting
 */
const compareValues = (a: any, b: any, propertyType: PropertyType): number => {
  // Handle null/undefined
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;

  switch (propertyType) {
    case PropertyType.NUMBER:
      return Number(a) - Number(b);

    case PropertyType.DATE:
    case PropertyType.CREATED_TIME:
    case PropertyType.UPDATED_TIME:
      return new Date(a).getTime() - new Date(b).getTime();

    case PropertyType.CHECKBOX:
      return a === b ? 0 : a ? -1 : 1;

    case PropertyType.TEXT:
    case PropertyType.EMAIL:
    case PropertyType.PHONE:
    case PropertyType.URL:
    default:
      return String(a).localeCompare(String(b));
  }
};

/**
 * Apply sorts to rows
 */
export const applySorts = (
  rows: DatabaseRow[],
  sorts: Sort[],
  properties: PropertyConfig[]
): DatabaseRow[] => {
  if (sorts.length === 0) return rows;

  return [...rows].sort((a, b) => {
    for (const sort of sorts) {
      const property = properties.find((p) => p.id === sort.propertyId);
      if (!property) continue;

      const aValue = a.properties[sort.propertyId];
      const bValue = b.properties[sort.propertyId];

      const comparison = compareValues(aValue, bValue, property.type);

      if (comparison !== 0) {
        return sort.direction === SortDirection.ASC ? comparison : -comparison;
      }
    }
    return 0;
  });
};

/**
 * Apply both filters and sorts to rows
 */
export const applyFiltersAndSorts = (
  rows: DatabaseRow[],
  filters: Filter[],
  sorts: Sort[],
  properties: PropertyConfig[]
): DatabaseRow[] => {
  const filtered = applyFilters(rows, filters, properties);
  return applySorts(filtered, sorts, properties);
};

/**
 * Get available filter operators for a property type
 */
export const getAvailableOperators = (propertyType: PropertyType): FilterOperator[] => {
  const common = [FilterOperator.IS_EMPTY, FilterOperator.IS_NOT_EMPTY];

  switch (propertyType) {
    case PropertyType.TEXT:
    case PropertyType.EMAIL:
    case PropertyType.PHONE:
    case PropertyType.URL:
      return [
        FilterOperator.EQUALS,
        FilterOperator.NOT_EQUALS,
        FilterOperator.CONTAINS,
        FilterOperator.NOT_CONTAINS,
        FilterOperator.STARTS_WITH,
        FilterOperator.ENDS_WITH,
        ...common,
      ];

    case PropertyType.NUMBER:
      return [
        FilterOperator.EQUALS,
        FilterOperator.NOT_EQUALS,
        FilterOperator.GREATER_THAN,
        FilterOperator.LESS_THAN,
        FilterOperator.GREATER_THAN_OR_EQUAL,
        FilterOperator.LESS_THAN_OR_EQUAL,
        ...common,
      ];

    case PropertyType.DATE:
    case PropertyType.CREATED_TIME:
    case PropertyType.UPDATED_TIME:
      return [
        FilterOperator.EQUALS,
        FilterOperator.GREATER_THAN,
        FilterOperator.LESS_THAN,
        FilterOperator.GREATER_THAN_OR_EQUAL,
        FilterOperator.LESS_THAN_OR_EQUAL,
        ...common,
      ];

    case PropertyType.SELECT:
      return [
        FilterOperator.EQUALS,
        FilterOperator.NOT_EQUALS,
        ...common,
      ];

    case PropertyType.MULTI_SELECT:
      return [
        FilterOperator.CONTAINS,
        FilterOperator.NOT_CONTAINS,
        ...common,
      ];

    case PropertyType.CHECKBOX:
      return [FilterOperator.IS_CHECKED, FilterOperator.IS_NOT_CHECKED];

    default:
      return common;
  }
};

