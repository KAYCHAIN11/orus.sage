/**
 * TypingIndicator - Indicador de Digitação
 * Aurora Visual Design System v2.0
 * Data: 07/11/2025
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { colors, spacing } from '../../lib/design-tokens';

interface TypingIndicatorProps {
  isDark?: boolean;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ isDark = false }) => {
  const containerVariants = {
    start: { opacity: 0.6 },
    end: { opacity: 1 },
  };

  const dotVariants = {
    start: { y: 0 },
    end: { y: -10 },
  };

  return (
    <motion.div className="flex gap-1 items-end" style={{ margin: spacing[4] }}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="w-2 h-2 rounded-full"
          style={{
            background: isDark ? colors.neutral[400] : colors.neutral[600],
          }}
          variants={dotVariants}
          initial="start"
          animate="end"
          transition={{
            duration: 0.6,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: index * 0.2,
          }}
        />
      ))}
    </motion.div>
  );
};

export default TypingIndicator;
