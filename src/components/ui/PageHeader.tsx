import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description: string;
  icon: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ title, description, icon, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 animate-slide-up">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#17365D]/10 border border-[#17365D]/20 flex items-center justify-center text-[#17365D]">
          {icon}
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#263445] tracking-tight">{title}</h2>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      {actions && <div className={cn('flex items-center gap-2')}>{actions}</div>}
    </div>
  );
}
