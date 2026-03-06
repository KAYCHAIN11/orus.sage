'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatInputPanelProps {
  onSend: (message: string) => void;
  loading?: boolean;
  isDark?: boolean;
  currentMode?: 'quick' | 'deep';
  onModeChange?: (mode: 'quick' | 'deep') => void;
}

export const ChatInputPanel: React.FC<ChatInputPanelProps> = ({
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
  const modePopupRef = useRef<HTMLDivElement>(null);
  const modeButtonRef = useRef<HTMLButtonElement>(null);
  const xpPopupRef = useRef<HTMLDivElement>(null);
  const xpButtonRef = useRef<HTMLButtonElement>(null);

  // CORES
  const panelBg = isDark ? '#0F1629' : '#FFFFFF';
  const inputBg = isDark ? '#1A1F3A' : '#F8F9FA';
  const textPrimary = isDark ? '#E8ECFF' : '#0A0E27';
  const textSecondary = isDark ? '#9CA3AF' : '#6B7280';
  const borderColor = isDark ? '#2D3748' : '#E5E7EB';
  const accentColor = '#22C55E';
  const popupBg = isDark ? '#0F1629' : '#FFFFFF';

  // ✅ FECHAR POPUP AO CLICAR FORA
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Fechar ModePopup se clicar fora
      if (
        showModePopup &&
        modePopupRef.current &&
        modeButtonRef.current &&
        !modePopupRef.current.contains(target) &&
        !modeButtonRef.current.contains(target)
      ) {
        setShowModePopup(false);
      }

      // Fechar XpPopup se clicar fora
      if (
        showXpPopup &&
        xpPopupRef.current &&
        xpButtonRef.current &&
        !xpPopupRef.current.contains(target) &&
        !xpButtonRef.current.contains(target)
      ) {
        setShowXpPopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showModePopup, showXpPopup]);

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        60
      )}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    onSend(input);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
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
      console.log('Arquivo anexado:', file.name);
    }
  };

  // ✅ POPUP: Mode Selector - SEM onMouseLeave!
  const ModePopup = () => (
    <AnimatePresence>
      {showModePopup && (
        <motion.div
          ref={modePopupRef}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          style={{
            position: 'absolute',
            bottom: '50px',
            left: '0px',
            backgroundColor: popupBg,
            border: `1px solid ${borderColor}`,
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
            zIndex: 1001,
            minWidth: '220px',
            pointerEvents: 'auto', // ← IMPORTANTE: Recebe events
          }}
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => {
              onModeChange?.('quick');
              setShowModePopup(false); // Fecha após selecionar
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
              Resposta rápida
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => {
              onModeChange?.('deep');
              setShowModePopup(false); // Fecha após selecionar
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
              Análise profunda
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ✅ POPUP: XP / Agent Stats - SEM onMouseLeave!
  const XpPopup = () => (
    <AnimatePresence>
      {showXpPopup && (
        <motion.div
          ref={xpPopupRef}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          style={{
            position: 'absolute',
            bottom: '50px',
            left: '56px',
            backgroundColor: popupBg,
            border: `1px solid ${borderColor}`,
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
            zIndex: 1001,
            minWidth: '240px',
            pointerEvents: 'auto', // ← IMPORTANTE: Recebe events
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
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div
      style={{
        width: '100%',
        backgroundColor: panelBg,
        border: `1px solid ${borderColor}`,
        borderTop: `1px solid ${borderColor}`,
        borderRadius: '0',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      {/* TEXTAREA */}
      <div
        style={{
          padding: '12px 16px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua mensagem... (Enter para enviar)"
          disabled={loading}
          rows={1}
          style={{
            width: '100%',
            padding: '8px 0',
            border: 'none',
            backgroundColor: 'transparent',
            color: textPrimary,
            fontSize: '0.875rem',
            fontFamily: 'inherit',
            outline: 'none',
            resize: 'none',
            minHeight: '40px',
            maxHeight: '60px',
            transition: 'all 0.2s ease',
            opacity: loading ? 0.6 : 1,
          }}
        />
      </div>

      {/* DIVISÓRIA */}
      <div
        style={{
          height: '1px',
          backgroundColor: borderColor,
          margin: '0',
        }}
      />

      {/* BOTÕES */}
      <div
        style={{
          padding: '8px 12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        {/* ESQUERDA: 3 Botões */}
        <div style={{ display: 'flex', gap: '6px', position: 'relative' }}>
          {/* ✅ Botão 1: QUICK/DEEP - Apenas onClick, sem onMouseLeave */}
          <motion.button
            ref={modeButtonRef}
            onClick={() => setShowModePopup(!showModePopup)} // Toggle
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '6px',
              border: `1px solid ${
                currentMode === 'quick' ? accentColor : borderColor
              }`,
              backgroundColor: inputBg,
              color: currentMode === 'quick' ? accentColor : textSecondary,
              cursor: 'pointer',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            ⚡
            <ModePopup />
          </motion.button>

          {/* ✅ Botão 2: XP - Apenas onClick, sem onMouseLeave */}
          <motion.button
            ref={xpButtonRef}
            onClick={() => setShowXpPopup(!showXpPopup)} // Toggle
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '6px',
              border: `1px solid ${borderColor}`,
              backgroundColor: inputBg,
              color: textSecondary,
              cursor: 'pointer',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            📊
            <XpPopup />
          </motion.button>

          {/* Botão 3: ORUS AGENTE */}
          <motion.button
            disabled
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '6px',
              border: `1px solid ${borderColor}`,
              backgroundColor: inputBg,
              color: textSecondary,
              cursor: 'not-allowed',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.5,
            }}
          >
            🤖
          </motion.button>
        </div>

        {/* DIREITA: 4 Botões */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '6px',
              border: `1px solid ${borderColor}`,
              backgroundColor: inputBg,
              color: textSecondary,
              cursor: 'pointer',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            🌐
          </motion.button>

          <motion.button
            onClick={() => fileInputRef.current?.click()}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '6px',
              border: `1px solid ${borderColor}`,
              backgroundColor: inputBg,
              color: textSecondary,
              cursor: 'pointer',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            📎
          </motion.button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />

          <motion.button
            disabled
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '6px',
              border: `1px solid ${borderColor}`,
              backgroundColor: inputBg,
              color: textSecondary,
              cursor: 'not-allowed',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.5,
            }}
          >
            🎤
          </motion.button>

          <motion.button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            whileHover={{
              scale: loading || !input.trim() ? 1 : 1.1,
            }}
            whileTap={{ scale: 0.95 }}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '6px',
              background:
                loading || !input.trim()
                  ? 'transparent'
                  : `linear-gradient(135deg, ${accentColor} 0%, #16A34A 100%)`,
              border: `1px solid ${
                loading || !input.trim() ? borderColor : accentColor
              }`,
              color: loading || !input.trim() ? textSecondary : '#FFFFFF',
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
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
    </div>
  );
};

export default ChatInputPanel;