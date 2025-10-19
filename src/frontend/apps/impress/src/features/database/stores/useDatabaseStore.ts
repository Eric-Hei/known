import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Database,
  DatabaseRow,
  PropertyConfig,
  ViewConfig,
  Filter,
  Sort,
  PropertyType,
  ViewType,
  SortDirection,
} from '../types';

interface DatabaseState {
  databases: Record<string, Database>;
  
  // Database operations
  createDatabase: (title: string, pageId?: string) => Database;
  updateDatabase: (id: string, updates: Partial<Database>) => void;
  deleteDatabase: (id: string) => void;
  getDatabase: (id: string) => Database | undefined;
  
  // Property operations
  addProperty: (databaseId: string, property: Omit<PropertyConfig, 'id'>) => void;
  updateProperty: (databaseId: string, propertyId: string, updates: Partial<PropertyConfig>) => void;
  deleteProperty: (databaseId: string, propertyId: string) => void;
  
  // Row operations
  addRow: (databaseId: string, properties?: Record<string, any>) => DatabaseRow;
  updateRow: (databaseId: string, rowId: string, properties: Record<string, any>) => void;
  deleteRow: (databaseId: string, rowId: string) => void;
  
  // View operations
  addView: (databaseId: string, view: Omit<ViewConfig, 'id'>) => void;
  updateView: (databaseId: string, viewId: string, updates: Partial<ViewConfig>) => void;
  deleteView: (databaseId: string, viewId: string) => void;
  setActiveView: (databaseId: string, viewId: string) => void;
  
  // Filter operations
  addFilter: (databaseId: string, viewId: string, filter: Omit<Filter, 'id'>) => void;
  updateFilter: (databaseId: string, viewId: string, filterId: string, updates: Partial<Filter>) => void;
  deleteFilter: (databaseId: string, viewId: string, filterId: string) => void;
  
  // Sort operations
  addSort: (databaseId: string, viewId: string, sort: Sort) => void;
  updateSort: (databaseId: string, viewId: string, propertyId: string, direction: SortDirection) => void;
  deleteSort: (databaseId: string, viewId: string, propertyId: string) => void;
}

const generateId = () => crypto.randomUUID();

export const useDatabaseStore = create<DatabaseState>()(
  persist(
    (set, get) => ({
      databases: {},

      createDatabase: (title: string, pageId?: string) => {
        const id = generateId();
        const now = new Date().toISOString();
        
        const defaultView: ViewConfig = {
          id: generateId(),
          name: 'All',
          type: ViewType.TABLE,
          filters: [],
          sorts: [],
          visibleProperties: [],
        };

        const database: Database = {
          id,
          title,
          properties: [
            {
              id: generateId(),
              name: 'Name',
              type: PropertyType.TEXT,
            },
          ],
          rows: [],
          views: [defaultView],
          activeViewId: defaultView.id,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          databases: {
            ...state.databases,
            [id]: database,
          },
        }));

        return database;
      },

      updateDatabase: (id: string, updates: Partial<Database>) => {
        set((state) => {
          const database = state.databases[id];
          if (!database) return state;

          return {
            databases: {
              ...state.databases,
              [id]: {
                ...database,
                ...updates,
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      deleteDatabase: (id: string) => {
        set((state) => {
          const { [id]: _, ...rest } = state.databases;
          return { databases: rest };
        });
      },

      getDatabase: (id: string) => {
        return get().databases[id];
      },

      addProperty: (databaseId: string, property: Omit<PropertyConfig, 'id'>) => {
        set((state) => {
          const database = state.databases[databaseId];
          if (!database) return state;

          const newProperty: PropertyConfig = {
            ...property,
            id: generateId(),
          };

          return {
            databases: {
              ...state.databases,
              [databaseId]: {
                ...database,
                properties: [...database.properties, newProperty],
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      updateProperty: (databaseId: string, propertyId: string, updates: Partial<PropertyConfig>) => {
        set((state) => {
          const database = state.databases[databaseId];
          if (!database) return state;

          return {
            databases: {
              ...state.databases,
              [databaseId]: {
                ...database,
                properties: database.properties.map((prop) =>
                  prop.id === propertyId ? { ...prop, ...updates } : prop
                ),
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      deleteProperty: (databaseId: string, propertyId: string) => {
        set((state) => {
          const database = state.databases[databaseId];
          if (!database) return state;

          return {
            databases: {
              ...state.databases,
              [databaseId]: {
                ...database,
                properties: database.properties.filter((prop) => prop.id !== propertyId),
                rows: database.rows.map((row) => {
                  const { [propertyId]: _, ...rest } = row.properties;
                  return { ...row, properties: rest };
                }),
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      addRow: (databaseId: string, properties: Record<string, any> = {}) => {
        const id = generateId();
        const now = new Date().toISOString();

        const newRow: DatabaseRow = {
          id,
          properties,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => {
          const database = state.databases[databaseId];
          if (!database) return state;

          return {
            databases: {
              ...state.databases,
              [databaseId]: {
                ...database,
                rows: [...database.rows, newRow],
                updatedAt: now,
              },
            },
          };
        });

        return newRow;
      },

      updateRow: (databaseId: string, rowId: string, properties: Record<string, any>) => {
        set((state) => {
          const database = state.databases[databaseId];
          if (!database) return state;

          return {
            databases: {
              ...state.databases,
              [databaseId]: {
                ...database,
                rows: database.rows.map((row) =>
                  row.id === rowId
                    ? {
                        ...row,
                        properties: { ...row.properties, ...properties },
                        updatedAt: new Date().toISOString(),
                      }
                    : row
                ),
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      deleteRow: (databaseId: string, rowId: string) => {
        set((state) => {
          const database = state.databases[databaseId];
          if (!database) return state;

          return {
            databases: {
              ...state.databases,
              [databaseId]: {
                ...database,
                rows: database.rows.filter((row) => row.id !== rowId),
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      addView: (databaseId: string, view: Omit<ViewConfig, 'id'>) => {
        set((state) => {
          const database = state.databases[databaseId];
          if (!database) return state;

          const newView: ViewConfig = {
            ...view,
            id: generateId(),
          };

          return {
            databases: {
              ...state.databases,
              [databaseId]: {
                ...database,
                views: [...database.views, newView],
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      updateView: (databaseId: string, viewId: string, updates: Partial<ViewConfig>) => {
        set((state) => {
          const database = state.databases[databaseId];
          if (!database) return state;

          return {
            databases: {
              ...state.databases,
              [databaseId]: {
                ...database,
                views: database.views.map((view) =>
                  view.id === viewId ? { ...view, ...updates } : view
                ),
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      deleteView: (databaseId: string, viewId: string) => {
        set((state) => {
          const database = state.databases[databaseId];
          if (!database || database.views.length <= 1) return state;

          const newViews = database.views.filter((view) => view.id !== viewId);
          const newActiveViewId =
            database.activeViewId === viewId ? newViews[0].id : database.activeViewId;

          return {
            databases: {
              ...state.databases,
              [databaseId]: {
                ...database,
                views: newViews,
                activeViewId: newActiveViewId,
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      setActiveView: (databaseId: string, viewId: string) => {
        set((state) => {
          const database = state.databases[databaseId];
          if (!database) return state;

          return {
            databases: {
              ...state.databases,
              [databaseId]: {
                ...database,
                activeViewId: viewId,
              },
            },
          };
        });
      },

      addFilter: (databaseId: string, viewId: string, filter: Omit<Filter, 'id'>) => {
        set((state) => {
          const database = state.databases[databaseId];
          if (!database) return state;

          return {
            databases: {
              ...state.databases,
              [databaseId]: {
                ...database,
                views: database.views.map((view) =>
                  view.id === viewId
                    ? {
                        ...view,
                        filters: [...view.filters, { ...filter, id: generateId() }],
                      }
                    : view
                ),
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      updateFilter: (databaseId: string, viewId: string, filterId: string, updates: Partial<Filter>) => {
        set((state) => {
          const database = state.databases[databaseId];
          if (!database) return state;

          return {
            databases: {
              ...state.databases,
              [databaseId]: {
                ...database,
                views: database.views.map((view) =>
                  view.id === viewId
                    ? {
                        ...view,
                        filters: view.filters.map((filter) =>
                          filter.id === filterId ? { ...filter, ...updates } : filter
                        ),
                      }
                    : view
                ),
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      deleteFilter: (databaseId: string, viewId: string, filterId: string) => {
        set((state) => {
          const database = state.databases[databaseId];
          if (!database) return state;

          return {
            databases: {
              ...state.databases,
              [databaseId]: {
                ...database,
                views: database.views.map((view) =>
                  view.id === viewId
                    ? {
                        ...view,
                        filters: view.filters.filter((filter) => filter.id !== filterId),
                      }
                    : view
                ),
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      addSort: (databaseId: string, viewId: string, sort: Sort) => {
        set((state) => {
          const database = state.databases[databaseId];
          if (!database) return state;

          return {
            databases: {
              ...state.databases,
              [databaseId]: {
                ...database,
                views: database.views.map((view) =>
                  view.id === viewId
                    ? {
                        ...view,
                        sorts: [...view.sorts, sort],
                      }
                    : view
                ),
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      updateSort: (databaseId: string, viewId: string, propertyId: string, direction: SortDirection) => {
        set((state) => {
          const database = state.databases[databaseId];
          if (!database) return state;

          return {
            databases: {
              ...state.databases,
              [databaseId]: {
                ...database,
                views: database.views.map((view) =>
                  view.id === viewId
                    ? {
                        ...view,
                        sorts: view.sorts.map((sort) =>
                          sort.propertyId === propertyId ? { ...sort, direction } : sort
                        ),
                      }
                    : view
                ),
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      deleteSort: (databaseId: string, viewId: string, propertyId: string) => {
        set((state) => {
          const database = state.databases[databaseId];
          if (!database) return state;

          return {
            databases: {
              ...state.databases,
              [databaseId]: {
                ...database,
                views: database.views.map((view) =>
                  view.id === viewId
                    ? {
                        ...view,
                        sorts: view.sorts.filter((sort) => sort.propertyId !== propertyId),
                      }
                    : view
                ),
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },
    }),
    {
      name: 'known-databases',
    }
  )
);

