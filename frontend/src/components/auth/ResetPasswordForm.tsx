'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { orusGreenWhiteTheme } from '@/lib/theme-orus';

interface ResetPasswordFormProps {
  token: string;
  onSubmit: (token: string, password: string) => Promise<void>;
  loading?: boolean;
  error?: string;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  token,
  onSubmit,
  loading = false,
  error,
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [success, setSuccess] = useState(false);
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
    setPassword(value);
    setPasswordStrength(calculatePasswordStrength(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!password || !confirmPassword) {
      setLocalError('Ambas as senhas são obrigatórias');
      return;
    }

    if (password.length < 8) {
      setLocalError('Senha deve ter pelo menos 8 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Senhas não correspondem');
      return;
    }

    try {
      await onSubmit(token, password);
      setSuccess(true);
    } catch (err: any) {
      setLocalError(err.message || 'Erro ao redefinir senha');
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
            ✓ Senha redefinida com sucesso!
          </p>
          <p className="text-sm text-green-600 mt-2">
            Você pode fazer login com sua nova senha.
          </p>
        </div>
      </div>
    );
  }

  const passwordStrengthColor = [
    '#EF4444',
    '#F97316',
    '#FBBF24',
    '#00D26A',
  ][passwordStrength - 1] || '#D1D5DB';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold" style={{ color: orusGreenWhiteTheme.secondary }}>
        Redefinir Senha
      </h2>

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

      <div>
        <Input
          label="Nova Senha"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={handlePasswordChange}
        />
        {password && (
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

      <Input
        label="Confirmar Senha"
        type="password"
        placeholder="••••••••"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={loading}
        className="w-full"
      >
        {loading ? 'Redefinindo...' : 'Redefinir Senha'}
      </Button>
    </form>
  );
};
