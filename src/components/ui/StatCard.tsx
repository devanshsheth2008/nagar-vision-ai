import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: { value: string; direction: 'up' | 'down' | 'flat' };
  accent?: 'emerald' | 'cyan' | 'amber' | 'red' | 'purple';
  sublabel?: string;
}

const accentMap = {
  emerald: { text: 'text-[#218838]', bg: 'bg-[#218838]/10', border: 'border-[#218838]/20' },
  cyan: { text: 'text-[#168C8C]', bg: 'bg-[#168C8C]/10', border: 'border-[#168C8C]/20' },
  amber: { text: 'text-[#D99A19]', bg: 'bg-[#D99A19]/10', border: 'border-[#D99A19]/20' },
  red: { text: 'text-[#C83E3E]', bg: 'bg-[#C83E3E]/10', border: 'border-[#C83E3E]/20' },
  purple: { text: 'text-[#2563A6]', bg: 'bg-[#2563A6]/10', border: 'border-[#2563A6]/20' },
};

export function StatCard({ label, value, icon, trend, accent = 'emerald', sublabel }: StatCardProps) {
  const a = accentMap[accent];
  return (
    <div className={cn('glass p-5 transition-all duration-200 hover:shadow-md')}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-[#263445] mt-2 font-mono">{value}</p>
          {sublabel && <p className="text-xs text-gray-500 mt-1">{sublabel}</p>}
        </div>
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center border', a.bg, a.border, a.text)}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-1.5 mt-3 text-xs">
          {trend.direction === 'up' && <TrendingUp className="w-3.5 h-3.5 text-[#218838]" />}
          {trend.direction === 'down' && <TrendingDown className="w-3.5 h-3.5 text-[#C83E3E]" />}
          {trend.direction === 'flat' && <Minus className="w-3.5 h-3.5 text-gray-400" />}
          <span className={cn(trend.direction === 'up' && 'text-[#218838]', trend.direction === 'down' && 'text-[#C83E3E]', trend.direction === 'flat' && 'text-gray-500')}>
            {trend.value}
          </span>
          <span className="text-gray-400">vs last week</span>
        </div>
      )}
    </div>
  );
}
