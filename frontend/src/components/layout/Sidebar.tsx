'use client';

import * as React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Bot,
  Workflow,
  Settings,
  Plus,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Layers,
  Zap,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon?: string;
  active?: boolean;
}

interface SidebarProps {
  items: NavItem[];
  onNavigate?: (href: string) => void;
  collapsed?: boolean;
  onCollapse?: () => void;
  user?: { name: string; avatar?: string };
  onLogout?: () => void;
  workspaceName?: string;
  onWorkspaceClick?: () => void;
}

// Map icon string to Lucide component
const iconMap: Record<string, React.ReactNode> = {
  messages: <MessageSquare className="w-4 h-4" />,
  agents: <Bot className="w-4 h-4" />,
  workflows: <Workflow className="w-4 h-4" />,
  settings: <Settings className="w-4 h-4" />,
  workspace: <Layers className="w-4 h-4" />,
  quick: <Zap className="w-4 h-4" />,
};

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  onNavigate,
  collapsed = false,
  onCollapse,
  user,
  onLogout,
  workspaceName = 'Workspace Principal',
  onWorkspaceClick,
}) => {
  const sidebarWidth = collapsed ? 80 : 256;

  return (
    <motion.aside
      animate={{ width: sidebarWidth }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen z-40 flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0a0f0c 0%, #0d1a12 50%, #080e0a 100%)',
        borderRight: '1px solid rgba(34, 197, 94, 0.1)',
      }}
    >
      {/* Neural pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(34,197,94,0.3) 0%, transparent 50%),
                            radial-gradient(circle at 80% 20%, rgba(139,92,246,0.2) 0%, transparent 40%)`,
        }}
      />

      {/* Logo / Brand */}
      <div
        className="relative flex items-center px-4 py-5 border-b"
        style={{ borderColor: 'rgba(34, 197, 94, 0.1)' }}
      >
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
        >
          <span className="text-black font-bold text-sm">O</span>
        </motion.div>

        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="ml-3 overflow-hidden"
            >
              <p className="text-white font-bold text-sm tracking-widest">ORUS</p>
              <p className="text-green-400 text-xs tracking-wider opacity-70">SAGE</p>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={onCollapse}
          className="ml-auto flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center transition-all hover:bg-green-500/10"
          style={{ color: 'rgba(34, 197, 94, 0.5)' }}
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </div>

      {/* Workspace Selector */}
      <div className="px-3 py-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onWorkspaceClick}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all group"
          style={{
            background: 'rgba(34, 197, 94, 0.06)',
            border: '1px solid rgba(34, 197, 94, 0.12)',
          }}
        >
          <Layers className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs text-green-300 truncate font-medium"
              >
                {workspaceName}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* New Chat Button */}
      <div className="px-3 pb-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all font-medium text-xs"
          style={{
            background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(22,163,74,0.15))',
            border: '1px solid rgba(34, 197, 94, 0.25)',
            color: '#4ade80',
          }}
        >
          <Plus className="w-3.5 h-3.5 flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Novo Chat
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Divider with label */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 pb-1"
          >
            <p className="text-xs font-medium tracking-widest uppercase"
               style={{ color: 'rgba(34, 197, 94, 0.3)' }}>
              Navegação
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto scrollbar-hide">
        {items.map((item, index) => {
          const iconKey = item.icon?.toLowerCase() || '';
          const icon = iconMap[iconKey] || <MessageSquare className="w-4 h-4" />;

          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={item.href}
                onClick={() => onNavigate?.(item.href)}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all group relative overflow-hidden"
                style={{
                  background: item.active
                    ? 'linear-gradient(135deg, rgba(34,197,94,0.18), rgba(22,163,74,0.1))'
                    : 'transparent',
                  border: item.active
                    ? '1px solid rgba(34, 197, 94, 0.2)'
                    : '1px solid transparent',
                  color: item.active ? '#4ade80' : 'rgba(156, 163, 175, 0.8)',
                }}
              >
                {/* Active glow */}
                {item.active && (
                  <motion.div
                    className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full"
                    style={{ background: 'linear-gradient(180deg, #22c55e, #16a34a)' }}
                    layoutId="activeIndicator"
                  />
                )}

                <span className="flex-shrink-0 transition-all group-hover:text-green-400">
                  {icon}
                </span>

                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-medium truncate group-hover:text-green-300 transition-colors"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* User / Logout Footer */}
      <div
        className="mt-auto px-3 py-4 border-t"
        style={{ borderColor: 'rgba(34, 197, 94, 0.08)' }}
      >
        {user && (
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-black"
              style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-gray-400 truncate font-medium"
                >
                  {user.name}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-red-400/60 hover:text-red-400 hover:bg-red-500/8"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs font-medium"
              >
                Sair
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.aside>
  );
};