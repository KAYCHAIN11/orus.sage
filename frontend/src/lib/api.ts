// frontend/src/lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

// ── TIPOS ─────────────────────────────────────────────────────────────────────
export type ChatMode     = 'quick' | 'deep';
export type ChatProvider = 'groq' | 'glm' | 'claude' | 'kimi' | 'gpt' | 'deepseek';

export interface ChatRequest {
  message:         string;
  workspaceId:     string;
  conversationId?: string;
  mode?:           ChatMode;
  agentId?:        string;
  agentType?:      string;
  provider?:       ChatProvider;
  documentContext?: string;
}

export interface ChatResponse {
  id:             string;
  role:           'assistant';
  content:        string;
  agentName:      string;
  agentId:        string | null;
  workspaceId:    string;
  conversationId: string;
  mode:           ChatMode;
  provider:       ChatProvider;
  timestamp:      string;
}

export interface ConversationMessage {
  id:        string;
  role:      'user' | 'assistant';
  content:   string;
  timestamp: string;
}

export interface ConversationResponse {
  conversationId: string;
  messages:       ConversationMessage[];
  meta:           { workspaceId?: string; agentId?: string; createdAt?: string };
  count:          number;
}

export interface ConversationSummary {
  conversationId: string;
  title:          string;
  lastMessage:    string;
  timestamp:      string;
  workspaceId:    string;
  messageCount:   number;
}

// ── HELPER ────────────────────────────────────────────────────────────────────
async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
  return data as T;
}

// ── API CLIENT ────────────────────────────────────────────────────────────────
export const orusApi = {

  // ── HEALTH ──────────────────────────────────────────────
  health: () =>
    apiFetch<{ status: string; providers: Record<string, boolean>; agentsSaved: number }>('/health'),

  // ── PROVIDERS ───────────────────────────────────────────
  getProvidersHealth: () =>
    apiFetch<any>('/api/providers/health'),

  getProvidersList: () =>
    apiFetch<{ providers: any[] }>('/api/providers/list'),

  // ── CHAT ────────────────────────────────────────────────
  chat: (req: ChatRequest) =>
    apiFetch<ChatResponse>('/api/chat', {
      method: 'POST',
      body:   JSON.stringify(req),
    }),

  chatSmart: (req: {
    message:          string;
    mode?:            'QUICK' | 'DEEP';
    systemPrompt?:    string;
    history?:         Array<{ role: string; content: string }>;
    documentContext?: string;
    agentId?:         string;
    maxTokens?:       number;
  }) =>
    apiFetch<any>('/api/chat/smart', {
      method: 'POST',
      body:   JSON.stringify(req),
    }),

  // ── CONVERSATIONS ────────────────────────────────────────
  getConversation: (conversationId: string) =>
    apiFetch<ConversationResponse>(`/api/conversations/${conversationId}`),

  deleteConversation: (conversationId: string) =>
    apiFetch<{ success: boolean; conversationId: string }>(
      `/api/conversations/${conversationId}`,
      { method: 'DELETE' }
    ),

  listConversations: (workspaceId?: string) => {
    const qs = workspaceId ? `?workspaceId=${workspaceId}` : '';
    return apiFetch<{ conversations: ConversationSummary[]; count: number }>(
      `/api/conversations${qs}`
    );
  },

  // ── AGENTS ──────────────────────────────────────────────
  getAgents: () =>
    apiFetch<{ agents: any[] }>('/api/agents'),

  getSavedAgents: () =>
    apiFetch<{ agents: any[] }>('/api/agents/saved'),

  getAgent: (agentId: string) =>
    apiFetch<any>(`/api/agents/${agentId}`),

  activateAgent: (agentId: string, workspaceId: string) =>
    apiFetch<any>(`/api/agents/${agentId}/activate`, {
      method: 'POST',
      body:   JSON.stringify({ workspaceId }),
    }),

  deleteAgent: (agentId: string) =>
    apiFetch<{ success: boolean }>(`/api/agents/${agentId}`, { method: 'DELETE' }),

  getAgentMemory: (agentId: string, workspaceId: string) =>
    apiFetch<any>(`/api/agents/${agentId}/memory/${workspaceId}`),

  getAgentContext: (agentId: string, workspaceId: string) =>
    apiFetch<any>(`/api/agents/${agentId}/context/${workspaceId}`),

  // ── DNA / FRAGMENT ───────────────────────────────────────
  extractDna: (objective: string, workspaceId: string, domains?: string[]) =>
    apiFetch<{ success: boolean; agent: any }>('/api/agents/extract-dna', {
      method: 'POST',
      body:   JSON.stringify({ objective, workspaceId, domains }),
    }),

  loadFragment: (file: File, workspaceId: string) => {
    const form = new FormData();
    form.append('file', file);
    return fetch(`${API_BASE}/api/agents/load-fragment?workspaceId=${workspaceId}`, {
      method: 'POST',
      body:   form,
    }).then(r => r.json());
  },

  // ── WORKSPACES ───────────────────────────────────────────
  getWorkspaces: () =>
    apiFetch<{ workspaces: any[] }>('/api/workspaces'),

  createWorkspace: (name: string, agentType: string) =>
    apiFetch<any>('/api/workspaces', {
      method: 'POST',
      body:   JSON.stringify({ name, agentType }),
    }),

  getWorkspace: (id: string) =>
    apiFetch<any>(`/api/workspaces/${id}`),

  deleteWorkspace: (id: string) =>
    apiFetch<{ success: boolean }>(`/api/workspaces/${id}`, { method: 'DELETE' }),

  getWorkspaceAgents: (workspaceId: string) =>
    apiFetch<{ agents: any[] }>(`/api/workspaces/${workspaceId}/agents`),

  // ── RESEARCH ─────────────────────────────────────────────
  runResearch: (params: {
    query:           string;
    templateId?:     string;
    format?:         string;
    maxSources?:     number;
    minCredibility?: number;
    timeframe?:      string;
  }) =>
    apiFetch<any>('/api/research/run', {
      method: 'POST',
      body:   JSON.stringify(params),
    }),

  search: (query: string, limit = 10, engine: 'perplexity' | 'google' = 'perplexity') =>
    apiFetch<{ results: any[]; count: number; query: string; engine: string }>('/api/search', {
      method: 'POST',
      body:   JSON.stringify({ query, limit, engine }),
    }),

  // ── DOCUMENTS ────────────────────────────────────────────
  uploadDocument: (filename: string, content: string) =>
    apiFetch<{ success: boolean; documentId: string; filename: string; chars: number }>(
      '/api/documents/upload',
      { method: 'POST', body: JSON.stringify({ filename, content }) }
    ),

  generateDocument: (title: string, content: string, format = 'markdown') =>
    apiFetch<any>('/api/documents/generate', {
      method: 'POST',
      body:   JSON.stringify({ title, content, format }),
    }),

  downloadDocumentUrl: (docId: string) => `${API_BASE}/api/documents/download/${docId}`,
};

// EOF — Evolution Hash: api.client.0042.20260306
