/**
 * Image preloading with retries + cache-busting.
 *
 * Why retries: Cloudinary's beta Generative Background Replace can answer
 * HTTP 420 (pending) / 423 (still generating) on first request while the AI
 * works — the browser just sees an <img>/Image() error, so we wait and try
 * again with a cache-buster. (On the cloud we tested, generation served 200
 * directly after ~5–14 s, but the retries are kept as defensive handling for
 * the documented beta behaviour.)
 */

export interface LoadOptions {
  attempts?: number;
  delayMs?: number;
  /** Called on each retry: (attemptNumber) */
  onRetry?: (attempt: number) => void;
}

export function loadImage(url: string, opts: LoadOptions = {}): Promise<void> {
  const attempts = Math.max(1, opts.attempts ?? 3);
  const delayMs = Math.max(0, opts.delayMs ?? 1500);
  const timeoutMs = 90_000;

  return new Promise<void>((resolve, reject) => {
    let attempt = 0;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let watchdog: ReturnType<typeof setTimeout> | undefined;
    let settled = false;

    const finish = (err?: Error) => {
      if (settled) return;
      settled = true;
      if (retryTimer) clearTimeout(retryTimer);
      if (watchdog) clearTimeout(watchdog);
      if (err) reject(err);
      else resolve();
    };

    const tryLoad = () => {
      attempt += 1;
      // Cache-buster so a previously-failed (420/423 or network) response is
      // re-requested rather than served from the browser's error cache.
      const bust = url + (url.includes('?') ? '&' : '?') + 'r=' + Date.now();
      const img = new Image();
      img.onload = () => finish();
      img.onerror = () => {
        if (attempt < attempts) {
          opts.onRetry?.(attempt);
          retryTimer = setTimeout(tryLoad, delayMs);
        } else {
          finish(new Error(`Image failed to load after ${attempts} attempts.`));
        }
      };
      img.src = bust;
    };

    watchdog = setTimeout(() => finish(new Error('Image load timed out.')), timeoutMs);
    tryLoad();
  });
}
