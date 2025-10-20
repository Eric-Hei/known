import { useQuery } from '@tanstack/react-query';

import { APIError, errorCauses, fetchAPI } from '@/api';

import { Database, PropertyType, ViewType } from '../types';

export const KEY_DATABASE = 'database';

export const getDatabase = async (id: string): Promise<Database> => {
  const response = await fetchAPI(`databases/${id}/`);

  if (!response.ok) {
    throw new APIError(
      'Failed to fetch database',
      await errorCauses(response),
    );
  }

  const data = await response.json();

  // Normalize the database to ensure all required fields exist
  const normalized: Database = {
    ...data,
    properties: (data.properties || []).map((prop: any) => ({
      ...prop,
      type: (prop.property_type || prop.type || PropertyType.TEXT) as PropertyType,
      options: prop.config?.options || prop.options || [],
    })),
    rows: (data.rows || []).map((row: any) => ({
      ...row,
      createdAt: row.created_at || row.createdAt || new Date().toISOString(),
      updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
    })),
    views: (data.views || []).map((view: any) => ({
      ...view,
      type: (view.view_type || view.type || ViewType.TABLE) as ViewType,
      filters: view.filters || [],
      sorts: view.sorts || [],
      visibleProperties: view.config?.visibleProperties || view.visibleProperties || [],
      groupByProperty: view.config?.groupByProperty || view.groupByProperty,
      dateProperty: view.config?.dateProperty || view.dateProperty,
      coverProperty: view.config?.coverProperty || view.coverProperty,
    })),
  };

  return normalized;
};

export function useDatabase(id: string | undefined) {
  return useQuery<Database, APIError>({
    queryKey: [KEY_DATABASE, id],
    queryFn: () => getDatabase(id!),
    enabled: !!id,
  });
}

