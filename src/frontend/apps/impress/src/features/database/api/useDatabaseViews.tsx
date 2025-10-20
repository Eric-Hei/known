import { useMutation, useQueryClient } from '@tanstack/react-query';

import { APIError, errorCauses, fetchAPI } from '@/api';

import { ViewConfig } from '../types';

import { KEY_DATABASE } from './useDatabase';

// Create View
interface CreateViewParams {
  databaseId: string;
  name: string;
  view_type: string;
  filters?: any[];
  sorts?: any[];
  config?: any;
  order?: number;
}

export const createView = async ({
  databaseId,
  ...params
}: CreateViewParams): Promise<ViewConfig> => {
  const response = await fetchAPI(`databases/${databaseId}/views/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new APIError('Failed to create view', await errorCauses(response));
  }

  return response.json() as Promise<ViewConfig>;
};

export function useCreateView() {
  const queryClient = useQueryClient();
  return useMutation<ViewConfig, APIError, CreateViewParams>({
    mutationFn: createView,
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [KEY_DATABASE, variables.databaseId],
      });
    },
  });
}

// Update View
interface UpdateViewParams {
  databaseId: string;
  viewId: string;
  name?: string;
  view_type?: string;
  filters?: any[];
  sorts?: any[];
  config?: any;
  order?: number;
}

export const updateView = async ({
  databaseId,
  viewId,
  ...params
}: UpdateViewParams): Promise<ViewConfig> => {
  const response = await fetchAPI(`databases/${databaseId}/views/${viewId}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new APIError('Failed to update view', await errorCauses(response));
  }

  return response.json() as Promise<ViewConfig>;
};

export function useUpdateView() {
  const queryClient = useQueryClient();
  return useMutation<ViewConfig, APIError, UpdateViewParams>({
    mutationFn: updateView,
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [KEY_DATABASE, variables.databaseId],
      });
    },
  });
}

// Delete View
interface DeleteViewParams {
  databaseId: string;
  viewId: string;
}

export const deleteView = async ({
  databaseId,
  viewId,
}: DeleteViewParams): Promise<void> => {
  const response = await fetchAPI(`databases/${databaseId}/views/${viewId}/`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new APIError('Failed to delete view', await errorCauses(response));
  }
};

export function useDeleteView() {
  const queryClient = useQueryClient();
  return useMutation<void, APIError, DeleteViewParams>({
    mutationFn: deleteView,
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [KEY_DATABASE, variables.databaseId],
      });
    },
  });
}

