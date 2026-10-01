'use client';

import { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Camera, CloudUpload, FileImage, RotateCcw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  uploadImage,
  cutoutUrl,
  backdropPreviewUrl,
  getBackdrop,
  studioUrl,
  PLATFORMS,
  isCloudinaryConfigured,
} from '@/lib/shoppics/cloudinary';
import { recommendFromImage } from '@/lib/shoppics/heuristics';
import { loadImage } from '@/lib/shoppics/image-utils';
import type { Session } from '@/lib/shoppics/types';
import { Stepper, type StepDef } from './stepper';

type Stage = 'idle' | 'upload' | 'cutout' | 'studio' | 'pack' | 'ready' | 'error';

const MAX_FILE_MB = 10;

const STEP_DEFS: Array<{ id: string; label: string; desc: string }> = [
  { id: 'upload', label: 'Upload', desc: 'Sending your photo to Cloudinary' },
  { id: 'cutout', label: 'BG removal', desc: 'AI cuts out your product (~5–10 s)' },
  { id: 'studio', label: 'Studio', desc: 'Applying your suggested look' },
  { id: 'pack', label: 'Pack', desc: 'Pre-rendering 4 marketplace sizes' },
  { id: 'ready', label: 'Ready', desc: 'Opening your studio shot' },
];

function stageIndex(stage: Stage): number {
  switch (stage) {
    case 'upload':
      return 0;
    case 'cutout':
      return 1;
    case 'studio':
      return 2;
    case 'pack':
      return 3;
    case 'ready':
      return 4;
    default:
      return 0;
  }
}

interface StudioViewProps {
  onComplete: (session: Session) => void;
  onBack: () => void;
}

export function StudioView({ onComplete, onBack }: StudioViewProps) {
  const [stage, setStage] = useState<Stage>('idle');
  const [uploadPct, setUploadPct] = useState(0);
  const [fileLabel, setFileLabel] = useState<string | null>(null);
  const [fileSizeKb, setFileSizeKb] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const configured = isCloudinaryConfigured();

  const steps: StepDef[] = STEP_DEFS.map((s, i) => {
    const idx = stageIndex(stage);
    if (stage === 'error' && i === idx) return { ...s, status: 'error' as const };
    if (i < idx || stage === 'ready') return { ...s, status: 'done' as const };
    if (i === idx) return { ...s, status: 'active' as const, progress: i === 0 ? uploadPct : undefined };
    return { ...s, status: 'pending' as const };
  });

  const runPipeline = useCallback(
    async (file: File) => {
      setFileLabel(file.name || 'product photo');
      setFileSizeKb(Math.round(file.size / 1024));
      setErrorMsg(null);

      try {
        // 1 — Upload (unsigned preset, straight to Cloudinary)
        setStage('upload');
        setUploadPct(0);
        const up = await uploadImage(file, setUploadPct);

        // 2 — AI Background Removal (warm + verify the cutout exists)
        setStage('cutout');
        await loadImage(cutoutUrl(up.publicId));

        // 3 — Studio: heuristic suggestion + render the suggested look
        setStage('studio');
        const rec = recommendFromImage({ width: up.width, height: up.height, bytes: up.bytes });
        await loadImage(backdropPreviewUrl(up.publicId, getBackdrop(rec.backdropId)));

        // 4 — Pack: pre-render the 4 marketplace sizes for the suggested
        //     backdrop (best-effort; downloads retry on their own)
        setStage('pack');
        const backdrop = getBackdrop(rec.backdropId);
        await Promise.race([
          Promise.allSettled(
            PLATFORMS.map((p) => loadImage(studioUrl(up.publicId, backdrop, p), { attempts: 2 })),
          ),
          new Promise((r) => setTimeout(r, 30_000)),
        ]);

        // 5 — Ready
        setStage('ready');
        const session: Session = {
          id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}`,
          publicId: up.publicId,
          originalFilename: up.originalFilename,
          width: up.width,
          height: up.height,
          bytes: up.bytes,
          rec,
          createdAt: Date.now(),
        };
        onComplete(session);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Something went wrong.';
        setErrorMsg(msg);
        setStage('error');
        toast.error('The studio hit a snag', { description: msg });
      }
    },
    [onComplete],
  );

  const acceptFile = useCallback(
    (file: File | null | undefined) => {
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        toast.error('That doesn’t look like an image', { description: 'Please pick a JPG, PNG or WebP photo.' });
        return;
      }
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        toast.error('Photo is too large', {
          description: `Cloudinary's free tier caps uploads at ${MAX_FILE_MB} MB. Try a smaller photo.`,
        });
        return;
      }
      void runPipeline(file);
    },
    [runPipeline],
  );

  const loadSamplePhoto = useCallback(async () => {
    try {
      const res = await fetch('/samples/product-original.png');
      const blob = await res.blob();
      const file = new File([blob], 'sample-jhumkas.png', { type: blob.type || 'image/png' });
      void runPipeline(file);
    } catch {
      toast.error('Could not load the sample photo.');
    }
  }, [runPipeline]);

  const reset = () => {
    setStage('idle');
    setUploadPct(0);
    setErrorMsg(null);
    setFileLabel(null);
    setFileSizeKb(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const busy = stage !== 'idle' && stage !== 'error';

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12" aria-labelledby="studio-heading">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 id="studio-heading" className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
            The Studio
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            One photo in — a full marketplace pack out. Everything runs on Cloudinary AI.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="h-9 shrink-0 gap-1.5 rounded-lg text-stone-500 hover:text-stone-800"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back
        </Button>
      </div>

      {stage === 'idle' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload your product photo — drag and drop or press Enter to choose a file"
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              acceptFile(e.dataTransfer.files?.[0]);
            }}
            className={`flex cursor-pointer flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed px-6 py-14 text-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 sm:py-20 ${
              dragOver
                ? 'border-emerald-500 bg-emerald-50/70 shadow-lg shadow-emerald-900/5'
                : 'border-stone-300 bg-white/60 hover:border-emerald-400 hover:bg-emerald-50/40'
            }`}
          >
            <span
              className={`flex h-16 w-16 items-center justify-center rounded-2xl transition-colors ${
                dragOver ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-500'
              }`}
            >
              <CloudUpload className="h-8 w-8" aria-hidden />
            </span>
            <div>
              <p className="text-lg font-semibold text-stone-800">Drag & drop your product photo</p>
              <p className="mt-1 text-sm text-stone-500">JPG, PNG or WebP — up to {MAX_FILE_MB} MB</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                type="button"
                className="h-11 rounded-xl bg-emerald-700 px-5 font-semibold text-white shadow-md shadow-emerald-900/20 hover:bg-emerald-800"
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.click();
                }}
              >
                <Camera className="mr-2 h-4 w-4" aria-hidden />
                Choose photo
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-xl border-stone-300 bg-white px-5 font-medium text-stone-700 hover:bg-stone-50"
                onClick={(e) => {
                  e.stopPropagation();
                  void loadSamplePhoto();
                }}
              >
                <Sparkles className="mr-2 h-4 w-4 text-amber-600" aria-hidden />
                Use a sample product photo
              </Button>
            </div>
            <p className="max-w-md text-xs leading-relaxed text-stone-400">
              Your photo uploads straight from your browser to Cloudinary with an unsigned preset — no account, and
              this demo stores nothing on any server. Your shot history stays in your browser.
            </p>
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/heic,image/heif"
              className="sr-only"
              aria-label="Choose a product photo from your device"
              onChange={(e) => acceptFile(e.target.files?.[0])}
            />
          </div>

          {!configured && (
            <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-center text-xs text-amber-800">
              Cloudinary env vars are missing — the studio can&apos;t upload until you add them (see README).
            </p>
          )}
        </motion.div>
      )}

      {stage !== 'idle' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <Card className="border-stone-200/80 bg-white/80 shadow-sm">
            <CardContent className="p-5 sm:p-7">
              {fileLabel && (
                <div className="mb-5 flex flex-wrap items-center justify-center gap-2 text-xs text-stone-500">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1.5 font-medium text-stone-700">
                    <FileImage className="h-3.5 w-3.5" aria-hidden />
                    {fileLabel}
                    {fileSizeKb ? ` · ${fileSizeKb > 1024 ? `${(fileSizeKb / 1024).toFixed(1)} MB` : `${fileSizeKb} KB`}` : ''}
                  </span>
                </div>
              )}

              <Stepper steps={steps} />

              {stage === 'error' ? (
                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50/70 p-4 text-center">
                  <p className="text-sm font-semibold text-red-800">The studio hit a snag</p>
                  <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-red-700">{errorMsg}</p>
                  <p className="mt-2 text-[11px] text-red-600/80">
                    First time? Check that your Cloudinary upload preset is Unsigned and the AI Background Removal
                    add-on is enabled (README → Setup).
                  </p>
                  <Button
                    type="button"
                    onClick={reset}
                    className="mt-4 h-10 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" aria-hidden />
                    Try another photo
                  </Button>
                </div>
              ) : (
                <p className="mt-6 text-center text-xs text-stone-400">
                  {stage === 'upload' && 'Uploading your photo — please keep this tab open.'}
                  {stage === 'cutout' && 'Cloudinary AI is cutting out your product. This usually takes 5–10 seconds.'}
                  {stage === 'studio' && 'Applying your suggested studio look…'}
                  {stage === 'pack' && 'Pre-rendering your 4 marketplace sizes — the first run is the slowest.'}
                  {stage === 'ready' && 'All done — opening your studio shot…'}
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </section>
  );
}
