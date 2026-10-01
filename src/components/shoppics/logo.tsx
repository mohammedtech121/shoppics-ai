'use client';

import { Aperture } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-900/20">
        <Aperture className="h-4.5 w-4.5" aria-hidden />
      </span>
      {!compact && (
        <span className="text-lg font-bold tracking-tight text-stone-900">
          ShopPics
          <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent"> AI</span>
        </span>
      )}
    </span>
  );
}
