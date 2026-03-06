'use client';

import * as React from 'react';
import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { Message } from './ChatContainer';
import { orusGreenWhiteTheme } from '../../lib/theme-orus';

interface MessageListProps {
  messages: Message[];
  loading?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  loading = false,
}) => {
  const endRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // AUTO-SCROLL - ROBUSTO
  useEffect(() => {
    // Scroll imediato
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  // FALLBACK: Se o scroll acima não funcionar, tenta outra forma
  useEffect(() => {
    const timer = setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [messages, loading]);

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        backgroundColor: orusGreenWhiteTheme.secondary[100],
        scrollBehavior: 'smooth',
      }}
    >
      {messages.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💬</div>
            <p
              style={{
                fontSize: '1.125rem',
                fontWeight: '500',
                margin: 0,
                color: orusGreenWhiteTheme.secondary[900],
              }}
            >
              Comece uma conversa
            </p>
            <p
              style={{
                fontSize: '0.875rem',
                marginTop: '8px',
                margin: 0,
                color: orusGreenWhiteTheme.secondary[700],
              }}
            >
              Digite uma mensagem para começar
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={{ ...message, timestamp: message.timestamp instanceof Date ? message.timestamp : new Date(message.timestamp) }} />
          ))}
          {loading && <TypingIndicator />}
          {/* ANCHOR - Scroll até aqui */}
          <div
            ref={endRef}
            style={{
              height: '1px',
              width: '100%',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default MessageList;