'use client';

import { useEffect } from 'react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { Workspace, CreateWorkspaceInput } from '../workspace';

export const useWorkspaces = () => {
  const {
    workspaces,
    loading,
    error,
    setWorkspaces,
    addWorkspace,
    updateWorkspace,
    deleteWorkspace,
    setLoading,
    setError,
  } = useWorkspaceStore();

  // Fetch workspaces on mount
  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    setLoading(true);
    try {
      // TODO: Replace with real API call
      const response = await fetch('/api/workspaces', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch workspaces');
      
      const data = await response.json();
      setWorkspaces(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      // Mock data for development
      const mockWorkspaces: Workspace[] = [
        {
          id: 'ws-1',
          name: 'Projeto Principal',
          description: 'Workspace para desenvolvimento do projeto principal',
          icon: '🚀',
          color: '#00D26A',
          ownerId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          members: [],
          settings: {
            theme: 'light',
            primaryColor: '#00D26A',
            allowInvites: true,
            visibility: 'private',
          },
          stats: {
            totalChats: 5,
            totalMessages: 127,
            totalMembers: 1,
          },
        },
      ];
      setWorkspaces(mockWorkspaces);
    } finally {
      setLoading(false);
    }
  };

  const createWorkspace = async (input: CreateWorkspaceInput): Promise<Workspace | null> => {
    setLoading(true);
    try {
      // TODO: Replace with real API call
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) throw new Error('Failed to create workspace');

      const newWorkspace = await response.json();
      addWorkspace(newWorkspace);
      return newWorkspace;
    } catch (err: any) {
      setError(err.message);
      // Mock creation
      const mockWorkspace: Workspace = {
        id: `ws-${Date.now()}`,
        ...input,
        ownerId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        members: [],
        settings: {
          theme: 'light',
          primaryColor: input.color || '#00D26A',
          allowInvites: true,
          visibility: input.visibility || 'private',
        },
        stats: {
          totalChats: 0,
          totalMessages: 0,
          totalMembers: 1,
        },
      };
      addWorkspace(mockWorkspace);
      return mockWorkspace;
    } finally {
      setLoading(false);
    }
  };

  const updateWorkspaceById = async (id: string, updates: Partial<Workspace>) => {
    try {
      // TODO: Replace with real API call
      const response = await fetch(`/api/workspaces/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update workspace');

      updateWorkspace(id, updates);
    } catch (err: any) {
      setError(err.message);
      // Mock update
      updateWorkspace(id, updates);
    }
  };

  const deleteWorkspaceById = async (id: string) => {
    try {
      // TODO: Replace with real API call
      const response = await fetch(`/api/workspaces/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete workspace');

      deleteWorkspace(id);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return {
    workspaces,
    loading,
    error,
    fetchWorkspaces,
    createWorkspace,
    updateWorkspace: updateWorkspaceById,
    deleteWorkspace: deleteWorkspaceById,
  };
};
