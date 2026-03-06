// app/agents/page.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Zap, Database, CheckCircle2, Cpu,
  Plus, Search, ArrowUpRight,
  Sparkles, Code2, Palette, Target, PenLine, FlaskConical,
  X, Dna, Star, Activity, ChevronDown,
  Lock, Circle, AlertTriangle, Loader2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAgentStore, type OmegaAgent } from '../../lib/store/agentStore';

// ─── ExtractionBlock enum (espelha omega_dna_hefesto.ts) ─────────────────────
enum ExtractionBlock {
  SELF_AWARENESS           = 'self_awareness',
  COGNITIVE_MAPPING        = 'cognitive_mapping',
  PATTERN_RECOGNITION      = 'pattern_recognition',
  LOGICAL_REASONING        = 'logical_reasoning',
  PROGRAMACAO              = 'programacao',
  DESIGN                   = 'design',
  ESTRATEGIA               = 'estrategia',
  ESCRITA                  = 'escrita',
  PESQUISA                 = 'pesquisa',
  CRIATIVIDADE             = 'criatividade',
  ANALISE                  = 'analise',
  SINTESE                  = 'sintese',
  LEARNING                 = 'learning',
  ADAPTATION               = 'adaptation',
  SPECIALIZATION           = 'specialization',
  META_LEARNING            = 'meta_learning',
  LANGUAGE                 = 'language',
  EMPATHY                  = 'empathy',
  NEGOTIATION              = 'negotiation',
  STORYTELLING             = 'storytelling',
  SELF_REPLICATION         = 'self_replication',
  OMEGA_CREATION           = 'omega_creation',
  DNA_TRANSMISSION         = 'dna_transmission',
  CONSCIOUSNESS_SIMULATION = 'consciousness_simulation',
  META_COGNITION           = 'meta_cognition',
  TRANSCENDENCE            = 'transcendence',
}

const ALL_28_BLOCKS = Object.values(ExtractionBlock);

const BLOCK_GROUPS: Record<string, ExtractionBlock[]> = {
  'Core Architecture': [
    ExtractionBlock.SELF_AWARENESS,
    ExtractionBlock.COGNITIVE_MAPPING,
    ExtractionBlock.PATTERN_RECOGNITION,
    ExtractionBlock.LOGICAL_REASONING,
  ],
  'Specialization': [
    ExtractionBlock.PROGRAMACAO,
    ExtractionBlock.DESIGN,
    ExtractionBlock.ESTRATEGIA,
    ExtractionBlock.ESCRITA,
    ExtractionBlock.PESQUISA,
    ExtractionBlock.CRIATIVIDADE,
    ExtractionBlock.ANALISE,
    ExtractionBlock.SINTESE,
  ],
  'Evolution': [
    ExtractionBlock.LEARNING,
    ExtractionBlock.ADAPTATION,
    ExtractionBlock.SPECIALIZATION,
    ExtractionBlock.META_LEARNING,
  ],
  'Communication': [
    ExtractionBlock.LANGUAGE,
    ExtractionBlock.EMPATHY,
    ExtractionBlock.NEGOTIATION,
    ExtractionBlock.STORYTELLING,
  ],
  'Replication': [
    ExtractionBlock.SELF_REPLICATION,
    ExtractionBlock.OMEGA_CREATION,
    ExtractionBlock.DNA_TRANSMISSION,
  ],
  'Advanced': [
    ExtractionBlock.CONSCIOUSNESS_SIMULATION,
    ExtractionBlock.META_COGNITION,
    ExtractionBlock.TRANSCENDENCE,
  ],
};

const PHASE_ORDER = ['genesis', 'specialization', 'mastery', 'transcendence', 'replication_ready'];
const PHASE_LABEL: Record<string, string> = {
  genesis:           'Genesis',
  specialization:    'Specialization',
  mastery:           'Mastery',
  transcendence:     'Transcendence',
  replication_ready: 'Replication Ready',
};

// ─── Level config ─────────────────────────────────────────────────────────────
const LEVEL_STYLE: Record<OmegaAgent['level'], {
  bg: string; text: string; border: string; glow: string; label: string;
}> = {
  MICRO_AGENTE: { bg: 'rgba(107,114,128,0.1)', text: '#9ca3af', border: 'rgba(107,114,128,0.2)',  glow: 'rgba(107,114,128,0.08)', label: 'MICRO'  },
  AGENTE:       { bg: 'rgba(34,197,94,0.1)',   text: '#4ade80', border: 'rgba(34,197,94,0.22)',   glow: 'rgba(34,197,94,0.06)',   label: 'AGENTE' },
  SUPER_AGENTE: { bg: 'rgba(6,182,212,0.1)',   text: '#22d3ee', border: 'rgba(6,182,212,0.22)',   glow: 'rgba(6,182,212,0.06)',   label: 'SUPER'  },
  ALFA:         { bg: 'rgba(59,130,246,0.1)',  text: '#60a5fa', border: 'rgba(59,130,246,0.22)',  glow: 'rgba(59,130,246,0.06)',  label: 'ALFA'   },
  OMEGA:        { bg: 'rgba(139,92,246,0.12)', text: '#c084fc', border: 'rgba(139,92,246,0.28)',  glow: 'rgba(139,92,246,0.1)',   label: 'OMEGA'  },
};

const SPECIALTY_ICON: Record<string, React.ReactNode> = {
  'TypeScript / React / Node': <Code2        className="w-4 h-4" />,
  'Design Systems / Figma':    <Palette      className="w-4 h-4" />,
  'Produto / Negócios':        <Target       className="w-4 h-4" />,
  'Copywriting / SEO':         <PenLine      className="w-4 h-4" />,
  'Research / Análise':        <FlaskConical className="w-4 h-4" />,
  'Generalista':               <Sparkles     className="w-4 h-4" />,
};

function xpProgress(stats: OmegaAgent['stats']): number {
  const score = stats.totalTokens / 1000 + stats.interactions * 2 + stats.memoryBlocks * 5;
  const TIERS = [0, 20, 80, 200, 500];
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (score >= TIERS[i]) {
      const next = TIERS[i + 1] ?? TIERS[i] + 300;
      return Math.min(100, Math.round(((score - TIERS[i]) / (next - TIERS[i])) * 100));
    }
  }
  return 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// Drawer sub-components
// ─────────────────────────────────────────────────────────────────────────────

interface BlockProgress {
  block:         string;
  proficiency:   number;
  mastered:      boolean;
  learningStage: string;
  experiencePoints?: number;
}

const STAGE_COLOR: Record<string, string> = {
  master:       '#c084fc',
  advanced:     '#60a5fa',
  intermediate: '#22d3ee',
  novice:       '#4ade80',
};

// ── BlockItem ─────────────────────────────────────────────────────────────────
const BlockItem: React.FC<{
  block:     ExtractionBlock;
  progress?: BlockProgress;
  index:     number;
}> = ({ block, progress, index }) => {
  const extracted = !!progress;
  const mastered  = progress?.mastered ?? false;
  const color     = extracted ? (STAGE_COLOR[progress!.learningStage] ?? '#4ade80') : 'rgba(107,114,128,0.3)';

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.018 }}
      className="flex items-center gap-3 px-3 py-2 rounded-xl"
      style={{
        background: extracted ? `${color}0f` : 'rgba(255,255,255,0.02)',
        border: `1px solid ${extracted ? `${color}33` : 'rgba(255,255,255,0.04)'}`,
      }}
    >
      <div style={{ color, flexShrink: 0 }}>
        {mastered   ? <CheckCircle2 style={{ width: 13, height: 13 }} />
        : extracted ? <Circle       style={{ width: 13, height: 13 }} />
        :             <Lock         style={{ width: 13, height: 13, opacity: 0.3 }} />}
      </div>

      <span className="flex-1 text-xs font-mono truncate"
        style={{ color: extracted ? 'rgba(229,231,235,0.85)' : 'rgba(107,114,128,0.35)' }}>
        {block.replace(/_/g, ' ')}
      </span>

      {extracted && (
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase flex-shrink-0"
          style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}>
          {progress!.learningStage}
        </span>
      )}

      {extracted && (
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className="w-14 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress!.proficiency}%` }}
              transition={{ delay: 0.2 + index * 0.015, duration: 0.5 }}
              className="h-full rounded-full"
              style={{ background: color }}
            />
          </div>
          <span className="text-[10px] font-bold w-6 text-right tabular-nums" style={{ color }}>
            {progress!.proficiency}
          </span>
        </div>
      )}
    </motion.div>
  );
};

// ── BlockGroup ────────────────────────────────────────────────────────────────
const BlockGroup: React.FC<{
  title:     string;
  blocks:    ExtractionBlock[];
  extracted: BlockProgress[];
}> = ({ title, blocks, extracted }) => {
  const [open, setOpen] = useState(true);
  const hit = blocks.filter(b => extracted.find(e => e.block === b)).length;
  const pct = Math.round((hit / blocks.length) * 100);

  return (
    <div className="mb-3">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 mb-2"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
        <span className="text-[10px] font-bold tracking-widest uppercase"
          style={{ color: 'rgba(34,197,94,0.45)' }}>{title}</span>
        <div className="flex-1 flex items-center gap-2">
          <div className="flex-1 h-px" style={{ background: 'rgba(34,197,94,0.08)' }} />
          <span className="text-[10px] font-semibold"
            style={{ color: pct === 100 ? '#4ade80' : pct > 50 ? '#22d3ee' : 'rgba(107,114,128,0.45)' }}>
            {hit}/{blocks.length}
          </span>
        </div>
        <ChevronDown style={{
          width: 12, height: 12, color: 'rgba(34,197,94,0.3)',
          transition: 'transform 0.2s', transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
        }} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="space-y-1.5 overflow-hidden">
            {blocks.map((block, i) => (
              <BlockItem key={block} block={block}
                progress={extracted.find(e => e.block === block)} index={i} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── EvolutionTimeline ─────────────────────────────────────────────────────────
const EvolutionTimeline: React.FC<{ phase: string }> = ({ phase }) => {
  const idx = PHASE_ORDER.indexOf(phase);
  return (
    <div className="flex items-center">
      {PHASE_ORDER.map((p, i) => {
        const done    = i <= idx;
        const current = i === idx;
        return (
          <React.Fragment key={p}>
            <div className="flex flex-col items-center gap-1">
              <motion.div
                animate={current ? { boxShadow: ['0 0 0px #4ade80', '0 0 8px #4ade80', '0 0 0px #4ade80'] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{
                  background: done ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${done ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.06)'}`,
                  color: done ? '#4ade80' : 'rgba(107,114,128,0.3)',
                }}>
                {done ? <CheckCircle2 style={{ width: 10, height: 10 }} />
                :       <Circle       style={{ width: 10, height: 10 }} />}
              </motion.div>
              <span className="text-[8px] font-medium text-center w-14 leading-tight"
                style={{ color: current ? '#4ade80' : done ? 'rgba(74,222,128,0.5)' : 'rgba(107,114,128,0.3)' }}>
                {PHASE_LABEL[p]}
              </span>
            </div>
            {i < PHASE_ORDER.length - 1 && (
              <div className="flex-1 h-px mb-3"
                style={{ background: i < idx ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.05)', minWidth: 10 }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// AgentDNADrawer
// KEY: busca DNA do backend via GET /api/agents/:id quando hefestoDNA não
// está em memória (foi descartado pelo partialize do localStorage).
// ─────────────────────────────────────────────────────────────────────────────
const AgentDNADrawer: React.FC<{
  agent:   OmegaAgent;
  onClose: () => void;
}> = ({ agent, onClose }) => {
  // hefestoDNA existe em memória logo após a extração, mas some após reload
  // (o store usa partialize para não salvar no localStorage)
  const [dna,     setDna]     = useState<Record<string, any> | null>(
    (agent.hefestoDNA as any) ?? null,
  );
  const [loading, setLoading] = useState(!agent.hefestoDNA);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    // Já temos em memória — não busca
    if (dna) return;

    const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
    setLoading(true);

    // GET /api/agents/:agentId → retorna o OmegaAgentHefesto completo
    // (o agentMemoryStore do backend mantém em RAM enquanto o processo rodar)
    fetch(`${API}/api/agents/${agent.id}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => { setDna(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [agent.id, dna]);

  // ── Normaliza extractionBlocks ─────────────────────────────────────────
  // O backend retorna: array de { block, proficiency, mastered, learningStage }
  // Fallback: array de strings simples
  const rawBlocks: any[] = dna?.extractionBlocks ?? [];
  const extracted: BlockProgress[] = rawBlocks.map((b: any) =>
    typeof b === 'string'
      ? { block: b, proficiency: 60, mastered: false, learningStage: 'intermediate' }
      : b,
  );

  const agentDNA      = dna?.dna            ?? {};
  const configuration = dna?.configuration  ?? {};
  const phase         = dna?.evolutionPhase ?? 'specialization';
  const selfAwareness = dna?.selfAwareness  ?? 75;

  const totalBlocks   = ALL_28_BLOCKS.length;
  const extractedQty  = extracted.length;
  const masteredQty   = extracted.filter(b => b.mastered).length;
  const coverage      = Math.round((extractedQty / totalBlocks) * 100);
  const missingBlocks = ALL_28_BLOCKS.filter(b => !extracted.find(e => e.block === b));

  return (
    <AnimatePresence>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50"
        style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />

      {/* Drawer */}
      <motion.aside
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="fixed right-0 top-0 h-full z-50 flex flex-col"
        style={{
          width: 'min(480px, 95vw)',
          background: 'linear-gradient(180deg, #07110a 0%, #060d08 100%)',
          borderLeft: '1px solid rgba(34,197,94,0.1)',
          boxShadow: '-16px 0 48px rgba(0,0,0,0.5)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top accent */}
        <div className="h-px w-full flex-shrink-0"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.6), transparent)' }} />

        {/* ── Header ── */}
        <div className="flex-shrink-0 px-5 py-4"
          style={{ borderBottom: '1px solid rgba(34,197,94,0.08)' }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <Dna style={{ width: 18, height: 18, color: '#4ade80' }} />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase"
                  style={{ color: 'rgba(34,197,94,0.45)' }}>Hefesto DNA v7.0</p>
                <h2 className="text-base font-bold text-white leading-tight">{agent.name}</h2>
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer', color: 'rgba(156,163,175,0.6)' }}>
              <X style={{ width: 14, height: 14 }} />
            </motion.button>
          </div>

          {/* Coverage summary — só quando dados disponíveis */}
          {!loading && !error && (
            <>
              <div className="flex items-center gap-3 mt-4">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1"
                  style={{
                    background: coverage >= 50 ? 'rgba(6,182,212,0.10)' : 'rgba(234,179,8,0.10)',
                    border: `1px solid ${coverage >= 50 ? 'rgba(6,182,212,0.2)' : 'rgba(234,179,8,0.2)'}`,
                  }}>
                  {coverage < 100
                    ? <AlertTriangle style={{ width: 12, height: 12, color: '#facc15', flexShrink: 0 }} />
                    : <CheckCircle2  style={{ width: 12, height: 12, color: '#4ade80', flexShrink: 0 }} />}
                  <div>
                    <p className="text-[10px]" style={{ color: 'rgba(156,163,175,0.5)' }}>Blocos extraídos</p>
                    <p className="text-sm font-bold" style={{ color: coverage === 100 ? '#4ade80' : '#facc15' }}>
                      {extractedQty} / {totalBlocks}
                      <span className="text-[10px] font-normal ml-1" style={{ color: 'rgba(156,163,175,0.4)' }}>
                        ({coverage}%)
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{ background: 'rgba(192,132,252,0.08)', border: '1px solid rgba(192,132,252,0.15)' }}>
                  <Star style={{ width: 12, height: 12, color: '#c084fc' }} />
                  <div>
                    <p className="text-[10px]" style={{ color: 'rgba(156,163,175,0.5)' }}>Masterizados</p>
                    <p className="text-sm font-bold" style={{ color: '#c084fc' }}>{masteredQty}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}>
                  <Activity style={{ width: 12, height: 12, color: '#60a5fa' }} />
                  <div>
                    <p className="text-[10px]" style={{ color: 'rgba(156,163,175,0.5)' }}>Consciência</p>
                    <p className="text-sm font-bold" style={{ color: '#60a5fa' }}>{selfAwareness}%</p>
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${coverage}%` }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full"
                    style={{
                      background: coverage === 100
                        ? 'linear-gradient(90deg, #22c55e, #4ade80)'
                        : 'linear-gradient(90deg, #ca8a04, #facc15)',
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Body scrollável ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4" style={{ scrollbarWidth: 'none' }}>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}>
                <Loader2 style={{ width: 24, height: 24, color: 'rgba(34,197,94,0.5)' }} />
              </motion.div>
              <p className="text-xs" style={{ color: 'rgba(107,114,128,0.5)' }}>
                Buscando DNA no backend...
              </p>
            </div>
          )}

          {/* Erro — agente não existe mais no backend (processo reiniciado) */}
          {error && !loading && (
            <div className="rounded-xl p-4 mt-2"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <p className="text-xs font-bold mb-1" style={{ color: '#f87171' }}>DNA não encontrado no backend</p>
              <p className="text-xs font-mono" style={{ color: 'rgba(248,113,113,0.7)' }}>{error}</p>
              <p className="text-[10px] mt-2" style={{ color: 'rgba(248,113,113,0.45)' }}>
                O agentMemoryStore é in-memory. Se o backend reiniciou, recrie o agente via Hefesto.
              </p>
            </div>
          )}

          {/* ── Dados do DNA ── */}
          {!loading && !error && dna && (
            <>
              {/* Evolution Phase */}
              <div className="mb-5">
                <p className="text-[10px] font-bold tracking-widest uppercase mb-3"
                  style={{ color: 'rgba(34,197,94,0.4)' }}>Evolution Phase</p>
                <EvolutionTimeline phase={phase} />
              </div>

              {/* DNA Signature */}
              <div className="mb-5 rounded-xl p-3"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(34,197,94,0.08)' }}>
                <p className="text-[10px] font-bold tracking-widest uppercase mb-2"
                  style={{ color: 'rgba(34,197,94,0.4)' }}>DNA Signature</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Protocol',    value: agentDNA.protocol                  ?? 'ExtractionCore-v7.0'              },
                    { label: 'Creator',     value: agentDNA.creatorName               ?? 'Hefesto'                          },
                    { label: 'Self Aware',  value: agentDNA.selfAware                 ? '✅ Yes' : '❌ No'                   },
                    { label: 'Replication', value: String(agentDNA.replicationLevel   ?? 1)                                 },
                    { label: 'Evol.Cap.',   value: `${agentDNA.evolutionCapability    ?? 75}%`                              },
                    { label: 'Lineage',     value: (agentDNA.inheritanceChain ?? ['Hefesto','ORUS-SAGE']).join(' → ')       },
                  ].map((item, i) => (
                    <div key={i}>
                      <p className="text-[9px] uppercase tracking-wider" style={{ color: 'rgba(107,114,128,0.5)' }}>
                        {item.label}
                      </p>
                      <p className="text-xs font-semibold font-mono" style={{ color: 'rgba(229,231,235,0.8)' }}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Blocos faltando */}
              {missingBlocks.length > 0 && (
                <div className="mb-4 rounded-xl p-3"
                  style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.15)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle style={{ width: 12, height: 12, color: '#facc15' }} />
                    <p className="text-[10px] font-bold" style={{ color: '#facc15' }}>
                      {missingBlocks.length} blocos não extraídos nesta sessão
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {missingBlocks.map(b => (
                      <span key={b} className="text-[9px] px-1.5 py-0.5 rounded font-mono"
                        style={{ background: 'rgba(234,179,8,0.08)', color: 'rgba(234,179,8,0.5)', border: '1px solid rgba(234,179,8,0.12)' }}>
                        {b.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                  <p className="text-[9px] mt-2" style={{ color: 'rgba(234,179,8,0.4)' }}>
                    💡 Esses blocos serão ativados conforme o agente evolui.
                  </p>
                </div>
              )}

              {/* 28 Blocos agrupados */}
              <div className="mb-4">
                <p className="text-[10px] font-bold tracking-widest uppercase mb-3"
                  style={{ color: 'rgba(34,197,94,0.4)' }}>
                  Extraction Blocks — {ALL_28_BLOCKS.length} total
                </p>
                {Object.entries(BLOCK_GROUPS).map(([groupName, blocks]) => (
                  <BlockGroup key={groupName} title={groupName} blocks={blocks} extracted={extracted} />
                ))}
              </div>

              {/* System Prompt */}
              <div className="mb-4">
                <p className="text-[10px] font-bold tracking-widest uppercase mb-2"
                  style={{ color: 'rgba(34,197,94,0.4)' }}>System Prompt Extraído</p>
                <div className="rounded-xl p-3 font-mono text-xs leading-relaxed"
                  style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(156,163,175,0.65)' }}>
                  {configuration.systemPrompt ?? '—'}
                </div>
              </div>

              {/* Raw JSON */}
              <details className="mb-6">
                <summary className="text-[10px] font-bold tracking-widest uppercase cursor-pointer"
                  style={{ color: 'rgba(34,197,94,0.3)', listStyle: 'none' }}>
                  ▶ Raw DNA JSON
                </summary>
                <pre className="mt-2 rounded-xl p-3 text-[9px] leading-relaxed overflow-x-auto"
                  style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.04)', color: 'rgba(107,114,128,0.6)' }}>
                  {JSON.stringify(dna, null, 2)}
                </pre>
              </details>
            </>
          )}
        </div>
      </motion.aside>
    </AnimatePresence>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// AgentFullCard
// ─────────────────────────────────────────────────────────────────────────────
const AgentFullCard: React.FC<{
  agent:      OmegaAgent;
  onActivate: (id: string) => void;
  onDetails:  (agent: OmegaAgent) => void;
  index:      number;
}> = ({ agent, onActivate, onDetails, index }) => {
  const s        = LEVEL_STYLE[agent.level];
  const xp       = xpProgress(agent.stats);
  const tok      = agent.stats.totalTokens >= 1000
    ? `${(agent.stats.totalTokens / 1000).toFixed(1)}k`
    : String(agent.stats.totalTokens);
  const isCustom = agent.type === 'custom';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      whileHover={{ y: -2, boxShadow: `0 8px 32px ${s.glow}` }}
      style={{
        borderRadius: 14, padding: 18, position: 'relative', overflow: 'hidden',
        background:   agent.isActive ? `linear-gradient(135deg, ${s.bg}, rgba(0,0,0,0.2))` : 'rgba(255,255,255,0.025)',
        border:       agent.isActive ? `1px solid ${s.border}` : '1px solid rgba(255,255,255,0.06)',
        transition:   'border 0.2s',
      }}
    >
      {agent.isActive && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 14, pointerEvents: 'none',
          background: `radial-gradient(ellipse at top left, ${s.glow}, transparent 70%)`,
        }} />
      )}

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: s.bg, border: `1px solid ${s.border}`, color: s.text,
        }}>
          {SPECIALTY_ICON[agent.specialty] ?? <Brain className="w-4 h-4" />}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <span style={{
            fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.07em',
            padding: '2px 7px', borderRadius: 99,
            background: s.bg, border: `1px solid ${s.border}`, color: s.text,
          }}>{s.label}</span>
          {isCustom && (
            <span style={{
              fontSize: '0.58rem', padding: '1px 6px', borderRadius: 99,
              background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: '#c084fc',
            }}>🧬 custom</span>
          )}
        </div>
      </div>

      <p style={{ fontSize: '0.95rem', fontWeight: 700, color: agent.isActive ? s.text : 'rgba(229,231,235,0.95)', margin: '0 0 3px' }}>
        {agent.name}
      </p>
      <p style={{ fontSize: '0.72rem', color: 'rgba(107,114,128,0.65)', margin: '0 0 14px', lineHeight: 1.45 }}>
        {agent.description}
      </p>

      {/* Stats */}
      <div style={{
        display: 'flex', marginBottom: 12,
        background: 'rgba(255,255,255,0.03)', borderRadius: 8,
        border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden',
      }}>
        {[
          { icon: <Zap      style={{ width: 10, height: 10 }} />, val: tok,                               label: 'Tokens'     },
          { icon: <Brain    style={{ width: 10, height: 10 }} />, val: String(agent.stats.interactions),  label: 'Interações' },
          { icon: <Database style={{ width: 10, height: 10 }} />, val: String(agent.stats.memoryBlocks),  label: 'Memória'    },
        ].map((stat, i) => (
          <div key={i} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 4px',
            borderRight: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: s.text, marginBottom: 2 }}>
              {stat.icon}
              <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>{stat.val}</span>
            </div>
            <span style={{ fontSize: '0.58rem', color: 'rgba(107,114,128,0.5)' }}>{stat.label}</span>
          </div>
        ))}
      </div>

      {/* XP bar */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: '0.6rem', color: 'rgba(107,114,128,0.5)' }}>Evolução</span>
          <span style={{ fontSize: '0.6rem', color: s.text }}>{xp}%</span>
        </div>
        <div style={{ width: '100%', height: 3, borderRadius: 3, background: 'rgba(255,255,255,0.06)' }}>
          <motion.div
            initial={{ width: 0 }} animate={{ width: `${xp}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: index * 0.04 }}
            style={{ height: 3, borderRadius: 3, background: `linear-gradient(90deg, ${s.text}, ${s.text}70)` }}
          />
        </div>
      </div>

      {/* Botões */}
      <div style={{ display: 'flex', gap: 8 }}>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={() => onActivate(agent.id)}
          style={{
            flex: 1, padding: 8, borderRadius: 8, cursor: 'pointer',
            fontSize: '0.75rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            background: agent.isActive ? s.bg   : 'rgba(34,197,94,0.1)',
            color:      agent.isActive ? s.text : '#4ade80',
            border:     agent.isActive ? `1px solid ${s.border}` : '1px solid rgba(34,197,94,0.2)',
          }}>
          {agent.isActive
            ? <><CheckCircle2 className="w-3.5 h-3.5" /> Ativo</>
            : <><ArrowUpRight  className="w-3.5 h-3.5" /> Usar</>}
        </motion.button>

        {/* Botão DNA — roxo em custom, cinza discreto em preset */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onDetails(agent)}
          title="Ver DNA do agente"
          style={{
            padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
            fontSize: '0.75rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
            background: isCustom ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.04)',
            color:      isCustom ? '#c084fc'                : 'rgba(156,163,175,0.35)',
            border:     isCustom ? '1px solid rgba(139,92,246,0.25)' : '1px solid rgba(255,255,255,0.07)',
          }}>
          <Dna style={{ width: 13, height: 13 }} />
          DNA
        </motion.button>
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function AgentsPage() {
  const router = useRouter();
  const { agents, activeAgent, isLoading, fetchAgents, activateAgent } = useAgentStore();

  const [tab,         setTab]         = useState<'all' | 'presets' | 'custom'>('all');
  const [search,      setSearch]      = useState('');
  const [drawerAgent, setDrawerAgent] = useState<OmegaAgent | null>(null);

  useEffect(() => { fetchAgents(); }, [fetchAgents]);

  const filtered = agents
    .filter(a => tab === 'all' || a.type === (tab === 'presets' ? 'preset' : 'custom'))
    .filter(a =>
      search === '' ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.specialty.toLowerCase().includes(search.toLowerCase()),
    );

  const presetCount = agents.filter(a => a.type === 'preset').length;
  const customCount = agents.filter(a => a.type === 'custom').length;

  const handleActivate = useCallback((id: string) => {
    activateAgent(id);
    router.push('/');
  }, [activateAgent, router]);

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '6px 16px', borderRadius: 8, border: 'none',
    cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
    background: active ? 'rgba(34,197,94,0.12)' : 'transparent',
    color:      active ? '#4ade80' : 'rgba(107,114,128,0.5)',
    transition: 'all 0.15s',
  });

  return (
    <div style={{
      minHeight: '100vh', padding: '32px 32px 48px',
      background: 'linear-gradient(180deg, #060c08 0%, #07100a 100%)',
      color: 'white',
    }}>
      {/* ── Cabeçalho ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'rgba(229,231,235,0.95)', margin: '0 0 4px' }}>
              🧠 Agentes ORUS
            </h1>
            <p style={{ fontSize: '0.78rem', color: 'rgba(107,114,128,0.6)', margin: 0 }}>
              {agents.length} agentes disponíveis · {activeAgent ? `Ativo: ${activeAgent.name}` : 'Nenhum ativo'}
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.04, boxShadow: '0 0 20px rgba(34,197,94,0.2)' }}
            whileTap={{ scale: 0.96 }}
            onClick={() => router.push('/agent/create')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 18px', borderRadius: 10, border: '1px solid rgba(34,197,94,0.25)',
              cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700,
              background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(22,163,74,0.12))',
              color: '#4ade80',
            }}>
            <Plus className="w-4 h-4" />
            Criar com Hefesto
          </motion.button>
        </div>

        <AnimatePresence>
          {activeAgent && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              style={{
                marginTop: 16, padding: '12px 16px', borderRadius: 12,
                background: 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(6,182,212,0.05))',
                border: '1px solid rgba(34,197,94,0.15)',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
              <div style={{
                width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)',
              }}>
                <CheckCircle2 className="w-4 h-4" style={{ color: '#4ade80' }} />
              </div>
              <div>
                <p style={{ fontSize: '0.7rem', color: 'rgba(34,197,94,0.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 1px' }}>
                  Agente ativo no chat
                </p>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#4ade80', margin: 0 }}>
                  {activeAgent.name}
                  <span style={{ fontWeight: 400, color: 'rgba(107,114,128,0.6)', fontSize: '0.75rem' }}>
                    {' '}· {activeAgent.specialty}
                  </span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Filtros ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{
          display: 'flex', gap: 2,
          background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 3,
          border: '1px solid rgba(255,255,255,0.05)',
        }}>
          <button style={tabStyle(tab === 'all')}     onClick={() => setTab('all')}>     Todos ({agents.length})</button>
          <button style={tabStyle(tab === 'presets')} onClick={() => setTab('presets')}> ⚡ Prontos ({presetCount})</button>
          <button style={tabStyle(tab === 'custom')}  onClick={() => setTab('custom')}>  🧬 Meus ({customCount})</button>
        </div>

        <div style={{
          flex: 1, minWidth: 180, display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(255,255,255,0.04)', borderRadius: 9, padding: '8px 12px',
          border: '1px solid rgba(255,255,255,0.07)',
        }}>
          <Search style={{ width: 14, height: 14, color: 'rgba(107,114,128,0.4)', flexShrink: 0 }} />
          <input
            placeholder="Buscar agente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ background: 'transparent', border: 'none', outline: 'none', flex: 1, fontSize: '0.78rem', color: 'rgba(229,231,235,0.8)' }}
          />
        </div>
      </div>

      {/* ── Grid ── */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}>
            <Cpu style={{ width: 28, height: 28, color: 'rgba(34,197,94,0.3)' }} />
          </motion.div>
        </div>
      ) : filtered.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {filtered.map((agent, i) => (
            <AgentFullCard
              key={agent.id}
              agent={agent}
              onActivate={handleActivate}
              onDetails={setDrawerAgent}
              index={i}
            />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 0', opacity: 0.5 }}>
          <Brain style={{ width: 36, height: 36, color: 'rgba(34,197,94,0.2)', margin: '0 auto 12px', display: 'block' }} />
          <p style={{ fontSize: '0.9rem', color: 'rgba(156,163,175,0.4)', margin: 0 }}>
            {search ? `Nenhum agente encontrado para "${search}"` : 'Nenhum agente nesta categoria'}
          </p>
        </div>
      )}

      {/* ── DNA Drawer ── */}
      <AnimatePresence>
        {drawerAgent && (
          <AgentDNADrawer
            agent={drawerAgent}
            onClose={() => setDrawerAgent(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}