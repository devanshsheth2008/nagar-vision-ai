import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export interface BadgeProps {
  children: ReactNode;
  variant?: 'emerald' | 'cyan' | 'amber' | 'red' | 'purple' | 'gray';
  dot?: boolean;
  size?: 'sm' | 'md';
}

const variants = {
  emerald: 'bg-[#218838]/10 text-[#218838] border-[#218838]/20',
  cyan: 'bg-[#168C8C]/10 text-[#168C8C] border-[#168C8C]/20',
  amber: 'bg-[#D99A19]/10 text-[#D99A19] border-[#D99A19]/20',
  red: 'bg-[#C83E3E]/10 text-[#C83E3E] border-[#C83E3E]/20',
  purple: 'bg-[#2563A6]/10 text-[#2563A6] border-[#2563A6]/20',
  gray: 'bg-gray-100 text-gray-600 border-gray-200',
};

const dotColors = {
  emerald: 'bg-[#218838]',
  cyan: 'bg-[#168C8C]',
  amber: 'bg-[#D99A19]',
  red: 'bg-[#C83E3E]',
  purple: 'bg-[#2563A6]',
  gray: 'bg-gray-400',
};

export function Badge({ children, variant = 'gray', dot, size = 'sm' }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 font-medium rounded-full border',
      size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
      variants[variant],
    )}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  );
}
