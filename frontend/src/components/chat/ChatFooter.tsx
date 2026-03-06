/**
 * ChatFooter.tsx - Input Overlay com Botões QUICK/DEEP + Stats
 * Aurora Visual Design System v2.0
 * Data: 15/11/2025
 * 
 * Layout:
 * [⚡ QUICK] [📊 XP] [🤖 BREVE] | [Input Grande] | [🌐] [📎] [🎤] [⬆️]
 * 
 * Features:
 * - Input auto-grow
 * - Popup QUICK/DEEP com ORUS COIN
 * - Popup XP/Stats do Agente
 * - File upload
 * - Voice (em breve)
 * - Send button
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatFooterProps {
  onSend: (message: string) => void;
  loading?: boolean;
  isDark?: boolean;
  currentMode?: 'quick' | 'deep';
  onModeChange?: (mode: 'quick' | 'deep') => void;
}

export const ChatFooter: React.FC<ChatFooterProps> = ({
  onSend,
  loading = false,
  isDark = true,
  currentMode = 'quick',
  onModeChange,
}) => {
  const [input, setInput] = useState('');
  const [showModePopup, setShowModePopup] = useState(false);
  const [showXpPopup, setShowXpPopup] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // CORES
  const bgColor = isDark ? '#0A0E27' : '#FFFFFF';
  const inputBg = isDark ? '#1A1F3A' : '#F8F9FA';
  const textPrimary = isDark ? '#E8ECFF' : '#0A0E27';
  const textSecondary = isDark ? '#9CA3AF' : '#6B7280';
  const borderColor = isDark ? '#2D3748' : '#E5E7EB';
  const accentColor = '#22C55E';
  const popupBg = isDark ? '#0F1629' : '#FFFFFF';

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    onSend(input);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = '44px';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // TODO: Implementar upload
      console.log('Arquivo anexado:', file.name);
    }
  };

  // ============================================
  // POPUP: Mode Selector (QUICK/DEEP)
  // ============================================
  const ModePopup = () => (
    <AnimatePresence>
      {showModePopup && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          style={{
            position: 'absolute',
            bottom: '70px',
            left: '12px',
            backgroundColor: popupBg,
            border: `1px solid ${borderColor}`,
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 1001,
            minWidth: '220px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* QUICK - Pré-selecionado */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => {
              onModeChange?.('quick');
              setShowModePopup(false);
            }}
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              backgroundColor:
                currentMode === 'quick' ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
              border:
                currentMode === 'quick' ? `1px solid ${accentColor}` : 'none',
              cursor: 'pointer',
              marginBottom: '8px',
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: '0.875rem',
                fontWeight: '600',
                color: textPrimary,
              }}
            >
              ⚡ QUICK
            </p>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: '0.75rem',
                color: textSecondary,
              }}
            >
              [Pré-selecionado] Resposta rápida
            </p>
          </motion.div>

          {/* DEEP - Requer ORUS COIN */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => {
              onModeChange?.('deep');
              setShowModePopup(false);
            }}
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              backgroundColor:
                currentMode === 'deep' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
              border:
                currentMode === 'deep' ? `1px solid #3B82F6` : 'none',
              cursor: 'pointer',
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: '0.875rem',
                fontWeight: '600',
                color: textPrimary,
              }}
            >
              🔷 DEEP
            </p>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: '0.75rem',
                color: '#F59E0B',
              }}
            >
              💰 1 ORUS COIN Análise profunda
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ============================================
  // POPUP: XP / Agent Stats
  // ============================================
  const XpPopup = () => (
    <AnimatePresence>
      {showXpPopup && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          style={{
            position: 'absolute',
            bottom: '70px',
            left: '56px',
            backgroundColor: popupBg,
            border: `1px solid ${borderColor}`,
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 1001,
            minWidth: '240px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <p
            style={{
              margin: 0,
              fontSize: '0.875rem',
              fontWeight: '600',
              color: textPrimary,
            }}
          >
            📊 Programador Expert
          </p>

          <div
            style={{
              marginTop: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', color: textSecondary }}>
                Nível:
              </span>
              <span
                style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: accentColor,
                }}
              >
                42 ⭐
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', color: textSecondary }}>
                Fragmentos:
              </span>
              <span
                style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: textPrimary,
                }}
              >
                8
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', color: textSecondary }}>
                Memória:
              </span>
              <span
                style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: textPrimary,
                }}
              >
                156 KB
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', color: textSecondary }}>
                Especialização:
              </span>
              <span
                style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#F59E0B',
                }}
              >
                89%
              </span>
            </div>
          </div>

          <div
            style={{
              marginTop: '12px',
              paddingTop: '12px',
              borderTop: `1px solid ${borderColor}`,
              fontSize: '0.7rem',
              color: textSecondary,
            }}
          >
            Última atualização: 5 min atrás
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ============================================
  // RENDER
  // ============================================
  return (
    <motion.div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: bgColor,
        borderTop: `1px solid ${borderColor}`,
        padding: '16px 32px',
        backdropFilter: 'blur(10px)',
        zIndex: 999,
      }}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-end',
        }}
      >
        {/* ======================================
            LADO ESQUERDO: 3 Botões com Popups
            ====================================== */}
        <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
          {/* BOTÃO 1: QUICK/DEEP Selector */}
          <motion.button
            onMouseEnter={() => setShowModePopup(true)}
            onMouseLeave={() => setShowModePopup(false)}
            onClick={() => setShowModePopup(!showModePopup)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '8px',
              border: `1px solid ${
                currentMode === 'quick' ? accentColor : borderColor
              }`,
              backgroundColor: isDark ? '#1A1F3A' : '#F8F9FA',
              color: currentMode === 'quick' ? accentColor : textSecondary,
              cursor: 'pointer',
              fontSize: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
            title="Modo: QUICK/DEEP"
          >
            ⚡
            <ModePopup />
          </motion.button>

          {/* BOTÃO 2: XP / Stats */}
          <motion.button
            onMouseEnter={() => setShowXpPopup(true)}
            onMouseLeave={() => setShowXpPopup(false)}
            onClick={() => setShowXpPopup(!showXpPopup)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '8px',
              border: `1px solid ${borderColor}`,
              backgroundColor: isDark ? '#1A1F3A' : '#F8F9FA',
              color: textSecondary,
              cursor: 'pointer',
              fontSize: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
            title="Stats do Agente"
          >
            📊
            <XpPopup />
          </motion.button>

          {/* BOTÃO 3: ORUS AGENTE (Disabled) */}
          <motion.button
            disabled
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '8px',
              border: `1px solid ${borderColor}`,
              backgroundColor: isDark ? '#1A1F3A' : '#F8F9FA',
              color: textSecondary,
              cursor: 'not-allowed',
              fontSize: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.5,
            }}
            title="Em breve"
          >
            🤖
          </motion.button>
        </div>

        {/* ======================================
            CENTRO: Input Textarea (Cresce)
            ====================================== */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua mensagem... (Enter para enviar, Shift+Enter para quebra)"
          disabled={loading}
          rows={1}
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: '12px',
            border: `1px solid ${borderColor}`,
            backgroundColor: inputBg,
            color: textPrimary,
            fontSize: '0.875rem',
            fontFamily: 'inherit',
            outline: 'none',
            resize: 'none',
            minHeight: '44px',
            maxHeight: '200px',
            transition: 'all 0.2s ease',
            opacity: loading ? 0.6 : 1,
            boxShadow: `inset 0 1px 2px rgba(0, 0, 0, 0.1)`,
          }}
          onFocus={(e) => {
            if (!loading) {
              e.currentTarget.style.borderColor = accentColor;
              e.currentTarget.style.boxShadow = `inset 0 1px 2px rgba(0, 0, 0, 0.1), 0 0 0 2px rgba(34, 197, 94, 0.1)`;
            }
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = borderColor;
            e.currentTarget.style.boxShadow = `inset 0 1px 2px rgba(0, 0, 0, 0.1)`;
          }}
        />

        {/* ======================================
            LADO DIREITO: 4 Botões (Ações)
            ====================================== */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {/* Idioma/Global */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '8px',
              border: `1px solid ${borderColor}`,
              backgroundColor: isDark ? '#1A1F3A' : '#F8F9FA',
              color: textSecondary,
              cursor: 'pointer',
              fontSize: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Idioma"
          >
            🌐
          </motion.button>

          {/* Upload Arquivo */}
          <motion.button
            onClick={() => fileInputRef.current?.click()}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '8px',
              border: `1px solid ${borderColor}`,
              backgroundColor: isDark ? '#1A1F3A' : '#F8F9FA',
              color: textSecondary,
              cursor: 'pointer',
              fontSize: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Anexar arquivo"
          >
            📎
          </motion.button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />

          {/* Voice Chat (Em Breve) */}
          <motion.button
            disabled
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '8px',
              border: `1px solid ${borderColor}`,
              backgroundColor: isDark ? '#1A1F3A' : '#F8F9FA',
              color: textSecondary,
              cursor: 'not-allowed',
              fontSize: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.5,
            }}
            title="Em breve"
          >
            🎤
          </motion.button>

          {/* Send Button */}
          <motion.button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            whileHover={{
              scale: loading || !input.trim() ? 1 : 1.1,
            }}
            whileTap={{ scale: 0.95 }}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '8px',
              background:
                loading || !input.trim()
                  ? 'transparent'
                  : `linear-gradient(135deg, ${accentColor} 0%, #16A34A 100%)`,
              border: `1px solid ${
                loading || !input.trim() ? borderColor : accentColor
              }`,
              color: loading || !input.trim() ? textSecondary : '#FFFFFF',
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              fontSize: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '600',
              opacity: loading || !input.trim() ? 0.5 : 1,
              boxShadow:
                loading || !input.trim()
                  ? 'none'
                  : `0 4px 12px rgba(34, 197, 94, 0.3)`,
              transition: 'all 0.2s ease',
            }}
            title="Enviar"
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                ⏳
              </motion.div>
            ) : (
              '⬆️'
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatFooter;