/**
 * ShopPics AI — downloads.
 *
 * Cloudinary image delivery sends `Access-Control-Allow-Origin: *` (verified),
 * so we can fetch images as blobs and trigger real file downloads with proper
 * filenames. If anything goes wrong we fall back to opening the URL in a new
 * tab (never a dead end).
 */

import { PLATFORMS, studioUrl, packFilename, type Backdrop, type Platform } from './cloudinary';

export async function downloadUrl(url: string, filename: string): Promise<boolean> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 5_000);
    return true;
  } catch {
    window.open(url, '_blank', 'noopener');
    return false;
  }
}

export interface PackResult {
  ok: number;
  failed: number;
}

/**
 * "Create Seller Pack" — downloads the 4 platform images (Instagram, Meesho,
 * Amazon, WhatsApp) for the chosen backdrop, staggered so browsers don't drop
 * them. Returns how many downloaded as files (vs opened in a tab).
 */
export async function downloadSellerPack(publicId: string, backdrop: Backdrop): Promise<PackResult> {
  let ok = 0;
  let failed = 0;
  for (const platform of PLATFORMS) {
    const good = await downloadUrl(studioUrl(publicId, backdrop, platform), packFilename(backdrop, platform));
    if (good) ok += 1;
    else failed += 1;
    await new Promise((r) => setTimeout(r, 700));
  }
  return { ok, failed };
}

