'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  Download,
  FileImage,
  Home,
  Info,
  Package,
  PiggyBank,
  Ruler,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  BACKDROPS,
  PLATFORMS,
  beforePadUrl,
  getBackdrop,
  getPlatform,
  packFilename,
  studioUrl,
} from '@/lib/shoppics/cloudinary';
import { downloadUrl } from '@/lib/shoppics/download';
import { loadImage } from '@/lib/shoppics/image-utils';
import type { Session } from '@/lib/shoppics/types';
import { BeforeAfterSlider } from './before-after-slider';

interface ResultViewProps {
  session: Session;
  initialBackdropId?: string;
  onNewPhoto: () => void;
  onBackHome: () => void;
  onBackdropChange: (backdropId: string) => void;
}

type PreviewState = { url: string; status: 'loading' | 'ok' | 'failed'; attempt: number };

export function ResultView({ session, initialBackdropId, onNewPhoto, onBackHome, onBackdropChange }: ResultViewProps) {
  const { publicId, rec } = session;

  const [backdropId, setBackdropId] = useState(initialBackdropId ?? rec.backdropId);
  const [platformId, setPlatformId] = useState(rec.platformIds[0] ?? 'instagram');
  const [preview, setPreview] = useState<PreviewState>({ url: '', status: 'loading', attempt: 1 });
  const [retryNonce, setRetryNonce] = useState(0);
  const [packState, setPackState] = useState<{ busy: boolean; done: number; total: number }>({
    busy: false,
    done: 0,
    total: PLATFORMS.length,
  });

  const backdrop = getBackdrop(backdropId);
  const platform = getPlatform(platformId);
  const afterUrl = useMemo(() => studioUrl(publicId, backdrop, platform), [publicId, backdrop, platform]);
  const beforeUrl = useMemo(() => beforePadUrl(publicId, platform), [publicId, platform]);

  /* Track which URL the preview state belongs to. When afterUrl changes we
     reset the preview state during render (React's sanctioned pattern for
     prop-driven state resets — avoids setState-in-effect cascades). */
  const [previewFor, setPreviewFor] = useState<string | null>(null);
  if (previewFor !== afterUrl) {
    setPreviewFor(afterUrl);
    setPreview({ url: afterUrl, status: 'loading', attempt: 1 });
  }

  /* Preload the after image with retries (network hiccups → failed state with a working Retry). */
  useEffect(() => {
    let cancelled = false;

    loadImage(afterUrl, {
      attempts: 3,
      delayMs: 1500,
      onRetry: (attempt) => {
        if (!cancelled) setPreview({ url: afterUrl, status: 'loading', attempt: attempt + 1 });
      },
    })
      .then(() => {
        if (!cancelled) setPreview({ url: afterUrl, status: 'ok', attempt: 1 });
      })
      .catch(() => {
        if (!cancelled) setPreview({ url: afterUrl, status: 'failed', attempt: 3 });
      });

    return () => {
      cancelled = true;
    };
  }, [afterUrl, retryNonce]);

  useEffect(() => {
    onBackdropChange(backdropId);
  }, [backdropId, onBackdropChange]);

  const runSellerPack = useCallback(async () => {
    if (packState.busy) return;
    setPackState({ busy: true, done: 0, total: PLATFORMS.length });
    let done = 0;
    for (const p of PLATFORMS) {
      const ok = await downloadUrl(
        studioUrl(publicId, backdrop, p),
        packFilename(backdrop, p),
      );
      if (ok) done += 1;
      setPackState((s) => ({ ...s, done: done }));
      await new Promise((r) => setTimeout(r, 700));
    }
    setPackState({ busy: false, done, total: PLATFORMS.length });
    if (done === PLATFORMS.length) {
      toast.success('Seller Pack downloaded 🎉', {
        description: '4 marketplace images — ready to post on Instagram, Meesho, Amazon & WhatsApp.',
      });
    } else {
      toast.warning('Seller Pack finished with a hiccup', {
        description: `${done} image(s) downloaded; the rest opened in a new tab — save them from there.`,
      });
    }
  }, [packState.busy, publicId, backdrop]);

  const downloadCurrent = useCallback(async () => {
    const ok = await downloadUrl(afterUrl, packFilename(backdrop, platform));
    if (!ok) toast.info('Opened in a new tab — save it from there.');
  }, [afterUrl, backdrop, platform]);

  const retryPreview = () => {
    setPreview({ url: afterUrl, status: 'loading', attempt: 1 });
    setRetryNonce((n) => n + 1);
  };

  const renderTile = (b: (typeof BACKDROPS)[number]) => {
    const selected = b.id === backdropId;
    return (
      <button
        key={b.id}
        type="button"
        onClick={() => setBackdropId(b.id)}
        aria-pressed={selected}
        title={b.hint}
        className={`group relative flex flex-col items-stretch gap-2 rounded-2xl p-1 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
          selected ? 'ring-2 ring-emerald-600 ring-offset-2 ring-offset-[#FBF9F4]' : 'ring-1 ring-stone-200 hover:ring-stone-300'
        }`}
      >
        <span className="relative block aspect-square w-full overflow-hidden rounded-xl">
          <span
            className="absolute inset-0 transition group-hover:scale-[1.03]"
            style={{ backgroundColor: `#${b.hex}` }}
          />
          {selected && (
            <span className="absolute bottom-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md">
              <Check className="h-3.5 w-3.5" aria-hidden />
            </span>
          )}
        </span>
        <span className="px-0.5 pb-0.5">
          <span className={`block truncate text-[11px] font-semibold sm:text-[12px] ${selected ? 'text-emerald-800' : 'text-stone-700'}`}>
            {b.name}
          </span>
        </span>
      </button>
    );
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-10">
      {/* Header row */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onBackHome}
            className="h-9 gap-1.5 rounded-lg text-stone-500 hover:text-stone-800"
          >
            <Home className="h-4 w-4" aria-hidden />
            Home
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onNewPhoto}
            className="h-9 gap-1.5 rounded-lg text-stone-500 hover:text-stone-800"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            New photo
          </Button>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-600">
            <FileImage className="h-3.5 w-3.5 text-stone-400" aria-hidden />
            {session.originalFilename} · {session.width}×{session.height}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
            <Check className="h-3.5 w-3.5" aria-hidden />
            Saved to history
          </span>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-12">
        {/* ------------------------------------------------ LEFT: hero slider */}
        <div className="flex flex-col gap-5 lg:col-span-7">
          <div className="relative">
            <BeforeAfterSlider
              key={`${backdropId}-${platformId}`}
              before={beforeUrl}
              after={afterUrl}
              beforeLabel={`Phone photo · ${platform.w}×${platform.h}`}
              afterLabel={backdrop.name}
              className="aspect-square w-full shadow-xl shadow-stone-900/10"
            />
            <AnimatePresence>
              {preview.status === 'loading' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="pointer-events-none absolute inset-0 flex items-end justify-center rounded-2xl bg-stone-900/0 p-4"
                >
                  <span className="inline-flex items-center gap-2 rounded-full bg-stone-900/75 px-4 py-2 text-xs font-medium text-white backdrop-blur-sm">
                    <span
                      className="h-2 w-2 animate-pulse rounded-full bg-emerald-400"
                      aria-hidden
                    />
                    Rendering your studio shot…
                  </span>
                </motion.div>
              )}
              {preview.status === 'failed' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl bg-stone-900/70 text-white"
                >
                  <p className="text-sm font-semibold">This studio shot failed to render</p>
                  <p className="max-w-xs text-center text-xs text-stone-300">
                    Cloudinary didn&apos;t respond after 3 tries. Your photo is safe — just retry.
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    onClick={retryPreview}
                    className="rounded-xl bg-white text-stone-800 hover:bg-stone-100"
                  >
                    Retry
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Value stat — illustrative, honestly labelled */}
          <Card className="border-emerald-200/70 bg-gradient-to-br from-emerald-50 to-white shadow-sm">
            <CardContent className="flex items-start gap-4 p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-900/20">
                <PiggyBank className="h-5.5 w-5.5" aria-hidden />
              </span>
              <div>
                <p className="text-base font-extrabold tracking-tight text-emerald-950 sm:text-lg">
                  You just saved about ₹1,000 and 2 days
                </p>
                <p className="mt-1 text-xs leading-relaxed text-emerald-800/70">
                  Illustrative estimate based on typical Indian freelance product-photo rates — not a promise. Your
                  Seller Pack below is ready to post right now.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Seller Pack CTA — the climax */}
          <Card className="border-stone-200/80 bg-white shadow-sm">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="max-w-sm">
                <p className="text-sm font-bold text-stone-900">Create your Seller Pack</p>
                <p className="mt-1 text-xs leading-relaxed text-stone-500">
                  One click downloads all 4 platform images — Instagram 1080×1080, Meesho 1080×1350, Amazon
                  2000×2000, WhatsApp 1080×1080 — in the <span className="font-medium text-stone-700">{backdrop.name}</span> look.
                </p>
              </div>
              <Button
                type="button"
                size="lg"
                onClick={() => void runSellerPack()}
                disabled={packState.busy || preview.status !== 'ok'}
                className="h-13 shrink-0 rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-600 px-6 text-base font-bold text-white shadow-lg shadow-emerald-900/25 transition hover:-translate-y-0.5 hover:from-emerald-800 hover:to-teal-700 disabled:translate-y-0 disabled:opacity-60"
              >
                <Package className="mr-2 h-5 w-5" aria-hidden />
                {packState.busy
                  ? `Downloading ${packState.done}/${packState.total}…`
                  : 'Create Seller Pack'}
              </Button>
            </CardContent>
          </Card>

          {/* Individual downloads */}
          <div className="flex flex-wrap items-center gap-2">
            {PLATFORMS.map((p) => (
              <Button
                key={p.id}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void downloadUrl(studioUrl(publicId, backdrop, p), packFilename(backdrop, p))}
                className="h-9 rounded-xl border-stone-300 bg-white px-3 text-xs font-medium text-stone-700 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-800"
                title={`Download ${p.name} size (${p.w}×${p.h})`}
              >
                <Download className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                {p.name}
                <span className="ml-1.5 text-stone-400">{p.w}×{p.h}</span>
              </Button>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => void downloadCurrent()}
              className="h-9 rounded-xl px-3 text-xs font-medium text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
            >
              <Download className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              Download current view
            </Button>
          </div>
        </div>

        {/* ---------------------------------------------- RIGHT: controls */}
        <div className="flex flex-col gap-5 lg:col-span-5">
          {/* Studio Suggestion (heuristic) */}
          <Card className="border-stone-200/80 bg-white/90 shadow-sm">
            <CardContent className="p-5 sm:p-6">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="inline-flex items-center gap-2 text-sm font-bold text-stone-900">
                  <Ruler className="h-4 w-4 text-emerald-700" aria-hidden />
                  Studio Suggestion
                </p>
                <Badge variant="outline" className="gap-1 border-amber-300 bg-amber-50 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
                  <Info className="h-3 w-3" aria-hidden />
                  Heuristic · not AI vision
                </Badge>
              </div>
              <p className="text-lg font-extrabold tracking-tight text-emerald-950">{rec.styleLabel}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {rec.platformIds.map((id, i) => (
                  <span
                    key={id}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      i === 0 ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {getPlatform(id).name}
                    {i === 0 && ' · first'}
                  </span>
                ))}
              </div>
              <ul className="mt-4 space-y-2">
                {rec.reasons.map((reason) => (
                  <li key={reason} className="flex gap-2 text-[12px] leading-relaxed text-stone-600">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                    {reason}
                  </li>
                ))}
              </ul>
              <p className="mt-4 border-t border-stone-100 pt-3 text-[11px] leading-relaxed text-stone-400">
                Auto-applied from your photo&apos;s aspect ratio &amp; file size — change anything below. This is a
                size-and-shape heuristic, not computer vision.
              </p>
            </CardContent>
          </Card>

          {/* Backdrops */}
          <Card className="border-stone-200/80 bg-white/90 shadow-sm">
            <CardContent className="p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-bold text-stone-900">Backdrop</p>
                <p className="text-[11px] text-stone-400">4 instant looks — tap to switch</p>
              </div>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {BACKDROPS.map(renderTile)}
              </div>
            </CardContent>
          </Card>

          {/* Platforms */}
          <Card className="border-stone-200/80 bg-white/90 shadow-sm">
            <CardContent className="p-5 sm:p-6">
              <p className="mb-4 text-sm font-bold text-stone-900">Platform size</p>
              <div className="grid grid-cols-2 gap-2.5">
                {PLATFORMS.map((p) => {
                  const selected = p.id === platformId;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPlatformId(p.id)}
                      aria-pressed={selected}
                      className={`rounded-2xl border p-3.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                        selected
                          ? 'border-emerald-600 bg-emerald-50 shadow-sm'
                          : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50'
                      }`}
                    >
                      <span className={`block text-[13px] font-bold ${selected ? 'text-emerald-800' : 'text-stone-800'}`}>
                        {p.name}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-stone-500">{p.blurb}</span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-stone-400">
                The slider and downloads switch to the selected size. Amazon&apos;s 2000×2000 frame is padded, not
                upscaled — Cloudinary won&apos;t invent pixels.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
