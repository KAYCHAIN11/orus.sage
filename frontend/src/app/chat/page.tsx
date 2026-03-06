'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlimSidebar }    from '../../components/layout/SlimSidebar';
import { ChatContainer }  from '../../components/chat/ChatContainer';
import { ChatInput }      from '../../components/chat/ChatInput';
import { useRouter }      from 'next/navigation';
import { useChatStore }   from '../../lib/store/chatStore';
import { useAgentStore }  from '../../lib/store/agentStore';
import { Brain, X, ChevronDown } from 'lucide-react';

// ─── Nível → cor ──────────────────────────────────────────────────────────────
const LEVEL_COLOR: Record<string, { text: string; bg: string; border: string }> = {
  MICRO_AGENTE: { text: '#9ca3af', bg: 'rgba(107,114,128,0.12)', border: 'rgba(107,114,128,0.2)' },
  AGENTE:       { text: '#4ade80', bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.2)'   },
  SUPER_AGENTE: { text: '#22d3ee', bg: 'rgba(6,182,212,0.12)',   border: 'rgba(6,182,212,0.2)'   },
  ALFA:         { text: '#60a5fa', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.2)'  },
  OMEGA:        { text: '#c084fc', bg: 'rgba(139,92,246,0.15)',  border: 'rgba(139,92,246,0.25)' },
};

export default function ChatPage() {
  const router = useRouter();

  const {
    isLoading, mode, setMode,
    sendMessage, clearMessages,
    loadConversation, deleteConversation,
    chatHistory, agentName,
    setAgent,
  } = useChatStore();

  const { activeAgent, activateAgent } = useAgentStore();

  const [chatTitle,        setChatTitle]        = useState('Nova Conversa');
  const [currentChatId,    setCurrentChatId]    = useState('chat-default');
  const [activeSection,    setActiveSection]    = useState<
    'messages' | 'agents' | 'workflows' | 'settings'
  >('messages');
  const [isDark]                                = useState(true);
  const [firstMessageSent, setFirstMessageSent] = useState(false);
  const [agentBannerDismissed, setAgentBannerDismissed] = useState(false);

  // ── Sincroniza agente ativo → chatStore ────────────────────────────────────
  // Toda vez que o usuário clicar em "Usar" no sidebar, o chatStore
  // recebe o agentId e passa pro backend no próximo sendMessage
  useEffect(() => {
    if (activeAgent) {
      setAgent(activeAgent.id, activeAgent.name);
      setAgentBannerDismissed(false); // mostra banner ao trocar agente
    } else {
      setAgent(null, 'ORUS SAGE');
    }
  }, [activeAgent, setAgent]);

  // ── Desativar agente ───────────────────────────────────────────────────────
  const handleDeactivateAgent = () => {
    // Desativa no agentStore (marca todos isActive: false)
    useAgentStore.setState(s => ({
      activeAgent: null,
      agents: s.agents.map(a => ({ ...a, isActive: false })),
    }));
    setAgent(null, 'ORUS SAGE');
  };

  // ── Envio ──────────────────────────────────────────────────────────────────
  const handleSendMessage = async (
    content: string,
    selectedMode: 'QUICK' | 'DEEP',
    documentContext?: string,
  ) => {
    setMode(selectedMode.toLowerCase() as 'quick' | 'deep');
    if (!firstMessageSent) {
      setChatTitle(content.substring(0, 50) + (content.length > 50 ? '...' : ''));
      setFirstMessageSent(true);
    }
    await sendMessage(content, 'ws-default', documentContext);
  };

  // ── Novo chat ──────────────────────────────────────────────────────────────
  const handleNewChat = () => {
    clearMessages();
    setChatTitle('Nova Conversa');
    setFirstMessageSent(false);
    setCurrentChatId(`chat-${Date.now()}`);
  };

  // ── Selecionar chat do histórico ───────────────────────────────────────────
  const handleSelectChat = (conversationId: string) => {
    const session = chatHistory.find(h => h.conversationId === conversationId);
    if (session) {
      setCurrentChatId(conversationId);
      setChatTitle(session.title || 'Conversa');
      setFirstMessageSent(true);
      loadConversation(conversationId);
    }
  };

  // ── Deletar chat ───────────────────────────────────────────────────────────
  const handleDeleteChat = (conversationId: string) => {
    deleteConversation(conversationId);
    if (currentChatId === conversationId) handleNewChat();
  };

  // ── Navegação ──────────────────────────────────────────────────────────────
  const handleSectionChange = (
    section: 'messages' | 'agents' | 'workflows' | 'settings',
  ) => {
    setActiveSection(section);
    if (section === 'workflows') router.push('/workflows');
    else if (section === 'agents') router.push('/agents');
    else if (section === 'settings') router.push('/settings');
  };

  const levelColors = activeAgent
    ? (LEVEL_COLOR[activeAgent.level] ?? LEVEL_COLOR.AGENTE)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#070d09' }}
    >
      {/* SlimSidebar */}
      <SlimSidebar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        onNewChat={handleNewChat}
        onLogout={() => router.push('/')}
        agentLevel={activeAgent?.level ?? 'AGENTE'}
        unreadMessages={0}
        chatHistory={chatHistory}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
      />

      {/* Main Chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

        {/* ── Banner: agente ativo ── */}
        <AnimatePresence>
          {activeAgent && !agentBannerDismissed && levelColors && (
            <motion.div
              key={activeAgent.id}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              style={{ overflow: 'hidden', flexShrink: 0 }}
            >
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '8px 16px',
                background: `linear-gradient(90deg, ${levelColors.bg}, rgba(0,0,0,0))`,
                borderBottom: `1px solid ${levelColors.border}`,
              }}>
                {/* Ícone pulsando */}
                <motion.div
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{
                    width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: levelColors.bg, border: `1px solid ${levelColors.border}`,
                  }}
                >
                  <Brain style={{ width: '14px', height: '14px', color: levelColors.text }} />
                </motion.div>

                {/* Info do agente */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em',
                      textTransform: 'uppercase', color: levelColors.text, opacity: 0.7,
                    }}>
                      Agente ativo
                    </span>
                    <span style={{
                      fontSize: '0.6rem', fontWeight: 700, padding: '1px 6px',
                      borderRadius: '99px', background: levelColors.bg,
                      border: `1px solid ${levelColors.border}`, color: levelColors.text,
                    }}>
                      {activeAgent.level.replace('_', ' ')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '1px' }}>
                    <span style={{
                      fontSize: '0.82rem', fontWeight: 700, color: levelColors.text,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {activeAgent.name}
                    </span>
                    <span style={{
                      fontSize: '0.68rem', color: 'rgba(156,163,175,0.5)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      · {activeAgent.specialty}
                    </span>
                  </div>
                </div>

                {/* Botão trocar agente */}
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => handleSectionChange('agents')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '4px 8px', borderRadius: '6px', flexShrink: 0,
                    fontSize: '0.62rem', fontWeight: 600, cursor: 'pointer',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(156,163,175,0.6)',
                  }}
                >
                  <ChevronDown style={{ width: '10px', height: '10px' }} />
                  Trocar
                </motion.button>

                {/* Botão desativar */}
                <motion.button
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={handleDeactivateAgent}
                  title="Desativar agente"
                  style={{
                    width: '24px', height: '24px', borderRadius: '6px', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
                    color: 'rgba(248,113,113,0.6)', cursor: 'pointer',
                  }}
                >
                  <X style={{ width: '10px', height: '10px' }} />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <ChatContainer
          chatId={currentChatId}
          workspaceId="ws-default"
          workspaceName="Workspace Principal"
          chatTitle={chatTitle}
          isDark={isDark}
          onSettingsClick={() => setActiveSection('settings')}
        />

        <ChatInput
          onSend={handleSendMessage}
          isLoading={isLoading}
          isDark={isDark}
          workspaceId="ws-default"
          mode={mode.toUpperCase() as 'QUICK' | 'DEEP'}
          onModeChange={m => setMode(m.toLowerCase() as 'quick' | 'deep')}
          onFragmentActivated={(id, name) => {
            // Ativa fragmento como agente
            setAgent(id, name);
          }}
        />
      </div>
    </motion.div>
  );
}

// EOF — Evolution Hash: chat.page.0032.20260306