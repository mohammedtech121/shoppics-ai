/**
 * ShopPics AI — "Studio Suggestion" heuristics.
 *
 * HONESTY NOTE (mirrored in the UI + README): this is NOT computer vision.
 * It looks only at the image's aspect ratio, pixel dimensions and file size —
 * the numbers Cloudinary's upload response already gives us — and applies
 * simple rules of thumb about Indian marketplace listings.
 */

import { PLATFORMS } from './cloudinary';

export interface HeuristicInput {
  width: number;
  height: number;
  bytes: number;
}

export interface StudioRec {
  /** Human label for the suggested look */
  styleLabel: string;
  /** Suggested backdrop id (always a SOLID backdrop — reliable by design) */
  backdropId: string;
  /** Platform ids in recommended priority order */
  platformIds: string[];
  /** Plain-language reasons, shown in the UI */
  reasons: string[];
}

const ALL_PLATFORMS = PLATFORMS.map((p) => p.id);

export function recommendFromImage(input: HeuristicInput): StudioRec {
  const { width, height, bytes } = input;
  const aspect = height > 0 ? width / height : 1;
  const reasons: string[] = [];

  let styleLabel: string;
  let backdropId: string;
  let platformIds: string[];

  if (aspect < 0.85) {
    styleLabel = 'Fashion-forward look';
    backdropId = 'ivory';
    platformIds = ['meesho', 'instagram', 'whatsapp', 'amazon'];
    reasons.push(
      `Your photo is portrait (${width}×${height}) — that's usually apparel or a tall product, and portrait shots shine on Meesho and Instagram.`,
    );
  } else if (aspect > 1.15) {
    styleLabel = 'Wide hero shot';
    backdropId = 'white';
    platformIds = ['amazon', 'instagram', 'whatsapp', 'meesho'];
    reasons.push(
      `Your photo is landscape (${width}×${height}) — wide shots work best as a centred marketplace hero, so we start with Amazon's square.`,
    );
  } else {
    styleLabel = 'Clean marketplace look';
    backdropId = 'white';
    platformIds = ALL_PLATFORMS;
    reasons.push(
      `Your photo is near-square (${width}×${height}) — square studio shots fit every platform with minimal cropping.`,
    );
  }

  if (bytes > 0 && bytes < 250 * 1024) {
    reasons.push(
      `Heads up: the file is quite small (${Math.round(bytes / 1024)} KB) — check it's sharp before listing.`,
    );
  }
  if (width > 0 && width < 1000) {
    reasons.push(
      `Your photo is ${width}×${height}px. The Amazon frame (2000×2000) will be padded, not enlarged — Cloudinary won't invent pixels that aren't there.`,
    );
  }

  reasons.push('This suggestion is a size-and-shape heuristic, not computer vision — you know your product best.');

  return { styleLabel, backdropId, platformIds, reasons };
}
