'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { orusGreenWhiteTheme } from '@/lib/theme-orus';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  loading?: boolean;
  error?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, loading = false, error }) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!email || !password) {
      setLocalError('Email e senha são obrigatórios');
      return;
    }

    if (!email.includes('@')) {
      setLocalError('Email inválido');
      return;
    }

    try {
      await onSubmit(email, password);
      if (rememberMe) {
        localStorage.setItem('orus_email', email);
      }
    } catch (err: any) {
      setLocalError(err.message || 'Erro ao fazer login');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <h2 className="text-2xl font-bold" style={{ color: orusGreenWhiteTheme.secondary }}>
        Entrar
      </h2>

      {/* Error Alert */}
      {(error || localError) && (
        <div
          className="p-3 rounded-lg border text-sm"
          style={{
            backgroundColor: '#FEE2E2',
            borderColor: '#EF4444',
            color: '#991B1B',
          }}
        >
          {error || localError}
        </div>
      )}

      {/* Email */}
      <Input
        label="Email"
        type="email"
        placeholder="seu@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        variant={localError && !email ? 'error' : 'default'}
      />

      {/* Password */}
      <Input
        label="Senha"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        variant={localError && !password ? 'error' : 'default'}
      />

      {/* Remember Me */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="remember"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="w-4 h-4 rounded"
          style={{ accentColor: orusGreenWhiteTheme.primary }}
        />
        <label htmlFor="remember" className="ml-2 text-sm" style={{ color: orusGreenWhiteTheme.secondary }}>
          Lembrar de mim
        </label>
      </div>

      {/* Forgot Password Link */}
      <div className="text-right">
        <Link
          href="/auth/forgot-password"
          className="text-sm transition-colors"
          style={{ color: orusGreenWhiteTheme.primary }}
        >
          Esqueceu a senha?
        </Link>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={loading}
        className="w-full"
      >
        {loading ? 'Entrando...' : 'Entrar'}
      </Button>

      {/* Divider */}
      <div className="relative my-6">
        <div
          className="absolute inset-0 flex items-center"
          style={{ backgroundColor: orusGreenWhiteTheme.secondary }}
        >
          <div className="w-full" style={{ borderTopColor: orusGreenWhiteTheme.secondary, borderTopWidth: '1px' }} />
        </div>
        <div className="relative flex justify-center text-sm">
          <span
            className="px-2"
            style={{
              backgroundColor: orusGreenWhiteTheme.secondary,
              color: orusGreenWhiteTheme.secondary,
            }}
          >
            ou
          </span>
        </div>
      </div>

      {/* OAuth Buttons (Placeholder) */}
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
        </svg>
        Entrar com Google
      </Button>

      {/* Register Link */}
      <p className="text-center text-sm" style={{ color: orusGreenWhiteTheme.secondary }}>
        Não tem conta?{' '}
        <Link
          href="/auth/register"
          className="transition-colors font-medium"
          style={{ color: orusGreenWhiteTheme.primary }}
        >
          Cadastre-se
        </Link>
      </p>
    </form>
  );
};
