'use client';

import * as React from 'react'
import { useState } from 'react';
import Link from 'next/link';
import { orusGreenWhiteTheme } from '../../lib/theme-orus';

interface NavItem {
  label: string;
  href: string;
  icon?: string;
}

interface MobileNavProps {
  items: NavItem[];
}

export const MobileNav: React.FC<MobileNavProps> = ({ items }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden fixed bottom-4 right-4 z-40 p-3 rounded-full shadow-lg transition-transform"
        style={{ backgroundColor: orusGreenWhiteTheme.primary }}
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={open ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
          />
        </svg>
      </button>

      {/* Mobile Drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-30 flex">
          {/* Overlay */}
          <div
            className="flex-1"
            onClick={() => setOpen(false)}
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          />

          {/* Drawer */}
          <div
            className="w-64 shadow-lg overflow-y-auto"
            style={{ backgroundColor: orusGreenWhiteTheme.secondary }}
          >
            <div className="p-4 space-y-2">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors"
                  style={{
                    color: orusGreenWhiteTheme.primary,
                  }}
                >
                  {item.icon && <span className="text-lg">{item.icon}</span>}
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
