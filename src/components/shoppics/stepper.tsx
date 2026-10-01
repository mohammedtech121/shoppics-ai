'use client';

import { Check, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StepStatus = 'pending' | 'active' | 'done' | 'error';

export interface StepDef {
  id: string;
  label: string;
  desc: string;
  status: StepStatus;
  /** 0–100, only meaningful while active (upload progress) */
  progress?: number;
}

/**
 * The processing pipeline stepper: Upload → BG removal → Studio → Pack → Ready.
 */
export function Stepper({ steps }: { steps: StepDef[] }) {
  return (
    <ol className="flex w-full items-start" aria-label="Processing steps">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        return (
          <li key={step.id} className="flex min-w-0 flex-1 flex-col items-center text-center" aria-current={step.status === 'active' ? 'step' : undefined}>
            <div className="flex w-full items-center">
              <span className="flex-1" aria-hidden>
                <span
                  className={cn(
                    'block h-0.5 rounded-full',
                    step.status === 'done' ? 'bg-emerald-600' : 'bg-stone-200',
                  )}
                />
              </span>
              <span
                role="img"
                aria-label={`${step.label}: ${step.status === 'done' ? 'done' : step.status === 'active' ? 'in progress' : step.status === 'error' ? 'failed' : 'waiting'}`}
                className={cn(
                  'relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-300',
                  step.status === 'done' && 'border-emerald-600 bg-emerald-600 text-white',
                  step.status === 'active' && 'border-emerald-600 bg-white text-emerald-700 shadow-[0_0_0_5px_rgba(5,150,105,0.12)]',
                  step.status === 'pending' && 'border-stone-200 bg-white text-stone-400',
                  step.status === 'error' && 'border-red-500 bg-red-500 text-white',
                )}
              >
                {step.status === 'done' && <Check className="h-4 w-4" aria-hidden />}
                {step.status === 'active' && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                {step.status === 'pending' && <span aria-hidden>{i + 1}</span>}
                {step.status === 'error' && <X className="h-4 w-4" aria-hidden />}
              </span>
              <span className="flex-1" aria-hidden>
                <span
                  className={cn(
                    'block h-0.5 rounded-full',
                    steps[i + 1]?.status === 'done' ? 'bg-emerald-600' : 'bg-stone-200',
                  )}
                />
              </span>
            </div>

            <p
              className={cn(
                'mt-2 w-full truncate text-[12px] font-semibold sm:text-[13px]',
                step.status === 'active' && 'text-emerald-800',
                step.status === 'done' && 'text-stone-700',
                step.status === 'pending' && 'text-stone-400',
                step.status === 'error' && 'text-red-600',
              )}
            >
              {step.label}
            </p>
            <p
              className={cn(
                'hidden w-full text-[11px] leading-snug text-stone-400 sm:block',
                step.status === 'active' && 'text-emerald-700/80',
              )}
            >
              {step.status === 'active' && typeof step.progress === 'number' && step.progress > 0
                ? `${step.progress}%`
                : step.desc}
            </p>

            {step.status === 'active' && typeof step.progress === 'number' && (
              <div className="mt-1 h-1 w-full max-w-24 overflow-hidden rounded-full bg-stone-200 sm:hidden" aria-hidden>
                <div
                  className="h-full rounded-full bg-emerald-600 transition-all duration-300"
                  style={{ width: `${Math.max(6, step.progress)}%` }}
                />
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
