import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import type { UserRole } from '@/types';

interface AppLayoutProps {
  role: UserRole;
}

export function AppLayout({ role }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} role={role} />
      <div className={cn('transition-all duration-300', collapsed ? 'ml-[72px]' : 'ml-64')}>
        <TopNav role={role} />
        <main className="p-6 min-h-[calc(100vh-4rem)]">
          <Outlet context={{ signOut }} />
        </main>
      </div>
    </div>
  );
}
