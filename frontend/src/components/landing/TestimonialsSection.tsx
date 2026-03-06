'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const C = {
  bg: '#060d08', bgMid: '#07110a',
  greenRgb: '34,197,94', violetRgb: '139,92,246', cyanRgb: '6,182,212',
  text: '#f0fdf4', muted: 'rgba(156,163,175,0.65)', dim: 'rgba(156,163,175,0.35)',
};

interface Testimonial { name: string; role: string; company: string; quote: string; avatar: string; rating?: number }
interface TestimonialsSectionProps { title?: string; testimonials?: Testimonial[]; isDark?: boolean }

const TESTIMONIALS: (Testimonial & { accentRgb: string })[] = [
  {
    name: 'Ana Silva',
    role: 'Tech Lead',
    company: 'StartupXYZ',
    avatar: '👩‍💻',
    rating: 5,
    accentRgb: C.greenRgb,
    quote: 'O Trinity Engine mudou como meu time trabalha. QUICK para rascunhos, DEEP para análises críticas — a IA realmente escolhe o momento certo para cada modo.',
  },
  {
    name: 'Carlos Souza',
    role: 'CEO',
    company: 'Innovation Labs',
    avatar: '👨‍💼',
    rating: 5,
    accentRgb: C.violetRgb,
    quote: 'Criar agentes OMEGA com OmegaDNA é absurdamente eficiente. Descrevo o objetivo em português e em segundos tenho um agente com personalidade, capacidades e system prompt prontos.',
  },
  {
    name: 'Marina Costa',
    role: 'Head of Product',
    company: 'Creative Studio',
    avatar: '👩‍🎨',
    rating: 5,
    accentRgb: C.cyanRgb,
    quote: 'A memória persistente entre sessões é o que diferencia o ORUS de tudo que testei. O agente lembra do contexto do projeto de duas semanas atrás como se fosse ontem.',
  },
];

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  title = 'O que dizem quem usa',
  testimonials,
  isDark = true,
}) => (
  <section id="testimonials" className="relative py-28 px-6 overflow-hidden"
    style={{ background:`linear-gradient(180deg,${C.bgMid} 0%,${C.bg} 50%,${C.bgMid} 100%)` }}>

    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-px"
        style={{ background:`linear-gradient(90deg,transparent,rgba(${C.greenRgb},0.2),transparent)` }} />
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage:`linear-gradient(rgba(34,197,94,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(34,197,94,0.5) 1px,transparent 1px)`,
        backgroundSize:'48px 48px',
      }} />
    </div>

    <div className="relative z-10 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
        viewport={{ once:true, margin:'-80px' }} transition={{ duration:0.5 }}
        className="text-center mb-16">
        <motion.div animate={{ opacity:[0.5,1,0.5] }} transition={{ duration:3, repeat:Infinity }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-5"
          style={{ background:`rgba(${C.greenRgb},0.09)`, border:`1px solid rgba(${C.greenRgb},0.18)`, color:'#4ade80' }}>
          Depoimentos
        </motion.div>
        <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color:C.text }}>{title}</h2>
      </motion.div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {TESTIMONIALS.map((t, i) => (
          <motion.div key={i}
            initial={{ opacity:0, y:24 }}
            whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true, margin:'-50px' }}
            transition={{ delay:i*0.1, duration:0.5, ease:[0.16,1,0.3,1] }}
            whileHover={{ y:-5, scale:1.015 }}
            className="group relative rounded-2xl p-6 flex flex-col overflow-hidden"
            style={{ background:`rgba(${t.accentRgb},0.04)`, border:`1px solid rgba(${t.accentRgb},0.12)` }}
            onMouseEnter={e=>{
              (e.currentTarget as HTMLElement).style.background=`rgba(${t.accentRgb},0.08)`;
              (e.currentTarget as HTMLElement).style.border=`1px solid rgba(${t.accentRgb},0.22)`;
            }}
            onMouseLeave={e=>{
              (e.currentTarget as HTMLElement).style.background=`rgba(${t.accentRgb},0.04)`;
              (e.currentTarget as HTMLElement).style.border=`1px solid rgba(${t.accentRgb},0.12)`;
            }}>

            {/* Top glow */}
            <div className="absolute top-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background:`linear-gradient(90deg,transparent,rgba(${t.accentRgb},0.7),transparent)` }} />

            {/* Stars */}
            <div className="flex gap-1 mb-4">
              {Array.from({ length: t.rating || 5 }).map((_, j) => (
                <motion.div key={j}
                  initial={{ scale:0 }} whileInView={{ scale:1 }}
                  viewport={{ once:true }}
                  transition={{ type:'spring', delay:0.1+j*0.06 }}>
                  <Star className="w-3.5 h-3.5 fill-current" style={{ color:`rgb(${t.accentRgb})` }} />
                </motion.div>
              ))}
            </div>

            {/* Quote */}
            <blockquote className="flex-1 text-sm leading-relaxed mb-6 italic"
              style={{ color:C.muted, borderLeft:`2px solid rgba(${t.accentRgb},0.3)`, paddingLeft:'12px' }}>
              "{t.quote}"
            </blockquote>

            {/* Author */}
            <div className="flex items-center gap-3">
              <motion.div animate={{ scale:[1,1.08,1] }} transition={{ duration:2.5, repeat:Infinity, delay:i*0.3 }}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background:`rgba(${t.accentRgb},0.1)`, border:`1px solid rgba(${t.accentRgb},0.18)` }}>
                {t.avatar}
              </motion.div>
              <div>
                <p className="text-sm font-bold" style={{ color:C.text }}>{t.name}</p>
                <p className="text-xs" style={{ color:C.dim }}>{t.role} · {t.company}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.div initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}
        transition={{ delay:0.4 }}
        className="text-center mt-14">
        <p className="text-sm mb-4" style={{ color:C.dim }}>Quer compartilhar sua experiência com ORUS?</p>
        <motion.a href="mailto:stories@orus.dev"
          whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
          className="inline-block px-6 py-3 rounded-xl font-semibold text-sm"
          style={{ background:`rgba(${C.greenRgb},0.12)`, border:`1px solid rgba(${C.greenRgb},0.22)`, color:'#4ade80' }}>
          Enviar depoimento
        </motion.a>
      </motion.div>
    </div>
  </section>
);

export default TestimonialsSection;
