'use client';

import React from 'react';
import Link from 'next/link';
import { Workspace } from '../../lib/workspace';
interface WorkspaceCardProps {
  workspace: Workspace;
  onDelete?: (id: string) => void;
}

export const WorkspaceCard: React.FC<WorkspaceCardProps> = ({ workspace, onDelete }) => {
  return (
    <Link href={`/workspace/${workspace.id}`}>
      <div
        style={{
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          padding: '1.5rem',
          backgroundColor: 'white',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {/* Icon & Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: workspace.color || '#00D26A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
            }}
          >
            {workspace.icon || '📁'}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>
              {workspace.name}
            </h3>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#6B7280' }}>
              {workspace.stats.totalChats} chats
            </p>
          </div>
        </div>

        {/* Description */}
        {workspace.description && (
          <p style={{
            fontSize: '0.875rem',
            color: '#6B7280',
            marginBottom: '1rem',
            lineHeight: '1.5',
          }}>
            {workspace.description}
          </p>
        )}

        {/* Stats */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          fontSize: '0.75rem',
          color: '#9CA3AF',
        }}>
          <span>💬 {workspace.stats.totalMessages} mensagens</span>
          <span>👥 {workspace.stats.totalMembers} membros</span>
        </div>

        {/* Actions */}
        {onDelete && (
          <button
            onClick={(e) => {
              e.preventDefault();
              if (confirm(`Deletar workspace "${workspace.name}"?`)) {
                onDelete(workspace.id);
              }
            }}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              color: '#EF4444',
              border: '1px solid #FEE2E2',
              borderRadius: '6px',
              backgroundColor: 'white',
              cursor: 'pointer',
            }}
          >
            Deletar
          </button>
        )}
      </div>
    </Link>
  );
};
