// frontend/src/lib/store/chatStore.ts
import { create } from 'zustand';
import { orusApi, ChatMode, ChatProvider } from '../api';

// ── TIPOS ─────────────────────────────────────────────────────────────────────
export interface ChatSession {
  conversationId: string;
  title:          string;
  lastMessage:    string;
  timestamp:      Date;
  workspaceId:    string;
}

export interface Message {
  id:         string;
  content:    string;
  role:       'user' | 'assistant';
  timestamp:  Date;
  agentName?: string;
  provider?:  ChatProvider;
  error?:     boolean;
}

interface ChatState {
  messages:       Message[];
  isLoading:      boolean;
  isLoadingHistory: boolean;   // ← loading ao buscar conversa antiga
  error:          string | null;
  conversationId: string | null;
  mode:           ChatMode;
  provider:       ChatProvider;
  agentId:        string | null;
  agentName:      string;
  chatHistory:    ChatSession[];

  // Actions
  setMode:            (mode: ChatMode) => void;
  setProvider:        (provider: ChatProvider) => void;
  setAgent:           (agentId: string | null, agentName?: string) => void;
  setError:           (error: string | null) => void;
  clearMessages:      () => void;
  deleteConversation: (conversationId: string) => void;
  loadConversation:   (conversationId: string) => Promise<void>;
  sendMessage:        (message: string, workspaceId: string, documentContext?: string) => Promise<void>;
}

// ── LOCALSTORAGE HELPERS ──────────────────────────────────────────────────────
const LS_KEY_CONV = 'orus_conversationId';
const LS_KEY_HIST = 'orus_chatHistory';

// Guard SSR (Next.js)
const isBrowser = typeof window !== 'undefined';

function loadHistory(): ChatSession[] {
  if (!isBrowser) return [];
  try {
    const raw = localStorage.getItem(LS_KEY_HIST);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // Garantir que timestamps são Date
    return parsed.map((s: any) => ({ ...s, timestamp: new Date(s.timestamp) }));
  } catch { return []; }
}

function saveHistory(history: ChatSession[]) {
  if (!isBrowser) return;
  try {
    localStorage.setItem(LS_KEY_HIST, JSON.stringify(history.slice(0, 30)));
  } catch {}
}

function getSavedConvId(): string | null {
  if (!isBrowser) return null;
  return localStorage.getItem(LS_KEY_CONV);
}

// ── STORE ─────────────────────────────────────────────────────────────────────
export const useChatStore = create<ChatState>((set, get) => ({
  messages:         [],
  isLoading:        false,
  isLoadingHistory: false,
  error:            null,
  conversationId:   getSavedConvId(),
  mode:             'quick',
  provider:         'kimi',
  agentId:          null,
  agentName:        'ORUS SAGE',
  chatHistory:      loadHistory(),

  setMode:     (mode)     => set({ mode }),
  setProvider: (provider) => set({ provider }),
  setAgent:    (agentId, agentName = 'ORUS SAGE') => set({ agentId, agentName }),
  setError:    (error)    => set({ error }),

  // ── Limpar conversa atual ────────────────────────────────
  clearMessages: () => {
    if (isBrowser) localStorage.removeItem(LS_KEY_CONV);
    set({ messages: [], conversationId: null, error: null });
  },

  // ── Deletar do histórico (local + backend) ───────────────
  deleteConversation: (conversationId: string) => {
    const { chatHistory } = get();
    const newHistory = chatHistory.filter(h => h.conversationId !== conversationId);
    saveHistory(newHistory);
    set({ chatHistory: newHistory });

    // Limpar conversa ativa se for a deletada
    if (get().conversationId === conversationId) {
      if (isBrowser) localStorage.removeItem(LS_KEY_CONV);
      set({ messages: [], conversationId: null });
    }

    // Deletar no backend (fire-and-forget)
    orusApi.deleteConversation(conversationId).catch(() => {});
  },

  // ── Carregar conversa do backend ─────────────────────────
  loadConversation: async (conversationId: string) => {
    if (isBrowser) localStorage.setItem(LS_KEY_CONV, conversationId);
    set({ conversationId, messages: [], isLoadingHistory: true, error: null });

    try {
      const data = await orusApi.getConversation(conversationId);

      const messages: Message[] = data.messages.map(m => ({
        id:        m.id,
        content:   m.content,
        role:      m.role,
        timestamp: new Date(m.timestamp),
      }));

      set({ messages, isLoadingHistory: false });
    } catch (err: any) {
      // Conversa não encontrada no backend — limpa silenciosamente
      set({ messages: [], isLoadingHistory: false });
    }
  },

  // ── Enviar mensagem ──────────────────────────────────────
  sendMessage: async (message, workspaceId, documentContext) => {
    const { mode, provider, agentId, conversationId, chatHistory } = get();

    // Mensagem do usuário (imediata)
    const userMsg: Message = {
      id:        `user-${Date.now()}`,
      content:   message,
      role:      'user',
      timestamp: new Date(),
    };

    set(state => ({
      messages:  [...state.messages, userMsg],
      isLoading: true,
      error:     null,
    }));

    try {
      const response = await orusApi.chat({
        message,
        workspaceId,
        conversationId:  conversationId ?? undefined,
        mode,
        provider,
        agentId:         agentId ?? undefined,
        documentContext: documentContext ?? undefined,
      });

      const assistantMsg: Message = {
        id:        response.id,
        content:   response.content,
        role:      'assistant',
        timestamp: new Date(response.timestamp),
        agentName: response.agentName,
        provider:  response.provider,
      };

      const newConvId = response.conversationId;
      if (isBrowser) localStorage.setItem(LS_KEY_CONV, newConvId);

      // ── Atualizar histórico ────────────────────────────
      const existingIdx = chatHistory.findIndex(h => h.conversationId === newConvId);
      const session: ChatSession = {
        conversationId: newConvId,
        title:          message.slice(0, 60),
        lastMessage:    response.content.slice(0, 80),
        timestamp:      new Date(),
        workspaceId,
      };

      let newHistory: ChatSession[];
      if (existingIdx >= 0) {
        newHistory = [...chatHistory];
        newHistory[existingIdx] = session;
      } else {
        newHistory = [session, ...chatHistory];
      }

      saveHistory(newHistory);

      set(state => ({
        messages:       [...state.messages, assistantMsg],
        isLoading:      false,
        conversationId: newConvId,
        agentName:      response.agentName,
        chatHistory:    newHistory,
      }));

    } catch (err: any) {
      const errorMsg: Message = {
        id:        `error-${Date.now()}`,
        content:   `❌ Erro: ${err.message}`,
        role:      'assistant',
        timestamp: new Date(),
        error:     true,
      };
      set(state => ({
        messages:  [...state.messages, errorMsg],
        isLoading: false,
        error:     err.message,
      }));
    }
  },
}));

// EOF — Evolution Hash: chat.store.0038.20260306
