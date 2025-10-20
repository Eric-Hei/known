import { Database, PropertyConfig, ViewConfig, DatabaseRow, PropertyType } from '../types';

/**
 * Helper functions to safely access database properties
 * and provide defaults for optional fields from the API
 */

export function getDatabaseProperties(database: Database | undefined): PropertyConfig[] {
  return database?.properties || [];
}

export function getDatabaseRows(database: Database | undefined): DatabaseRow[] {
  return database?.rows || [];
}

export function getDatabaseViews(database: Database | undefined): ViewConfig[] {
  return database?.views || [];
}

export function getPropertyType(property: PropertyConfig | undefined): PropertyType {
  // Try property_type first (backend), then type (legacy)
  if (property?.property_type) {
    return property.property_type as PropertyType;
  }
  return property?.type || PropertyType.TEXT;
}

export function getViewType(view: ViewConfig | undefined): string {
  // Try view_type first (backend), then type (legacy)
  return view?.view_type || view?.type || 'table';
}

export function getViewFilters(view: ViewConfig | undefined): any[] {
  return view?.filters || [];
}

export function getViewSorts(view: ViewConfig | undefined): any[] {
  return view?.sorts || [];
}

export function getViewConfig(view: ViewConfig | undefined): any {
  return view?.config || {};
}

export function getRowCreatedAt(row: DatabaseRow | undefined): string {
  return row?.created_at || row?.createdAt || new Date().toISOString();
}

export function getRowUpdatedAt(row: DatabaseRow | undefined): string {
  return row?.updated_at || row?.updatedAt || new Date().toISOString();
}

export function getPropertyOptions(property: PropertyConfig | undefined): any[] {
  // Try config.options first (backend), then options (legacy)
  return property?.config?.options || property?.options || [];
}

/**
 * Normalize a database from the API to ensure all required fields exist
 */
export function normalizeDatabase(database: Database | undefined): Database | undefined {
  if (!database) return undefined;

  return {
    ...database,
    properties: getDatabaseProperties(database),
    rows: getDatabaseRows(database),
    views: getDatabaseViews(database),
  };
}

