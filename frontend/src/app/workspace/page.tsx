'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Plus, Brain, Layers, Zap, MessageSquare,
  Clock, Users, Archive, Search, X, ChevronRight,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Workspace {
  id: string;
  name: string;
  description: string;
  emoji: string;
  status: 'active' | 'archived';
  members: number;
  chats: number;
  lastAccessed: string;
  accentRgb: string;
}

// ─── Mock data (substitua pela sua fonte real) ────────────────────────────────

const MOCK_WORKSPACES: Workspace[] = [
  {
    id: '1',
    name: 'ORUS Projects',
    description: 'Main development workspace for ORUS ecosystem',
    emoji: '🚀',
    status: 'active',
    members: 12,
    chats: 42,
    lastAccessed: '02/03/2026',
    accentRgb: '34,197,94',
  },
  {
    id: '2',
    name: 'Design Team',
    description: 'Aurora visual design system collaboration',
    emoji: '🎨',
    status: 'active',
    members: 8,
    chats: 18,
    lastAccessed: '01/03/2026',
    accentRgb: '139,92,246',
  },
  {
    id: '3',
    name: 'Research Hub',
    description: 'AI research and experimentation space',
    emoji: '🔬',
    status: 'active',
    members: 5,
    chats: 31,
    lastAccessed: '28/02/2026',
    accentRgb: '6,182,212',
  },
];

// ─── Create Workspace Modal ────────────────────────────────────────────────────

const CreateModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl p-6"
        style={{
          background: 'linear-gradient(160deg, #0a1510 0%, #0c1a12 100%)',
          border: '1px solid rgba(34,197,94,0.15)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: 'rgba(34,197,94,0.5)' }}>
              Novo ambiente
            </p>
            <h2 className="text-xl font-bold" style={{ color: '#f0fdf4' }}>Criar Workspace</h2>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(156,163,175,0.6)' }}
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Fields */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(156,163,175,0.7)' }}>
              Nome do workspace
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Meu Projeto"
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(34,197,94,0.15)',
                color: '#f0fdf4',
              }}
              onFocus={e => (e.target.style.border = '1px solid rgba(34,197,94,0.4)')}
              onBlur={e => (e.target.style.border = '1px solid rgba(34,197,94,0.15)')}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(156,163,175,0.7)' }}>
              Descrição
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Descreva o propósito deste workspace..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all resize-none"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(34,197,94,0.15)',
                color: '#f0fdf4',
              }}
              onFocus={e => (e.target.style.border = '1px solid rgba(34,197,94,0.4)')}
              onBlur={e => (e.target.style.border = '1px solid rgba(34,197,94,0.15)')}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(156,163,175,0.7)',
            }}
          >
            Cancelar
          </button>
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(34,197,94,0.2)' }}
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: 'linear-gradient(135deg, rgba(34,197,94,0.25), rgba(22,163,74,0.15))',
              border: '1px solid rgba(34,197,94,0.3)',
              color: '#4ade80',
            }}
          >
            Criar workspace
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Workspace Card ────────────────────────────────────────────────────────────

const WorkspaceCard: React.FC<{ ws: Workspace; index: number }> = ({ ws, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
  >
    <Link href={`/workspace/${ws.id}`}>
      <motion.div
        whileHover={{ y: -3, scale: 1.008 }}
        transition={{ duration: 0.22 }}
        className="group relative rounded-2xl p-5 cursor-pointer overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.025)',
          border: `1px solid rgba(${ws.accentRgb},0.1)`,
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.background = `rgba(${ws.accentRgb},0.06)`;
          (e.currentTarget as HTMLElement).style.border = `1px solid rgba(${ws.accentRgb},0.22)`;
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.025)';
          (e.currentTarget as HTMLElement).style.border = `1px solid rgba(${ws.accentRgb},0.1)`;
        }}
      >
        {/* Top glow line */}
        <div
          className="absolute top-0 left-8 right-8 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: `linear-gradient(90deg, transparent, rgba(${ws.accentRgb},0.8), transparent)` }}
        />

        <div className="flex items-start gap-4">
          {/* Emoji icon */}
          <motion.div
            whileHover={{ scale: 1.15, rotate: 5 }}
            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{
              background: `rgba(${ws.accentRgb},0.1)`,
              border: `1px solid rgba(${ws.accentRgb},0.18)`,
            }}
          >
            {ws.emoji}
          </motion.div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {/* Status dot */}
              <motion.div
                animate={{ opacity: ws.status === 'active' ? [0.5, 1, 0.5] : 1 }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: ws.status === 'active' ? `rgb(${ws.accentRgb})` : '#6b7280' }}
              />
              <span
                className="text-xs font-semibold capitalize"
                style={{ color: ws.status === 'active' ? `rgba(${ws.accentRgb},0.8)` : 'rgba(107,114,128,0.8)' }}
              >
                {ws.status === 'active' ? 'Ativo' : 'Arquivado'}
              </span>
            </div>

            <h3 className="text-base font-bold mb-0.5 truncate" style={{ color: '#f0fdf4' }}>
              {ws.name}
            </h3>
            <p className="text-xs truncate" style={{ color: 'rgba(156,163,175,0.55)' }}>
              {ws.description}
            </p>
          </div>

          {/* Arrow */}
          <motion.div
            className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: `rgba(${ws.accentRgb},0.7)` }}
          >
            <ChevronRight className="w-4 h-4" />
          </motion.div>
        </div>

        {/* Stats row */}
        <div
          className="flex items-center gap-4 mt-4 pt-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
        >
          {[
            { icon: <Users className="w-3 h-3" />, value: ws.members, label: 'membros' },
            { icon: <MessageSquare className="w-3 h-3" />, value: ws.chats, label: 'chats' },
            { icon: <Clock className="w-3 h-3" />, value: ws.lastAccessed, label: '' },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(156,163,175,0.45)' }}>
              <span style={{ color: `rgba(${ws.accentRgb},0.4)` }}>{s.icon}</span>
              <span className="font-medium" style={{ color: 'rgba(209,213,219,0.6)' }}>{s.value}</span>
              {s.label && <span>{s.label}</span>}
            </div>
          ))}
        </div>
      </motion.div>
    </Link>
  </motion.div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WorkspaceHubPage() {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'archived'>('all');

  const filtered = MOCK_WORKSPACES.filter(ws => {
    const matchSearch = ws.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || ws.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #060d08 0%, #07110a 40%, #050c07 100%)' }}
    >
      {/* Ambient BG */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.07) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: 'linear-gradient(rgba(34,197,94,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.4) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }} />
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative sticky top-0 z-40"
        style={{
          background: 'rgba(6,13,8,0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(34,197,94,0.08)',
        }}
      >
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-black font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
            >
              O
            </motion.div>
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase leading-none" style={{ color: 'rgba(34,197,94,0.45)' }}>
                ORUS SAGE
              </p>
              <h1 className="text-base font-bold text-white leading-none mt-0.5">Workspaces</h1>
            </div>
          </div>

          <motion.button
            onClick={() => setShowModal(true)}
            whileHover={{ scale: 1.04, boxShadow: '0 0 20px rgba(34,197,94,0.2)' }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm"
            style={{
              background: 'linear-gradient(135deg, rgba(34,197,94,0.18), rgba(22,163,74,0.1))',
              border: '1px solid rgba(34,197,94,0.25)',
              color: '#4ade80',
            }}
          >
            <Plus className="w-4 h-4" />
            Novo Workspace
          </motion.button>
        </div>
      </motion.header>

      {/* Hero */}
      <div className="relative max-w-4xl mx-auto px-6 pt-12 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.18)', color: '#4ade80' }}
          >
            <Layers className="w-3 h-3" />
            Seus ambientes cognitivos
          </motion.div>
          <h2 className="text-3xl font-bold mb-2" style={{ color: '#f0fdf4' }}>Meus Workspaces</h2>
          <p className="text-sm" style={{ color: 'rgba(156,163,175,0.6)' }}>
            Organize projetos, colaborações e conversas em ambientes isolados e inteligentes.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-4 mt-6"
        >
          {[
            { icon: <Layers className="w-3 h-3" />, value: MOCK_WORKSPACES.length, label: 'Workspaces' },
            { icon: <Brain className="w-3 h-3" />, value: 7, label: 'Agentes' },
            { icon: <Zap className="w-3 h-3" />, value: 12, label: 'Chats hoje' },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 + i * 0.06 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(34,197,94,0.07)' }}
            >
              <span style={{ color: 'rgba(74,222,128,0.5)' }}>{s.icon}</span>
              <span className="font-bold" style={{ color: '#f0fdf4' }}>{s.value}</span>
              <span style={{ color: 'rgba(156,163,175,0.45)' }}>{s.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Content */}
      <main className="relative max-w-4xl mx-auto px-6 pb-20">
        {/* Search + filter */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-3 mb-6"
        >
          {/* Search */}
          <div
            className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(34,197,94,0.1)' }}
          >
            <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'rgba(74,222,128,0.4)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar workspaces..."
              className="bg-transparent outline-none text-sm w-full"
              style={{ color: '#f0fdf4' }}
            />
          </div>

          {/* Filter pills */}
          <div className="flex gap-1.5">
            {(['all', 'active', 'archived'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize"
                style={
                  filter === f
                    ? { background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80' }
                    : { background: 'transparent', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(156,163,175,0.5)' }
                }
              >
                {f === 'all' ? 'Todos' : f === 'active' ? 'Ativos' : 'Arquivados'}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Workspace cards */}
        <div className="space-y-3">
          {filtered.length > 0 ? (
            filtered.map((ws, i) => <WorkspaceCard key={ws.id} ws={ws} index={i} />)
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
              style={{ color: 'rgba(156,163,175,0.4)' }}
            >
              <Archive className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhum workspace encontrado</p>
            </motion.div>
          )}
        </div>
      </main>

      {/* Modal */}
      <AnimatePresence>
        {showModal && <CreateModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </div>
  );
}