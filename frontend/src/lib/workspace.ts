export interface Workspace {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Members
  members: WorkspaceMember[];
  
  // Settings
  settings: WorkspaceSettings;
  
  // Stats
  stats: WorkspaceStats;
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  workspaceId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  userName: string;
  userEmail: string;
  userAvatar?: string;
  joinedAt: Date;
  lastActiveAt?: Date;
}

export interface WorkspaceSettings {
  theme: 'light' | 'dark' | 'auto';
  primaryColor: string;
  agentType?: string;
  agentName?: string;
  allowInvites: boolean;
  visibility: 'private' | 'team' | 'public';
}

export interface WorkspaceStats {
  totalChats: number;
  totalMessages: number;
  totalMembers: number;
  lastActivityAt?: Date;
}

export interface CreateWorkspaceInput {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  agentType?: string;
  visibility?: 'private' | 'team';
}

export interface UpdateWorkspaceInput {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  settings?: Partial<WorkspaceSettings>;
}

export interface InviteMemberInput {
  workspaceId: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  message?: string;
}
