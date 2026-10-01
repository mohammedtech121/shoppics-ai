'use client';

import { TriangleAlert } from 'lucide-react';

/**
 * Shown when the two NEXT_PUBLIC_ Cloudinary vars are missing.
 * Helps anyone (including hackathon judges) configure a fresh clone.
 */
export function ConfigNotice() {
  return (
    <div
      role="status"
      className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-[13px] text-amber-900"
    >
      <div className="mx-auto flex max-w-6xl items-start gap-2.5">
        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
        <p>
          <span className="font-semibold">Cloudinary isn&apos;t configured yet.</span>{' '}
          Copy <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-[12px]">.env.example</code> to{' '}
          <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-[12px]">.env.local</code> and set{' '}
          <code className="font-mono text-[12px]">NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</code> and{' '}
          <code className="font-mono text-[12px]">NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET</code>. See the README for the
          5-minute setup.
        </p>
      </div>
    </div>
  );
}
