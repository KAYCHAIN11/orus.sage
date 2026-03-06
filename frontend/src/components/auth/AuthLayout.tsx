'use client';

import React from 'react';
import { orusGreenWhiteTheme } from '../../lib/theme-orus';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
}

// Helper para garantir sempre uma string de cor
const getColor = (value: any, shade: number = 500): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;

  // Se for um objeto de escala (0, 50, 100, ..., 900)
  if (typeof value === 'object') {
    if (value[shade]) return value[shade];
    if (value[500]) return value[500];
    const keys = Object.keys(value);
    if (keys.length > 0) {
      const firstKey = keys[0];
      return value[firstKey];
    }
  }

  return String(value);
};

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title = 'ORUS SAGE',
  subtitle = 'Comunicação Simbiótica Suprema',
  backgroundImage,
}) => {
  // Extrair cores seguras
  const primaryColor = getColor(orusGreenWhiteTheme.primary, 500);
  const secondaryBg = getColor(orusGreenWhiteTheme.secondary, 50);
  const secondaryText = getColor(orusGreenWhiteTheme.secondary, 600);
  const secondaryBorder = getColor(orusGreenWhiteTheme.secondary, 200);

  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundColor: secondaryBg,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay */}
      {backgroundImage && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
          }}
        />
      )}

      <div className="relative w-full max-w-md">
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4"
            style={{ backgroundColor: primaryColor }}
          >
            O
          </div>
          <h1
            className="text-3xl font-bold"
            style={{ color: primaryColor }}
          >
            {title}
          </h1>
          <p
            className="text-sm mt-2"
            style={{ color: secondaryText }}
          >
            {subtitle}
          </p>
        </div>

        {/* Form Container */}
        <div
          className="rounded-lg shadow-md border p-8"
          style={{
            backgroundColor: '#FFFFFF',
            borderColor: secondaryBorder,
          }}
        >
          {children}
        </div>

        {/* Footer Info */}
        <div
          className="text-center mt-6 text-sm"
          style={{ color: secondaryText }}
        >
          <p>© 2025 ORUS SAGE. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
};
