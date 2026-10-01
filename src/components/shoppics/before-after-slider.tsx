'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronsLeftRight, Smartphone, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BeforeAfterSliderProps {
  before: string;
  after: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
  initial?: number;
}

/**
 * The hero moment: drag (or arrow-key) between the original phone photo and the
 * studio result. Pointer-capture based, so it works with mouse, touch and pen.
 */
export function BeforeAfterSlider({
  before,
  after,
  beforeLabel = 'Phone photo',
  afterLabel = 'Studio shot',
  className,
  initial = 50,
}: BeforeAfterSliderProps) {
  const [pos, setPos] = useState(initial);
  const [hasInteracted, setHasInteracted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  // Gentle invitation: nudge the handle once on mount so people realise it's draggable.
  useEffect(() => {
    const t1 = setTimeout(() => setPos(64), 900);
    const t2 = setTimeout(() => setPos(42), 1600);
    const t3 = setTimeout(() => setPos(50), 2300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const update = useCallback((clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(98, Math.max(2, pct)));
  }, []);

  return (
    <div
      ref={ref}
      role="slider"
      aria-label="Before and after comparison — drag to compare"
      aria-valuenow={Math.round(pos)}
      aria-valuemin={0}
      aria-valuemax={100}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') {
          setHasInteracted(true);
          setPos((p) => Math.max(2, p - 5));
        }
        if (e.key === 'ArrowRight') {
          setHasInteracted(true);
          setPos((p) => Math.min(98, p + 5));
        }
      }}
      onPointerDown={(e) => {
        dragging.current = true;
        setHasInteracted(true);
        e.currentTarget.setPointerCapture(e.pointerId);
        e.currentTarget.focus();
        update(e.clientX);
      }}
      onPointerMove={(e) => {
        if (dragging.current) update(e.clientX);
      }}
      onPointerUp={() => {
        dragging.current = false;
      }}
      onPointerCancel={() => {
        dragging.current = false;
      }}
      className={cn(
        'group relative cursor-ew-resize touch-none select-none overflow-hidden rounded-2xl bg-stone-100 outline-none ring-1 ring-stone-200/80 focus-visible:ring-2 focus-visible:ring-emerald-600',
        className,
      )}
    >
      {/* AFTER (full, underneath) */}
      <img
        src={after}
        alt="After — studio-quality product shot"
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* BEFORE (clipped to the left of the handle) */}
      <img
        src={before}
        alt="Before — original phone photo"
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      />

      {/* Divider */}
      <div className="pointer-events-none absolute inset-y-0" style={{ left: `${pos}%` }}>
        <div className="absolute inset-y-0 -left-px w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,0.45)]" />
        <motion.div
          animate={hasInteracted ? undefined : { scale: [1, 1.12, 1] }}
          transition={hasInteracted ? undefined : { repeat: Infinity, repeatDelay: 1.6, duration: 0.9 }}
          className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-stone-800 shadow-lg ring-1 ring-black/10"
        >
          <ChevronsLeftRight className="h-4 w-4" aria-hidden />
        </motion.div>
      </div>

      {/* Labels */}
      <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-stone-900/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
        <Smartphone className="h-3 w-3" aria-hidden />
        {beforeLabel}
      </span>
      <span className="pointer-events-none absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-600/90 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
        <Sparkles className="h-3 w-3" aria-hidden />
        {afterLabel}
      </span>
    </div>
  );
}
