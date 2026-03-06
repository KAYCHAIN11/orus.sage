'use client';

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Zap, Brain, Settings, ChevronDown } from 'lucide-react';
import { useChatStore } from '../../lib/store/chatStore';
import type { ChatProvider } from '../../lib/api';
import { MessageBubble } from './MessageBubble'; // ← import externo
import { useSearchParams } from 'next/navigation';
// ─── Types ────────────────────────────────────────────────────────────────────

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  metadata?: {
    model?: string;
    tokens?: number;
    latency?: number;
    mode?: 'QUICK' | 'DEEP';
  };
}

interface ChatContainerProps {
  chatId: string;
  workspaceId?: string;
  workspaceName?: string;
  chatTitle?: string;
  isDark?: boolean;
  onSettingsClick?: () => void;
}

// ─── OrusLogo ─────────────────────────────────────────────────────────────────

const OrusLogo: React.FC<{ size?: number; glow?: boolean; pulseGlow?: boolean }> = ({
  size = 32, glow = false, pulseGlow = false,
}) => (
  <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
    {pulseGlow && (
      <motion.div
        animate={{ opacity: [0, 0.4, 0], scale: [0.7, 1.4, 0.7] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', inset: -size * 0.3, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34,197,94,0.5), transparent 70%)',
          filter: 'blur(8px)', pointerEvents: 'none', zIndex: 0,
        }}
      />
    )}
    <motion.img
      src="/sage.png"
      alt="ORUS SAGE"
      animate={{ rotate: [0, 360] }}
      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      style={{
        width: size, height: size, objectFit: 'contain',
        display: 'block', position: 'relative', zIndex: 1,
        filter: glow
          ? 'drop-shadow(0 0 5px rgba(34,197,94,0.45)) drop-shadow(0 0 2px rgba(34,197,94,0.25))'
          : undefined,
      }}
    />
  </div>
);

// ─── Typing Indicator ─────────────────────────────────────────────────────────

const TypingIndicator: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
    className="flex items-center gap-3 mb-6"
  >
    <OrusLogo size={32} glow pulseGlow />
    <div
      className="flex items-center gap-1.5 px-4 py-3 rounded-2xl"
      style={{ background: 'rgba(17,24,28,0.9)', border: '1px solid rgba(255,255,255,0.07)', borderBottomLeftRadius: '4px' }}
    >
      <span className="text-xs mr-1" style={{ color: 'rgba(74,222,128,0.5)' }}>processando</span>
      {[0, 1, 2].map(i => (
        <motion.div key={i}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.1, 0.8] }}
          transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: '#22c55e' }} />
      ))}
    </div>
  </motion.div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className="flex flex-col items-center justify-center h-full pb-16 select-none"
  >
    <div className="relative mb-8 flex items-center justify-center">
      <OrusLogo size={64} glow pulseGlow />
    </div>
    <h2 className="text-xl font-semibold mb-2" style={{ color: '#f0fdf4' }}>
      Olá! Sou seu parceiro cognitivo
    </h2>
    <p className="text-sm mb-1" style={{ color: 'rgba(74,222,128,0.7)' }}>
      ORUS SAGE — Plataforma de comunicação
    </p>
    <p className="text-sm mt-3 max-w-sm text-center leading-relaxed" style={{ color: 'rgba(156,163,175,0.5)' }}>
      Pronto para pensar junto com você. Faça uma pergunta, explore ideias ou inicie um fluxo de trabalho.
    </p>
    <div className="flex gap-3 mt-8">
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
        style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80' }}>
        <Zap className="w-3 h-3" /> QUICK — Respostas rápidas
      </div>
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
        style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: '#c084fc' }}>
        <Brain className="w-3 h-3" /> DEEP — Análise profunda
      </div>
    </div>
  </motion.div>
);

// ─── Provider Badge ───────────────────────────────────────────────────────────

const ProviderBadge: React.FC<{ provider: ChatProvider; onChange: (p: ChatProvider) => void }> = ({
  provider, onChange,
}) => {
  const [open, setOpen] = useState(false);
  const options: { value: ChatProvider; label: string; color: string }[] = [
    { value: 'groq',   label: '⚡ Groq',       color: '#f59e0b' },
    { value: 'glm',    label: '🔮 GLM-4',      color: '#8b5cf6' },
    { value: 'claude', label: '🤖 Claude',     color: '#06b6d4' },
    { value: 'kimi',   label: '🌙 Kimi K2.5',  color: '#60a5fa' },
  ];
  const current = options.find(o => o.value === provider)!;

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: current.color }}
      >
        {current.label}
        <ChevronDown className="w-3 h-3 opacity-60" />
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -6 }}
            className="absolute top-full mt-1 right-0 w-40 rounded-xl overflow-hidden z-50"
            style={{ background: 'rgba(11,17,20,0.98)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {options.map(opt => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className="w-full px-3 py-2 text-xs text-left hover:bg-white/5 transition-colors"
                style={{ color: opt.value === provider ? opt.color : 'rgba(156,163,175,0.7)' }}
              >
                {opt.label}
                {opt.value === provider && <span className="float-right">✓</span>}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── ChatContainer ────────────────────────────────────────────────────────────

export const ChatContainer: React.FC<ChatContainerProps> = ({
  chatId,
  workspaceId: workspaceIdProp,
  workspaceName = 'Workspace Principal',
  chatTitle = 'Nova Conversa',
  isDark = true,
  onSettingsClick,
}) => {
  const searchParams = useSearchParams();
  
  // ← Pega workspaceId da URL (?workspace=ws-123) ou usa a prop
  const workspaceId = searchParams.get('workspace') ?? workspaceIdProp ?? 'ws-default';
  const { messages, isLoading, error, mode, provider, setProvider, sendMessage } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollRef      = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 200);
  };

  const displayMessages: Message[] = messages.map(m => ({
    id:        m.id,
    content:   m.content,
    role:      m.role,
    timestamp: m.timestamp instanceof Date ? m.timestamp : new Date(m.timestamp),
    metadata:  { mode: mode.toUpperCase() as 'QUICK' | 'DEEP' },
  }));

  return (
    <div
      className="flex flex-col h-full relative"
      style={{ background: 'linear-gradient(180deg, #070d09 0%, #090f0b 60%, #070c09 100%)' }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-8"
          style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.12), transparent)' }} />
        <div className="absolute bottom-32 right-0 w-64 h-64 rounded-full blur-3xl opacity-5"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.2), transparent)' }} />
      </div>

      {/* Header */}
      <div
        className="relative flex items-center justify-between px-6 py-4 flex-shrink-0"
        style={{ background: 'rgba(7,13,9,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(34,197,94,0.08)' }}
      >
        <div className="flex items-center gap-3">
          <OrusLogo size={28} glow />
          <div>
            <p className="text-xs mb-0.5 font-medium tracking-widest uppercase"
              style={{ color: 'rgba(34,197,94,0.4)' }}>
              {workspaceName}
            </p>
            <h1 className="text-base font-semibold" style={{ color: '#f0fdf4' }}>{chatTitle}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ProviderBadge provider={provider} onChange={setProvider} />
          <motion.div
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={mode === 'quick'
              ? { background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80' }
              : { background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)', color: '#c084fc' }}
          >
            {mode === 'quick' ? <Zap className="w-3 h-3" /> : <Brain className="w-3 h-3" />}
            {mode.toUpperCase()}
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
            onClick={onSettingsClick}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(156,163,175,0.6)' }}
          >
            <Settings className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="relative flex-1 overflow-y-auto px-6 py-6"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(34,197,94,0.15) transparent' }}
      >
        <AnimatePresence>
          {displayMessages.length === 0 && !isLoading && <EmptyState />}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {displayMessages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              isLast={index === displayMessages.length - 1}
            />
          ))}
          {isLoading && <TypingIndicator key="typing" />}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              className="flex gap-3 px-4 py-3 rounded-xl mb-4"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              <AlertCircle className="flex-shrink-0 w-4 h-4 mt-0.5 text-red-400" />
              <p className="text-sm text-red-300">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll button */}
      <AnimatePresence>
        {showScrollBtn && (
          <motion.button
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="absolute bottom-6 right-6 w-9 h-9 rounded-full flex items-center justify-center shadow-lg"
            style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80' }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatContainer;

// EOF — Evolution Hash: chat.container.0032.20260305