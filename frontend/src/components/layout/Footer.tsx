'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';
import { orusGreenWhiteTheme } from '../../lib/theme-orus';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer
      className="border-t mt-12"
      style={{
        backgroundColor: orusGreenWhiteTheme.secondary,
        borderTopColor: orusGreenWhiteTheme.secondary,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3
              className="font-bold mb-4"
              style={{ color: orusGreenWhiteTheme.primary }}
            >
              ORUS SAGE
            </h3>
            <p className="text-sm" style={{ color: orusGreenWhiteTheme.secondary }}>
              Comunicação Simbiôtica Suprema
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4" style={{ color: orusGreenWhiteTheme.secondary }}>
              {t('nav.help')}
            </h4>
            <ul className="space-y-2 text-sm" style={{ color: orusGreenWhiteTheme.secondary }}>
              <li>
                <Link href="/docs" className="hover:underline">
                  Documentação
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:underline">
                  Suporte
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4" style={{ color: orusGreenWhiteTheme.secondary }}>
              Legal
            </h4>
            <ul className="space-y-2 text-sm" style={{ color: orusGreenWhiteTheme.secondary }}>
              <li>
                <Link href="/privacy" className="hover:underline">
                  {t('footer.links.privacy')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:underline">
                  {t('footer.links.terms')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div
          className="border-t pt-8 text-center text-sm"
          style={{
            borderTopColor: orusGreenWhiteTheme.secondary,
            color: orusGreenWhiteTheme.secondary,
          }}
        >
          <p>{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
};
