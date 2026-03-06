'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { orusGreenWhiteTheme } from '@/lib/theme-orus';

interface RegisterFormProps {
  onSubmit: (data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => Promise<void>;
  loading?: boolean;
  error?: string;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, loading = false, error }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [localError, setLocalError] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;
    return strength;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, password: value });
    setPasswordStrength(calculatePasswordStrength(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setLocalError('Todos os campos são obrigatórios');
      return;
    }

    if (!formData.email.includes('@')) {
      setLocalError('Email inválido');
      return;
    }

    if (formData.password.length < 8) {
      setLocalError('Senha deve ter pelo menos 8 caracteres');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Senhas não correspondem');
      return;
    }

    if (!acceptedTerms) {
      setLocalError('Aceite os termos de serviço');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setLocalError(err.message || 'Erro ao registrar');
    }
  };

  const passwordStrengthColor = [
    '#EF4444',
    '#F97316',
    '#FBBF24',
    '#00D26A',
  ][passwordStrength - 1] || '#D1D5DB';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <h2 className="text-2xl font-bold" style={{ color: orusGreenWhiteTheme.secondary }}>
        Criar Conta
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

      {/* Name */}
      <Input
        label="Nome Completo"
        placeholder="João Silva"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />

      {/* Email */}
      <Input
        label="Email"
        type="email"
        placeholder="seu@email.com"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />

      {/* Password */}
      <div>
        <Input
          label="Senha"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handlePasswordChange}
        />
        {formData.password && (
          <>
            <div className="mt-2 flex gap-1">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="flex-1 h-1 rounded-full"
                  style={{
                    backgroundColor: i < passwordStrength ? passwordStrengthColor : '#D1D5DB',
                  }}
                />
              ))}
            </div>
            <p className="text-xs mt-1" style={{ color: passwordStrengthColor }}>
              {passwordStrength === 0 && 'Muito fraca'}
              {passwordStrength === 1 && 'Fraca'}
              {passwordStrength === 2 && 'Média'}
              {passwordStrength === 3 && 'Forte'}
              {passwordStrength === 4 && 'Muito forte'}
            </p>
          </>
        )}
      </div>

      {/* Confirm Password */}
      <Input
        label="Confirmar Senha"
        type="password"
        placeholder="••••••••"
        value={formData.confirmPassword}
        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
      />

      {/* Terms Acceptance */}
      <div className="flex items-start">
        <input
          type="checkbox"
          id="terms"
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          className="w-4 h-4 rounded mt-1"
          style={{ accentColor: orusGreenWhiteTheme.primary }}
        />
        <label htmlFor="terms" className="ml-3 text-sm" style={{ color: orusGreenWhiteTheme.secondary }}>
          Concordo com os{' '}
          <Link href="/terms" className="underline" style={{ color: orusGreenWhiteTheme.primary }}>
            termos de serviço
          </Link>{' '}
          e{' '}
          <Link href="/privacy" className="underline" style={{ color: orusGreenWhiteTheme.primary }}>
            política de privacidade
          </Link>
        </label>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={loading}
        className="w-full"
      >
        {loading ? 'Criando conta...' : 'Cadastrar'}
      </Button>

      {/* Login Link */}
      <p className="text-center text-sm" style={{ color: orusGreenWhiteTheme.secondary }}>
        Já tem conta?{' '}
        <Link
          href="/auth/login"
          className="transition-colors font-medium"
          style={{ color: orusGreenWhiteTheme.primary }}
        >
          Entrar
        </Link>
      </p>
    </form>
  );
};
