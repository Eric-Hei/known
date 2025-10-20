import { useMutation, useQueryClient } from '@tanstack/react-query';

import { APIError, errorCauses, fetchAPI } from '@/api';

import { DatabaseRow } from '../types';

import { KEY_DATABASE } from './useDatabase';

// Create Row
interface CreateRowParams {
  databaseId: string;
  properties?: Record<string, any>;
  page_id?: string;
  order?: number;
}

export const createRow = async ({
  databaseId,
  ...params
}: CreateRowParams): Promise<DatabaseRow> => {
  console.log('[createRow] Creating row with params:', params);

  const response = await fetchAPI(`databases/${databaseId}/rows/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  console.log('[createRow] Response status:', response.status);

  if (!response.ok) {
    const error = await errorCauses(response);
    console.error('[createRow] Failed to create row:', error);
    throw new APIError('Failed to create row', error);
  }

  const data = await response.json();
  console.log('[createRow] Row created successfully:', data);
  return data as DatabaseRow;
};

export function useCreateRow() {
  const queryClient = useQueryClient();
  return useMutation<DatabaseRow, APIError, CreateRowParams>({
    mutationFn: createRow,
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [KEY_DATABASE, variables.databaseId],
      });
    },
  });
}

// Update Row
interface UpdateRowParams {
  databaseId: string;
  rowId: string;
  properties?: Record<string, any>;
  page_id?: string;
  order?: number;
}

export const updateRow = async ({
  databaseId,
  rowId,
  ...params
}: UpdateRowParams): Promise<DatabaseRow> => {
  const response = await fetchAPI(`databases/${databaseId}/rows/${rowId}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new APIError('Failed to update row', await errorCauses(response));
  }

  return response.json() as Promise<DatabaseRow>;
};

export function useUpdateRow() {
  const queryClient = useQueryClient();
  return useMutation<DatabaseRow, APIError, UpdateRowParams>({
    mutationFn: updateRow,
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [KEY_DATABASE, variables.databaseId],
      });
    },
  });
}

// Delete Row
interface DeleteRowParams {
  databaseId: string;
  rowId: string;
}

export const deleteRow = async ({
  databaseId,
  rowId,
}: DeleteRowParams): Promise<void> => {
  const response = await fetchAPI(`databases/${databaseId}/rows/${rowId}/`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new APIError('Failed to delete row', await errorCauses(response));
  }
};

export function useDeleteRow() {
  const queryClient = useQueryClient();
  return useMutation<void, APIError, DeleteRowParams>({
    mutationFn: deleteRow,
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [KEY_DATABASE, variables.databaseId],
      });
    },
  });
}

