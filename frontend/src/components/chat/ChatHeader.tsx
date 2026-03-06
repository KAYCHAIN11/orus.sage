'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { spacing, typography, borderRadius } from '../../lib/design-tokens';

interface ChatHeaderProps {
  currentMode: 'quick' | 'deep';
  onModeChange: (mode: 'quick' | 'deep') => void;
  agentName: string;
  agentSpecialization: number;
  isDark: boolean;
  onToggleDark: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  currentMode,
  onModeChange,
  agentName,
  agentSpecialization,
  isDark,
  onToggleDark,
}) => {
  const bgColor = isDark ? '#0A0E27' : '#FFFFFF';
  const borderColor = isDark ? '#2D3748' : '#E5E7EB';
  const textPrimary = isDark ? '#E8ECFF' : '#0A0E27';
  const textSecondary = isDark ? '#9CA3AF' : '#6B7280';
  const accentColor = '#22C55E';

  return (
    <motion.header
      style={{
        padding: `${spacing[4]} ${spacing[6]}`,
        borderBottom: `1px solid ${borderColor}`,
        backgroundColor: bgColor,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: spacing[4],
        height: '70px',
      }}
      initial={{ y: -70 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.1 }}
    >
      {/* LEFT: Logo */}
      <h1
        style={{
          fontSize: typography.fontSize.xl,
          fontWeight: typography.fontWeight.bold,
          color: accentColor,
          margin: 0,
        }}
      >
        💬 ORUS
      </h1>

      {/* CENTER: Mode Switch (ORUS QUICK / ORUS DEEP) */}
      <div style={{ display: 'flex', gap: spacing[2] }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onModeChange('quick')}
          style={{
            padding: `${spacing[2]} ${spacing[4]}`,
            borderRadius: borderRadius.base,
            background: currentMode === 'quick' ? accentColor : 'transparent',
            border: `1px solid ${accentColor}`,
            color: currentMode === 'quick' ? '#FFFFFF' : accentColor,
            cursor: 'pointer',
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.semibold,
            transition: 'all 0.2s ease',
          }}
        >
          ⚡ ORUS QUICK
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onModeChange('deep')}
          style={{
            padding: `${spacing[2]} ${spacing[4]}`,
            borderRadius: borderRadius.base,
            background: currentMode === 'deep' ? accentColor : 'transparent',
            border: `1px solid ${accentColor}`,
            color: currentMode === 'deep' ? '#FFFFFF' : accentColor,
            cursor: 'pointer',
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.semibold,
            transition: 'all 0.2s ease',
          }}
        >
          🧠 ORUS DEEP
        </motion.button>
      </div>

      {/* CENTER-RIGHT: Agent XP (como jogo) */}
      <motion.div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[3],
          minWidth: '250px',
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontSize: typography.fontSize.sm,
              color: textPrimary,
              fontWeight: typography.fontWeight.semibold,
            }}
          >
            💻 {agentName}
          </p>
          <div
            style={{
              width: '150px',
              height: '6px',
              borderRadius: borderRadius.base,
              backgroundColor: isDark ? '#2D3748' : '#E5E7EB',
              overflow: 'hidden',
              marginTop: spacing[1],
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${agentSpecialization}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #22C55E, #16A34A)',
              }}
            />
          </div>
          <p
            style={{
              margin: `${spacing[1]} 0 0`,
              fontSize: typography.fontSize.xs,
              color: accentColor,
            }}
          >
            {agentSpecialization}% 👑
          </p>
        </div>
      </motion.div>

      {/* RIGHT: Dark/Light Toggle */}
      <motion.button
        onClick={onToggleDark}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        style={{
          width: '44px',
          height: '44px',
          borderRadius: borderRadius.base,
          background: isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)',
          border: `1px solid ${borderColor}`,
          cursor: 'pointer',
          fontSize: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isDark ? '☀️' : '🌙'}
      </motion.button>
    </motion.header>
  );
};

export default ChatHeader;
