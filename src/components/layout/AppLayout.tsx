import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { cn } from '@/lib/utils';

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={cn('transition-all duration-300', collapsed ? 'ml-[72px]' : 'ml-64')}>
        <TopNav />
        <main className="p-6 min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
