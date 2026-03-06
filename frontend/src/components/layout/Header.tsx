

'use client';

import * as React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { orusGreenWhiteTheme } from '../../lib/theme-orus';

interface HeaderProps {
  user?: {
    name: string;
    avatar?: string;
  };
  onWorkspaceClick?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onWorkspaceClick, onLogout }) => {
  const { language, setLanguage, t, languages } = useLanguage();
  const [langMenuOpen, setLangMenuOpen] = React.useState(false);

  return (
    <header
      className="sticky top-0 z-50 border-b transition-colors"
      style={{
        backgroundColor: orusGreenWhiteTheme.secondary,
        borderBottomColor: orusGreenWhiteTheme.secondary,
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: orusGreenWhiteTheme.primary }}
            >
              O
            </div>
            <div className="hidden sm:block">
              <h1
                className="text-lg font-bold"
                style={{ color: orusGreenWhiteTheme.primary }}
              >
                {t('header.logo')}
              </h1>
              <p className="text-xs" style={{ color: orusGreenWhiteTheme.secondary }}>
                {t('header.tagline')}
              </p>
            </div>
          </div>

          {/* Center - Search (optional) */}
          <div className="hidden md:flex flex-1 mx-8">
            <input
              type="text"
              placeholder={t('header.searchPlaceholder')}
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
              style={{
                borderColor: orusGreenWhiteTheme.secondary,
                backgroundColor: orusGreenWhiteTheme.secondary,
              }}
            />
          </div>

          {/* Right - User menu, Language, Logout */}
          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100"
                style={{ color: orusGreenWhiteTheme.secondary }}
              >
                {language.toUpperCase()}
              </button>
              {langMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-32 rounded-lg shadow-lg border"
                  style={{
                    backgroundColor: orusGreenWhiteTheme.secondary,
                    borderColor: orusGreenWhiteTheme.secondary,
                  }}
                >
                  {Object.entries(languages).map(([code, name]) => (
                    <button
                      key={code}
                      onClick={() => {
                        setLanguage(code as any);
                        setLangMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                      style={{
                        color: language === code ? orusGreenWhiteTheme.primary : orusGreenWhiteTheme.secondary,
                      }}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Avatar */}
            {user && (
              <div className="flex items-center gap-2">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                ) : (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: orusGreenWhiteTheme.primary }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden sm:inline text-sm font-medium">{user.name}</span>
              </div>
            )}

            {/* Logout button */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: orusGreenWhiteTheme.secondary,
                  color: orusGreenWhiteTheme.secondary,
                }}
              >
                {t('nav.logout')}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
