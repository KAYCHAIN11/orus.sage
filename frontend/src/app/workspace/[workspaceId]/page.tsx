'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion, Variants } from 'framer-motion';
import { MessageSquare, FolderOpen, Settings, ArrowLeft, Brain, Activity, Clock } from 'lucide-react';

const CARDS = [
  {
    href: (id: string) => `/chat?workspace=${id}`,
    icon: <MessageSquare className="w-6 h-6" />,
    title: 'Chat',
    description: 'Converse com seu parceiro cognitivo ORUS em modo QUICK ou DEEP.',
    accent: '#22c55e',
    accentRgb: '34,197,94',
    tag: 'IA',
  },
  {
    href: (id: string) => `/workspace/${id}/files`,
    icon: <FolderOpen className="w-6 h-6" />,
    title: 'Arquivos',
    description: 'Gerencie documentos, exports e artefatos gerados neste workspace.',
    accent: '#06b6d4',
    accentRgb: '6,182,212',
    tag: 'Storage',
  },
  {
    href: (id: string) => `/workspace/${id}/settings`,
    icon: <Settings className="w-6 h-6" />,
    title: 'Configurações',
    description: 'Personalize agentes, permissões e preferências do workspace.',
    accent: '#8b5cf6',
    accentRgb: '139,92,246',
    tag: 'Config',
  },
];

const containerVariants: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.08 } },
};

const cardVariants: Variants = {
  initial: { opacity: 0, y: 24, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export default function WorkspaceHomePage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #060d08 0%, #07110a 40%, #050c07 100%)' }}
    >
      {/* ── Ambient background ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(ellipse, rgba(34,197,94,0.07) 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 right-0 w-[350px] h-[350px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)' }}
        />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: 'linear-gradient(rgba(34,197,94,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.4) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      {/* ── Header ── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative sticky top-0 z-50"
        style={{
          background: 'rgba(6,13,8,0.82)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(34,197,94,0.08)',
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            {/* Back */}
            <Link href="/workspace">
              <motion.div
                whileHover={{ x: -3 }}
                className="flex items-center gap-1.5 text-xs font-medium transition-colors"
                style={{ color: 'rgba(74,222,128,0.5)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(74,222,128,0.9)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(74,222,128,0.5)')}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Workspaces
              </motion.div>
            </Link>

            <div className="w-px h-4" style={{ background: 'rgba(34,197,94,0.15)' }} />

            {/* Workspace identity */}
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ boxShadow: ['0 0 0px rgba(34,197,94,0)', '0 0 12px rgba(34,197,94,0.35)', '0 0 0px rgba(34,197,94,0)'] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #0d2818, #1a4a2e)', border: '1px solid rgba(34,197,94,0.22)' }}
              >
                <Brain className="w-4 h-4 text-green-400" />
              </motion.div>
              <div>
                <p className="text-xs font-medium tracking-widest uppercase" style={{ color: 'rgba(34,197,94,0.4)' }}>
                  Workspace
                </p>
                <p className="text-sm font-bold text-white leading-none">{workspaceId}</p>
              </div>
            </div>

            {/* Live indicator */}
            <div className="ml-auto flex items-center gap-2">
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: '#22c55e' }}
              />
              <span className="text-xs" style={{ color: 'rgba(34,197,94,0.5)' }}>Ativo</span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* ── Hero ── */}
      <div className="relative max-w-6xl mx-auto px-6 pt-14 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.18)', color: '#4ade80' }}
          >
            <Activity className="w-3 h-3" />
            Ambiente cognitivo ativo
          </motion.div>

          <h1 className="text-4xl font-bold mb-3 leading-tight" style={{ color: '#f0fdf4' }}>
            Bem-vindo ao seu{' '}
            <span
              className="font-extrabold"
              style={{
                background: 'linear-gradient(135deg, #22c55e, #4ade80)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Workspace
            </span>
          </h1>
          <p className="text-base max-w-lg" style={{ color: 'rgba(156,163,175,0.65)' }}>
            Selecione um módulo abaixo para começar. Cada ambiente é isolado com contexto e memória próprios.
          </p>
        </motion.div>

        {/* Quick stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="flex items-center gap-5 mt-7"
        >
          {[
            { icon: <Clock className="w-3 h-3" />, label: 'Último acesso', value: 'Agora' },
            { icon: <MessageSquare className="w-3 h-3" />, label: 'Chats', value: '42' },
            { icon: <Brain className="w-3 h-3" />, label: 'Agentes', value: '3' },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.06 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(34,197,94,0.07)' }}
            >
              <span style={{ color: 'rgba(74,222,128,0.5)' }}>{s.icon}</span>
              <span className="font-semibold" style={{ color: '#f0fdf4' }}>{s.value}</span>
              <span style={{ color: 'rgba(156,163,175,0.45)' }}>{s.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ── Action cards ── */}
      <motion.main
        className="relative max-w-6xl mx-auto px-6 pb-20"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        {/* Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px flex-1" style={{ background: 'rgba(34,197,94,0.08)' }} />
          <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'rgba(34,197,94,0.25)' }}>
            Módulos
          </span>
          <div className="h-px flex-1" style={{ background: 'rgba(34,197,94,0.08)' }} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {CARDS.map((card, i) => (
            <motion.div key={i} variants={cardVariants}>
              <Link href={card.href(workspaceId)} className="block group">
                <motion.div
                  whileHover={{ y: -4, scale: 1.015 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="relative rounded-2xl p-6 h-full overflow-hidden cursor-pointer"
                  style={{
                    background: 'rgba(255,255,255,0.025)',
                    border: `1px solid rgba(${card.accentRgb},0.12)`,
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = `rgba(${card.accentRgb},0.07)`;
                    (e.currentTarget as HTMLElement).style.border = `1px solid rgba(${card.accentRgb},0.25)`;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.025)';
                    (e.currentTarget as HTMLElement).style.border = `1px solid rgba(${card.accentRgb},0.12)`;
                  }}
                >
                  {/* Top glow line */}
                  <div
                    className="absolute top-0 left-8 right-8 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `linear-gradient(90deg, transparent, ${card.accent}, transparent)` }}
                  />

                  {/* Ambient corner glow */}
                  <div
                    className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
                    style={{ background: card.accent, transform: 'translate(30%, -30%)' }}
                  />

                  {/* Icon */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 3 }}
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-all"
                    style={{
                      background: `rgba(${card.accentRgb},0.12)`,
                      border: `1px solid rgba(${card.accentRgb},0.2)`,
                      color: card.accent,
                    }}
                  >
                    {card.icon}
                  </motion.div>

                  {/* Tag */}
                  <span
                    className="inline-block px-2 py-0.5 rounded-md text-xs font-semibold mb-3"
                    style={{ background: `rgba(${card.accentRgb},0.1)`, color: card.accent }}
                  >
                    {card.tag}
                  </span>

                  <h3 className="text-lg font-bold mb-2" style={{ color: '#f0fdf4' }}>
                    {card.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(156,163,175,0.6)' }}>
                    {card.description}
                  </p>

                  {/* Arrow */}
                  <motion.div
                    className="mt-5 flex items-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-all duration-200"
                    style={{ color: card.accent }}
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    Acessar módulo →
                  </motion.div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Workspace ID footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 flex items-center justify-center"
        >
          <div
            className="flex items-center gap-3 px-5 py-3 rounded-xl text-xs"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(34,197,94,0.07)',
              color: 'rgba(107,114,128,0.6)',
            }}
          >
            <Brain className="w-3.5 h-3.5" style={{ color: 'rgba(34,197,94,0.3)' }} />
            Workspace ID:
            <code
              className="font-mono px-2 py-0.5 rounded-md"
              style={{ background: 'rgba(34,197,94,0.08)', color: 'rgba(74,222,128,0.7)' }}
            >
              {workspaceId}
            </code>
          </div>
        </motion.div>
      </motion.main>
    </div>
  );
}