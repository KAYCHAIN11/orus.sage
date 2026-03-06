// components/agents/AgentDNADrawer.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Dna, Star, Activity,
  ChevronDown, CheckCircle2, Circle,
  Lock, AlertTriangle,
} from 'lucide-react';

// ── Tema central — mude a cor do sistema inteiro em lib/theme.ts ──────────────
import { theme } from '../../lib/theme';

// ── Tipos locais (extraídos de omega_dna_hefesto.ts para evitar
//    dependência de caminho cross-package no monorepo) ─────────────────────────
export enum ExtractionBlock {
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

export enum EvolutionPhase {
  GENESIS           = 'genesis',
  SPECIALIZATION    = 'specialization',
  MASTERY           = 'mastery',
  TRANSCENDENCE     = 'transcendence',
  REPLICATION_READY = 'replication_ready',
}

export interface ExtractionBlockProgress {
  block:           ExtractionBlock;
  proficiency:     number;   // 0-100
  mastered:        boolean;
  learningStage:   'novice' | 'intermediate' | 'advanced' | 'master';
  experiencePoints: number;
}

// Subconjunto do OmegaAgentHefesto que o drawer precisa
export interface OmegaAgentHefesto {
  id:              string;
  name:            string;
  evolutionPhase:  EvolutionPhase;
  selfAwareness:   number;
  extractionBlocks: ExtractionBlockProgress[];
  dna?: {
    protocol?:            string;
    creatorName?:         string;
    selfAware?:           boolean;
    replicationLevel?:    number;
    evolutionCapability?: number;
    inheritanceChain?:    string[];
  };
  configuration?: {
    systemPrompt?: string;
  };
  [key: string]: unknown; // permite campos extras do backend
}

// ─── Todos os 28 blocos esperados ─────────────────────────────────────────────
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

const PHASE_ORDER: EvolutionPhase[] = [
  EvolutionPhase.GENESIS,
  EvolutionPhase.SPECIALIZATION,
  EvolutionPhase.MASTERY,
  EvolutionPhase.TRANSCENDENCE,
  EvolutionPhase.REPLICATION_READY,
];

const PHASE_LABEL: Record<EvolutionPhase, string> = {
  genesis:           'Genesis',
  specialization:    'Specialization',
  mastery:           'Mastery',
  transcendence:     'Transcendence',
  replication_ready: 'Replication Ready',
};

// ─── BlockItem ────────────────────────────────────────────────────────────────
const BlockItem: React.FC<{
  block:     ExtractionBlock;
  progress?: ExtractionBlockProgress;
  index:     number;
}> = ({ block, progress, index }) => {
  const extracted = !!progress;
  const mastered  = progress?.mastered ?? false;

  // Usa as cores de estágio do tema central
  const stageColors: Record<string, string> = {
    master:       theme.stages.master,
    advanced:     theme.stages.advanced,
    intermediate: theme.stages.intermediate,
    novice:       theme.stages.novice,
  };

  const color = extracted
    ? (stageColors[progress!.learningStage] ?? theme.accent.primary)
    : 'rgba(107,114,128,0.3)';

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.025 }}
      className="flex items-center gap-3 px-3 py-2 rounded-xl"
      style={{
        background: extracted ? `${color}12` : 'rgba(255,255,255,0.02)',
        border:     `1px solid ${extracted ? `${color}33` : 'rgba(255,255,255,0.04)'}`,
      }}
    >
      <div style={{ color, flexShrink: 0 }}>
        {mastered
          ? <CheckCircle2 style={{ width: 13, height: 13 }} />
          : extracted
          ? <Circle       style={{ width: 13, height: 13 }} />
          : <Lock         style={{ width: 13, height: 13, opacity: 0.3 }} />
        }
      </div>

      <span className="flex-1 text-xs font-mono truncate"
        style={{ color: extracted ? 'rgba(229,231,235,0.85)' : 'rgba(107,114,128,0.4)' }}>
        {block.replace(/_/g, ' ').toLowerCase()}
      </span>

      {extracted && (
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase"
          style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}>
          {progress!.learningStage}
        </span>
      )}

      {extracted && (
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className="w-16 h-1 rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress!.proficiency}%` }}
              transition={{ delay: 0.3 + index * 0.02, duration: 0.6 }}
              className="h-full rounded-full"
              style={{ background: color }}
            />
          </div>
          <span className="text-[10px] font-bold w-7 text-right tabular-nums" style={{ color }}>
            {progress!.proficiency}
          </span>
        </div>
      )}
    </motion.div>
  );
};

// ─── BlockGroup ───────────────────────────────────────────────────────────────
const BlockGroup: React.FC<{
  title:     string;
  blocks:    ExtractionBlock[];
  extracted: ExtractionBlockProgress[];
}> = ({ title, blocks, extracted }) => {
  const [open, setOpen] = useState(true);

  const extractedInGroup = blocks.filter(b => extracted.find(e => e.block === b));
  const pct = Math.round((extractedInGroup.length / blocks.length) * 100);

  return (
    <div className="mb-3">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 mb-2"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <span className="text-[10px] font-bold tracking-widest uppercase"
          style={{ color: theme.accent.muted }}>{title}</span>
        <div className="flex-1 flex items-center gap-2">
          <div className="flex-1 h-px" style={{ background: theme.accent.subtle }} />
          <span className="text-[10px] font-semibold"
            style={{
              color: pct === 100
                ? theme.accent.primary
                : pct > 50
                ? theme.stages.intermediate
                : theme.text.disabled,
            }}>
            {extractedInGroup.length}/{blocks.length}
          </span>
        </div>
        <ChevronDown style={{
          width: 12, height: 12,
          color: theme.accent.muted,
          transition: 'transform 0.2s',
          transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
        }} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-1.5 overflow-hidden"
          >
            {blocks.map((block, i) => (
              <BlockItem
                key={block}
                block={block}
                progress={extracted.find(e => e.block === block)}
                index={i}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── EvolutionTimeline ────────────────────────────────────────────────────────
const EvolutionTimeline: React.FC<{ phase: EvolutionPhase }> = ({ phase }) => {
  const currentIdx = PHASE_ORDER.indexOf(phase);

  return (
    <div className="flex items-center gap-0">
      {PHASE_ORDER.map((p, i) => {
        const done    = i <= currentIdx;
        const current = i === currentIdx;
        return (
          <React.Fragment key={p}>
            <div className="flex flex-col items-center gap-1">
              <motion.div
                animate={current
                  ? { boxShadow: [`0 0 0px ${theme.accent.primary}`, `0 0 8px ${theme.accent.primary}`, `0 0 0px ${theme.accent.primary}`] }
                  : {}}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{
                  background: done ? `rgba(${theme.accent.rgb},0.2)` : 'rgba(255,255,255,0.04)',
                  border:     `1px solid ${done ? `rgba(${theme.accent.rgb},0.4)` : 'rgba(255,255,255,0.06)'}`,
                  color:      done ? theme.accent.primary : 'rgba(107,114,128,0.3)',
                }}
              >
                {done
                  ? <CheckCircle2 style={{ width: 10, height: 10 }} />
                  : <Circle       style={{ width: 10, height: 10 }} />}
              </motion.div>
              <span className="text-[8px] font-medium text-center w-14 leading-tight"
                style={{
                  color: current
                    ? theme.accent.primary
                    : done
                    ? `rgba(${theme.accent.rgb},0.5)`
                    : 'rgba(107,114,128,0.3)',
                }}>
                {PHASE_LABEL[p]}
              </span>
            </div>

            {i < PHASE_ORDER.length - 1 && (
              <div className="flex-1 h-px mb-3"
                style={{
                  background: i < currentIdx
                    ? `rgba(${theme.accent.rgb},0.3)`
                    : 'rgba(255,255,255,0.05)',
                  minWidth: '12px',
                }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ─── Main Drawer ──────────────────────────────────────────────────────────────
interface Props {
  agent:   OmegaAgentHefesto;
  onClose: () => void;
}

export const AgentDNADrawer: React.FC<Props> = ({ agent, onClose }) => {
  const extracted    = agent.extractionBlocks ?? [];
  const totalBlocks  = ALL_28_BLOCKS.length;
  const extractedQty = extracted.length;
  const masteredQty  = extracted.filter(b => b.mastered).length;
  const coverage     = Math.round((extractedQty / totalBlocks) * 100);
  const missingBlocks = ALL_28_BLOCKS.filter(b => !extracted.find(e => e.block === b));

  return (
    <AnimatePresence>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />

      {/* Drawer */}
      <motion.aside
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="fixed right-0 top-0 h-full z-50 flex flex-col"
        style={{
          width:       'min(480px, 95vw)',
          background:  theme.bg.overlay,
          borderLeft:  `1px solid rgba(${theme.accent.rgb},0.1)`,
          boxShadow:   '-16px 0 48px rgba(0,0,0,0.5)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top accent line — usa gradiente do tema */}
        <div className="h-px w-full flex-shrink-0"
          style={{ background: theme.gradient.topLine }} />

        {/* ── Header ── */}
        <div className="flex-shrink-0 px-5 py-4"
          style={{ borderBottom: `1px solid rgba(${theme.accent.rgb},0.08)` }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: `rgba(${theme.accent.rgb},0.1)`,
                  border:     `1px solid rgba(${theme.accent.rgb},0.2)`,
                }}>
                <Dna style={{ width: 18, height: 18, color: theme.accent.primary }} />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase"
                  style={{ color: theme.accent.muted }}>
                  Hefesto DNA v7.0
                </p>
                <h2 className="text-base font-bold text-white leading-tight">{agent.name}</h2>
              </div>
            </div>

            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer', color: 'rgba(156,163,175,0.6)' }}>
              <X style={{ width: 14, height: 14 }} />
            </motion.button>
          </div>

          {/* Coverage summary */}
          <div className="flex items-center gap-3 mt-4">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1"
              style={{
                background: coverage === 100
                  ? `rgba(${theme.accent.rgb},0.12)`
                  : coverage >= 50
                  ? 'rgba(6,182,212,0.10)'
                  : 'rgba(234,179,8,0.10)',
                border: `1px solid ${
                  coverage === 100
                    ? `rgba(${theme.accent.rgb},0.25)`
                    : coverage >= 50
                    ? 'rgba(6,182,212,0.2)'
                    : 'rgba(234,179,8,0.2)'
                }`,
              }}>
              {coverage < 100
                ? <AlertTriangle style={{ width: 12, height: 12, color: theme.status.warning, flexShrink: 0 }} />
                : <CheckCircle2  style={{ width: 12, height: 12, color: theme.status.success, flexShrink: 0 }} />
              }
              <div>
                <p className="text-[10px]" style={{ color: theme.text.muted }}>Blocos extraídos</p>
                <p className="text-sm font-bold"
                  style={{ color: coverage === 100 ? theme.status.success : theme.status.warning }}>
                  {extractedQty} / {totalBlocks}
                  <span className="text-[10px] font-normal ml-1" style={{ color: 'rgba(156,163,175,0.4)' }}>
                    ({coverage}%)
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: 'rgba(192,132,252,0.08)', border: '1px solid rgba(192,132,252,0.15)' }}>
              <Star style={{ width: 12, height: 12, color: theme.stages.master }} />
              <div>
                <p className="text-[10px]" style={{ color: theme.text.muted }}>Masterizados</p>
                <p className="text-sm font-bold" style={{ color: theme.stages.master }}>{masteredQty}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}>
              <Activity style={{ width: 12, height: 12, color: theme.stages.advanced }} />
              <div>
                <p className="text-[10px]" style={{ color: theme.text.muted }}>Consciência</p>
                <p className="text-sm font-bold" style={{ color: theme.stages.advanced }}>
                  {agent.selfAwareness}%
                </p>
              </div>
            </div>
          </div>

          {/* Coverage bar */}
          <div className="mt-3">
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${coverage}%` }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full"
                style={{
                  background: coverage === 100
                    ? `linear-gradient(90deg, ${theme.accent.secondary}, ${theme.accent.primary})`
                    : 'linear-gradient(90deg, #ca8a04, #facc15)',
                }}
              />
            </div>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4" style={{ scrollbarWidth: 'none' }}>

          {/* Evolution Phase */}
          <div className="mb-5">
            <p className="text-[10px] font-bold tracking-widest uppercase mb-3"
              style={{ color: theme.accent.muted }}>
              Evolution Phase
            </p>
            <EvolutionTimeline phase={agent.evolutionPhase as EvolutionPhase} />
          </div>

          {/* DNA Signature */}
          <div className="mb-5 rounded-xl p-3"
            style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${theme.accent.subtle}` }}>
            <p className="text-[10px] font-bold tracking-widest uppercase mb-2"
              style={{ color: theme.accent.muted }}>
              DNA Signature
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Protocol',    value: agent.dna?.protocol           ?? 'ExtractionCore-v7.0' },
                { label: 'Creator',     value: agent.dna?.creatorName        ?? 'Hefesto'             },
                { label: 'Self Aware',  value: agent.dna?.selfAware          ? '✅ Yes' : '❌ No'      },
                { label: 'Replication', value: String(agent.dna?.replicationLevel   ?? 1)             },
                { label: 'Evol.Cap.',   value: `${agent.dna?.evolutionCapability    ?? 100}%`         },
                { label: 'Lineage',     value: (agent.dna?.inheritanceChain ?? ['Hefesto','ORUS-SAGE']).join(' → ') },
              ].map((item, i) => (
                <div key={i}>
                  <p className="text-[9px] uppercase tracking-wider" style={{ color: 'rgba(107,114,128,0.5)' }}>
                    {item.label}
                  </p>
                  <p className="text-xs font-semibold font-mono" style={{ color: theme.text.secondary }}>
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
                <AlertTriangle style={{ width: 12, height: 12, color: theme.status.warning }} />
                <p className="text-[10px] font-bold" style={{ color: theme.status.warning }}>
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
              style={{ color: theme.accent.muted }}>
              Extraction Blocks — {ALL_28_BLOCKS.length} total
            </p>
            {Object.entries(BLOCK_GROUPS).map(([groupName, blocks]) => (
              <BlockGroup
                key={groupName}
                title={groupName}
                blocks={blocks}
                extracted={extracted}
              />
            ))}
          </div>

          {/* System Prompt */}
          <div className="mb-4">
            <p className="text-[10px] font-bold tracking-widest uppercase mb-2"
              style={{ color: theme.accent.muted }}>
              System Prompt Extraído
            </p>
            <div className="rounded-xl p-3 font-mono text-xs leading-relaxed"
              style={{ background: 'rgba(0,0,0,0.4)', border: `1px solid ${theme.border.default}`, color: theme.text.muted }}>
              {agent.configuration?.systemPrompt ?? '—'}
            </div>
          </div>

          {/* Raw JSON */}
          <details className="mb-6">
            <summary className="text-[10px] font-bold tracking-widest uppercase cursor-pointer"
              style={{ color: `rgba(${theme.accent.rgb},0.3)`, listStyle: 'none' }}>
              ▶ Raw DNA JSON
            </summary>
            <pre className="mt-2 rounded-xl p-3 text-[9px] leading-relaxed overflow-x-auto"
              style={{ background: 'rgba(0,0,0,0.5)', border: `1px solid ${theme.border.default}`, color: 'rgba(107,114,128,0.6)' }}>
              {JSON.stringify(agent, null, 2)}
            </pre>
          </details>

        </div>
      </motion.aside>
    </AnimatePresence>
  );
};