import { useMutation, useQueryClient } from '@tanstack/react-query';

import { APIError, errorCauses, fetchAPI } from '@/api';

import { Database } from '../types';

import { KEY_LIST_DATABASE } from './useDatabases';

interface CreateDatabaseParams {
  title: string;
  description?: string;
  icon?: string;
  cover?: string;
}

export const createDatabase = async (
  params: CreateDatabaseParams,
): Promise<Database> => {
  console.log('[createDatabase] Creating database with params:', params);

  const response = await fetchAPI(`databases/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  console.log('[createDatabase] Response status:', response.status);

  if (!response.ok) {
    const error = await errorCauses(response);
    console.error('[createDatabase] Failed to create database:', error);
    throw new APIError(
      'Failed to create the database',
      error,
    );
  }

  const data = await response.json();
  console.log('[createDatabase] Database created successfully:', data);
  return data as Database;
};

interface UseCreateDatabaseProps {
  onSuccess?: (data: Database) => void;
}

export function useCreateDatabase({ onSuccess }: UseCreateDatabaseProps = {}) {
  const queryClient = useQueryClient();
  return useMutation<Database, APIError, CreateDatabaseParams>({
    mutationFn: createDatabase,
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: [KEY_LIST_DATABASE],
      });
      onSuccess?.(data);
    },
  });
}

