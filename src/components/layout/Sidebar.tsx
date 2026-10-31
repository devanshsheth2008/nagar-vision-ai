import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { navItems } from '@/config/navigation';
import { cn } from '@/lib/utils';
import { ChevronLeft, Eye } from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

export function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const [hovered, setHovered] = useState(false);
  const expanded = !collapsed || hovered;

  return (
    <aside
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        'fixed left-0 top-0 h-screen z-40 flex flex-col bg-white border-r border-ink-700 transition-all duration-300',
        collapsed ? 'w-[72px]' : 'w-64',
      )}
    >
      <div className="flex items-center gap-3 px-4 h-16 border-b border-ink-700 shrink-0">
        <div className="relative w-10 h-10 rounded-lg bg-[#17365D] flex items-center justify-center shrink-0">
          <Eye className="w-5 h-5 text-white" />
        </div>
        {expanded && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold text-[#263445] tracking-wide whitespace-nowrap">NAGAR VISION AI</h1>
            <p className="text-[10px] text-gray-500 whitespace-nowrap">Gandhidham Municipal Corporation</p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              cn('nav-link', isActive && 'nav-link-active', !expanded && 'justify-center px-0')
            }
            title={!expanded ? item.label : undefined}
          >
            <item.icon className="w-[18px] h-[18px] shrink-0" />
            {expanded && (
              <>
                <span className="flex-1 whitespace-nowrap">{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] font-bold bg-[#C83E3E]/10 text-[#C83E3E] px-1.5 py-0.5 rounded-full border border-[#C83E3E]/20">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-2 pb-3 border-t border-ink-700 pt-3">
        <div className={cn('flex items-center gap-2 px-3 py-2 rounded-lg bg-ink-800/50', !expanded && 'justify-center')}>
          <span className="w-2 h-2 rounded-full bg-[#218838] shrink-0" />
          {expanded && (
            <div className="text-xs">
              <span className="text-gray-500">System</span>{' '}
              <span className="text-[#218838] font-medium">Operational</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'mt-2 w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-500 hover:text-[#263445] transition-colors',
            !expanded && 'justify-center',
          )}
        >
          <ChevronLeft className={cn('w-4 h-4 transition-transform', collapsed && 'rotate-180')} />
          {expanded && 'Collapse'}
        </button>
      </div>
    </aside>
  );
}
