'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ArrowRight, Check, Loader2, Dna, Zap, Layers } from 'lucide-react';

const C = {
  bg: '#060d08', bgMid: '#04090605',
  green: '#22c55e', greenRgb: '34,197,94',
  violetRgb: '139,92,246',
  text: '#f0fdf4', muted: 'rgba(156,163,175,0.65)', dim: 'rgba(156,163,175,0.35)',
};

interface CTABannerProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  isDark?: boolean;
  onSubmit?: (email: string) => void;
}

export const CTABanner: React.FC<CTABannerProps> = ({
  title = 'Comece a evoluir hoje',
  subtitle = 'Junte-se a equipes que já usam Trinity Engine, OmegaDNA e Omega Agents para trabalhar com inteligência que cresce com elas.',
  buttonText = 'Começar gratuitamente',
  isDark = true,
  onSubmit,
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const isValid = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email) { setError('Insira seu email'); return; }
    if (!isValid(email)) { setError('Email inválido'); return; }
    setLoading(true);
    try {
      if (onSubmit) await onSubmit(email);
      else await new Promise(r => setTimeout(r, 1100));
      setDone(true);
      setEmail('');
      setTimeout(() => setDone(false), 4000);
    } catch {
      setError('Erro ao enviar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="cta" className="relative py-28 px-6 overflow-hidden"
      style={{ background:`linear-gradient(180deg,${C.bgMid} 0%,#030806 50%,#020504 100%)` }}>

      {/* Dramatic ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div animate={{ opacity:[0.08,0.2,0.08], scale:[1,1.15,1] }}
          transition={{ duration:6, repeat:Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full blur-3xl"
          style={{ background:`radial-gradient(ellipse,rgba(${C.greenRgb},0.4),transparent)` }} />
        <motion.div animate={{ opacity:[0.05,0.12,0.05] }}
          transition={{ duration:8, repeat:Infinity, delay:2 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-3xl"
          style={{ background:`radial-gradient(ellipse,rgba(${C.violetRgb},0.3),transparent)` }} />
        {/* Top divider */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px"
          style={{ background:`linear-gradient(90deg,transparent,rgba(${C.greenRgb},0.3),transparent)` }} />
        {/* Scan line */}
        <motion.div animate={{ y:['-100%','200%'] }}
          transition={{ duration:6, repeat:Infinity, ease:'linear', delay:1 }}
          className="absolute left-0 right-0 h-px opacity-10"
          style={{ background:`linear-gradient(90deg,transparent,rgba(${C.greenRgb},0.8),transparent)` }} />
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage:`linear-gradient(rgba(34,197,94,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(34,197,94,0.5) 1px,transparent 1px)`,
          backgroundSize:'56px 56px',
        }} />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        {/* Animated logo mark */}
        <motion.div animate={{ rotate:[0,360] }} transition={{ duration:18, repeat:Infinity, ease:'linear' }}
          className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-black font-black text-xl mb-8"
          style={{ background:`linear-gradient(135deg,${C.green},#16a34a)`, boxShadow:`0 0 32px rgba(${C.greenRgb},0.3)` }}>
          O
        </motion.div>

        {/* Badge */}
        <motion.div animate={{ opacity:[0.5,1,0.5] }} transition={{ duration:3, repeat:Infinity }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-7"
          style={{ background:`rgba(${C.greenRgb},0.09)`, border:`1px solid rgba(${C.greenRgb},0.2)`, color:'#4ade80' }}>
          <motion.div animate={{ opacity:[0.4,1,0.4] }} transition={{ duration:1.5, repeat:Infinity }}
            className="w-1.5 h-1.5 rounded-full" style={{ background:C.green }} />
          ORUS SAGE · Live
        </motion.div>

        <h2 className="text-4xl md:text-6xl font-black mb-5 leading-tight" style={{ color:C.text }}>
          {title}
        </h2>
        <p className="text-base md:text-lg leading-relaxed mb-10 max-w-xl mx-auto" style={{ color:C.muted }}>
          {subtitle}
        </p>

        {/* Email form */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-4 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={e=>{setEmail(e.target.value); setError('');}}
            disabled={done||loading}
            placeholder="seu@email.com"
            className="flex-1 px-5 py-3.5 rounded-xl text-sm outline-none transition-all"
            style={{
              background:'rgba(255,255,255,0.05)',
              border: error ? '1px solid rgba(239,68,68,0.5)' : `1px solid rgba(${C.greenRgb},0.18)`,
              color:C.text,
            }}
            onFocus={e=>(e.target.style.border=`1px solid rgba(${C.greenRgb},0.45)`)}
            onBlur={e=>(e.target.style.border=error?'1px solid rgba(239,68,68,0.5)':`1px solid rgba(${C.greenRgb},0.18)`)}
          />
          <motion.button type="submit" disabled={loading||done}
            whileHover={!done?{scale:1.04,boxShadow:'0 0 24px rgba(34,197,94,0.3)'}:{}}
            whileTap={!done?{scale:0.97}:{}}
            className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all"
            style={done
              ?{background:'rgba(34,197,94,0.18)', border:'1px solid rgba(34,197,94,0.3)', color:'#4ade80'}
              :{background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'#000', boxShadow:'0 0 14px rgba(34,197,94,0.18)'}}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Enviando...</>
              : done ? <><Check className="w-4 h-4" />Inscrito!</>
              : <><Brain className="w-4 h-4" />{buttonText}</>}
          </motion.button>
        </form>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.p initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
              className="text-xs mb-4" style={{ color:'rgba(239,68,68,0.8)' }}>
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Micro proof */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {[
            { icon:<Dna className="w-3.5 h-3.5"/>, text:'OmegaDNA incluído' },
            { icon:<Zap className="w-3.5 h-3.5"/>, text:'Trinity Engine ativo' },
            { icon:<Layers className="w-3.5 h-3.5"/>, text:'Sem cartão de crédito' },
          ].map((item,i)=>(
            <div key={i} className="flex items-center gap-1.5 text-xs" style={{ color:C.dim }}>
              <span style={{ color:`rgba(${C.greenRgb},0.5)` }}>{item.icon}</span>
              {item.text}
            </div>
          ))}
        </div>

        {/* Footer links */}
        <div className="flex flex-wrap justify-center gap-6 pt-8"
          style={{ borderTop:`1px solid rgba(${C.greenRgb},0.08)` }}>
          {[
            { label:'Privacidade', href:'/privacy' },
            { label:'Termos', href:'/terms' },
            { label:'Documentação', href:'/docs' },
            { label:'contato@orus.dev', href:'mailto:contato@orus.dev' },
          ].map((l,i)=>(
            <motion.a key={i} href={l.href}
              whileHover={{ scale:1.05 }}
              className="text-xs transition-all"
              style={{ color:C.dim }}
              onMouseEnter={e=>(e.currentTarget.style.color='rgba(74,222,128,0.7)')}
              onMouseLeave={e=>(e.currentTarget.style.color=C.dim)}>
              {l.label}
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CTABanner;
