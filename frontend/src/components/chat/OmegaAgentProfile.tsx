

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { spacing, typography, borderRadius } from '../../lib/design-tokens';

interface OmegaAgentProfileProps {
  agentName: string;
  agentType: 'programador' | 'designer' | 'estrategista' | 'writer' | 'pesquisador';
  specialization: number;
  learningContexts: number;
  isDark?: boolean;
}

export const OmegaAgentProfile: React.FC<OmegaAgentProfileProps> = ({
  agentName,
  agentType,
  specialization,
  learningContexts,
  isDark = true,
}) => {
  const [expanded, setExpanded] = useState(false);

  // Cores
  const bgColor = isDark ? '#1A1F3A' : '#F8F9FA';
  const borderColor = isDark ? '#2D3748' : '#E5E7EB';
  const textColor = isDark ? '#E8ECFF' : '#0A0E27';
  const textSecondary = isDark ? '#9CA3AF' : '#6B7280';
  const accentColor = '#22C55E';
  const expandedBg = isDark ? '#161B2E' : '#F3F4F6';

  // Emojis por tipo
  const agentEmojis: Record<string, string> = {
    programador: '💻',
    designer: '🎨',
    estrategista: '📊',
    writer: '✍️',
    pesquisador: '🔬',
  };

  // Capabilities por tipo
  const capabilitiesByType: Record<string, string[]> = {
    programador: [
      'Code review detalhado',
      'Arquitetura de software',
      'Debugging avançado',
      'Best practices moderno',
    ],
    designer: [
      'UI/UX refinado',
      'Design system',
      'Prototipagem',
      'Acessibilidade',
    ],
    estrategista: [
      'Planejamento estratégico',
      'Análise de mercado',
      'Growth hacking',
      'Business intelligence',
    ],
    writer: [
      'Copywriting avançado',
      'SEO otimizado',
      'Content strategy',
      'Brand voice',
    ],
    pesquisador: [
      'Pesquisa em tempo real',
      'Análise de dados',
      'Literatura técnica',
      'Síntese de informações',
    ],
  };

  return (
    <motion.div
      style={{
        padding: spacing[4],
        borderRadius: borderRadius.lg,
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`,
        cursor: 'pointer',
      }}
      whileHover={{ scale: 1.01 }}
      onClick={() => setExpanded(!expanded)}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* HEADER */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[3],
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
          <div style={{ fontSize: '2rem' }}>
            {agentEmojis[agentType] || '🤖'}
          </div>

          <div>
            <h3
              style={{
                margin: 0,
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.semibold,
                color: textColor,
              }}
            >
              {agentName}
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: typography.fontSize.sm,
                color: accentColor,
              }}
            >
              {agentType.charAt(0).toUpperCase() + agentType.slice(1)}
            </p>
          </div>
        </div>

        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          style={{
            fontSize: '1.5rem',
          }}
        >
          ▼
        </motion.div>
      </div>

      {/* EXPANDED CONTENT */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            marginTop: spacing[4],
            overflow: 'hidden',
          }}
        >
          {/* SPECIALIZATION BAR */}
          <div style={{ marginBottom: spacing[4] }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: spacing[2],
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: typography.fontSize.sm,
                  color: textColor,
                }}
              >
                📊 Especialização
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: typography.fontSize.sm,
                  color: accentColor,
                  fontWeight: typography.fontWeight.semibold,
                }}
              >
                {specialization}%
              </p>
            </div>

            <div
              style={{
                width: '100%',
                height: '8px',
                borderRadius: borderRadius.base,
                backgroundColor: isDark ? '#2D3748' : '#E5E7EB',
                overflow: 'hidden',
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${specialization}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }}
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #22C55E, #16A34A)',
                }}
              />
            </div>
          </div>

          {/* LEARNING CONTEXTS */}
          <div
            style={{
              padding: spacing[3],
              borderRadius: borderRadius.base,
              backgroundColor: expandedBg,
              marginBottom: spacing[3],
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: typography.fontSize.sm,
                color: textSecondary,
              }}
            >
              🧠 Aprendizado
            </p>
            <p
              style={{
                margin: `${spacing[1]} 0 0`,
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.bold,
                color: accentColor,
              }}
            >
              +{learningContexts} contextos
            </p>
          </div>

          {/* CAPABILITIES */}
          <div>
            <p
              style={{
                margin: 0,
                fontSize: typography.fontSize.sm,
                color: textColor,
                marginBottom: spacing[2],
              }}
            >
              ⚡ Habilidades Desbloqueadas
            </p>
            <ul
              style={{
                margin: 0,
                paddingLeft: spacing[4],
                fontSize: typography.fontSize.sm,
                color: textSecondary,
              }}
            >
              {capabilitiesByType[agentType].map((capability, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  style={{
                    marginBottom: spacing[1],
                  }}
                >
                  {capability}
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default OmegaAgentProfile;