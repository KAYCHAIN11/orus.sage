'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Zap, Brain, Dna } from 'lucide-react';

const C = {
  bg: '#060d08', bgMid: '#07110a',
  greenRgb: '34,197,94', violetRgb: '139,92,246',
  text: '#f0fdf4', muted: 'rgba(156,163,175,0.65)', dim: 'rgba(156,163,175,0.35)',
};

interface PricingPlan { name: string; price: string; period: string; description: string; features: string[]; cta: string; highlighted: boolean; href?: string }
interface PricingSectionProps { title?: string; subtitle?: string; plans?: PricingPlan[]; isDark?: boolean }

const PLANS = [
  {
    name: 'Agente',
    level: 'AGENTE',
    accentRgb: C.greenRgb,
    icon: <Zap className="w-5 h-5" />,
    price: 'R$97',
    period: '/mês',
    description: 'Para profissionais que querem uma IA que realmente entende o contexto',
    features: [
      '3 Workspaces isolados',
      'Trinity Engine (QUICK + DEEP)',
      'Até 5 Agentes OmegaDNA',
      '100k mensagens/mês',
      'Memória persistente',
      'Modo QUICK ~120ms',
    ],
    cta: 'Começar como Agente',
    highlighted: false,
    href: '/signup?plan=agente',
  },
  {
    name: 'Super Agente',
    level: 'SUPER AGENTE',
    accentRgb: C.violetRgb,
    icon: <Brain className="w-5 h-5" />,
    price: 'R$197',
    period: '/mês',
    description: 'Para times que precisam de múltiplos agentes especializados evoluindo juntos',
    features: [
      'Workspaces ilimitados',
      'Trinity Engine completo',
      'Agentes ilimitados (nível ALFA)',
      'Mensagens ilimitadas',
      'Memória + Learning Engine',
      'Interruption Service ativo',
      'Colaboração em tempo real',
    ],
    cta: 'Evoluir para Super',
    highlighted: true,
    href: '/signup?plan=super',
  },
  {
    name: 'Omega',
    level: 'OMEGA',
    accentRgb: '249,115,22',
    icon: <Dna className="w-5 h-5" />,
    price: 'Sob consulta',
    period: '',
    description: 'Plataforma completa com agentes OMEGA, white-label e SLA enterprise',
    features: [
      'Tudo do Super Agente',
      'Agentes nível OMEGA',
      'API completa + webhooks',
      'White-label da plataforma',
      'SLA 99.9% garantido',
      'Suporte dedicado 24/7',
      'Onboarding especializado',
    ],
    cta: 'Falar com vendas',
    highlighted: false,
    href: '/contact?plan=omega',
  },
];

export const PricingSection: React.FC<PricingSectionProps> = ({
  title = 'Escolha seu nível',
  subtitle = 'Da mesma hierarquia dos Omega Agents — cada plano desbloqueia um nível de inteligência',
  isDark = true,
}) => (
  <section id="pricing" className="relative py-28 px-6 overflow-hidden"
    style={{ background:`linear-gradient(180deg,${C.bg} 0%,${C.bgMid} 50%,${C.bg} 100%)` }}>

    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-px"
        style={{ background:`linear-gradient(90deg,transparent,rgba(${C.greenRgb},0.2),transparent)` }} />
      <div className="absolute bottom-1/3 left-0 w-[350px] h-[350px] rounded-full blur-3xl opacity-5"
        style={{ background:`radial-gradient(circle,rgba(${C.violetRgb},1),transparent)` }} />
    </div>

    <div className="relative z-10 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
        viewport={{ once:true, margin:'-80px' }} transition={{ duration:0.5 }}
        className="text-center mb-16">
        <motion.div animate={{ opacity:[0.5,1,0.5] }} transition={{ duration:3, repeat:Infinity }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-5"
          style={{ background:`rgba(${C.greenRgb},0.09)`, border:`1px solid rgba(${C.greenRgb},0.18)`, color:'#4ade80' }}>
          Planos
        </motion.div>
        <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color:C.text }}>{title}</h2>
        <p className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed" style={{ color:C.muted }}>{subtitle}</p>
      </motion.div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
        {PLANS.map((p, i) => (
          <motion.div key={i}
            initial={{ opacity:0, y:24, scale:0.97 }}
            whileInView={{ opacity:1, y:0, scale: p.highlighted ? 1.03 : 1 }}
            viewport={{ once:true, margin:'-50px' }}
            transition={{ delay:i*0.1, duration:0.5, ease:[0.16,1,0.3,1] }}
            whileHover={{ y:-5 }}
            className="relative flex flex-col rounded-2xl overflow-hidden"
            style={{
              background: p.highlighted ? `rgba(${p.accentRgb},0.06)` : 'rgba(255,255,255,0.025)',
              border: p.highlighted ? `1.5px solid rgba(${p.accentRgb},0.35)` : `1px solid rgba(${p.accentRgb},0.12)`,
              boxShadow: p.highlighted ? `0 0 32px rgba(${p.accentRgb},0.12)` : 'none',
            }}>

            {/* Top glow */}
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background:`linear-gradient(90deg,transparent,rgba(${p.accentRgb},${p.highlighted?'0.9':'0.4'}),transparent)` }} />

            {/* Popular badge */}
            {p.highlighted && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                <motion.div animate={{ boxShadow:[`0 0 8px rgba(${p.accentRgb},0.3)`,`0 0 18px rgba(${p.accentRgb},0.6)`,`0 0 8px rgba(${p.accentRgb},0.3)`] }}
                  transition={{ duration:2, repeat:Infinity }}
                  className="px-4 py-1 rounded-full text-xs font-black"
                  style={{ background:`linear-gradient(135deg,rgba(${p.accentRgb},0.9),rgba(${p.accentRgb},0.7))`, color:'#fff' }}>
                  ⭐ Mais popular
                </motion.div>
              </div>
            )}

            <div className="p-7 flex flex-col flex-1">
              {/* Level + icon */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background:`rgba(${p.accentRgb},0.12)`, border:`1px solid rgba(${p.accentRgb},0.22)`, color:`rgb(${p.accentRgb})` }}>
                  {p.icon}
                </div>
                <div>
                  <span className="block text-[10px] font-bold tracking-widest uppercase" style={{ color:`rgba(${p.accentRgb},0.7)` }}>
                    {p.level}
                  </span>
                  <span className="text-base font-black" style={{ color:C.text }}>{p.name}</span>
                </div>
              </div>

              {/* Price */}
              <div className="mb-2">
                <span className="text-4xl font-black" style={{ color:C.text }}>{p.price}</span>
                {p.period && <span className="text-sm ml-1" style={{ color:C.muted }}>{p.period}</span>}
              </div>
              <p className="text-xs mb-6 leading-relaxed" style={{ color:C.muted }}>{p.description}</p>

              {/* Features */}
              <div className="space-y-2.5 mb-8 flex-1">
                {p.features.map((feat, j) => (
                  <motion.div key={j} initial={{ opacity:0, x:-8 }} whileInView={{ opacity:1, x:0 }}
                    viewport={{ once:true }} transition={{ delay:0.1+j*0.04 }}
                    className="flex items-start gap-2.5 text-sm" style={{ color:C.muted }}>
                    <Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color:`rgb(${p.accentRgb})` }} />
                    {feat}
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <Link href={p.href || '/signup'}>
                <motion.button whileHover={{ scale:1.03, boxShadow:`0 0 20px rgba(${p.accentRgb},0.25)` }} whileTap={{ scale:0.97 }}
                  className="w-full py-3.5 rounded-xl font-bold text-sm transition-all"
                  style={p.highlighted
                    ?{background:`linear-gradient(135deg,rgba(${p.accentRgb},0.85),rgba(${p.accentRgb},0.65))`, color:'#fff'}
                    :{background:`rgba(${p.accentRgb},0.1)`, border:`1px solid rgba(${p.accentRgb},0.25)`, color:`rgb(${p.accentRgb})`}}>
                  {p.cta}
                </motion.button>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.p initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}
        transition={{ delay:0.5 }} className="text-center mt-10 text-xs" style={{ color:C.dim }}>
        Sem cartão de crédito para começar · Cancele quando quiser · Migre de plano a qualquer momento
      </motion.p>
    </div>
  </section>
);

export default PricingSection;
