import { useQuery } from '@tanstack/react-query';

import { APIError, errorCauses, fetchAPI } from '@/api';

import { Database } from '../types';

export const KEY_LIST_DATABASE = 'databases';

export const getDatabases = async (): Promise<Database[]> => {
  console.log('[getDatabases] Fetching databases...');
  const response = await fetchAPI(`databases/`);

  console.log('[getDatabases] Response status:', response.status);

  if (!response.ok) {
    const error = await errorCauses(response);
    console.error('[getDatabases] Failed to fetch databases:', error);
    throw new APIError(
      'Failed to fetch databases',
      error,
    );
  }

  const data = await response.json();
  console.log('[getDatabases] Databases fetched:', data);

  // Handle paginated response
  if (data && typeof data === 'object' && 'results' in data) {
    console.log('[getDatabases] Returning results array:', data.results);
    return data.results as Database[];
  }

  // Fallback for non-paginated response
  return data as Database[];
};

export function useDatabases() {
  return useQuery<Database[], APIError>({
    queryKey: [KEY_LIST_DATABASE],
    queryFn: getDatabases,
  });
}

