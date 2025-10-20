import { create } from 'zustand';

/**
 * Local-only state for database UI (not persisted to backend)
 * 
 * This store manages UI state like active view selection.
 * All data persistence is handled by React Query + API calls.
 */
interface DatabaseLocalState {
  activeViewIds: Record<string, string>; // databaseId -> viewId
  
  setActiveView: (databaseId: string, viewId: string) => void;
  getActiveViewId: (databaseId: string) => string | undefined;
}

export const useDatabaseLocalStore = create<DatabaseLocalState>((set, get) => ({
  activeViewIds: {},
  
  setActiveView: (databaseId: string, viewId: string) => {
    set((state) => ({
      activeViewIds: {
        ...state.activeViewIds,
        [databaseId]: viewId,
      },
    }));
  },
  
  getActiveViewId: (databaseId: string) => {
    return get().activeViewIds[databaseId];
  },
}));

