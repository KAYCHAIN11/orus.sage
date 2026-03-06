'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, Brain, Zap, Settings,
  Plus, ChevronLeft, LogOut, Trash2, Database,
  CheckCircle2, Cpu, ArrowUpRight,
} from 'lucide-react';
import type { ChatSession } from '../../lib/store/chatStore';
import { useAgentStore, type OmegaAgent } from '../../lib/store/agentStore';

// ─── Types ────────────────────────────────────────────────────────────────────
type Section = 'messages' | 'agents' | 'workflows' | 'settings';

interface SlimSidebarProps {
  activeSection?:   Section;
  onSectionChange?: (section: Section) => void;
  onNewChat?:       () => void;
  onLogout?:        () => void;
  agentLevel?:      'OMEGA' | 'ALFA' | 'SUPER_AGENTE' | 'AGENTE' | 'MICRO_AGENTE';
  unreadMessages?:  number;
  chatHistory?:     ChatSession[];
  currentChatId?:   string;
  onSelectChat?:    (conversationId: string) => void;
  onDeleteChat?:    (conversationId: string) => void;
}

// ─── Seções que abrem painel lateral (não navegam) ────────────────────────────
// 'agents'    → painel lateral + botão "Ver todos" → /agents
// 'workflows' → painel lateral + botão "Ver workspace" → /workspace
// 'settings'  → painel lateral apenas
// 'messages'  → painel lateral apenas
const PANEL_ONLY_SECTIONS: Section[] = ['agents', 'workflows', 'settings', 'messages'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(date: Date | string): string {
  const d    = date instanceof Date ? date : new Date(date);
  const now  = new Date();
  const diff = now.getTime() - d.getTime();
  const h    = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (h < 1)    return 'Agora';
  if (h < 24)   return `há ${h}h`;
  if (days < 7) return `há ${days}d`;
  return d.toLocaleDateString('pt-BR');
}

// ─── Icon Button ──────────────────────────────────────────────────────────────
const IconBtn: React.FC<{
  icon:      React.ReactNode;
  label:     string;
  isActive?: boolean;
  badge?:    string | number;
  onClick:   () => void;
}> = ({ icon, label, isActive, badge, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
    onClick={onClick} title={label}
    style={{
      position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: '44px', height: '44px', borderRadius: '12px',
      background: isActive ? 'rgba(34,197,94,0.15)' : 'transparent',
      border:     isActive ? '1px solid rgba(34,197,94,0.22)' : '1px solid transparent',
      color:      isActive ? '#4ade80' : 'rgba(156,163,175,0.6)',
      cursor: 'pointer',
    }}
  >
    {icon}
    {badge != null && Number(badge) > 0 && (
      <span style={{
        position: 'absolute', top: '2px', right: '2px',
        width: '16px', height: '16px', borderRadius: '50%',
        background: '#22c55e', color: '#000', fontWeight: 700,
        fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {Number(badge) > 9 ? '9+' : badge}
      </span>
    )}
  </motion.button>
);

// ─── SubmenuMessages ──────────────────────────────────────────────────────────
const SubmenuMessages: React.FC<{
  chatHistory:    ChatSession[];
  currentChatId?: string;
  onSelectChat?:  (id: string) => void;
  onDeleteChat?:  (id: string) => void;
}> = ({ chatHistory, currentChatId, onSelectChat, onDeleteChat }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (chatHistory.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: 0.5 }}>
        <MessageCircle style={{ width: '28px', height: '28px', color: 'rgba(34,197,94,0.3)' }} />
        <p style={{ fontSize: '0.75rem', color: 'rgba(156,163,175,0.5)', textAlign: 'center' }}>
          Nenhuma conversa ainda.<br />Inicie um novo chat!
        </p>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', display: 'flex', flexDirection: 'column', gap: '3px' }}>
      {chatHistory.map(session => {
        const isActive  = currentChatId === session.conversationId;
        const isHovered = hoveredId === session.conversationId;
        return (
          <motion.div
            key={session.conversationId}
            whileHover={{ x: 2 }}
            onMouseEnter={() => setHoveredId(session.conversationId)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => onSelectChat?.(session.conversationId)}
            style={{
              padding: '9px 10px', borderRadius: '10px',
              cursor: 'pointer', position: 'relative',
              background: isActive
                ? 'rgba(34,197,94,0.1)'
                : isHovered ? 'rgba(34,197,94,0.05)' : 'rgba(255,255,255,0.02)',
              border: isActive ? '1px solid rgba(34,197,94,0.2)' : '1px solid transparent',
              transition: 'all 0.15s',
            }}
          >
            {isActive && (
              <div style={{
                position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                width: '3px', height: '55%', background: '#22c55e', borderRadius: '0 2px 2px 0',
              }} />
            )}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '4px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: '0.8rem', fontWeight: 600, margin: 0,
                  color: isActive ? '#4ade80' : 'rgba(229,231,235,0.85)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {session.title || 'Nova conversa'}
                </p>
                <p style={{
                  fontSize: '0.68rem', margin: '2px 0 0', color: 'rgba(107,114,128,0.7)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {session.lastMessage || '...'}
                </p>
                <p style={{ fontSize: '0.6rem', margin: '2px 0 0', color: 'rgba(107,114,128,0.5)' }}>
                  {formatTime(session.timestamp)}
                </p>
              </div>
              <AnimatePresence>
                {isHovered && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}
                    onClick={e => { e.stopPropagation(); onDeleteChat?.(session.conversationId); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(239,68,68,0.5)', padding: '2px', flexShrink: 0, display: 'flex', alignItems: 'center' }}
                    title="Deletar conversa"
                  >
                    <Trash2 style={{ width: '12px', height: '12px' }} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// ─── Constantes de nível ──────────────────────────────────────────────────────
const LEVEL_STYLE: Record<OmegaAgent['level'], { bg: string; text: string; border: string; label: string }> = {
  MICRO_AGENTE: { bg: 'rgba(107,114,128,0.12)', text: '#9ca3af', border: 'rgba(107,114,128,0.2)', label: 'MI' },
  AGENTE:       { bg: 'rgba(34,197,94,0.12)',   text: '#4ade80', border: 'rgba(34,197,94,0.2)',   label: 'AG' },
  SUPER_AGENTE: { bg: 'rgba(6,182,212,0.12)',   text: '#22d3ee', border: 'rgba(6,182,212,0.2)',   label: 'SA' },
  ALFA:         { bg: 'rgba(59,130,246,0.12)',  text: '#60a5fa', border: 'rgba(59,130,246,0.2)',  label: 'AL' },
  OMEGA:        { bg: 'rgba(139,92,246,0.15)',  text: '#c084fc', border: 'rgba(139,92,246,0.25)', label: 'ΩM' },
};

function xpProgress(stats: OmegaAgent['stats']): number {
  const score = stats.totalTokens / 1000 + stats.interactions * 2 + stats.memoryBlocks * 5;
  if (score >= 500) return 100;
  if (score >= 200) return Math.round(((score - 200) / 300) * 100);
  if (score >= 80)  return Math.round(((score - 80)  / 120) * 100);
  if (score >= 20)  return Math.round(((score - 20)  / 60)  * 100);
  return Math.min(100, Math.round((score / 20) * 100));
}

// ─── AgentCard ────────────────────────────────────────────────────────────────
const AgentCard: React.FC<{ agent: OmegaAgent; onActivate: (id: string) => void }> = ({ agent, onActivate }) => {
  const [hovered, setHovered] = useState(false);
  const s  = LEVEL_STYLE[agent.level];
  const xp = xpProgress(agent.stats);
  const tok = agent.stats.totalTokens >= 1000
    ? `${(agent.stats.totalTokens / 1000).toFixed(1)}k`
    : agent.stats.totalTokens.toString();

  return (
    <motion.div
      whileHover={{ x: 2 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '9px 10px 7px', borderRadius: '10px', cursor: 'pointer', position: 'relative',
        background: agent.isActive ? s.bg : hovered ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
        border:     agent.isActive ? `1px solid ${s.border}` : '1px solid transparent',
        transition: 'all 0.15s',
      }}
    >
      {agent.isActive && (
        <div style={{
          position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
          width: '3px', height: '55%', background: s.text, borderRadius: '0 2px 2px 0',
        }} />
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '6px' }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '7px', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: s.bg, border: `1px solid ${s.border}`, color: s.text, fontSize: '9px', fontWeight: 700,
        }}>
          {s.label}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <p style={{ fontSize: '0.78rem', fontWeight: 600, margin: 0, color: agent.isActive ? s.text : 'rgba(229,231,235,0.9)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {agent.name}
            </p>
            {agent.isActive && <CheckCircle2 style={{ width: '10px', height: '10px', color: s.text, flexShrink: 0 }} />}
          </div>
          <p style={{ fontSize: '0.62rem', margin: 0, color: 'rgba(107,114,128,0.65)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {agent.specialty}
          </p>
        </div>
        <AnimatePresence>
          {(hovered || agent.isActive) && (
            <motion.button
              initial={{ opacity: 0, scale: 0.75 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.75 }}
              onClick={e => { e.stopPropagation(); onActivate(agent.id); }}
              style={{
                padding: '3px 8px', borderRadius: '5px', fontSize: '0.6rem', fontWeight: 700,
                flexShrink: 0, cursor: 'pointer',
                background: agent.isActive ? s.bg : 'rgba(34,197,94,0.12)',
                border:     agent.isActive ? `1px solid ${s.border}` : '1px solid rgba(34,197,94,0.2)',
                color:      agent.isActive ? s.text : '#4ade80',
              }}
            >
              {agent.isActive ? '✓ Ativo' : 'Usar'}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '5px' }}>
        {[
          { icon: <Zap      style={{ width: '8px', height: '8px' }} />, val: tok,                               title: 'Tokens'     },
          { icon: <Brain    style={{ width: '8px', height: '8px' }} />, val: String(agent.stats.interactions),  title: 'Interações' },
          { icon: <Database style={{ width: '8px', height: '8px' }} />, val: String(agent.stats.memoryBlocks),  title: 'Memória'    },
        ].map((stat, i) => (
          <div key={i} title={stat.title} style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'rgba(107,114,128,0.55)', fontSize: '0.6rem' }}>
            {stat.icon}<span>{stat.val}</span>
          </div>
        ))}
      </div>
      <div style={{ width: '100%', height: '2px', borderRadius: '2px', background: 'rgba(255,255,255,0.05)' }}>
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${xp}%` }} transition={{ duration: 0.9, ease: 'easeOut' }}
          style={{ height: '2px', borderRadius: '2px', background: `linear-gradient(90deg, ${s.text}, ${s.text}60)` }}
        />
      </div>
      <p style={{ fontSize: '0.55rem', color: 'rgba(107,114,128,0.35)', margin: '2px 0 0', textAlign: 'right' }}>
        {agent.level} · {xp}%
      </p>
    </motion.div>
  );
};

// ─── SubmenuAgents ────────────────────────────────────────────────────────────
const SubmenuAgents: React.FC<{ level: string }> = ({ level }) => {
  const router = useRouter();
  const { agents, activeAgent, isLoading, fetchAgents, activateAgent } = useAgentStore();
  const [tab, setTab] = useState<'presets' | 'custom'>('presets');

  useEffect(() => { fetchAgents(); }, [fetchAgents]);

  const presets = agents.filter(a => a.type === 'preset');
  const custom  = agents.filter(a => a.type === 'custom');
  const list    = tab === 'presets' ? presets : custom;

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '5px 0', fontSize: '0.65rem', fontWeight: 600,
    borderRadius: '6px', border: 'none', cursor: 'pointer',
    background: active ? 'rgba(34,197,94,0.12)' : 'transparent',
    color:      active ? '#4ade80' : 'rgba(107,114,128,0.4)',
    transition: 'all 0.15s',
  });

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', gap: '8px' }}>

      {/* Banner agente ativo */}
      {activeAgent && (
        <div style={{
          padding: '8px 10px', borderRadius: '10px', flexShrink: 0,
          background: 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(6,182,212,0.05))',
          border: '1px solid rgba(34,197,94,0.15)',
        }}>
          <p style={{ fontSize: '0.58rem', color: 'rgba(34,197,94,0.45)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', margin: '0 0 2px' }}>
            Ativo agora
          </p>
          <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#4ade80', margin: 0 }}>
            {activeAgent.name}
          </p>
          <p style={{ fontSize: '0.63rem', color: 'rgba(107,114,128,0.6)', margin: '1px 0 0' }}>
            {activeAgent.specialty}
          </p>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '3px', flexShrink: 0, background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '3px' }}>
        <button style={tabStyle(tab === 'presets')} onClick={() => setTab('presets')}>⚡ Prontos ({presets.length})</button>
        <button style={tabStyle(tab === 'custom')}  onClick={() => setTab('custom')}>🧬 Meus ({custom.length})</button>
      </div>

      {/* Lista */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', scrollbarWidth: 'none' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              <Cpu style={{ width: '18px', height: '18px', color: 'rgba(34,197,94,0.3)' }} />
            </motion.div>
          </div>
        ) : list.length > 0 ? (
          list.map(agent => <AgentCard key={agent.id} agent={agent} onActivate={activateAgent} />)
        ) : (
          <div style={{ textAlign: 'center', padding: '24px 0', opacity: 0.5 }}>
            <Brain style={{ width: '22px', height: '22px', color: 'rgba(34,197,94,0.3)', margin: '0 auto 8px', display: 'block' }} />
            <p style={{ fontSize: '0.72rem', color: 'rgba(156,163,175,0.5)', margin: 0 }}>Nenhum agente criado</p>
            <p style={{ fontSize: '0.63rem', color: 'rgba(107,114,128,0.35)', margin: '4px 0 0' }}>Use o extrator Hefesto na página Agentes</p>
          </div>
        )}
      </div>

      {/* ✅ Botão → /agents */}
      <motion.button
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
        onClick={() => router.push('/agents')}
        style={{
          flexShrink: 0, width: '100%', padding: '8px', borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
          background: 'transparent', cursor: 'pointer', fontSize: '0.68rem', fontWeight: 600,
          border: '1px solid rgba(34,197,94,0.12)', color: 'rgba(34,197,94,0.5)',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.background = 'rgba(34,197,94,0.07)';
          (e.currentTarget as HTMLElement).style.color = '#4ade80';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.background = 'transparent';
          (e.currentTarget as HTMLElement).style.color = 'rgba(34,197,94,0.5)';
        }}
      >
        Ver todos os agentes
        <ArrowUpRight style={{ width: '11px', height: '11px' }} />
      </motion.button>
    </div>
  );
};

// ─── SubmenuWorkflows ─────────────────────────────────────────────────────────
const SubmenuWorkflows: React.FC = () => {
  const router = useRouter();

  const mockWorkflows = [
    { name: 'Code Generation', age: '2d' },
    { name: 'Data Analysis',   age: '3d' },
    { name: 'Content Creation', age: '5d' },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', gap: '6px' }}>

      {/* Lista */}
      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {mockWorkflows.map((wf, i) => (
          <motion.div key={i} whileHover={{ x: 3 }}
            style={{ padding: '9px 12px', borderRadius: '10px', cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(34,197,94,0.07)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)')}
          >
            <p style={{ fontSize: '0.82rem', fontWeight: 500, color: 'rgba(229,231,235,0.85)', margin: 0 }}>{wf.name}</p>
            <p style={{ fontSize: '0.68rem', color: 'rgba(107,114,128,0.7)', margin: '2px 0 0' }}>há {wf.age}</p>
          </motion.div>
        ))}
      </div>

      {/* ✅ Botões → /workspace */}
      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <motion.button
          whileHover={{ scale: 1.02, boxShadow: '0 0 12px rgba(34,197,94,0.15)' }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push('/workspace')}
          style={{
            width: '100%', padding: '8px 12px', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
            fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
            background: 'rgba(34,197,94,0.15)', color: '#4ade80',
            border: '1px solid rgba(34,197,94,0.25)',
          }}
        >
          <Zap style={{ width: '13px', height: '13px' }} />
          + Novo Workflow
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={() => router.push('/workspace')}
          style={{
            width: '100%', padding: '7px', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
            background: 'transparent', cursor: 'pointer', fontSize: '0.68rem', fontWeight: 600,
            border: '1px solid rgba(34,197,94,0.12)', color: 'rgba(34,197,94,0.5)',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(34,197,94,0.07)';
            (e.currentTarget as HTMLElement).style.color = '#4ade80';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.color = 'rgba(34,197,94,0.5)';
          }}
        >
          Ver todos os workflows
          <ArrowUpRight style={{ width: '11px', height: '11px' }} />
        </motion.button>
      </div>
    </div>
  );
};

// ─── SubmenuSettings ──────────────────────────────────────────────────────────
const SubmenuSettings: React.FC = () => (
  <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', display: 'flex', flexDirection: 'column', gap: '16px' }}>
    <div>
      <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(34,197,94,0.3)', marginBottom: '6px' }}>Aparência</p>
      {['🌙  Tema Escuro', '🌍  Idioma: Português'].map((item, i) => (
        <button key={i} style={{ display: 'block', width: '100%', padding: '8px 12px', borderRadius: '10px', fontSize: '0.82rem', textAlign: 'left', color: 'rgba(209,213,219,0.8)', background: 'transparent', border: 'none', cursor: 'pointer' }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(34,197,94,0.07)')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
        >{item}</button>
      ))}
    </div>
    <div style={{ borderTop: '1px solid rgba(34,197,94,0.08)', paddingTop: '12px' }}>
      <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(34,197,94,0.3)', marginBottom: '6px' }}>Conta</p>
      {['👤  Perfil', '🔐  Segurança'].map((item, i) => (
        <button key={i} style={{ display: 'block', width: '100%', padding: '8px 12px', borderRadius: '10px', fontSize: '0.82rem', textAlign: 'left', color: 'rgba(209,213,219,0.8)', background: 'transparent', border: 'none', cursor: 'pointer' }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(34,197,94,0.07)')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
        >{item}</button>
      ))}
    </div>
  </div>
);

// ─── Constantes ───────────────────────────────────────────────────────────────
const SUBMENU_TITLES: Record<Section, string> = {
  messages:  '💬  Mensagens',
  agents:    '🧠  Agentes',
  workflows: '⚡  Workflows',
  settings:  '⚙️  Configurações',
};

const agentColors = {
  OMEGA:        { bg: 'rgba(139,92,246,0.15)', text: '#c084fc', label: 'ΩM' },
  ALFA:         { bg: 'rgba(59,130,246,0.15)', text: '#60a5fa', label: 'AL' },
  SUPER_AGENTE: { bg: 'rgba(6,182,212,0.15)',  text: '#22d3ee', label: 'SA' },
  AGENTE:       { bg: 'rgba(34,197,94,0.15)',  text: '#4ade80', label: 'AG' },
  MICRO_AGENTE: { bg: 'rgba(107,114,128,0.15)',text: '#9ca3af', label: 'MI' },
};

// ─── SlimSidebar ──────────────────────────────────────────────────────────────
export const SlimSidebar: React.FC<SlimSidebarProps> = ({
  activeSection  = 'messages',
  onSectionChange,
  onNewChat,
  onLogout,
  agentLevel     = 'AGENTE',
  unreadMessages = 0,
  chatHistory    = [],
  currentChatId,
  onSelectChat,
  onDeleteChat,
}) => {
  const [openPanel, setOpenPanel] = useState<Section | null>(null);
  const colors = agentColors[agentLevel];

  // ✅ FIX: agents e workflows nunca disparam onSectionChange (evita navegação)
  // A navegação fica dentro de cada submenu via useRouter
  const handleIconClick = (section: Section) => {
    setOpenPanel(prev => (prev === section ? null : section));
    if (section !== 'agents' && section !== 'workflows') {
      onSectionChange?.(section);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100%', flexShrink: 0, overflow: 'hidden' }}>

      {/* ── Rail de ícones ── */}
      <div style={{
        width: 64, minWidth: 64, flexShrink: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'space-between', padding: '16px 6px',
        background: 'linear-gradient(180deg, #060c08 0%, #08110a 100%)',
        borderRight: '1px solid rgba(34,197,94,0.08)',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            style={{
              width: '36px', height: '36px', borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: '#000', fontWeight: 700, fontSize: '14px', marginBottom: '8px',
            }}
          >O</motion.div>

          <motion.button
            whileHover={{ scale: 1.08, boxShadow: '0 0 14px rgba(34,197,94,0.2)' }}
            whileTap={{ scale: 0.94 }}
            onClick={onNewChat} title="Novo Chat"
            style={{
              width: '44px', height: '44px', borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(22,163,74,0.12))',
              border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80', cursor: 'pointer',
            }}
          >
            <Plus style={{ width: '16px', height: '16px' }} />
          </motion.button>

          <div style={{ width: '32px', height: '1px', background: 'rgba(34,197,94,0.1)', margin: '4px 0' }} />

          <IconBtn icon={<MessageCircle style={{ width: '16px', height: '16px' }} />} label="Mensagens"
            isActive={openPanel === 'messages'} badge={unreadMessages}
            onClick={() => handleIconClick('messages')} />
          <IconBtn icon={<Brain style={{ width: '16px', height: '16px' }} />} label="Agentes"
            isActive={openPanel === 'agents'}
            onClick={() => handleIconClick('agents')} />
          <IconBtn icon={<Zap style={{ width: '16px', height: '16px' }} />} label="Workflows"
            isActive={openPanel === 'workflows'}
            onClick={() => handleIconClick('workflows')} />
          <IconBtn icon={<Settings style={{ width: '16px', height: '16px' }} />} label="Configurações"
            isActive={openPanel === 'settings'}
            onClick={() => handleIconClick('settings')} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: colors.bg, color: colors.text,
            border: `1px solid ${colors.text}33`, fontSize: '11px', fontWeight: 700,
          }} title={`Nível: ${agentLevel}`}>
            {colors.label}
          </div>
          <motion.button
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
            onClick={onLogout} title="Sair"
            style={{ width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(248,113,113,0.5)', background: 'transparent', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)'; (e.currentTarget as HTMLElement).style.color = 'rgba(248,113,113,0.9)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(248,113,113,0.5)'; }}
          >
            <LogOut style={{ width: '16px', height: '16px' }} />
          </motion.button>
        </div>
      </div>

      {/* ── Painel animado ── */}
      <AnimatePresence initial={false}>
        {openPanel && (
          <motion.div
            key={openPanel}
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 256, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            style={{ flexShrink: 0, overflow: 'hidden', height: '100%', background: 'linear-gradient(180deg, #07100a 0%, #09140b 100%)', borderRight: '1px solid rgba(34,197,94,0.07)' }}
          >
            <div style={{ width: 256, minWidth: 256, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', flexShrink: 0, borderBottom: '1px solid rgba(34,197,94,0.07)' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'rgba(229,231,235,0.9)', margin: 0 }}>
                  {SUBMENU_TITLES[openPanel]}
                </h3>
                {openPanel === 'messages' && chatHistory.length > 0 && (
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '1px 7px', borderRadius: '99px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80', marginRight: '6px' }}>
                    {chatHistory.length}
                  </span>
                )}
                <motion.button
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => setOpenPanel(null)}
                  style={{ width: '24px', height: '24px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(34,197,94,0.5)', background: 'rgba(34,197,94,0.07)', border: 'none', cursor: 'pointer' }}
                >
                  <ChevronLeft style={{ width: '12px', height: '12px' }} />
                </motion.button>
              </div>

              <div style={{ flex: 1, padding: '10px 12px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {openPanel === 'messages'  && <SubmenuMessages chatHistory={chatHistory} currentChatId={currentChatId} onSelectChat={onSelectChat} onDeleteChat={onDeleteChat} />}
                {openPanel === 'agents'    && <SubmenuAgents level={agentLevel} />}
                {openPanel === 'workflows' && <SubmenuWorkflows />}
                {openPanel === 'settings'  && <SubmenuSettings />}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SlimSidebar;

// EOF — Evolution Hash: slim.sidebar.0030.20260306
