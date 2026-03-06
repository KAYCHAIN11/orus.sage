'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Mic, Zap, Wand2, X, FileText, FileCode } from 'lucide-react';

interface PendingFile {
  name:       string;
  type:       'fragment' | 'document';
  content:    string;
  isFragment: boolean;
}

interface ChatInputProps {
  onSend:                  (message: string, mode: 'QUICK' | 'DEEP', documentContext?: string) => void;
  isLoading?:              boolean;
  isDark?:                 boolean;
  mode?:                   'QUICK' | 'DEEP';
  onModeChange?:           (mode: 'QUICK' | 'DEEP') => void;
  workspaceId?:            string;
  onFragmentActivated?:    (agentId: string, agentName: string) => void;
}

const PASTE_AS_FILE_THRESHOLD = 500;

const isOmegaFragment = (content: string) =>
  content.includes('@alphalang/blueprint') ||
  content.includes('@component:') ||
  content.includes('@cognitive-signature') ||
  content.includes('@hefesto-protocol');

const FileIcon: React.FC<{ name: string }> = ({ name }) => {
  const ext = name.split('.').pop()?.toLowerCase();
  return ['ts','tsx','js','json','md'].includes(ext ?? '')
    ? <FileCode className="w-3 h-3" />
    : <FileText className="w-3 h-3" />;
};

function makePasteName(existing: PendingFile[]): string {
  const count = existing.filter(f => f.name.startsWith('paste')).length;
  return count === 0 ? 'paste.txt' : `paste-${count + 1}.txt`;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  isLoading    = false,
  isDark       = true,
  mode         = 'QUICK',
  onModeChange,
  workspaceId  = 'ws-default',
  onFragmentActivated,
}) => {
  const [input,          setInput]          = useState('');
  const [showModePopup,  setShowModePopup]  = useState(false);
  const [showXpPopup,    setShowXpPopup]    = useState(false);
  const [pendingFiles,   setPendingFiles]   = useState<PendingFile[]>([]);
  const [isDragging,     setIsDragging]     = useState(false);
  const [uploadingNames, setUploadingNames] = useState<string[]>([]);

  const textareaRef   = useRef<HTMLTextAreaElement>(null);
  const fileInputRef  = useRef<HTMLInputElement>(null);
  const modeButtonRef = useRef<HTMLButtonElement>(null);
  const xpButtonRef   = useRef<HTMLButtonElement>(null);

  // ── Auto-resize textarea ──────────────────────────────────────────────────
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = '42px';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [input]);

  // ── Fechar popups ao clicar fora ──────────────────────────────────────────
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (modeButtonRef.current?.contains(e.target as Node)) return;
      if ((e.target as HTMLElement).closest('[data-popup="mode"]')) return;
      setShowModePopup(false);

      if (xpButtonRef.current?.contains(e.target as Node)) return;
      if ((e.target as HTMLElement).closest('[data-popup="xp"]')) return;
      setShowXpPopup(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // ── Paste grande → chip ───────────────────────────────────────────────────
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData.getData('text');
    if (text.length > PASTE_AS_FILE_THRESHOLD) {
      e.preventDefault();
      const name = makePasteName(pendingFiles);
      setPendingFiles(prev => [...prev, { name, type: 'document', content: text.slice(0, 40000), isFragment: false }]);
      setInput(prev => prev.trimStart() || `Analise o conteúdo de "${name}" e me dê um resumo.`);
    }
  }, [pendingFiles]);

  // ── Processar arquivo ─────────────────────────────────────────────────────
  const processFile = useCallback(async (file: File) => {
    setUploadingNames(prev => [...prev, file.name]);
    try {
      const text       = await file.text();
      const isFragment = isOmegaFragment(text);

      if (isFragment) {
        const API  = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
        const form = new FormData();
        form.append('file', file);
        const res  = await fetch(`${API}/api/agents/load-fragment?workspaceId=${workspaceId}`, { method: 'POST', body: form });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Erro ao carregar fragmento');
        onFragmentActivated?.(data.agent?.id, data.agent?.name);
        setPendingFiles(prev => [...prev, { name: data.agent?.name ?? file.name, type: 'fragment', content: text.slice(0, 40000), isFragment: true }]);
        setInput(prev => prev || 'Olá! Pode se apresentar e listar suas capacidades principais?');
      } else {
        setPendingFiles(prev => [...prev, { name: file.name, type: 'document', content: text.slice(0, 40000), isFragment: false }]);
        setInput(prev => prev || `Analise o documento "${file.name}" e me dê um resumo dos pontos principais.`);
      }
    } catch (err: any) {
      console.error('Erro ao processar arquivo:', err.message);
    } finally {
      setUploadingNames(prev => prev.filter(n => n !== file.name));
    }
  }, [workspaceId, onFragmentActivated]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files ?? []).forEach(processFile);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    Array.from(e.dataTransfer.files).forEach(processFile);
  };

  // ── Enviar ────────────────────────────────────────────────────────────────
  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    const documentContext = pendingFiles.length > 0
      ? pendingFiles.map(f => `\n\n═══ ARQUIVO: ${f.name} ═══\n${f.content}\n═══════════════════════\n`).join('')
      : undefined;
    onSend(input, mode, documentContext);
    setInput('');
    setPendingFiles([]);
    if (textareaRef.current) textareaRef.current.style.height = '42px';
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const removeFile = (name: string) => setPendingFiles(prev => prev.filter(f => f.name !== name));
  const canSend = !!input.trim() && !isLoading;

  const hasAttachments = pendingFiles.length > 0 || uploadingNames.length > 0;

  return (
    <div
      onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      style={{
        // ✅ FIX PRINCIPAL: flex-shrink-0 + position sticky na bottom
        position:       'relative',
        flexShrink:     0,
        width:          '100%',
        maxHeight:      '260px',      // ← limite máximo do componente inteiro
        display:        'flex',
        flexDirection:  'column',
        background:     'rgba(7,13,9,0.95)',
        backdropFilter: 'blur(20px)',
        borderTop:      isDragging
          ? '1px solid rgba(34,197,94,0.5)'
          : '1px solid rgba(34,197,94,0.08)',
        transition:     'border-color 0.2s',
        zIndex:         10,
      }}
    >
      {/* Drag overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'absolute', inset: 0, zIndex: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(34,197,94,0.05)',
              border: '2px dashed rgba(34,197,94,0.35)',
              pointerEvents: 'none',
            }}
          >
            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'rgba(74,222,128,0.8)' }}>
              📎 Solte o arquivo aqui
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <input
        ref={fileInputRef} type="file" multiple
        accept=".md,.txt,.ts,.tsx,.js,.json,.pdf,.docx,.doc,.csv,.yaml,.yml"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* ── Chips de arquivo ── SCROLLÁVEL com altura máxima fixa ─────────── */}
      <AnimatePresence>
        {hasAttachments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              // ✅ FIX: altura máxima + scroll interno — não empurra o input
              maxHeight:    '80px',
              overflowY:    'auto',
              overflowX:    'hidden',
              padding:      '8px 16px 4px',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(34,197,94,0.1) transparent',
              flexShrink:   0,
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
              {/* Uploading */}
              {uploadingNames.map(name => (
                <div key={name} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '3px 8px', borderRadius: '6px', fontSize: '0.7rem',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(156,163,175,0.5)',
                }}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{ width: '10px', height: '10px', borderRadius: '50%', border: '1.5px solid currentColor', borderTopColor: 'transparent' }}
                  />
                  <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                </div>
              ))}

              {/* Chips prontos */}
              {pendingFiles.map(f => (
                <motion.div key={f.name}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    padding: '3px 8px', borderRadius: '6px', fontSize: '0.7rem',
                    background: f.type === 'fragment' ? 'rgba(139,92,246,0.12)' : 'rgba(34,197,94,0.1)',
                    border:     f.type === 'fragment' ? '1px solid rgba(139,92,246,0.25)' : '1px solid rgba(34,197,94,0.2)',
                    color:      f.type === 'fragment' ? '#c084fc' : '#4ade80',
                  }}
                >
                  <FileIcon name={f.name} />
                  <span style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {f.name}
                  </span>
                  <span style={{ opacity: 0.6, fontSize: '0.65rem' }}>
                    {f.type === 'fragment' ? '🧬' : '📄'}
                  </span>
                  <button
                    onClick={() => removeFile(f.name)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '1px', opacity: 0.5, lineHeight: 1 }}
                  >
                    <X style={{ width: '10px', height: '10px' }} />
                  </button>
                </motion.div>
              ))}

              {pendingFiles.length > 0 && (
                <span style={{ fontSize: '0.6rem', color: 'rgba(74,222,128,0.35)', marginLeft: '2px' }}>
                  ↑ enviado junto com a próxima mensagem
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Row principal — sempre visível ────────────────────────────────── */}
      <div style={{
        display:    'flex',
        alignItems: 'flex-end',
        gap:        '8px',
        padding:    '10px 16px',
        flexShrink: 0,   // ← nunca encolhe
      }}>

        {/* LEFT: Mode + XP */}
        <div style={{ display: 'flex', gap: '6px', flexShrink: 0, paddingBottom: '2px' }}>

          {/* Modo */}
          <div style={{ position: 'relative' }}>
            <motion.button
              ref={modeButtonRef}
              whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
              onClick={() => setShowModePopup(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '36px', height: '36px', borderRadius: '10px',
                background: mode === 'QUICK' ? 'rgba(34,197,94,0.12)' : 'rgba(139,92,246,0.12)',
                border:     mode === 'QUICK' ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(139,92,246,0.2)',
                color:      mode === 'QUICK' ? '#4ade80' : '#c084fc',
                cursor: 'pointer',
              }}
              title="Modo de resposta"
            >
              <Zap style={{ width: '15px', height: '15px' }} />
            </motion.button>

            <AnimatePresence>
              {showModePopup && (
                <motion.div data-popup="mode"
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.95 }}
                  style={{
                    position: 'absolute', bottom: '100%', marginBottom: '8px', left: 0,
                    width: '176px', padding: '10px', borderRadius: '12px', zIndex: 50,
                    background: 'rgba(9,15,11,0.98)',
                    border: '1px solid rgba(34,197,94,0.12)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  }}
                >
                  <p style={{ fontSize: '0.6rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(156,163,175,0.4)', padding: '0 4px' }}>
                    Modo de resposta
                  </p>
                  {(['QUICK', 'DEEP'] as const).map(m => (
                    <motion.button key={m} whileHover={{ x: 3 }}
                      onClick={() => { onModeChange?.(m); setShowModePopup(false); }}
                      style={{
                        display: 'block', width: '100%', padding: '7px 10px',
                        borderRadius: '8px', fontSize: '0.75rem', textAlign: 'left',
                        marginBottom: '4px', border: 'none', cursor: 'pointer',
                        background: mode === m
                          ? m === 'QUICK' ? 'rgba(34,197,94,0.12)' : 'rgba(139,92,246,0.12)'
                          : 'transparent',
                        color: mode === m
                          ? m === 'QUICK' ? '#4ade80' : '#c084fc'
                          : 'rgba(156,163,175,0.4)',
                      }}
                    >
                      {m === 'QUICK' ? '⚡ QUICK — rápido' : '🧠 DEEP — profundo'}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* XP */}
          <div style={{ position: 'relative' }}>
            <motion.button
              ref={xpButtonRef}
              whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
              onClick={() => setShowXpPopup(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'rgba(139,92,246,0.1)',
                border: '1px solid rgba(139,92,246,0.18)',
                color: '#a78bfa', cursor: 'pointer',
              }}
              title="Stats do agente"
            >
              <Wand2 style={{ width: '15px', height: '15px' }} />
            </motion.button>

            <AnimatePresence>
              {showXpPopup && (
                <motion.div data-popup="xp"
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.95 }}
                  style={{
                    position: 'absolute', bottom: '100%', marginBottom: '8px', left: 0,
                    width: '200px', padding: '12px', borderRadius: '12px', zIndex: 50,
                    background: 'rgba(9,15,11,0.98)',
                    border: '1px solid rgba(139,92,246,0.15)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  }}
                >
                  <p style={{ fontSize: '0.72rem', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#a78bfa' }}>
                    Nível: AGENTE
                  </p>
                  <div style={{ width: '100%', borderRadius: '99px', height: '5px', marginBottom: '4px', background: 'rgba(255,255,255,0.06)' }}>
                    <div style={{ height: '5px', borderRadius: '99px', width: '65%', background: 'linear-gradient(90deg, #8b5cf6, #ec4899)' }} />
                  </div>
                  <p style={{ fontSize: '0.68rem', marginBottom: '10px', color: 'rgba(156,163,175,0.4)' }}>650 / 1000 XP</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div>
                      <p style={{ fontSize: '0.65rem', color: 'rgba(156,163,175,0.4)', marginBottom: '2px' }}>Chats</p>
                      <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#4ade80', margin: 0 }}>42</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.65rem', color: 'rgba(156,163,175,0.4)', marginBottom: '2px' }}>Deep</p>
                      <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#818cf8', margin: 0 }}>156/500</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* TEXTAREA */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            disabled={isLoading}
            placeholder={
              pendingFiles.length > 0
                ? `Pergunte sobre ${pendingFiles.map(f => f.name).join(', ')}...`
                : 'Digite sua mensagem... (Shift+Enter para nova linha)'
            }
            rows={1}
            style={{
              width:        '100%',
              height:       '42px',
              maxHeight:    '120px',
              overflowY:    'auto',
              resize:       'none',
              padding:      '10px 14px',
              borderRadius: '10px',
              fontSize:     '0.875rem',
              lineHeight:   '1.5',
              outline:      'none',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(34,197,94,0.15) transparent',
              background: hasAttachments ? 'rgba(34,197,94,0.04)' : 'rgba(255,255,255,0.03)',
              border:     hasAttachments ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(34,197,94,0.1)',
              color:      '#e2e8f0',
              opacity:    isLoading ? 0.5 : 1,
              boxSizing:  'border-box',
              transition: 'border-color 0.15s',
            }}
            onFocus={e  => { e.target.style.borderColor = 'rgba(34,197,94,0.35)'; }}
            onBlur={e   => { e.target.style.borderColor = hasAttachments ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.1)'; }}
          />
        </div>

        {/* RIGHT: Attach + Mic + Send */}
        <div style={{ display: 'flex', gap: '6px', flexShrink: 0, paddingBottom: '2px' }}>

          {/* Attach */}
          <motion.button
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
            onClick={() => fileInputRef.current?.click()}
            title="Anexar documento ou fragmento"
            style={{
              position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer',
              background: hasAttachments ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.03)',
              border:     hasAttachments ? '1px solid rgba(34,197,94,0.25)' : '1px solid rgba(255,255,255,0.07)',
              color:      hasAttachments ? '#4ade80' : 'rgba(156,163,175,0.5)',
            }}
          >
            <Paperclip style={{ width: '15px', height: '15px' }} />
            {pendingFiles.length > 0 && (
              <span style={{
                position: 'absolute', top: '-4px', right: '-4px',
                width: '16px', height: '16px', borderRadius: '50%',
                fontSize: '0.6rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#22c55e', color: '#000',
              }}>
                {pendingFiles.length}
              </span>
            )}
          </motion.button>

          {/* Mic */}
          <motion.button
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
            title="Voz (em breve)"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              color: 'rgba(156,163,175,0.5)',
            }}
          >
            <Mic style={{ width: '15px', height: '15px' }} />
          </motion.button>

          {/* Send */}
          <motion.button
            whileHover={{ scale: canSend ? 1.06 : 1 }}
            whileTap={{ scale: canSend ? 0.94 : 1 }}
            onClick={handleSend}
            disabled={!canSend}
            title="Enviar"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '36px', height: '36px', borderRadius: '10px',
              background: canSend ? 'rgba(34,197,94,0.9)' : 'rgba(34,197,94,0.1)',
              border: '1px solid rgba(34,197,94,0.3)',
              color:  canSend ? '#000' : 'rgba(74,222,128,0.3)',
              cursor: canSend ? 'pointer' : 'not-allowed',
              transition: 'all 0.15s',
            }}
          >
            {isLoading
              ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
                  <Zap style={{ width: '15px', height: '15px' }} />
                </motion.div>
              : <Send style={{ width: '15px', height: '15px' }} />
            }
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;

// EOF — Evolution Hash: chat.input.0044.20260306
