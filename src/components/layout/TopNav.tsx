import { useEffect, useState } from 'react';
import { Bell, Activity, ChevronDown, LogOut, User as UserIcon } from 'lucide-react';
import { notifications as initialNotifications } from '@/data/mockData';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { portalLabels } from '@/config/navigation';
import type { UserRole } from '@/types';

interface TopNavProps {
  role: UserRole;
}

const roleDisplayMap: Record<UserRole, string> = {
  admin: 'Municipal Administrator',
  citizen: 'Citizen',
  crew: 'Cleaning Crew',
};

export function TopNav({ role }: TopNavProps) {
  const { user, profile, signOut } = useAuth();
  const [now, setNow] = useState(new Date());
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifs, setNotifs] = useState(initialNotifications);
  const unread = notifs.filter((n) => !n.read).length;

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const markAllRead = () => setNotifs(notifs.map((n) => ({ ...n, read: true })));

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';
  const displayRole = roleDisplayMap[role];

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-ink-700 flex items-center gap-4 px-6">
      <div className="flex-1">
        <span className="text-sm font-medium text-[#263445]">{portalLabels[role]}</span>
      </div>

      {role === 'admin' && (
        <div className="hidden lg:flex items-center gap-2 text-xs text-gray-500">
          <Activity className="w-3.5 h-3.5 text-[#218838]" />
          <span className="text-gray-500">All Systems</span>
          <span className="text-[#218838] font-medium">Operational</span>
        </div>
      )}

      <div className="hidden md:flex flex-col items-end text-right">
        <span className="text-sm font-mono text-[#263445]">{formatTime(now)}</span>
        <span className="text-[11px] text-gray-500">{formatDate(now)}</span>
      </div>

      {role === 'admin' && (
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative w-9 h-9 rounded-lg bg-ink-800/50 border border-ink-700 flex items-center justify-center hover:bg-ink-800 transition-colors"
          >
            <Bell className="w-4 h-4 text-gray-500" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 text-[9px] font-bold bg-[#C83E3E] text-white rounded-full flex items-center justify-center border border-white">
                {unread}
              </span>
            )}
          </button>
          {notifOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 top-12 w-80 bg-white border border-ink-700 rounded-lg shadow-lg z-40">
                <div className="flex items-center justify-between px-4 py-3 border-b border-ink-700">
                  <span className="text-sm font-semibold text-[#263445]">Notifications</span>
                  <button onClick={markAllRead} className="text-xs text-[#168C8C] hover:underline">
                    Mark all read
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifs.map((n) => (
                    <div
                      key={n.id}
                      className={cn(
                        'px-4 py-3 border-b border-ink-700/60 hover:bg-ink-800/40 transition-colors',
                        !n.read && 'bg-[#168C8C]/5',
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <span
                          className={cn(
                            'w-2 h-2 rounded-full mt-1.5 shrink-0',
                            n.type === 'alert' && 'bg-[#C83E3E]',
                            n.type === 'info' && 'bg-[#168C8C]',
                            n.type === 'success' && 'bg-[#218838]',
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#263445]">{n.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                          <p className="text-[10px] text-gray-400 mt-1">
                            {new Date(n.timestamp).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <div className="relative">
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-ink-800/50 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-[#17365D] flex items-center justify-center text-white font-bold text-sm">
            {displayName.slice(0, 2).toUpperCase()}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-[#263445]">{displayName}</p>
            <p className="text-[10px] text-gray-500">{displayRole}</p>
          </div>
          <ChevronDown className={cn('hidden sm:block w-4 h-4 text-gray-400 transition-transform', profileOpen && 'rotate-180')} />
        </button>
        {profileOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setProfileOpen(false)} />
            <div className="absolute right-0 top-12 w-56 bg-white border border-ink-700 rounded-lg shadow-lg z-40 overflow-hidden">
              <div className="px-4 py-3 border-b border-ink-700">
                <p className="text-sm font-medium text-[#263445]">{displayName}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <div className="py-1">
                <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 cursor-default">
                  <UserIcon className="w-4 h-4" />
                  {displayRole}
                </div>
                <button
                  onClick={() => signOut()}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#C83E3E] hover:bg-[#C83E3E]/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
