'use client';

import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';

/**
 * 🌟 WORKSPACE LIST - COM AURORA COLORS 🌟
 * Lista de workspaces com design premium
 */

interface Workspace {
  id: string;
  name: string;
  description: string;
  members: number;
  chats: number;
  lastAccess: Date;
  color: 'aurora' | 'emerald' | 'cyan' | 'violet' | 'rose';
  icon: string;
  status: 'active' | 'archived' | 'pending';
}

const colorMap = {
  aurora: { bg: 'from-aurora-500 to-violet-500', text: 'text-aurora-400' },
  emerald: { bg: 'from-emerald-500 to-cyan-500', text: 'text-emerald-400' },
  cyan: { bg: 'from-cyan-500 to-blue-500', text: 'text-cyan-400' },
  violet: { bg: 'from-violet-500 to-purple-500', text: 'text-violet-400' },
  rose: { bg: 'from-rose-500 to-pink-500', text: 'text-rose-400' }
};

const mockWorkspaces: Workspace[] = [
  {
    id: '1',
    name: 'ORUS Projects',
    description: 'Main development workspace for ORUS ecosystem',
    members: 12,
    chats: 42,
    lastAccess: new Date(Date.now() - 86400000),
    color: 'aurora',
    icon: '🚀',
    status: 'active'
  },
  {
    id: '2',
    name: 'Design Team',
    description: 'Aurora visual design system collaboration',
    members: 8,
    chats: 28,
    lastAccess: new Date(Date.now() - 172800000),
    color: 'cyan',
    icon: '🎨',
    status: 'active'
  },
  {
    id: '3',
    name: 'Research Lab',
    description: 'Minerva cognitive research projects',
    members: 5,
    chats: 15,
    lastAccess: new Date(Date.now() - 604800000),
    color: 'violet',
    icon: '🧪',
    status: 'active'
  },
  {
    id: '4',
    name: 'Archive 2024',
    description: 'Previous year projects and documentation',
    members: 20,
    chats: 156,
    lastAccess: new Date(Date.now() - 2592000000),
    color: 'emerald',
    icon: '📦',
    status: 'archived'
  }
];

export function WorkspaceList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'archived'>('all');

  const filteredWorkspaces = mockWorkspaces.filter(ws => {
    const matchesSearch = ws.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ws.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || ws.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const cardVariants: Variants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
    hover: { y: -8, transition: { duration: 0.3 } }
  };

  return (
    <div>
      {/* SEARCH & FILTER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8 flex gap-4 flex-wrap"
      >
        {/* Search */}
        <div className="flex-1 min-w-xs">
          <input
            type="text"
            placeholder="Search workspaces..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-900/50 text-white placeholder-gray-500 focus:ring-2 focus:ring-aurora-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          {(['all', 'active', 'archived'] as const).map((status) => (
            <motion.button
              key={status}
              onClick={() => setFilterStatus(status)}
              animate={{
                scale: filterStatus === status ? 1.05 : 1,
                backgroundColor: filterStatus === status ? '#9d5cff' : 'transparent',
                color: filterStatus === status ? 'white' : '#9CA3AF'
              }}
              className={`px-4 py-3 rounded-lg border ${filterStatus === status ? 'border-aurora-500' : 'border-gray-700'} capitalize font-medium transition-all duration-200 cursor-pointer`}
            >
              {status}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* WORKSPACES GRID */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredWorkspaces.length > 0 ? (
          filteredWorkspaces.map((workspace, idx) => {
            const colors = colorMap[workspace.color];
            return (
              <motion.a
                key={workspace.id}
                href={`/workspace/${workspace.id}`}
                variants={cardVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                transition={{ delay: idx * 0.05 }}
                className="relative rounded-2xl border border-gray-700 bg-gray-900/50 p-6 backdrop-blur-sm hover:shadow-glow-aurora transition-all duration-300 group overflow-hidden cursor-pointer"
              >
                {/* Status Badge */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                  className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${colors.bg}`}
                >
                  {workspace.status === 'active' ? '● Active' : workspace.status === 'archived' ? 'Archived' : 'Pending'}
                </motion.div>

                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  {/* Icon Circle */}
                  <motion.div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold bg-gradient-to-br ${colors.bg} shadow-lg flex-shrink-0`}
                    whileHover={{ rotate: 5, scale: 1.05 }}
                  >
                    {workspace.icon}
                  </motion.div>

                  {/* Title & Description */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white truncate">
                      {workspace.name}
                    </h3>
                    <p className="text-sm text-gray-400 line-clamp-1 mt-1">
                      {workspace.description}
                    </p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mb-4 py-4 border-t border-b border-gray-700">
                  <div>
                    <p className="text-xs font-medium text-gray-400 mb-1">Members</p>
                    <p className="text-xl font-bold text-white">{workspace.members}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 mb-1">Chats</p>
                    <p className="text-xl font-bold text-white">{workspace.chats}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 mb-1">Status</p>
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-xl"
                    >
                      {workspace.status === 'active' ? '✓' : workspace.status === 'archived' ? '📦' : '⏳'}
                    </motion.div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400">
                    Last accessed {workspace.lastAccess.toLocaleDateString()}
                  </p>
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-lg text-gray-400 group-hover:text-aurora-400 transition-colors"
                  >
                    →
                  </motion.div>
                </div>
              </motion.a>
            );
          })
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full text-center py-12"
          >
            <p className="text-lg text-gray-400">No workspaces found</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default WorkspaceList;
