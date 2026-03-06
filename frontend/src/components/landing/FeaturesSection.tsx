'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Dna, Layers, Zap, Pause, Shield } from 'lucide-react';

const C = {
  bg: '#060d08', bgMid: '#07110a',
  green: '#22c55e', greenRgb: '34,197,94',
  violetRgb: '139,92,246', cyanRgb: '6,182,212',
  text: '#f0fdf4', muted: 'rgba(156,163,175,0.65)', dim: 'rgba(156,163,175,0.38)',
};

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface FeaturesProps {
  title?: string;
  subtitle?: string;
  features?: Feature[];
  isDark?: boolean;
}

const FEATURES = [
  {
    icon: 'trinity',
    accentRgb: C.greenRgb,
    tag: 'Trinity Engine',
    title: 'Dois modos de inteligência',
    description: 'QUICK (Claude Sonnet, ~120ms) para respostas instantâneas. DEEP (Claude Opus) para análises profundas, pesquisa e raciocínio estratégico. O sistema escolhe automaticamente.',
  },
  {
    icon: 'omega',
    accentRgb: C.violetRgb,
    tag: 'Omega Agents',
    title: 'Agentes hierárquicos com DNA próprio',
    description: 'Crie agentes MICRO → AGENTE → SUPER → ALFA → OMEGA. Cada um gerado via OmegaDNA a partir do seu objetivo — personalidade, capacidades e system prompt extraídos automaticamente.',
  },
  {
    icon: 'memory',
    accentRgb: C.cyanRgb,
    tag: 'Core Memory',
    title: 'Memória contextual persistente',
    description: 'Contexto serializado, indexado e recuperado entre sessões. O agente lembra do histórico, preferências e continuidade de tarefas — como um colaborador que nunca esquece.',
  },
  {
    icon: 'interrupt',
    accentRgb: '244,63,94',
    tag: 'Interruption Service',
    title: 'Pausa inteligente de contexto',
    description: 'Detecta quando pausar, pedir clarificação ou retomar. O sistema preserva o estado completo da interação, analisa intenção do usuário e toma decisões adaptativas.',
  },
  {
    icon: 'workspace',
    accentRgb: '16,185,129',
    tag: 'Workspace Service',
    title: 'Ambientes cognitivos isolados',
    description: 'Múltiplos workspaces com isolamento total de dados, colaboração em tempo real, sync, permissões granulares e histórico de conversas por ambiente.',
  },
  {
    icon: 'learning',
    accentRgb: '249,115,22',
    tag: 'Learning Engine',
    title: 'Agentes que evoluem',
    description: 'Sistema de aprendizado com metacognição, síntese cross-domain e transferência de conhecimento. Agentes que se tornam mais eficazes com cada interação.',
  },
];

const ICON_MAP: Record<string, React.ReactNode> = {
  trinity: <Zap className="w-6 h-6" />,
  omega:   <Dna className="w-6 h-6" />,
  memory:  <Brain className="w-6 h-6" />,
  interrupt: <Pause className="w-6 h-6" />,
  workspace: <Layers className="w-6 h-6" />,
  learning: <Shield className="w-6 h-6" />,
};

export const FeaturesSection: React.FC<FeaturesProps> = ({
  title = 'Arquitetura cognitiva completa',
  subtitle = 'Sete serviços especializados trabalhando em harmonia para criar uma inteligência que realmente entende você',
  isDark = true,
}) => (
  <section id="features" className="relative py-28 px-6 overflow-hidden"
    style={{ background:`linear-gradient(180deg,${C.bg} 0%,${C.bgMid} 50%,${C.bg} 100%)` }}>

    {/* Ambient */}
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[2px]"
        style={{ background:`linear-gradient(90deg,transparent,rgba(${C.greenRgb},0.35),transparent)` }} />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[2px]"
        style={{ background:`linear-gradient(90deg,transparent,rgba(${C.greenRgb},0.2),transparent)` }} />
    </div>

    <div className="relative z-10 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
        viewport={{ once:true, margin:'-80px' }} transition={{ duration:0.55 }}
        className="text-center mb-20">
        <motion.div animate={{ opacity:[0.55,1,0.55] }} transition={{ duration:3, repeat:Infinity }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-5"
          style={{ background:`rgba(${C.greenRgb},0.09)`, border:`1px solid rgba(${C.greenRgb},0.18)`, color:'#4ade80' }}>
          <Layers className="w-3 h-3" /> Serviços
        </motion.div>
        <h2 className="text-4xl md:text-5xl font-black mb-5 leading-tight" style={{ color:C.text }}>
          {title}
        </h2>
        <p className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed" style={{ color:C.muted }}>
          {subtitle}
        </p>
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map((f, i) => (
          <motion.div key={i}
            initial={{ opacity:0, y:24, scale:0.97 }}
            whileInView={{ opacity:1, y:0, scale:1 }}
            viewport={{ once:true, margin:'-60px' }}
            transition={{ delay:i*0.08, duration:0.5, ease:[0.16,1,0.3,1] }}
            whileHover={{ y:-5, scale:1.015 }}
            className="group relative rounded-2xl p-6 overflow-hidden cursor-default"
            style={{
              background:`rgba(${f.accentRgb},0.04)`,
              border:`1px solid rgba(${f.accentRgb},0.12)`,
              transition:'background 0.25s, border 0.25s',
            }}
            onMouseEnter={e=>{
              (e.currentTarget as HTMLElement).style.background=`rgba(${f.accentRgb},0.08)`;
              (e.currentTarget as HTMLElement).style.border=`1px solid rgba(${f.accentRgb},0.24)`;
            }}
            onMouseLeave={e=>{
              (e.currentTarget as HTMLElement).style.background=`rgba(${f.accentRgb},0.04)`;
              (e.currentTarget as HTMLElement).style.border=`1px solid rgba(${f.accentRgb},0.12)`;
            }}>

            {/* Top glow line */}
            <div className="absolute top-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background:`linear-gradient(90deg,transparent,rgba(${f.accentRgb},0.8),transparent)` }} />

            {/* Corner ambient */}
            <div className="absolute top-0 right-0 w-28 h-28 rounded-full blur-2xl opacity-0 group-hover:opacity-15 transition-opacity duration-500 pointer-events-none"
              style={{ background:`rgb(${f.accentRgb})`, transform:'translate(30%,-30%)' }} />

            {/* Icon */}
            <motion.div whileHover={{ scale:1.1, rotate:5 }}
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
              style={{ background:`rgba(${f.accentRgb},0.12)`, border:`1px solid rgba(${f.accentRgb},0.2)`, color:`rgb(${f.accentRgb})` }}>
              {ICON_MAP[f.icon]}
            </motion.div>

            {/* Tag */}
            <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-bold mb-3"
              style={{ background:`rgba(${f.accentRgb},0.12)`, color:`rgb(${f.accentRgb})` }}>
              {f.tag}
            </span>

            <h3 className="text-base font-bold mb-2.5 leading-snug" style={{ color:C.text }}>
              {f.title}
            </h3>
            <p className="text-sm leading-relaxed" style={{ color:C.muted }}>
              {f.description}
            </p>

            {/* Bottom accent bar */}
            <motion.div className="absolute bottom-0 left-0 h-0.5 rounded-full"
              initial={{ width:0 }}
              whileHover={{ width:'100%' }}
              transition={{ duration:0.35 }}
              style={{ background:`linear-gradient(90deg,transparent,rgba(${f.accentRgb},0.6),transparent)` }} />
          </motion.div>
        ))}
      </div>

      {/* Footer note */}
      <motion.p initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}
        transition={{ delay:0.5 }}
        className="text-center mt-14 text-xs tracking-widest uppercase"
        style={{ color:C.dim }}>
        152 arquivos · 7 microserviços · 34k linhas · arquitetura production-ready
      </motion.p>
    </div>
  </section>
);

export default FeaturesSection;
