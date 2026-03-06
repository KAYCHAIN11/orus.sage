'use client';

import React, { useState } from 'react';
import { useWorkspaces } from '../../lib/hooks/useWorkspace';
import { useRouter } from 'next/navigation';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { createWorkspace } = useWorkspaces();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('📁');
  const [color, setColor] = useState('#00D26A');
  const [loading, setLoading] = useState(false);

  const icons = ['📁', '🚀', '💡', '🎯', '⚡', '🔥', '💼', '🎨', '📊', '🛠️'];
  const colors = ['#00D26A', '#2E7BFF', '#A855F7', '#F59E0B', '#EF4444', '#8B5CF6'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const workspace = await createWorkspace({
        name,
        description,
        icon,
        color,
      });

      if (workspace) {
        router.push(`/workspace/${workspace.id}`);
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '2rem',
          maxWidth: '500px',
          width: '90%',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.5rem', fontWeight: '600' }}>
          Criar Novo Workspace
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Nome do Workspace
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Projeto Principal"
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '1rem',
              }}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Descrição (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="O que você vai trabalhar neste workspace?"
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '1rem',
                resize: 'none',
              }}
            />
          </div>

          {/* Icon Picker */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Ícone
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {icons.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  style={{
                    width: '48px',
                    height: '48px',
                    fontSize: '1.5rem',
                    border: icon === emoji ? '2px solid #00D26A' : '1px solid #E5E7EB',
                    borderRadius: '8px',
                    backgroundColor: icon === emoji ? '#F0FDF4' : 'white',
                    cursor: 'pointer',
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Cor
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    backgroundColor: c,
                    border: color === c ? '3px solid #111827' : 'none',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: '#00D26A',
                color: 'white',
                cursor: loading || !name.trim() ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                opacity: loading || !name.trim() ? 0.5 : 1,
              }}
            >
              {loading ? 'Criando...' : 'Criar Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
