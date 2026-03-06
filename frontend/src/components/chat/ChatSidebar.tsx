'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../../lib/store/chatStore';

interface ChatSidebarProps {
  currentChatId: string;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onWorkflow: () => void;
  isDark?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  currentChatId,
  onSelectChat,
  onNewChat,
  onWorkflow,
  isDark = true,
  isOpen = true,
  onToggle,
}) => {
  const [searchTerm, setSearchTerm]       = useState('');
  const [hoveredId, setHoveredId]         = useState<string | null>(null);

  // ─── Store real (substitui mock) ──────────────────────────────────────────
  const { chatHistory, loadConversation, clearMessages } = useChatStore();

  // ─── Tema ─────────────────────────────────────────────────────────────────
  const bgColor       = isDark ? '#080d0a'           : '#FFFFFF';
  const borderColor   = isDark ? 'rgba(34,197,94,0.08)' : '#E5E7EB';
  const hoverBg       = isDark ? 'rgba(34,197,94,0.06)' : '#F8F9FA';
  const textPrimary   = isDark ? '#e8ecff'           : '#0A0E27';
  const textSecondary = isDark ? 'rgba(156,163,175,0.6)' : '#6B7280';
  const accentColor   = '#22C55E';

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const formatTime = (date: Date | string) => {
    const d   = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const h    = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (h < 1)   return 'Agora';
    if (h < 24)  return `${h}h atrás`;
    if (days < 7) return `${days}d atrás`;
    return d.toLocaleDateString('pt-BR');
  };

  const handleDelete = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    // Remove do localStorage diretamente
    try {
      const raw  = localStorage.getItem('orus_chatHistory');
      const hist = raw ? JSON.parse(raw) : [];
      const next = hist.filter((h: any) => h.conversationId !== conversationId);
      localStorage.setItem('orus_chatHistory', JSON.stringify(next));
      // Força re-render via reload do store — solução simples sem action extra
      window.dispatchEvent(new Event('orus_history_update'));
    } catch {}
  };

  // ─── Filtro de busca ──────────────────────────────────────────────────────
  const filtered = chatHistory.filter(s =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ─── Agrupamento por data ─────────────────────────────────────────────────
  const today     = filtered.filter(s => {
    const d = new Date(s.timestamp);
    return d.toDateString() === new Date().toDateString();
  });
  const older     = filtered.filter(s => {
    const d = new Date(s.timestamp);
    return d.toDateString() !== new Date().toDateString();
  });

  // ─── Item de chat ─────────────────────────────────────────────────────────
  const ChatItem = ({ session, idx }: { session: typeof chatHistory[0]; idx: number }) => {
    const isActive  = currentChatId === session.conversationId;
    const isHovered = hoveredId === session.conversationId;

    return (
      <motion.div
        key={session.conversationId}
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: idx * 0.04 }}
        onMouseEnter={() => setHoveredId(session.conversationId)}
        onMouseLeave={() => setHoveredId(null)}
        onClick={() => {
          loadConversation(session.conversationId);
          onSelectChat(session.conversationId);
        }}
        style={{
          marginBottom: '3px',
          padding: '10px 12px',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          background: isActive
            ? 'rgba(34,197,94,0.1)'
            : isHovered ? hoverBg : 'transparent',
          border: isActive
            ? '1px solid rgba(34,197,94,0.25)'
            : '1px solid transparent',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          {/* Ícone de conversa */}
          <div style={{
            width: '28px', height: '28px', borderRadius: '6px', flexShrink: 0,
            background: isActive ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${isActive ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.06)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem',
          }}>
            💬
          </div>

          {/* Texto */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              margin: 0, fontSize: '0.8rem', fontWeight: 600,
              color: isActive ? '#4ade80' : textPrimary,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {session.title || 'Nova conversa'}
            </p>
            <p style={{
              margin: '2px 0 0', fontSize: '0.68rem', color: textSecondary,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {session.lastMessage || '...'}
            </p>
            <p style={{ margin: '3px 0 0', fontSize: '0.6rem', color: textSecondary, opacity: 0.7 }}>
              {formatTime(session.timestamp)}
            </p>
          </div>

          {/* Botão deletar (aparece no hover) */}
          <AnimatePresence>
            {isHovered && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={(e) => handleDelete(e, session.conversationId)}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: 'rgba(239,68,68,0.6)', fontSize: '0.7rem', padding: '2px',
                  flexShrink: 0, lineHeight: 1,
                }}
                title="Deletar chat"
              >
                🗑️
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Indicador ativo */}
        {isActive && (
          <div style={{
            position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
            width: '3px', height: '60%', background: accentColor,
            borderRadius: '0 2px 2px 0',
          }} />
        )}
      </motion.div>
    );
  };

  // ─── Grupo de sessões ──────────────────────────────────────────────────────
  const GroupLabel = ({ label }: { label: string }) => (
    <p style={{
      margin: '12px 0 4px 4px', fontSize: '0.6rem', fontWeight: 700,
      letterSpacing: '0.1em', textTransform: 'uppercase',
      color: 'rgba(34,197,94,0.35)',
    }}>
      {label}
    </p>
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ x: isOpen ? 0 : -320 }}
      animate={{ x: isOpen ? 0 : -320 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{
        width: '280px', height: '100vh',
        background: bgColor,
        borderRight: `1px solid ${borderColor}`,
        display: 'flex', flexDirection: 'column',
        position: 'fixed', left: 0, top: 0, zIndex: 1000,
      }}
    >
      {/* ── HEADER ── */}
      <div style={{
        padding: '16px', borderBottom: `1px solid ${borderColor}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '8px',
            background: 'rgba(34,197,94,0.12)',
            border: '1px solid rgba(34,197,94,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.8rem',
          }}>💬</div>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: textPrimary }}>
            Conversas
          </span>
          {chatHistory.length > 0 && (
            <span style={{
              fontSize: '0.6rem', fontWeight: 700,
              padding: '1px 6px', borderRadius: '10px',
              background: 'rgba(34,197,94,0.12)',
              border: '1px solid rgba(34,197,94,0.2)',
              color: '#4ade80',
            }}>
              {chatHistory.length}
            </span>
          )}
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          onClick={onToggle}
          style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '6px', color: textSecondary, cursor: 'pointer',
            width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.7rem',
          }}
        >
          ✕
        </motion.button>
      </div>

      {/* ── NOVO CHAT ── */}
      <div style={{ padding: '12px 12px 0' }}>
        <motion.button
          onClick={() => { clearMessages(); onNewChat(); }}
          whileHover={{ scale: 1.02, background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' }}
          whileTap={{ scale: 0.98 }}
          style={{
            width: '100%', padding: '10px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            border: 'none', color: '#fff', fontWeight: 700,
            cursor: 'pointer', fontSize: '0.8rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            boxShadow: '0 2px 12px rgba(34,197,94,0.25)',
          }}
        >
          ＋ Nova Conversa
        </motion.button>
      </div>

      {/* ── BUSCA ── */}
      <div style={{ padding: '10px 12px' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Buscar conversas..."
          style={{
            width: '100%', padding: '7px 10px', borderRadius: '7px',
            border: `1px solid ${borderColor}`,
            background: 'rgba(255,255,255,0.03)',
            color: textPrimary, fontSize: '0.78rem', outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* ── LISTA DE CHATS ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px',
        scrollbarWidth: 'thin', scrollbarColor: 'rgba(34,197,94,0.1) transparent',
      }}>
        {chatHistory.length === 0 ? (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ padding: '40px 16px', textAlign: 'center' }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '12px', opacity: 0.4 }}>💬</div>
            <p style={{ fontSize: '0.8rem', color: textSecondary, margin: 0 }}>
              Nenhuma conversa ainda
            </p>
            <p style={{ fontSize: '0.72rem', color: textSecondary, margin: '4px 0 0', opacity: 0.6 }}>
              Inicie um novo chat acima
            </p>
          </motion.div>
        ) : filtered.length === 0 ? (
          /* Sem resultado na busca */
          <div style={{ padding: '24px 16px', textAlign: 'center' }}>
            <p style={{ fontSize: '0.78rem', color: textSecondary, margin: 0 }}>
              Nenhum resultado para "{searchTerm}"
            </p>
          </div>
        ) : (
          <>
            {/* Hoje */}
            {today.length > 0 && (
              <>
                <GroupLabel label="Hoje" />
                {today.map((s, i) => <ChatItem key={s.conversationId} session={s} idx={i} />)}
              </>
            )}
            {/* Anteriores */}
            {older.length > 0 && (
              <>
                <GroupLabel label="Anteriores" />
                {older.map((s, i) => <ChatItem key={s.conversationId} session={s} idx={i} />)}
              </>
            )}
          </>
        )}
      </div>

      {/* ── WORKFLOW ── */}
      <div style={{ padding: '8px 12px' }}>
        <motion.button
          onClick={onWorkflow}
          whileHover={{ scale: 1.02, background: 'rgba(34,197,94,0.1)' }}
          whileTap={{ scale: 0.98 }}
          style={{
            width: '100%', padding: '9px',
            borderRadius: '8px', background: 'transparent',
            border: `1px solid rgba(34,197,94,0.2)`,
            color: '#4ade80', fontWeight: 600, cursor: 'pointer',
            fontSize: '0.78rem', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '6px', transition: 'all 0.15s',
          }}
        >
          🔄 Workflow
        </motion.button>
      </div>

      {/* ── FOOTER ── */}
      <div style={{
        padding: '10px 12px',
        borderTop: `1px solid ${borderColor}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: '0.62rem', color: textSecondary, opacity: 0.6 }}>
          ORUS SAGE v1.0
        </span>
        <span style={{ fontSize: '0.62rem', color: 'rgba(34,197,94,0.4)' }}>
          {chatHistory.length} sessões
        </span>
      </div>
    </motion.div>
  );
};

export default ChatSidebar;

// EOF — Evolution Hash: chat.sidebar.0041.20260306
