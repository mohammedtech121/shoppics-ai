'use client';

import { useState } from 'react';
import { ArrowUpRight, Clock3, Images, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  clearHistory,
  removeHistoryEntry,
  type HistoryEntry,
} from '@/lib/shoppics/history';
import { beforePadUrl, getBackdrop, getPlatform } from '@/lib/shoppics/cloudinary';

interface HistoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entries: HistoryEntry[];
  onReopen: (entry: HistoryEntry) => void;
}

const THUMB: { id: string; name: string; w: number; h: number; blurb: string } = {
  id: 'thumb',
  name: 'thumb',
  w: 120,
  h: 120,
  blurb: '',
};

function formatDate(ts: number): string {
  try {
    return new Date(ts).toLocaleString(undefined, {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export function HistoryDrawer({ open, onOpenChange, entries, onReopen }: HistoryDrawerProps) {
  const [confirmingClear, setConfirmingClear] = useState(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 bg-[#FBF9F4] p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b border-stone-200/80 px-5 py-4">
          <SheetTitle className="flex items-center gap-2 text-lg font-bold text-stone-900">
            <Clock3 className="h-5 w-5 text-emerald-700" aria-hidden />
            Shot history
          </SheetTitle>
          <SheetDescription className="text-xs text-stone-500">
            {entries.length > 0
              ? `${entries.length} session${entries.length === 1 ? '' : 's'} · stored only in this browser (localStorage) — clearing browser data clears history.`
              : 'Your studio sessions will appear here.'}
          </SheetDescription>
        </SheetHeader>

        <div className="scrollbar-thin flex-1 overflow-y-auto px-4 py-4">
          {entries.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-16 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-stone-400">
                <Images className="h-7 w-7" aria-hidden />
              </span>
              <p className="text-sm font-semibold text-stone-600">No shots yet</p>
              <p className="max-w-[240px] text-xs leading-relaxed text-stone-400">
                Every photo you run through the Studio gets saved here — on your device only.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {entries.map((e) => (
                <li
                  key={e.id}
                  className="flex items-center gap-3 rounded-2xl border border-stone-200/80 bg-white p-3 shadow-sm transition hover:border-emerald-300"
                >
                  <img
                    src={beforePadUrl(e.publicId, THUMB)}
                    alt={`Original photo from session — ${e.rec.styleLabel}`}
                    width={56}
                    height={56}
                    loading="lazy"
                    draggable={false}
                    className="h-14 w-14 shrink-0 rounded-xl border border-stone-200 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-stone-800">{e.rec.styleLabel}</p>
                    <p className="truncate text-[11px] text-stone-500">
                      {getBackdrop(e.backdropId).name} · {getPlatform(e.rec.platformIds[0] ?? 'instagram').name}
                    </p>
                    <p className="mt-0.5 text-[10px] text-stone-400">{formatDate(e.createdAt)}</p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1.5">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => onReopen(e)}
                      className="h-8 gap-1 rounded-lg bg-emerald-700 px-2.5 text-[11px] font-semibold text-white hover:bg-emerald-800"
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                      Reopen
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeHistoryEntry(e.id)}
                      aria-label={`Delete ${e.rec.styleLabel} session from history`}
                      className="h-8 gap-1 rounded-lg px-2.5 text-[11px] text-stone-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {entries.length > 0 && (
          <div className="border-t border-stone-200/80 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (confirmingClear) {
                  clearHistory();
                  setConfirmingClear(false);
                } else {
                  setConfirmingClear(true);
                  setTimeout(() => setConfirmingClear(false), 3500);
                }
              }}
              className={`h-10 w-full rounded-xl border text-xs font-semibold ${
                confirmingClear
                  ? 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100'
                  : 'border-stone-300 bg-white text-stone-600 hover:bg-stone-50'
              }`}
            >
              {confirmingClear ? 'Tap again to really clear everything' : 'Clear all history'}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
