import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface PanelProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  noPadding?: boolean;
}

export function Panel({ children, className, title, subtitle, action, noPadding }: PanelProps) {
  return (
    <div className={cn('glass', className)}>
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-700">
          <div>
            {title && <h3 className="text-sm font-semibold text-[#263445]">{title}</h3>}
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={cn(!noPadding && 'p-5')}>{children}</div>
    </div>
  );
}
