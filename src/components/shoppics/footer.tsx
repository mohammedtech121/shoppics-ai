'use client';

import { Logo } from './logo';

/**
 * Global footer — sticky to the bottom on short pages (root layout is
 * min-h-screen flex-col with mt-auto here), pushed down naturally on long ones.
 */
export function Footer() {
  return (
    <footer className="mt-auto border-t border-stone-200/80 bg-[#FBF9F4]">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-2 text-sm text-stone-500">
          <Logo compact />
          <span>
            Built for the{' '}
            <span className="font-medium text-stone-700">Cloudinary AI Hackathon 2026 — Pixels to Products</span>
          </span>
        </div>
        <p className="text-xs leading-relaxed text-stone-400">
          Team HYDRA · Mohammed Khan · Heuristic suggestions, not computer vision · History lives in your
          browser&apos;s localStorage · GenAI backdrops are Cloudinary beta
        </p>
      </div>
    </footer>
  );
}
