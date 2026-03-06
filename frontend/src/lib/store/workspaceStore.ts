import { create } from 'zustand';
import { Workspace } from '../workspace';

interface WorkspaceState {
  workspaces: Workspace[];
  currentWorkspaceId: string | null;
  loading: boolean;
  error: string | null;

  // Actions
  setWorkspaces: (workspaces: Workspace[]) => void;
  setCurrentWorkspaceId: (id: string) => void;
  addWorkspace: (workspace: Workspace) => void;
  updateWorkspace: (id: string, updates: Partial<Workspace>) => void;
  deleteWorkspace: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workspaces: [],
  currentWorkspaceId: null,
  loading: false,
  error: null,

  setWorkspaces: (workspaces) => set({ workspaces }),
  
  setCurrentWorkspaceId: (id) => {
    set({ currentWorkspaceId: id });
    // Persist to localStorage
    localStorage.setItem('orus_current_workspace', id);
  },

  addWorkspace: (workspace) =>
    set((state) => ({
      workspaces: [...state.workspaces, workspace],
    })),

  updateWorkspace: (id, updates) =>
    set((state) => ({
      workspaces: state.workspaces.map((ws) =>
        ws.id === id ? { ...ws, ...updates } : ws
      ),
    })),

  deleteWorkspace: (id) =>
    set((state) => ({
      workspaces: state.workspaces.filter((ws) => ws.id !== id),
      currentWorkspaceId:
        state.currentWorkspaceId === id ? null : state.currentWorkspaceId,
    })),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
