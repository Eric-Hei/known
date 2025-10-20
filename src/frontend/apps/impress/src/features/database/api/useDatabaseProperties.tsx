import { useMutation, useQueryClient } from '@tanstack/react-query';

import { APIError, errorCauses, fetchAPI } from '@/api';

import { PropertyConfig } from '../types';

import { KEY_DATABASE } from './useDatabase';

// Create Property
interface CreatePropertyParams {
  databaseId: string;
  name: string;
  property_type: string;
  config?: any;
  order?: number;
}

export const createProperty = async ({
  databaseId,
  ...params
}: CreatePropertyParams): Promise<PropertyConfig> => {
  const response = await fetchAPI(`databases/${databaseId}/properties/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new APIError(
      'Failed to create property',
      await errorCauses(response),
    );
  }

  return response.json() as Promise<PropertyConfig>;
};

export function useCreateProperty() {
  const queryClient = useQueryClient();
  return useMutation<PropertyConfig, APIError, CreatePropertyParams>({
    mutationFn: createProperty,
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [KEY_DATABASE, variables.databaseId],
      });
    },
  });
}

// Update Property
interface UpdatePropertyParams {
  databaseId: string;
  propertyId: string;
  name?: string;
  property_type?: string;
  config?: any;
  order?: number;
}

export const updateProperty = async ({
  databaseId,
  propertyId,
  ...params
}: UpdatePropertyParams): Promise<PropertyConfig> => {
  const response = await fetchAPI(
    `databases/${databaseId}/properties/${propertyId}/`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    },
  );

  if (!response.ok) {
    throw new APIError(
      'Failed to update property',
      await errorCauses(response),
    );
  }

  return response.json() as Promise<PropertyConfig>;
};

export function useUpdateProperty() {
  const queryClient = useQueryClient();
  return useMutation<PropertyConfig, APIError, UpdatePropertyParams>({
    mutationFn: updateProperty,
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [KEY_DATABASE, variables.databaseId],
      });
    },
  });
}

// Delete Property
interface DeletePropertyParams {
  databaseId: string;
  propertyId: string;
}

export const deleteProperty = async ({
  databaseId,
  propertyId,
}: DeletePropertyParams): Promise<void> => {
  const response = await fetchAPI(
    `databases/${databaseId}/properties/${propertyId}/`,
    {
      method: 'DELETE',
    },
  );

  if (!response.ok) {
    throw new APIError(
      'Failed to delete property',
      await errorCauses(response),
    );
  }
};

export function useDeleteProperty() {
  const queryClient = useQueryClient();
  return useMutation<void, APIError, DeletePropertyParams>({
    mutationFn: deleteProperty,
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [KEY_DATABASE, variables.databaseId],
      });
    },
  });
}

