'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { orusGreenWhiteTheme } from '../../lib/theme-orus';

interface ForgotPasswordFormProps {
  onSubmit: (email: string) => Promise<void>;
  loading?: boolean;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onSubmit, loading = false }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Email válido é obrigatório');
      return;
    }

    try {
      await onSubmit(email);
      setSuccess(true);
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar link de recuperação');
    }
  };

  if (success) {
    return (
      <div className="space-y-6 text-center">
        <div
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: '#ECFDF5',
            borderColor: '#00D26A',
          }}
        >
          <p className="text-green-700 font-medium">
            ✓ Link enviado com sucesso!
          </p>
          <p className="text-sm text-green-600 mt-2">
            Verifique seu email para recuperar sua senha.
          </p>
        </div>
        <Link
          href="/auth/login"
          className="text-sm transition-colors font-medium"
          style={{ color: orusGreenWhiteTheme.primary }}
        >
          Voltar ao login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: orusGreenWhiteTheme.secondary }}>
          Recuperar Senha
        </h2>
        <p className="text-sm" style={{ color: orusGreenWhiteTheme.secondary }}>
          Digite seu email para receber um link de recuperação
        </p>
      </div>

      {error && (
        <div
          className="p-3 rounded-lg border text-sm"
          style={{
            backgroundColor: '#FEE2E2',
            borderColor: '#EF4444',
            color: '#991B1B',
          }}
        >
          {error}
        </div>
      )}

      <Input
        label="Email"
        type="email"
        placeholder="seu@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={loading}
        className="w-full"
      >
        {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
      </Button>

      <div className="text-center">
        <Link
          href="/auth/login"
          className="text-sm transition-colors"
          style={{ color: orusGreenWhiteTheme.primary }}
        >
          Voltar ao login
        </Link>
      </div>
    </form>
  );
};
