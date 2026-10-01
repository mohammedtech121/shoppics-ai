'use client';

import { History, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from './logo';

interface NavbarProps {
  view: 'landing' | 'studio' | 'result';
  historyCount: number;
  onOpenHistory: () => void;
  onStart: () => void;
  onHome: () => void;
}

export function Navbar({ view, historyCount, onOpenHistory, onStart, onHome }: NavbarProps) {
  const onLanding = view === 'landing';
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-[#FBF9F4]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <button
          type="button"
          onClick={() => (onLanding ? window.scrollTo({ top: 0, behavior: 'smooth' }) : onHome())}
          className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/60"
          aria-label={onLanding ? 'ShopPics AI — back to top' : 'ShopPics AI — back to home page'}
        >
          <Logo />
        </button>

        <div className="flex items-center gap-2">
          {!onLanding && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onHome}
              className="h-10 gap-2 rounded-xl px-3 text-stone-600 hover:bg-stone-100 hover:text-stone-900"
              aria-label="Back to home page"
            >
              <Home className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Home</span>
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onOpenHistory}
            className="h-10 gap-2 rounded-xl px-3 text-stone-600 hover:bg-stone-100 hover:text-stone-900"
            aria-label={`Open shot history (${historyCount} saved)`}
          >
            <History className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1.5 text-[11px] font-bold text-white">
                {historyCount > 99 ? '99+' : historyCount}
              </span>
            )}
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={onStart}
            className="h-10 rounded-xl bg-emerald-700 px-4 font-semibold text-white shadow-sm shadow-emerald-900/20 transition hover:-translate-y-0.5 hover:bg-emerald-800"
          >
            {onLanding ? 'Open Studio' : 'New photo'}
          </Button>
        </div>
      </div>
    </header>
  );
}
