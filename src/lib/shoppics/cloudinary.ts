/**
 * ShopPics AI — client-side Cloudinary helpers.
 *
 * SECURITY MODEL (important, also documented in README):
 * - This app has NO server and NO secrets. Everything below runs in the browser.
 * - Uploads use an UNSIGNED upload preset (browser-safe by design).
 * - All edits are Cloudinary delivery-URL transformations (no signed APIs).
 * - The only config needed: cloud name + unsigned preset name (NEXT_PUBLIC_*).
 *
 * Verified transformation chains (tested via curl on a real Cloudinary cloud):
 * - AI Background Removal:  e_background_removal            → transparent PNG (add-on)
 * - Solid studio backdrop:   e_background_removal/b_rgb:HEX,fl_flatten/c_pad,w,h,b_rgb:HEX
 * - GenAI backdrop (beta):   e_gen_background_replace:prompt/c_fill,w,h,g_auto
 *   → evaluated during the build but NOT shipped in the UI (see README Honest Notes:
 *     the beta can be slow/unavailable depending on the account, so the demo ships
 *     only the rock-solid chains). genBackdropUrl() is kept for reference.
 * - Platform "before" pad:  c_pad,w,h,b_rgb:HEX
 * - All finals append:       /f_auto,q_auto
 */

export const CLOUD_NAME = (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? '').trim();
export const UPLOAD_PRESET = (process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? '').trim();

export function isCloudinaryConfigured(): boolean {
  return CLOUD_NAME.length > 0 && UPLOAD_PRESET.length > 0;
}

const delivery = () => `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;

/* ----------------------------------------------------------------------------
 * Upload (unsigned, with progress)
 * ------------------------------------------------------------------------- */

export interface UploadResult {
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
  originalFilename: string;
}

export function uploadImage(
  file: File | Blob,
  onProgress?: (pct: number) => void,
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured()) {
      reject(
        new Error(
          'Cloudinary is not configured. Copy .env.example to .env.local and set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.',
        ),
      );
      return;
    }
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', UPLOAD_PRESET);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      try {
        const r = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && r.public_id) {
          resolve({
            publicId: r.public_id as string,
            secureUrl: r.secure_url as string,
            width: (r.width as number) ?? 0,
            height: (r.height as number) ?? 0,
            bytes: (r.bytes as number) ?? 0,
            format: (r.format as string) ?? 'jpg',
            originalFilename:
              (r.original_filename as string) || 'product-photo',
          });
        } else {
          reject(new Error(r?.error?.message ?? `Cloudinary upload failed (HTTP ${xhr.status})`));
        }
      } catch {
        reject(new Error('Could not read the Cloudinary upload response.'));
      }
    };
    xhr.onerror = () => reject(new Error('Network error while uploading to Cloudinary.'));
    xhr.send(fd);
  });
}

/* ----------------------------------------------------------------------------
 * Backdrops
 * ------------------------------------------------------------------------- */

export type BackdropKind = 'solid' | 'genai';

export interface Backdrop {
  id: string;
  name: string;
  kind: BackdropKind;
  /** 6-digit hex (no #) for solid backdrops */
  hex?: string;
  /** Prompt for Cloudinary's beta Generative Background Replace */
  prompt?: string;
  hint: string;
}

/**
 * 4 solid studio backdrops (instant, reliable — AI Background Removal + flatten + pad).
 * GenAI backdrops were tested but are NOT shipped: e_gen_background_replace is a
 * Cloudinary beta whose availability/latency varies by account, and this demo must
 * work flawlessly on any judge's run. The URL builder is kept below for reference.
 */
export const BACKDROPS: Backdrop[] = [
  { id: 'white', name: 'Studio White', kind: 'solid', hex: 'ffffff', hint: 'The marketplace favourite — clean & crisp' },
  { id: 'ivory', name: 'Warm Ivory', kind: 'solid', hex: 'f5eee3', hint: 'Soft premium tone for handicrafts & apparel' },
  { id: 'blush', name: 'Blush Pink', kind: 'solid', hex: 'f6e3de', hint: 'Pretty in pink — accessories & beauty' },
  { id: 'sage', name: 'Soft Sage', kind: 'solid', hex: 'e7ede4', hint: 'Calm green-grey — home & skincare' },
];

export const FALLBACK_BACKDROP_ID = 'white';

export function getBackdrop(id: string): Backdrop {
  return BACKDROPS.find((b) => b.id === id) ?? BACKDROPS[0];
}

/* ----------------------------------------------------------------------------
 * Platforms
 * ------------------------------------------------------------------------- */

export interface Platform {
  id: string;
  name: string;
  w: number;
  h: number;
  blurb: string;
}

export const PLATFORMS: Platform[] = [
  { id: 'instagram', name: 'Instagram', w: 1080, h: 1080, blurb: 'Square post · 1080 × 1080' },
  { id: 'meesho', name: 'Meesho', w: 1080, h: 1350, blurb: '4:5 catalogue · 1080 × 1350' },
  { id: 'amazon', name: 'Amazon', w: 2000, h: 2000, blurb: 'Marketplace main · 2000 × 2000' },
  { id: 'whatsapp', name: 'WhatsApp', w: 1080, h: 1080, blurb: 'Share-ready · 1080 × 1080' },
];

export function getPlatform(id: string): Platform {
  return PLATFORMS.find((p) => p.id === id) ?? PLATFORMS[0];
}

/* ----------------------------------------------------------------------------
 * URL builders (pure, client-safe)
 * ------------------------------------------------------------------------- */

/** Transparent PNG cutout from the AI Background Removal add-on. */
export function cutoutUrl(publicId: string): string {
  return `${delivery()}/e_background_removal/${publicId}.png`;
}

/**
 * "Before" image for a fair slider comparison: the ORIGINAL photo padded to the
 * same frame the studio version will use (no AI at all).
 */
export function beforePadUrl(publicId: string, platform: Platform): string {
  return `${delivery()}/c_pad,w_${platform.w},h_${platform.h},b_rgb:e9e4da/f_auto,q_auto/${publicId}.jpg`;
}

/**
 * Solid studio shot: AI cutout → flattened onto a colour → padded to platform size.
 * Verified chain: e_background_removal/b_rgb:HEX,fl_flatten/c_pad,w,h,b_rgb:HEX/f_auto,q_auto
 */
export function solidStudioUrl(publicId: string, hex: string, platform: Platform): string {
  return `${delivery()}/e_background_removal/b_rgb:${hex},fl_flatten/c_pad,w_${platform.w},h_${platform.h},b_rgb:${hex}/f_auto,q_auto/${publicId}.jpg`;
}

/**
 * GenAI backdrop (beta): replaces the background behind the product, then fills
 * the platform frame with subject-aware gravity. Verified chain:
 * e_gen_background_replace:prompt/c_fill,w,h,g_auto/f_auto,q_auto
 */
export function genBackdropUrl(publicId: string, prompt: string, platform: Platform): string {
  // NOT used by the shipped UI — kept from our beta evaluation for reference (see README).
  const p = encodeURIComponent(prompt);
  return `${delivery()}/e_gen_background_replace:${p}/c_fill,w_${platform.w},h_${platform.h},g_auto/f_auto,q_auto/${publicId}.jpg`;
}

/** Small square preview of a backdrop (used for picker tiles + history thumbs). */
export function backdropPreviewUrl(publicId: string, backdrop: Backdrop, size = 480): string {
  const preview: Platform = { id: 'preview', name: 'preview', w: size, h: size, blurb: '' };
  return backdrop.kind === 'genai'
    ? genBackdropUrl(publicId, backdrop.prompt ?? '', preview)
    : solidStudioUrl(publicId, backdrop.hex ?? 'ffffff', preview);
}

/** The main studio image for the active backdrop + platform. */
export function studioUrl(publicId: string, backdrop: Backdrop, platform: Platform): string {
  return backdrop.kind === 'genai'
    ? genBackdropUrl(publicId, backdrop.prompt ?? '', platform)
    : solidStudioUrl(publicId, backdrop.hex ?? 'ffffff', platform);
}

/** Filename for downloads, e.g. shoppics-marble-luxe-meesho-1080x1350.jpg */
export function packFilename(backdrop: Backdrop, platform: Platform): string {
  const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `shoppics-${slug(backdrop.name)}-${slug(platform.name)}-${platform.w}x${platform.h}.jpg`;
}
