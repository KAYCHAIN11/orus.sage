'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const C = {
  bg: '#060d08', bgMid: '#07110a',
  greenRgb: '34,197,94', violetRgb: '139,92,246',
  text: '#f0fdf4', muted: 'rgba(156,163,175,0.65)', dim: 'rgba(156,163,175,0.35)',
};

interface FAQ { question: string; answer: string }
interface FAQSectionProps { title?: string; faqs?: FAQ[]; isDark?: boolean }

const FAQS: FAQ[] = [
  {
    question: 'O que é o Trinity Engine?',
    answer: 'Trinity Engine é o núcleo de IA do ORUS. Ele opera em dois modos: QUICK usa Claude Sonnet para respostas rápidas (~120ms) em tarefas do dia a dia. DEEP usa Claude Opus para análises complexas, pesquisa profunda e raciocínio estratégico. O sistema detecta automaticamente qual modo usar com base na complexidade da sua solicitação.',
  },
  {
    question: 'Como o OmegaDNA funciona?',
    answer: 'Você descreve em linguagem natural o objetivo do agente. O OmegaDNA analisa semanticamente a descrição e extrai automaticamente: nível hierárquico (MICRO_AGENTE → OMEGA), modo preferido (QUICK/DEEP/HYBRID), personalidade, especialização, capacidades cognitivas, traços comportamentais e gera o system prompt completo. Tudo em segundos, sem configuração manual.',
  },
  {
    question: 'O que é o sistema de interrupção?',
    answer: 'O Interruption Service monitora conversas em tempo real para detectar quando o agente precisa pausar. Ele analisa intenção do usuário, gerencia estados de pausa, faz perguntas de clarificação quando necessário e retoma o contexto preservando o estado completo. Isso evita respostas incorretas por ambiguidade de intenção.',
  },
  {
    question: 'Como funciona a memória persistente?',
    answer: 'O Core Memory Service serializa e indexa todo o contexto de conversas entre sessões. Quando você retorna, o agente recupera histórico, preferências, tarefas em andamento e padrões de comportamento aprendidos. É como ter um colaborador que nunca esquece — diferente de ChatGPT que reinicia do zero a cada sessão.',
  },
  {
    question: 'Posso criar quantos agentes quiser?',
    answer: 'No plano Super Agente e Omega, sim — agentes ilimitados. Cada agente tem seu próprio DNA, personalidade e memória. Você pode ter um agente de pesquisa, um de código, um estrategista e um criativo, cada um evoluindo de forma independente dentro do mesmo workspace.',
  },
  {
    question: 'Os dados ficam seguros?',
    answer: 'Cada workspace é isolado com barreiras de dados rígidas. O Workspace Service implementa isolation.barrier.ts, permission.validator.ts e data.encapsulation.ts para garantir que dados de um ambiente nunca contaminem outro. Toda comunicação é criptografada via encryption.handler.ts. Compliance LGPD e GDPR.',
  },
];

export const FAQSection: React.FC<FAQSectionProps> = ({
  title = 'Perguntas frequentes',
  faqs = FAQS,
  isDark = true,
}) => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-28 px-6 overflow-hidden"
      style={{ background:`linear-gradient(180deg,${C.bg} 0%,${C.bgMid} 50%,${C.bg} 100%)` }}>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-px"
          style={{ background:`linear-gradient(90deg,transparent,rgba(${C.greenRgb},0.2),transparent)` }} />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full blur-3xl opacity-5"
          style={{ background:`radial-gradient(circle,rgba(${C.violetRgb},1),transparent)` }} />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true, margin:'-80px' }} transition={{ duration:0.5 }}
          className="text-center mb-16">
          <motion.div animate={{ opacity:[0.5,1,0.5] }} transition={{ duration:3, repeat:Infinity }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-5"
            style={{ background:`rgba(${C.greenRgb},0.09)`, border:`1px solid rgba(${C.greenRgb},0.18)`, color:'#4ade80' }}>
            FAQ
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-black" style={{ color:C.text }}>{title}</h2>
        </motion.div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div key={i}
              initial={{ opacity:0, y:16 }}
              whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true, margin:'-30px' }}
              transition={{ delay:i*0.06, duration:0.45 }}
              className="rounded-xl overflow-hidden"
              style={{
                background: openIdx===i ? `rgba(${C.greenRgb},0.06)` : 'rgba(255,255,255,0.025)',
                border: openIdx===i ? `1px solid rgba(${C.greenRgb},0.22)` : `1px solid rgba(255,255,255,0.06)`,
                transition: 'background 0.2s, border 0.2s',
              }}>

              {/* Question */}
              <button
                onClick={()=>setOpenIdx(openIdx===i?null:i)}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                style={{ background:'transparent' }}>
                <span className="text-sm font-semibold leading-snug" style={{ color:C.text }}>
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: openIdx===i ? 180 : 0 }}
                  transition={{ duration:0.25 }}
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background:`rgba(${C.greenRgb},${openIdx===i?'0.15':'0.06'})`, color:'#4ade80' }}>
                  {openIdx===i ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                </motion.div>
              </button>

              {/* Answer */}
              <AnimatePresence>
                {openIdx===i && (
                  <motion.div
                    initial={{ opacity:0, height:0 }}
                    animate={{ opacity:1, height:'auto' }}
                    exit={{ opacity:0, height:0 }}
                    transition={{ duration:0.28, ease:'easeInOut' }}
                    style={{ overflow:'hidden', borderTop:`1px solid rgba(${C.greenRgb},0.1)` }}>
                    <p className="px-6 py-5 text-sm leading-relaxed" style={{ color:C.muted }}>
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}
          transition={{ delay:0.5 }}
          className="text-center mt-14">
          <p className="text-sm mb-4" style={{ color:C.dim }}>Ainda tem dúvidas?</p>
          <motion.a href="mailto:support@orus.dev"
            whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
            className="inline-block px-6 py-3 rounded-xl font-semibold text-sm"
            style={{ background:`rgba(${C.violetRgb},0.12)`, border:`1px solid rgba(${C.violetRgb},0.22)`, color:'#c084fc' }}>
            Falar com suporte
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
