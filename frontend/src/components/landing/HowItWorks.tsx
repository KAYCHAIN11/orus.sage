'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Dna, MessageSquare, TrendingUp } from 'lucide-react';

const C = {
  bg: '#060d08', bgMid: '#07110a',
  green: '#22c55e', greenRgb: '34,197,94',
  violetRgb: '139,92,246', cyanRgb: '6,182,212',
  text: '#f0fdf4', muted: 'rgba(156,163,175,0.65)',
};

interface Step { number: string; title: string; description: string }
interface HowItWorksProps { title?: string; steps?: Step[]; isDark?: boolean }

const STEPS = [
  {
    num: '01',
    icon: <UserPlus className="w-7 h-7" />,
    accentRgb: C.greenRgb,
    tag: 'Início',
    title: 'Crie seu workspace',
    description: 'Configure um ambiente cognitivo isolado. Defina membros, permissões e o contexto do projeto em segundos.',
  },
  {
    num: '02',
    icon: <Dna className="w-7 h-7" />,
    accentRgb: C.violetRgb,
    tag: 'OmegaDNA',
    title: 'Gere seus agentes',
    description: 'Descreva o objetivo do agente em linguagem natural. O OmegaDNA extrai o perfil completo: personalidade, nível (MICRO→OMEGA), capacidades e system prompt.',
  },
  {
    num: '03',
    icon: <MessageSquare className="w-7 h-7" />,
    accentRgb: C.cyanRgb,
    tag: 'Trinity Engine',
    title: 'Converse com inteligência',
    description: 'QUICK para respostas imediatas com Claude Sonnet. DEEP para análises profundas com Claude Opus. A IA comuta automaticamente conforme a complexidade.',
  },
  {
    num: '04',
    icon: <TrendingUp className="w-7 h-7" />,
    accentRgb: '249,115,22',
    tag: 'Evolução',
    title: 'Agentes que aprendem',
    description: 'O Learning Engine captura padrões, sintetiza conhecimento cross-domain e melhora continuamente. Seu agente OMEGA de hoje sabe mais que o de ontem.',
  },
];

export const HowItWorks: React.FC<HowItWorksProps> = ({
  title = 'Como o ORUS funciona',
  isDark = true,
}) => (
  <section id="how-it-works" className="relative py-28 px-6 overflow-hidden"
    style={{ background:`linear-gradient(180deg,${C.bgMid} 0%,${C.bg} 50%,${C.bgMid} 100%)` }}>

    {/* Ambient */}
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage:`linear-gradient(rgba(34,197,94,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(34,197,94,0.5) 1px,transparent 1px)`,
        backgroundSize:'48px 48px',
      }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-px"
        style={{ background:`linear-gradient(90deg,transparent,rgba(${C.greenRgb},0.25),transparent)` }} />
    </div>

    <div className="relative z-10 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
        viewport={{ once:true, margin:'-80px' }} transition={{ duration:0.5 }}
        className="text-center mb-20">
        <motion.div animate={{ opacity:[0.5,1,0.5] }} transition={{ duration:3, repeat:Infinity }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-5"
          style={{ background:`rgba(${C.greenRgb},0.09)`, border:`1px solid rgba(${C.greenRgb},0.18)`, color:'#4ade80' }}>
          Jornada
        </motion.div>
        <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color:C.text }}>{title}</h2>
        <p className="text-base md:text-lg max-w-xl mx-auto" style={{ color:C.muted }}>
          De zero a uma IA que evolui com você — em quatro passos.
        </p>
      </motion.div>

      {/* Steps */}
      <div className="relative">
        {/* Connecting line desktop */}
        <div className="hidden lg:block absolute top-16 left-0 right-0 h-px"
          style={{ background:`linear-gradient(90deg,transparent,rgba(${C.greenRgb},0.15),rgba(${C.violetRgb},0.15),rgba(${C.cyanRgb},0.15),rgba(249,115,22,0.15),transparent)` }} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((s, i) => (
            <motion.div key={i}
              initial={{ opacity:0, y:28 }}
              whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true, margin:'-50px' }}
              transition={{ delay:i*0.1, duration:0.5, ease:[0.16,1,0.3,1] }}
              className="relative flex flex-col items-center text-center">

              {/* Number badge */}
              <motion.div
                whileHover={{ scale:1.08 }}
                animate={{ boxShadow:[`0 0 0px rgba(${s.accentRgb},0)`,`0 0 20px rgba(${s.accentRgb},0.35)`,`0 0 0px rgba(${s.accentRgb},0)`] }}
                transition={{ duration:2.5, repeat:Infinity, delay:i*0.4 }}
                className="relative w-[72px] h-[72px] rounded-2xl flex items-center justify-center mb-6 flex-shrink-0"
                style={{ background:`rgba(${s.accentRgb},0.1)`, border:`1px solid rgba(${s.accentRgb},0.25)`, color:`rgb(${s.accentRgb})` }}>
                {s.icon}
                {/* Step number */}
                <div className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black"
                  style={{ background:`rgb(${s.accentRgb})`, color:'#000' }}>
                  {i+1}
                </div>
              </motion.div>

              {/* Tag */}
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mb-2.5 tracking-wider"
                style={{ background:`rgba(${s.accentRgb},0.1)`, color:`rgb(${s.accentRgb})` }}>
                {s.tag}
              </span>

              <h3 className="text-base font-bold mb-2 leading-snug" style={{ color:C.text }}>
                {s.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color:C.muted }}>
                {s.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }}
        viewport={{ once:true }} transition={{ delay:0.5 }}
        className="text-center mt-20">
        <motion.a href="/chat"
          whileHover={{ scale:1.04, boxShadow:'0 0 28px rgba(34,197,94,0.25)' }}
          whileTap={{ scale:0.97 }}
          className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-base"
          style={{ background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'#000' }}>
          Começar agora
        </motion.a>
      </motion.div>
    </div>
  </section>
);

export default HowItWorks;
