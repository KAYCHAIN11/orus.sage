// src/components/chat/TrinityModeIndicator.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { spacing, typography, borderRadius } from '../../lib/design-tokens';

interface TrinityModeIndicatorProps {
  currentMode: 'trinity_native' | 'api_external';
  latency: number;
  isDark?: boolean;
  onForceMode?: (mode: 'trinity_native' | 'api_external') => void;
}

export const TrinityModeIndicator: React.FC<TrinityModeIndicatorProps> = ({
  currentMode,
  latency,
  isDark = true,
  onForceMode,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const isTrinity = currentMode === 'trinity_native';
  const bgColor = isDark ? '#1A1F3A' : '#F8F9FA';
  const borderColor = isDark ? '#2D3748' : '#E5E7EB';
  const textColor = isDark ? '#E8ECFF' : '#0A0E27';
  const accentColor = isTrinity ? '#22C55E' : '#3B82F6';

  return (
    <motion.div
      style={{
        padding: spacing[4],
        borderRadius: borderRadius.lg,
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`,
        cursor: 'pointer',
      }}
      whileHover={{ scale: 1.02 }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Mode Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[4],
          marginBottom: spacing[4],
        }}
      >
        <motion.div
          animate={{ rotate: isTrinity ? 360 : 0 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          style={{
            fontSize: '1.25rem',
          }}
        >
          {isTrinity ? '🔮' : '🤖'}
        </motion.div>

        <div>
          <p
            style={{
              margin: 0,
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.semibold,
              color: textColor,
            }}
          >
            {isTrinity ? 'Trinity Mode' : 'Claude API Mode'}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: typography.fontSize.xs,
              color: accentColor,
            }}
          >
            {latency}ms
          </p>
        </div>
      </div>

      {/* Switch Buttons */}
      <div
        style={{
          display: 'flex',
          gap: spacing[4],
          marginBottom: spacing[4],
        }}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onForceMode?.('trinity_native')}
          style={{
            flex: 1,
            padding: `${spacing[2]} ${spacing[4]}`,
            borderRadius: borderRadius.base,
            background: isTrinity ? accentColor : 'transparent',
            border: `1px solid ${accentColor}`,
            color: isTrinity ? '#FFFFFF' : accentColor,
            cursor: 'pointer',
            fontSize: typography.fontSize.xs,
            fontWeight: typography.fontWeight.semibold,
          }}
        >
          🔮 Trinity
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onForceMode?.('api_external')}
          style={{
            flex: 1,
            padding: `${spacing[2]} ${spacing[4]}`,
            borderRadius: borderRadius.base,
            background: !isTrinity ? '#3B82F6' : 'transparent',
            border: '1px solid #3B82F6',
            color: !isTrinity ? '#FFFFFF' : '#3B82F6',
            cursor: 'pointer',
            fontSize: typography.fontSize.xs,
            fontWeight: typography.fontWeight.semibold,
          }}
        >
          🤖 Claude
        </motion.button>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            fontSize: typography.fontSize.xs,
            color: '#9CA3AF',
            lineHeight: typography.lineHeight.relaxed,
          }}
        >
          <p style={{ margin: `${spacing[2]} 0` }}>
            ✅ Trinity Nativa: Mais rápido e poderoso
          </p>
          <p style={{ margin: `${spacing[2]} 0` }}>
            ✅ Claude API: Confiável fallback
          </p>
          <p style={{ margin: `${spacing[2]} 0` }}>
            🔄 Sistema troca automaticamente se Trinity ficar offline
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default TrinityModeIndicator;
