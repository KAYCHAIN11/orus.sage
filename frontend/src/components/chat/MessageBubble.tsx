'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Download, Check, X, Terminal, FileCode } from 'lucide-react';
import type { Message } from './ChatContainer';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CodeBlock { type: 'code'; lang: string; content: string; }
interface TextBlock  { type: 'text'; content: string; }
type Block = CodeBlock | TextBlock;

// ─── Block Splitter ───────────────────────────────────────────────────────────

function splitBlocks(raw: string): Block[] {
  const blocks: Block[] = [];
  const re = /```(\w*)\n?([\s\S]*?)```/g;
  let last = 0, m: RegExpExecArray | null;
  while ((m = re.exec(raw)) !== null) {
    if (m.index > last) blocks.push({ type: 'text', content: raw.slice(last, m.index) });
    blocks.push({ type: 'code', lang: m[1] || 'txt', content: m[2].trimEnd() });
    last = m.index + m[0].length;
  }
  if (last < raw.length) blocks.push({ type: 'text', content: raw.slice(last) });
  return blocks;
}

// ─── Inline Markdown ──────────────────────────────────────────────────────────

function renderInline(text: string, key: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const re = /(\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`|~~(.+?)~~)/g;
  let last = 0, m: RegExpExecArray | null, idx = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[2])      parts.push(<strong key={`${key}-b${idx++}`} style={{ fontWeight: 700, color: '#f1f5f9' }}>{m[2]}</strong>);
    else if (m[3]) parts.push(<em     key={`${key}-i${idx++}`} style={{ fontStyle: 'italic', color: '#cbd5e1' }}>{m[3]}</em>);
    else if (m[4]) parts.push(
      <code key={`${key}-c${idx++}`} style={{
        fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78em',
        padding: '2px 6px', borderRadius: '4px',
        background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)',
        color: '#6ee7b7',
      }}>{m[4]}</code>
    );
    else if (m[5]) parts.push(<s key={`${key}-s${idx++}`} style={{ opacity: 0.45 }}>{m[5]}</s>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

// ─── Text Block Renderer ──────────────────────────────────────────────────────

function renderText(content: string, bk: string): React.ReactNode {
  const lines = content.split('\n');
  const els: React.ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i], key = `${bk}-${i}`;
    if (!line.trim()) { els.push(<div key={key} style={{ height: '8px' }} />); i++; continue; }

    if (line.startsWith('# ')) {
      els.push(
        <div key={key} style={{ margin: '18px 0 8px' }}>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.3 }}>
            {renderInline(line.slice(2), key)}
          </h1>
          <div style={{ height: '2px', width: '32px', background: 'linear-gradient(90deg,#10b981,transparent)', marginTop: '5px', borderRadius: '2px' }} />
        </div>
      );
      i++; continue;
    }
    if (line.startsWith('## ')) {
      els.push(
        <h2 key={key} style={{ fontSize: '0.92rem', fontWeight: 600, color: '#cbd5e1', margin: '14px 0 5px', borderLeft: '3px solid #10b981', paddingLeft: '10px', lineHeight: 1.4 }}>
          {renderInline(line.slice(3), key)}
        </h2>
      );
      i++; continue;
    }
    if (line.startsWith('### ')) {
      els.push(
        <h3 key={key} style={{ fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', margin: '10px 0 4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {renderInline(line.slice(4), key)}
        </h3>
      );
      i++; continue;
    }
    if (/^[-*] /.test(line)) {
      els.push(
        <div key={key} style={{ display: 'flex', gap: '9px', margin: '4px 0', alignItems: 'flex-start' }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981', flexShrink: 0, marginTop: '8px', display: 'inline-block' }} />
          <span style={{ fontSize: '0.875rem', lineHeight: '1.7', color: '#cbd5e1' }}>{renderInline(line.replace(/^[-*] /, ''), key)}</span>
        </div>
      );
      i++; continue;
    }
    if (/^\d+\. /.test(line)) {
      const num = line.match(/^(\d+)\./)?.[1];
      els.push(
        <div key={key} style={{ display: 'flex', gap: '9px', margin: '4px 0', alignItems: 'flex-start' }}>
          <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.72rem', minWidth: '16px', lineHeight: '1.7', fontFamily: 'monospace' }}>{num}.</span>
          <span style={{ fontSize: '0.875rem', lineHeight: '1.7', color: '#cbd5e1' }}>{renderInline(line.replace(/^\d+\. /, ''), key)}</span>
        </div>
      );
      i++; continue;
    }
    if (/^---+$/.test(line.trim())) {
      els.push(<div key={key} style={{ margin: '12px 0', height: '1px', background: 'linear-gradient(90deg,transparent,rgba(148,163,184,0.15),transparent)' }} />);
      i++; continue;
    }
    if (line.startsWith('> ')) {
      els.push(
        <div key={key} style={{ borderLeft: '2px solid rgba(16,185,129,0.4)', paddingLeft: '12px', margin: '6px 0', color: '#94a3b8', fontSize: '0.875rem', lineHeight: '1.65', fontStyle: 'italic' }}>
          {renderInline(line.slice(2), key)}
        </div>
      );
      i++; continue;
    }
    els.push(
      <p key={key} style={{ margin: '3px 0', fontSize: '0.875rem', lineHeight: '1.75', color: '#cbd5e1' }}>
        {renderInline(line, key)}
      </p>
    );
    i++;
  }
  return <>{els}</>;
}

// ─── Lang Config ──────────────────────────────────────────────────────────────

const LANG_CFG: Record<string, { accent: string; label: string }> = {
  typescript: { accent: '#3b82f6', label: 'TypeScript' },
  ts:         { accent: '#3b82f6', label: 'TypeScript' },
  tsx:        { accent: '#8b5cf6', label: 'TSX'        },
  javascript: { accent: '#f59e0b', label: 'JavaScript' },
  js:         { accent: '#f59e0b', label: 'JavaScript' },
  python:     { accent: '#10b981', label: 'Python'     },
  py:         { accent: '#10b981', label: 'Python'     },
  json:       { accent: '#f97316', label: 'JSON'       },
  html:       { accent: '#ef4444', label: 'HTML'       },
  css:        { accent: '#06b6d4', label: 'CSS'        },
  bash:       { accent: '#22c55e', label: 'Bash'       },
  sh:         { accent: '#22c55e', label: 'Shell'      },
  sql:        { accent: '#a855f7', label: 'SQL'        },
};

const LANG_EXT: Record<string, string> = {
  typescript: 'ts', ts: 'ts', tsx: 'tsx', javascript: 'js', js: 'js',
  python: 'py', py: 'py', json: 'json', html: 'html', css: 'css',
  bash: 'sh', sh: 'sh', sql: 'sql', yaml: 'yml', yml: 'yml',
};

// ─── Code Modal ───────────────────────────────────────────────────────────────

const CodeModal: React.FC<{
  lang: string;
  content: string;
  idx: number;
  onClose: () => void;
}> = ({ lang, content, idx, onClose }) => {
  const [copied, setCopied] = useState(false);
  const cfg   = LANG_CFG[lang.toLowerCase()] ?? { accent: '#64748b', label: lang || 'Code' };
  const ext   = LANG_EXT[lang.toLowerCase()] ?? 'txt';
  const lines = content.split('\n');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `codigo-${idx + 1}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 20 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '760px', maxHeight: '82vh',
          borderRadius: '16px', overflow: 'hidden',
          background: '#0d1117',
          border: `1px solid ${cfg.accent}35`,
          boxShadow: `0 0 0 1px ${cfg.accent}18, 0 24px 64px rgba(0,0,0,0.7)`,
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px',
          background: `${cfg.accent}12`,
          borderBottom: `1px solid ${cfg.accent}20`,
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '3px 10px', borderRadius: '6px',
              background: `${cfg.accent}20`, border: `1px solid ${cfg.accent}35`,
            }}>
              <Terminal size={12} color={cfg.accent} />
              <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: cfg.accent, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {cfg.label}
              </span>
            </div>
            <span style={{ fontSize: '0.68rem', color: '#475569', fontFamily: 'monospace' }}>
              {lines.length} linhas · {content.length} chars
            </span>
          </div>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: `${cfg.accent}25` }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownload}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 14px', borderRadius: '8px', border: 'none',
                cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600,
                background: `${cfg.accent}18`, color: cfg.accent, transition: 'all 0.15s',
              }}
            >
              <Download size={13} /> baixar .{ext}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCopy}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 14px', borderRadius: '8px', border: 'none',
                cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600,
                background: copied ? `${cfg.accent}30` : `${cfg.accent}18`,
                color: copied ? '#fff' : cfg.accent, transition: 'all 0.15s',
              }}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? 'copiado!' : 'copiar'}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.08, backgroundColor: 'rgba(239,68,68,0.15)' }}
              whileTap={{ scale: 0.92 }}
              onClick={onClose}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '30px', height: '30px', borderRadius: '8px', border: 'none',
                cursor: 'pointer', background: 'rgba(255,255,255,0.05)',
                color: '#64748b', transition: 'all 0.15s',
              }}
            >
              <X size={14} />
            </motion.button>
          </div>
        </div>

        {/* Code body */}
        <div style={{ overflowY: 'auto', overflowX: 'auto', flex: 1, padding: '12px 0' }}>
          <table style={{
            borderCollapse: 'collapse', width: '100%',
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: '0.82rem', lineHeight: '1.75',
          }}>
            <tbody>
              {lines.map((line, li) => (
                <tr key={li}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{
                    paddingLeft: '18px', paddingRight: '14px', textAlign: 'right',
                    color: '#2d3748', userSelect: 'none', fontSize: '0.7rem',
                    verticalAlign: 'top', width: '1%', whiteSpace: 'nowrap',
                  }}>
                    {li + 1}
                  </td>
                  <td style={{ paddingRight: '20px', whiteSpace: 'pre', color: '#e2e8f0', verticalAlign: 'top' }}>
                    {line || ' '}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Code Card (inline na mensagem) ──────────────────────────────────────────

const CodeCard: React.FC<{ lang: string; content: string; idx: number }> = ({ lang, content, idx }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const cfg     = LANG_CFG[lang.toLowerCase()] ?? { accent: '#64748b', label: lang || 'Code' };
  const lines   = content.split('\n');
  const preview = lines.slice(0, 3).join('\n');
  const hasMore = lines.length > 3;

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.01, boxShadow: `0 0 0 1px ${cfg.accent}45, 0 8px 32px rgba(0,0,0,0.5)` }}
        whileTap={{ scale: 0.99 }}
        onClick={() => setModalOpen(true)}
        style={{
          margin: '10px 0', borderRadius: '12px', cursor: 'pointer',
          border: `1px solid ${cfg.accent}28`, overflow: 'hidden',
          background: 'linear-gradient(135deg, #0d1117 0%, #0a0f14 100%)',
          boxShadow: `0 0 0 1px ${cfg.accent}15, 0 4px 16px rgba(0,0,0,0.4)`,
          transition: 'box-shadow 0.2s',
        }}
      >
        {/* Card header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 14px',
          background: `${cfg.accent}10`,
          borderBottom: `1px solid ${cfg.accent}18`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '2px 8px', borderRadius: '5px',
              background: `${cfg.accent}18`, border: `1px solid ${cfg.accent}30`,
            }}>
              <Terminal size={10} color={cfg.accent} />
              <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: cfg.accent, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                {cfg.label}
              </span>
            </div>
            <span style={{ fontSize: '0.62rem', color: '#475569', fontFamily: 'monospace' }}>
              {lines.length} linhas
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.62rem', color: cfg.accent, opacity: 0.7 }}>clique para abrir</span>
            <FileCode size={13} color={cfg.accent} style={{ opacity: 0.6 }} />
          </div>
        </div>

        {/* Preview */}
        <div style={{ padding: '12px 16px', position: 'relative' }}>
          <pre style={{
            margin: 0, fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: '0.78rem', lineHeight: '1.65', color: '#64748b',
            whiteSpace: 'pre', overflow: 'hidden', pointerEvents: 'none',
          }}>
            {preview}
          </pre>
          {hasMore && (
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px',
              background: 'linear-gradient(to top, #0d1117, transparent)',
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
              paddingBottom: '6px',
            }}>
              <span style={{ fontSize: '0.62rem', color: cfg.accent, opacity: 0.6, fontFamily: 'monospace' }}>
                +{lines.length - 3} linhas...
              </span>
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {modalOpen && (
          <CodeModal lang={lang} content={content} idx={idx} onClose={() => setModalOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

// ─── Action Bar ───────────────────────────────────────────────────────────────

const ActionBar: React.FC<{ message: Message }> = ({ message }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([message.content], { type: 'text/markdown' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `resposta-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const btnStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '5px',
    padding: '4px 10px', borderRadius: '6px', border: 'none',
    cursor: 'pointer', fontSize: '0.67rem', fontWeight: 500,
    background: 'rgba(255,255,255,0.04)', color: '#64748b', transition: 'all 0.15s',
  };

  return (
    <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
      <motion.button
        whileHover={{ backgroundColor: 'rgba(16,185,129,0.14)', color: '#6ee7b7' }}
        whileTap={{ scale: 0.95 }}
        onClick={handleCopy}
        style={{ ...btnStyle, color: copied ? '#6ee7b7' : '#64748b' }}
      >
        {copied ? <Check size={10} /> : <Copy size={10} />}
        {copied ? 'copiado!' : 'copiar resposta'}
      </motion.button>
      <motion.button
        whileHover={{ backgroundColor: 'rgba(16,185,129,0.14)', color: '#6ee7b7' }}
        whileTap={{ scale: 0.95 }}
        onClick={handleDownload}
        style={btnStyle}
      >
        <Download size={10} /> baixar .md
      </motion.button>
    </div>
  );
};

// ─── MessageBubble (export principal) ────────────────────────────────────────

export const MessageBubble: React.FC<{ message: Message; isLast: boolean }> = ({ message, isLast }) => {
  const isUser  = message.role === 'user';
  const blocks  = isUser ? null : splitBlocks(message.content);
  let codeIdx   = 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      style={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        marginBottom: '24px',
        gap: '12px',
        alignItems: 'flex-start',
      }}
    >
      {/* Avatar */}
      <div style={{
        width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
        background: isUser
          ? 'linear-gradient(135deg, #22c55e, #16a34a)'
          : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#000', fontSize: '0.65rem', fontWeight: 800,
        marginTop: '2px',
      }}>
        {isUser ? 'U' : null}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', maxWidth: isUser ? '68%' : '80%' }}>

        {/* Sender label */}
        <span style={{
          fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.08em',
          color: isUser ? 'rgba(74,222,128,0.45)' : '#10b981',
          marginBottom: '5px', textTransform: 'uppercase',
        }}>
          {isUser ? 'Você' : 'ORUS SAGE'}
        </span>

        {/* Bubble */}
        <div style={{
          padding: '14px 18px',
          borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
          background: isUser
            ? 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(22,163,74,0.1))'
            : 'linear-gradient(135deg, rgba(17,24,28,0.92), rgba(11,17,20,0.96))',
          border: isUser
            ? '1px solid rgba(34,197,94,0.22)'
            : '1px solid rgba(255,255,255,0.07)',
          color: isUser ? '#d1fae5' : '#cbd5e1',
          position: 'relative',
        }}>
          {!isUser && (
            <div style={{
              position: 'absolute', top: 0, left: '16px', right: '16px', height: '1px',
              background: 'linear-gradient(90deg,transparent,rgba(34,197,94,0.4),transparent)',
              opacity: 0.4,
            }} />
          )}

          {isUser ? (
            <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.7', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {message.content}
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {blocks!.map((block, bi) =>
                block.type === 'code'
                  ? <CodeCard key={bi} lang={block.lang} content={block.content} idx={codeIdx++} />
                  : <div key={bi}>{renderText(block.content, `tb${bi}`)}</div>
              )}
            </div>
          )}
        </div>

        {/* Action bar — sempre visível para AI */}
        {!isUser && <ActionBar message={message} />}

        {/* Metadata */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '4px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.6rem', color: '#1e293b' }}>
            {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </span>
          {message.metadata?.mode && (
            <span style={{
              fontSize: '0.58rem', padding: '1px 6px', borderRadius: '4px', fontWeight: 500,
              ...(message.metadata.mode === 'QUICK'
                ? { background: 'rgba(34,197,94,0.08)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.15)' }
                : { background: 'rgba(139,92,246,0.08)', color: '#c084fc', border: '1px solid rgba(139,92,246,0.15)' }),
            }}>
              {message.metadata.mode === 'QUICK' ? '⚡ QUICK' : '🔮 DEEP'}
            </span>
          )}
          {message.metadata?.latency && (
            <span style={{ fontSize: '0.58rem', color: '#1e293b' }}>{message.metadata.latency}ms</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;

// EOF — Evolution Hash: message.bubble.0050.20260305