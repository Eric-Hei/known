import { useMutation, useQueryClient } from '@tanstack/react-query';

import { APIError, errorCauses, fetchAPI } from '@/api';

import { Database } from '../types';

import { KEY_DATABASE } from './useDatabase';
import { KEY_LIST_DATABASE } from './useDatabases';

interface UpdateDatabaseParams {
  id: string;
  title?: string;
  description?: string;
  icon?: string;
  cover?: string;
}

export const updateDatabase = async ({
  id,
  ...params
}: UpdateDatabaseParams): Promise<Database> => {
  const response = await fetchAPI(`databases/${id}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new APIError(
      'Failed to update the database',
      await errorCauses(response),
    );
  }

  return response.json() as Promise<Database>;
};

interface UseUpdateDatabaseProps {
  onSuccess?: (data: Database) => void;
}

export function useUpdateDatabase({ onSuccess }: UseUpdateDatabaseProps = {}) {
  const queryClient = useQueryClient();
  return useMutation<Database, APIError, UpdateDatabaseParams>({
    mutationFn: updateDatabase,
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: [KEY_DATABASE, data.id],
      });
      void queryClient.invalidateQueries({
        queryKey: [KEY_LIST_DATABASE],
      });
      onSuccess?.(data);
    },
  });
}

