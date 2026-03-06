'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Brain, Zap, Dna, Layers, ArrowRight, ChevronDown } from 'lucide-react';

const C = {
  bg: '#060d08', bgMid: '#07110a',
  green: '#22c55e', greenRgb: '34,197,94',
  violetRgb: '139,92,246',
  text: '#f0fdf4', muted: 'rgba(156,163,175,0.7)', dim: 'rgba(156,163,175,0.4)',
};

const Backdrop = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 opacity-[0.033]" style={{
      backgroundImage: `linear-gradient(rgba(34,197,94,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(34,197,94,0.5) 1px,transparent 1px)`,
      backgroundSize: '56px 56px',
    }} />
    <div className="absolute inset-0" style={{ background:`radial-gradient(ellipse 70% 55% at 50% 50%,transparent 25%,${C.bg} 100%)` }} />
    <motion.div animate={{ y:[0,-30,0], x:[0,14,0], opacity:[0.12,0.24,0.12] }}
      transition={{ duration:9, repeat:Infinity, ease:'easeInOut' }}
      className="absolute top-1/4 left-[12%] w-[500px] h-[500px] rounded-full blur-3xl"
      style={{ background:`radial-gradient(circle,rgba(${C.greenRgb},0.45),transparent)` }} />
    <motion.div animate={{ y:[0,22,0], x:[0,-16,0], opacity:[0.06,0.14,0.06] }}
      transition={{ duration:11, repeat:Infinity, ease:'easeInOut', delay:2.5 }}
      className="absolute bottom-1/5 right-[8%] w-[420px] h-[420px] rounded-full blur-3xl"
      style={{ background:`radial-gradient(circle,rgba(${C.violetRgb},0.4),transparent)` }} />
    <motion.div animate={{ scale:[1,1.2,1], opacity:[0.04,0.1,0.04] }}
      transition={{ duration:7, repeat:Infinity }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-3xl"
      style={{ background:`radial-gradient(circle,rgba(${C.greenRgb},0.18),transparent)` }} />
  </div>
);

const ChatMockup = () => {
  const msgs = [
    { user:true, text:'Analise tendências de IA para Q2 2026' },
    { user:false, mode:'DEEP', text:'Ativando Claude Opus... Identificando 3 vetores críticos de crescimento no setor de IA generativa.' },
    { user:true, text:'Resuma em pontos rápidos' },
    { user:false, mode:'QUICK', text:'• Adoção enterprise +340% YoY  •  ROI médio 4.2×  •  78% Fortune 500 adotando' },
  ];
  return (
    <motion.div initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }}
      transition={{ delay:0.55, duration:0.8, ease:[0.16,1,0.3,1] }}
      className="relative max-w-lg mx-auto mt-14">
      <div className="absolute inset-0 blur-3xl rounded-3xl opacity-20"
        style={{ background:`linear-gradient(135deg,rgba(${C.greenRgb},0.5),rgba(${C.violetRgb},0.35))` }} />
      <div className="relative rounded-2xl overflow-hidden"
        style={{ background:'rgba(4,9,5,0.94)', border:`1px solid rgba(${C.greenRgb},0.14)`, backdropFilter:'blur(20px)' }}>
        <div className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom:`1px solid rgba(${C.greenRgb},0.07)`, background:'rgba(0,0,0,0.3)' }}>
          <div className="flex items-center gap-2.5">
            <motion.div animate={{ rotate:[0,360] }} transition={{ duration:18, repeat:Infinity, ease:'linear' }}
              className="w-5 h-5 rounded-md flex items-center justify-center text-black font-black text-[10px]"
              style={{ background:`linear-gradient(135deg,${C.green},#16a34a)` }}>O</motion.div>
            <span className="text-xs font-bold" style={{ color:C.text }}>ORUS SAGE</span>
          </div>
          <div className="flex gap-1.5">
            {['QUICK','DEEP'].map(m=>(
              <span key={m} className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                style={m==='QUICK'?{background:'rgba(34,197,94,0.15)',color:'#4ade80'}:{background:'rgba(139,92,246,0.15)',color:'#c084fc'}}>{m}</span>
            ))}
          </div>
        </div>
        <div className="p-4 space-y-2.5">
          {msgs.map((m,i)=>(
            <motion.div key={i} initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
              transition={{ delay:0.8+i*0.18 }}
              className={`flex ${m.user?'justify-end':'justify-start'}`}>
              <div className="max-w-[88%] px-3.5 py-2.5 rounded-xl text-[11px] leading-relaxed"
                style={m.user
                  ?{background:'rgba(34,197,94,0.11)',border:'1px solid rgba(34,197,94,0.18)',color:'#d1fae5',borderBottomRightRadius:4}
                  :{background:'rgba(10,16,12,0.9)',border:'1px solid rgba(255,255,255,0.05)',color:'#e2e8f0',borderBottomLeftRadius:4}}>
                {!m.user&&m.mode&&(
                  <span className="inline-block mr-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold"
                    style={m.mode==='QUICK'?{background:'rgba(34,197,94,0.2)',color:'#4ade80'}:{background:'rgba(139,92,246,0.2)',color:'#c084fc'}}>
                    {m.mode}
                  </span>
                )}
                {m.text}
              </div>
            </motion.div>
          ))}
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.65 }}
            className="flex items-center gap-1 pl-0.5">
            <span className="text-[10px] mr-1" style={{ color:'rgba(74,222,128,0.35)' }}>processando</span>
            {[0,1,2].map(j=>(
              <motion.div key={j} animate={{ opacity:[0.3,1,0.3], scale:[0.8,1.1,0.8] }}
                transition={{ duration:1.2, repeat:Infinity, delay:j*0.2 }}
                className="w-1.5 h-1.5 rounded-full" style={{ background:C.green }} />
            ))}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

interface HeroSectionProps {
  badgeText?: string;
  title?: React.ReactNode;
  subtitle?: string;
  ctaPrimary?: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };
  heroImage?: React.ReactNode;
  isDark?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  ctaPrimary  = { label: 'Começar Agora', href: '/chat' },
  ctaSecondary = { label: 'Ver como funciona', href: '#how-it-works' },
}) => (
  <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center px-6 py-24 overflow-hidden"
    style={{ background:`linear-gradient(180deg,${C.bg} 0%,${C.bgMid} 55%,${C.bg} 100%)` }}>
    <Backdrop />
    <div className="relative z-10 max-w-4xl mx-auto text-center">

      <motion.div initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
        className="inline-flex items-center gap-3 px-4 py-2 rounded-full mb-8"
        style={{ background:`rgba(${C.greenRgb},0.08)`, border:`1px solid rgba(${C.greenRgb},0.22)` }}>
        <motion.div animate={{ opacity:[0.4,1,0.4] }} transition={{ duration:2, repeat:Infinity }}
          className="w-1.5 h-1.5 rounded-full" style={{ background:C.green }} />
        <span className="text-xs font-bold tracking-widest uppercase" style={{ color:'#4ade80' }}>
          Trinity Engine · OmegaDNA · Omega Agents
        </span>
        <motion.div animate={{ opacity:[0.4,1,0.4] }} transition={{ duration:2, repeat:Infinity, delay:0.6 }}
          className="w-1.5 h-1.5 rounded-full" style={{ background:'#8b5cf6' }} />
      </motion.div>

      <motion.h1 initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }}
        transition={{ delay:0.28, duration:0.7, ease:[0.16,1,0.3,1] }}
        className="text-5xl md:text-[4.5rem] font-black leading-[1.04] mb-6 tracking-tight">
        <span style={{ color:C.text }}>Seu Parceiro</span><br />
        <span style={{ background:'linear-gradient(135deg,#22c55e 0%,#4ade80 45%,#86efac 70%,#22c55e 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundSize:'200%' }}>
          Cognitivo
        </span><br />
        <span style={{ color:'rgba(240,253,244,0.55)' }}>de IA</span>
      </motion.h1>

      <motion.p initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
        transition={{ delay:0.42, duration:0.6 }}
        className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10" style={{ color:C.muted }}>
        ORUS SAGE combina o <strong style={{ color:'#4ade80' }}>Trinity Engine</strong> (Claude Sonnet + Opus),{' '}
        <strong style={{ color:'#c084fc' }}>Omega Agents</strong> hierárquicos e memória contextual persistente
        para criar uma inteligência que evolui com você.
      </motion.p>

      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.55 }}
        className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Link href={ctaPrimary.href}>
          <motion.button whileHover={{ scale:1.04, boxShadow:'0 0 32px rgba(34,197,94,0.3)' }} whileTap={{ scale:0.97 }}
            className="flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-base"
            style={{ background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'#000', boxShadow:'0 0 18px rgba(34,197,94,0.18)' }}>
            <Brain className="w-5 h-5" />{ctaPrimary.label}<ArrowRight className="w-4 h-4" />
          </motion.button>
        </Link>
        <Link href={ctaSecondary.href}>
          <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-base"
            style={{ background:'rgba(255,255,255,0.04)', border:`1px solid rgba(${C.greenRgb},0.22)`, color:'rgba(74,222,128,0.85)' }}>
            {ctaSecondary.label}
          </motion.button>
        </Link>
      </motion.div>

      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.72 }}
        className="flex flex-wrap justify-center gap-3 mt-12">
        {[
          { icon:<Dna className="w-3.5 h-3.5"/>, val:'∞ Agentes', sub:'OmegaDNA' },
          { icon:<Zap className="w-3.5 h-3.5"/>, val:'~120ms', sub:'Modo QUICK' },
          { icon:<Layers className="w-3.5 h-3.5"/>, val:'Ilimitados', sub:'Workspaces' },
          { icon:<Brain className="w-3.5 h-3.5"/>, val:'Sonnet+Opus', sub:'Trinity Engine' },
        ].map((s,i)=>(
          <motion.div key={i} initial={{ opacity:0, scale:0.88 }} animate={{ opacity:1, scale:1 }}
            transition={{ delay:0.78+i*0.07 }}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium"
            style={{ background:'rgba(255,255,255,0.03)', border:`1px solid rgba(${C.greenRgb},0.09)`, color:C.dim }}>
            <span style={{ color:`rgba(${C.greenRgb},0.55)` }}>{s.icon}</span>
            <span className="font-bold" style={{ color:C.text }}>{s.val}</span>
            <span>{s.sub}</span>
          </motion.div>
        ))}
      </motion.div>

      <ChatMockup />
    </div>

    <motion.div animate={{ y:[0,8,0] }} transition={{ duration:2.2, repeat:Infinity }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 cursor-pointer"
      onClick={()=>document.getElementById('features')?.scrollIntoView({behavior:'smooth'})}
      style={{ color:`rgba(${C.greenRgb},0.28)` }}>
      <span className="text-[10px] tracking-widest uppercase">Explorar</span>
      <ChevronDown className="w-4 h-4" />
    </motion.div>
  </section>
);

export default HeroSection;
