'use client';

import * as React from 'react';
import { useState } from 'react';
import { Sidebar } from './Sidebar';

interface NavItem {
  label: string;
  href: string;
  icon?: string;
  active?: boolean;
}

interface MainLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  user?: { name: string; avatar?: string };
  onWorkspaceClick?: () => void;
  onLogout?: () => void;
  onNavigate?: (href: string) => void;
  workspaceName?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  navItems,
  user,
  onWorkspaceClick,
  onLogout,
  onNavigate,
  workspaceName = 'Workspace Principal',
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const sidebarWidth = sidebarCollapsed ? 80 : 256;

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        items={navItems}
        onNavigate={onNavigate}
        collapsed={sidebarCollapsed}
        onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        user={user}
        onLogout={onLogout}
        workspaceName={workspaceName}
        onWorkspaceClick={onWorkspaceClick}
      />

      {/* Main content — offset by sidebar width */}
      <main
        className="flex-1 flex flex-col overflow-hidden transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
      >
        {children}
      </main>
    </div>
  );
};