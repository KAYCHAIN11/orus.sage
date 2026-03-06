'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Zap, Dna, Sparkles, ChevronRight,
  Bot, Shield, Target, Cpu, Star, X, Check,
  ArrowLeft, Loader2,
} from 'lucide-react';
import Image from 'next/image';

// ─── Types ────────────────────────────────────────────────────────────────────

type AgentLevel = 'MICRO_AGENTE' | 'AGENTE' | 'SUPER_AGENTE' | 'ALFA' | 'OMEGA';
type AgentMode = 'QUICK' | 'DEEP' | 'HYBRID';

interface OmegaDNAProfile {
  name: string;
  codename: string;
  level: AgentLevel;
  mode: AgentMode;
  personality: string;
  specialization: string;
  capabilities: string[];
  traits: string[];
  accentRgb: string;
  emoji: string;
  description: string;
  systemPrompt: string;
}

// ─── Level config ─────────────────────────────────────────────────────────────

const LEVEL_CONFIG: Record<AgentLevel, { label: string; color: string; rgb: string; power: number }> = {
  MICRO_AGENTE: { label: 'Micro Agente', color: '#9ca3af', rgb: '156,163,175', power: 20 },
  AGENTE:       { label: 'Agente',       color: '#22c55e', rgb: '34,197,94',   power: 40 },
  SUPER_AGENTE: { label: 'Super Agente', color: '#06b6d4', rgb: '6,182,212',   power: 60 },
  ALFA:         { label: 'Alfa',         color: '#3b82f6', rgb: '59,130,246',  power: 80 },
  OMEGA:        { label: 'Omega',        color: '#8b5cf6', rgb: '139,92,246',  power: 100 },
};

// ─── Mock OmegaDNA extraction (substitua pela chamada real à API) ──────────────

async function extractWithOmegaDNA(objective: string): Promise<OmegaDNAProfile> {
  await new Promise(r => setTimeout(r, 3200));

  const isResearch   = /pesquis|research|analise|análise|dados|data/i.test(objective);
  const isCode       = /código|code|develop|programa|software|api/i.test(objective);
  const isCreative   = /cri[ae]|design|conteúdo|content|escri|writ/i.test(objective);
  const isStrategic  = /estratégi|strateg|negócio|business|plano|plan/i.test(objective);
  const isOmega      = /tudo|everything|completo|full|master|avançad/i.test(objective);

  let level: AgentLevel = 'AGENTE';
  let mode: AgentMode = 'QUICK';
  let accentRgb = '34,197,94';
  let emoji = '🤖';
  let specialization = 'Assistente Geral';
  let personality = 'Equilibrado e direto';
  let capabilities: string[] = [];
  let traits: string[] = [];

  if (isOmega) {
    level = 'OMEGA'; mode = 'HYBRID'; accentRgb = '139,92,246'; emoji = '🧬';
    specialization = 'Orquestrador Universal';
    personality = 'Adaptativo, estratégico e meta-cognitivo';
    capabilities = ['Raciocínio profundo', 'Orquestração de agentes', 'Meta-análise', 'Síntese cross-domain'];
    traits = ['Autonomo', 'Reflexivo', 'Adaptativo', 'Criativo'];
  } else if (isStrategic) {
    level = 'ALFA'; mode = 'DEEP'; accentRgb = '59,130,246'; emoji = '🎯';
    specialization = 'Estrategista de Negócios';
    personality = 'Analítico, focado em resultados e orientado a dados';
    capabilities = ['Análise de mercado', 'Planejamento estratégico', 'KPI tracking', 'Risk assessment'];
    traits = ['Decisivo', 'Analítico', 'Orientado a metas'];
  } else if (isResearch) {
    level = 'SUPER_AGENTE'; mode = 'DEEP'; accentRgb = '6,182,212'; emoji = '🔬';
    specialization = 'Pesquisador e Analista';
    personality = 'Metódico, curioso e orientado a evidências';
    capabilities = ['Web research', 'Síntese de informações', 'Análise crítica', 'Relatórios detalhados'];
    traits = ['Metódico', 'Curioso', 'Preciso'];
  } else if (isCode) {
    level = 'SUPER_AGENTE'; mode = 'HYBRID'; accentRgb = '34,197,94'; emoji = '⚡';
    specialization = 'Engenheiro de Software';
    personality = 'Preciso, eficiente e orientado a soluções';
    capabilities = ['Code generation', 'Code review', 'Debugging', 'Arquitetura de sistemas'];
    traits = ['Técnico', 'Eficiente', 'Pragmático'];
  } else if (isCreative) {
    level = 'AGENTE'; mode = 'QUICK'; accentRgb = '244,63,94'; emoji = '✨';
    specialization = 'Criador de Conteúdo';
    personality = 'Criativo, expressivo e envolvente';
    capabilities = ['Redação criativa', 'Copywriting', 'Storytelling', 'Ideação'];
    traits = ['Criativo', 'Expressivo', 'Empático'];
  } else {
    capabilities = ['Conversação avançada', 'Resolução de problemas', 'Suporte contextual'];
    traits = ['Prestativo', 'Claro', 'Eficiente'];
  }

  const words = objective.trim().split(' ');
  const codename = words.slice(0, 2).map(w => w.toUpperCase()).join('_');

  return {
    name: `Agente ${specialization}`,
    codename: `ORUS_${codename}`,
    level,
    mode,
    personality,
    specialization,
    capabilities,
    traits,
    accentRgb,
    emoji,
    description: `Agente especializado para: ${objective}`,
    systemPrompt: `Você é ${`Agente ${specialization}`}, um ${LEVEL_CONFIG[level].label} do sistema ORUS SAGE. Sua personalidade é ${personality}. Foque em: ${objective}. Responda sempre de forma clara e objetiva, utilizando suas capacidades de ${capabilities.join(', ')}.`,
  };
}

// ─── Step indicators ──────────────────────────────────────────────────────────

const STEPS = ['Objetivo', 'Extração DNA', 'Perfil do Agente'] as const;

// ─── DNA Animation (STEP 1) ───────────────────────────────────────────────────
// (mantido como você pediu, não mexi no visual geral)

const DnaAnimation: React.FC<{ accentRgb?: string }> = ({ accentRgb = '34,197,94' }) => (
  <div className="flex items-center justify-center py-8">
    <div className="relative w-20 h-20">
      {/* Outer ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 rounded-full"
        style={{ border: `2px solid rgba(${accentRgb},0.3)`, borderTopColor: `rgb(${accentRgb})` }}
      />
      {/* Middle ring */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-3 rounded-full"
        style={{ border: `2px solid rgba(${accentRgb},0.2)`, borderBottomColor: `rgb(${accentRgb})` }}
      />
      {/* Center */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Image
          src="/sage.png"
          alt="Sage"
          width={24}
          height={24}
          className="select-none"
        />
      </motion.div>
      {/* Glow */}
      <motion.div
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="absolute inset-0 rounded-full blur-xl"
        style={{ background: `rgba(${accentRgb},0.3)` }}
      />
    </div>
  </div>
);

// ─── Extraction log lines ─────────────────────────────────────────────────────

const LOG_LINES = [
  'Inicializando OmegaDNA extractor...',
  'Analisando semântica do objetivo...',
  'Mapeando domínio de especialização...',
  'Calculando nível de complexidade...',
  'Inferindo traços de personalidade...',
  'Sintetizando capacidades cognitivas...',
  'Gerando system prompt base...',
  'Perfil OmegaDNA extraído com sucesso ✓',
];

const ExtractionLog: React.FC = () => {
  const [visibleLines, setVisibleLines] = useState<number>(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setVisibleLines(prev => {
        if (prev >= LOG_LINES.length) { clearInterval(interval); return prev; }
        return prev + 1;
      });
    }, 380);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="rounded-xl p-4 font-mono text-xs space-y-1.5 overflow-hidden"
      style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(34,197,94,0.1)' }}
    >
      {LOG_LINES.slice(0, visibleLines).map((line, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
          style={{ color: i === visibleLines - 1 ? '#4ade80' : 'rgba(74,222,128,0.45)' }}
        >
          <span style={{ color: 'rgba(34,197,94,0.3)' }}>&gt;</span>
          {line}
        </motion.div>
      ))}
      {visibleLines < LOG_LINES.length && (
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="inline-block w-2 h-3"
          style={{ background: '#22c55e' }}
        />
      )}
    </div>
  );
};

// ─── Agent Profile Card ───────────────────────────────────────────────────────

const AgentProfileCard: React.FC<{ profile: OmegaDNAProfile }> = ({ profile }) => {
  const lvl = LEVEL_CONFIG[profile.level];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl overflow-hidden"
      style={{ border: `1px solid rgba(${profile.accentRgb},0.2)`, background: 'rgba(255,255,255,0.02)' }}
    >
      {/* Top glow */}
      <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, rgba(${profile.accentRgb},0.7), transparent)` }} />

      {/* Header */}
      <div className="p-5" style={{ background: `rgba(${profile.accentRgb},0.06)` }}>
        <div className="flex items-start gap-4">
          <motion.div
            animate={{ boxShadow: [`0 0 0px rgba(${profile.accentRgb},0)`, `0 0 16px rgba(${profile.accentRgb},0.4)`, `0 0 0px rgba(${profile.accentRgb},0)`] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: `rgba(${profile.accentRgb},0.12)`, border: `1px solid rgba(${profile.accentRgb},0.25)` }}
          >
            {profile.emoji}
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: `rgba(${lvl.rgb},0.15)`, color: lvl.color, border: `1px solid rgba(${lvl.rgb},0.25)` }}
              >
                {lvl.label}
              </span>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(156,163,175,0.7)' }}
              >
                {profile.mode}
              </span>
            </div>
            <h3 className="text-base font-bold text-white">{profile.name}</h3>
            <p className="text-xs font-mono" style={{ color: `rgba(${profile.accentRgb},0.6)` }}>
              {profile.codename}
            </p>
          </div>
        </div>

        {/* Power bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs" style={{ color: 'rgba(156,163,175,0.5)' }}>Poder cognitivo</span>
            <span className="text-xs font-bold" style={{ color: `rgb(${lvl.rgb})` }}>{lvl.power}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${lvl.power}%` }}
              transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, rgba(${lvl.rgb},0.6), rgb(${lvl.rgb}))` }}
            />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        {/* Specialization + Personality */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Especialização', value: profile.specialization, icon: <Target className="w-3 h-3" /> },
            { label: 'Personalidade', value: profile.personality, icon: <Star className="w-3 h-3" /> },
          ].map((item, i) => (
            <div key={i} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-1.5 mb-1.5" style={{ color: `rgba(${profile.accentRgb},0.6)` }}>
                {item.icon}
                <span className="text-xs font-semibold tracking-wider uppercase" style={{ color: 'rgba(156,163,175,0.45)' }}>
                  {item.label}
                </span>
              </div>
              <p className="text-xs font-medium leading-relaxed" style={{ color: 'rgba(229,231,235,0.8)' }}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Capabilities */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-3.5 h-3.5" style={{ color: `rgba(${profile.accentRgb},0.5)` }} />
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'rgba(156,163,175,0.45)' }}>
              Capacidades
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {profile.capabilities.map((cap, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                style={{
                  background: `rgba(${profile.accentRgb},0.1)`,
                  border: `1px solid rgba(${profile.accentRgb},0.18)`,
                  color: `rgba(${profile.accentRgb === '34,197,94' ? '74,222,128' : profile.accentRgb},0.9)`,
                }}
              >
                <Check className="w-2.5 h-2.5" />
                {cap}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Traits */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-3.5 h-3.5" style={{ color: `rgba(${profile.accentRgb},0.5)` }} />
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'rgba(156,163,175,0.45)' }}>
              Traços
            </span>
          </div>
          <div className="flex gap-2">
            {profile.traits.map((trait, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.07 }}
                className="px-2.5 py-1 rounded-lg text-xs font-medium"
                style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(156,163,175,0.7)' }}
              >
                {trait}
              </motion.span>
            ))}
          </div>
        </div>

        {/* System prompt preview */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-3.5 h-3.5" style={{ color: `rgba(${profile.accentRgb},0.5)` }} />
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'rgba(156,163,175,0.45)' }}>
              System Prompt
            </span>
          </div>
          <div
            className="rounded-xl p-3 font-mono text-xs leading-relaxed"
            style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(156,163,175,0.65)' }}
          >
            {profile.systemPrompt}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────

type Step = 0 | 1 | 2;

export default function CreateAgentPage() {
  const [step, setStep] = useState<Step>(0);
  const [objective, setObjective] = useState('');
  const [profile, setProfile] = useState<OmegaDNAProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleExtract = useCallback(async () => {
    if (!objective.trim()) return;
    setStep(1);
    try {
      const result = await extractWithOmegaDNA(objective);
      setProfile(result);
      setStep(2);
    } catch {
      setStep(0);
    }
  }, [objective]);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1200));
    setSaving(false);
    setSaved(true);
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #060d08 0%, #07110a 45%, #050c07 100%)' }}
    >
      {/* Ambient BG */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(ellipse, rgba(34,197,94,0.08) 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)' }}
        />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(34,197,94,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.4) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative top-0 z-40"
        style={{
          background: 'rgba(6,13,8,0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(34,197,94,0.08)',
        }}
      >
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ x: -2 }}
              onClick={() => (step > 0 ? setStep((step - 1) as Step) : undefined)}
              className="flex items-center gap-1.5 text-xs font-medium transition-colors"
              style={{ color: 'rgba(74,222,128,0.45)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(74,222,128,0.9)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(74,222,128,0.45)')}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Agentes
            </motion.button>
            <div className="w-px h-4" style={{ background: 'rgba(34,197,94,0.12)' }} />
            <div className="flex items-center gap-2">
              <Dna className="w-4 h-4" style={{ color: 'rgba(34,197,94,0.6)' }} />
              <span className="text-sm font-bold text-white">Criar Agente</span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80' }}
              >
                Hefesto
              </span>
            </div>
          </div>

          {/* Step pills */}
          <div className="flex items-center gap-1.5">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all"
                  style={
                    step === i
                      ? { background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.25)' }
                      : step > i
                      ? { background: 'rgba(34,197,94,0.08)', color: 'rgba(74,222,128,0.5)', border: '1px solid rgba(34,197,94,0.1)' }
                      : { color: 'rgba(156,163,175,0.3)', border: '1px solid transparent' }
                  }
                >
                  {step > i ? <Check className="w-2.5 h-2.5" /> : <span>{i + 1}</span>}
                  <span className="hidden sm:inline">{s}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <ChevronRight className="w-3 h-3" style={{ color: 'rgba(34,197,94,0.2)' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.header>

      {/* Content */}
      <main className="relative max-w-2xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {/* ── STEP 0: Objetivo ── */}
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Hero */}
              <div className="text-center mb-10">
                {/* ✅ aqui: apenas logo + luz atrás (sem fundo/bloco verde) */}
                <div className="relative w-16 h-16 mx-auto mb-5 flex items-center justify-center">
                  {/* Luz atrás */}
                  <motion.div
                    animate={{ opacity: [0.18, 0.42, 0.18], scale: [0.98, 1.08, 0.98] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute inset-0 rounded-full blur-2xl"
                    style={{ background: 'rgba(34,197,94,0.30)' }}
                  />
                  {/* Logo girando */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                    className="relative z-10"
                    style={{ filter: 'drop-shadow(0 0 10px rgba(34,197,94,0.22))' }}
                  >
                    <Image src="/sage.png" alt="Sage" width={44} height={44} className="select-none" priority />
                  </motion.div>
                </div>

                <motion.div
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
                  style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.18)', color: '#4ade80' }}
                >
                  {/* (vazio como estava) */}
                </motion.div>

                <h1 className="text-3xl font-bold mb-3" style={{ color: '#f0fdf4' }}>
                  Qual é o objetivo do agente?
                </h1>
                <p className="text-sm leading-relaxed max-w-md mx-auto" style={{ color: 'rgba(156,163,175,0.6)' }}>
                  Descreva em linguagem natural o que este agente deve fazer. O Hefesto irá extrair automaticamente o perfil completo.
                </p>
              </div>

              {/* Textarea */}
              <div className="relative mb-4">
                <textarea
                  value={objective}
                  onChange={e => setObjective(e.target.value)}
                  placeholder="Ex: Quero um agente que pesquise tendências de mercado, analise dados e gere relatórios executivos para tomada de decisão estratégica..."
                  rows={5}
                  className="w-full px-5 py-4 rounded-2xl text-sm outline-none resize-none leading-relaxed transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(34,197,94,0.15)',
                    color: '#f0fdf4',
                  }}
                  onFocus={e => (e.target.style.border = '1px solid rgba(34,197,94,0.4)')}
                  onBlur={e => (e.target.style.border = '1px solid rgba(34,197,94,0.15)')}
                />
                <div className="absolute bottom-3 right-4 text-xs" style={{ color: 'rgba(34,197,94,0.35)' }}>
                  {objective.length} chars
                </div>
              </div>

              {/* Example prompts */}
              <div className="mb-6">
                <p className="text-xs mb-2 font-medium" style={{ color: 'rgba(156,163,175,0.4)' }}>Exemplos:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Agente de pesquisa e análise de dados',
                    'Engenheiro de software especialista em APIs',
                    'Criador de conteúdo para redes sociais',
                    'Estrategista de negócios e growth',
                  ].map((ex, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setObjective(ex)}
                      className="px-3 py-1.5 rounded-full text-xs transition-all"
                      style={{
                        background: 'rgba(34,197,94,0.06)',
                        border: '1px solid rgba(34,197,94,0.12)',
                        color: 'rgba(74,222,128,0.65)',
                      }}
                    >
                      {ex}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <motion.button
                onClick={handleExtract}
                disabled={!objective.trim()}
                whileHover={objective.trim() ? { scale: 1.02, boxShadow: '0 0 28px rgba(34,197,94,0.25)' } : {}}
                whileTap={objective.trim() ? { scale: 0.97 } : {}}
                className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all"
                style={
                  objective.trim()
                    ? {
                        background: 'linear-gradient(135deg, rgba(34,197,94,0.22), rgba(22,163,74,0.14))',
                        border: '1px solid rgba(34,197,94,0.3)',
                        color: '#4ade80',
                      }
                    : {
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        color: 'rgba(156,163,175,0.3)',
                        cursor: 'not-allowed',
                      }
                }
              >
                <Dna className="w-5 h-5" />
                Extrair com OmegaDNA
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}

          {/* ── STEP 1: Extração ── */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <DnaAnimation />

              <h2 className="text-xl font-bold mb-2" style={{ color: '#f0fdf4' }}>
                Analisando objetivo...
              </h2>
              <p className="text-sm mb-8" style={{ color: 'rgba(156,163,175,0.55)' }}>
                O OmegaDNA está extraindo o perfil cognitivo do seu agente
              </p>

              <ExtractionLog />
            </motion.div>
          )}

          {/* ── STEP 2: Perfil gerado ── */}
          {step === 2 && profile && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Success banner */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl mb-6"
                style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(34,197,94,0.2)' }}>
                  <Check className="w-3.5 h-3.5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#4ade80' }}>
                    OmegaDNA extraído com sucesso
                  </p>
                  <p className="text-xs" style={{ color: 'rgba(74,222,128,0.55)' }}>
                    Perfil gerado a partir do objetivo fornecido
                  </p>
                </div>
              </motion.div>

              {/* Profile card */}
              <AgentProfileCard profile={profile} />

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setStep(0); setProfile(null); setSaved(false); }}
                  className="flex-1 py-3 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(156,163,175,0.7)',
                  }}
                >
                  Refazer extração
                </motion.button>

                <motion.button
                  whileHover={!saved ? { scale: 1.02, boxShadow: `0 0 24px rgba(${profile.accentRgb},0.25)` } : {}}
                  whileTap={!saved ? { scale: 0.97 } : {}}
                  onClick={!saved ? handleSave : undefined}
                  disabled={saving || saved}
                  className="flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                  style={
                    saved
                      ? { background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80' }
                      : {
                          background: `linear-gradient(135deg, rgba(${profile.accentRgb},0.22), rgba(${profile.accentRgb},0.12))`,
                          border: `1px solid rgba(${profile.accentRgb},0.3)`,
                          color: `rgb(${profile.accentRgb === '34,197,94' ? '74,222,128' : profile.accentRgb})`,
                        }
                  }
                >
                  {saving ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
                  ) : saved ? (
                    <><Check className="w-4 h-4" /> Agente criado!</>
                  ) : (
                    <><Bot className="w-4 h-4" /> Criar agente</>
                  )}
                </motion.button>
              </div>

              {!saved && (
                <p className="text-center text-xs mt-4" style={{ color: 'rgba(156,163,175,0.35)' }}>
                  Você poderá editar o agente depois de criá-lo
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}