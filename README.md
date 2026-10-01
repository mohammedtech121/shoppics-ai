# ShopPics AI

**Phone photos in. Studio shots out.** ShopPics AI turns one product photo taken on a phone into
clean, studio-style shots sized for the places Indian small sellers actually sell:
**Instagram (1080×1080), Meesho (1080×1350), Amazon (2000×2000) and WhatsApp (1080×1080)** —
downloaded as a one-click **Seller Pack**.

Built for the **Cloudinary AI Hackathon 2026 — Pixels to Products** (Track 3) by
**Mohammed Khan — Team HYDRA** (HackIndia ID: HI012181).

Every image this app shows or downloads is produced by **Cloudinary** — there is no image
processing, no server and no database in this app at all.

---

## The 30-second tour

1. **Upload** a product photo (or use the built-in sample photo).
2. A 5-step pipeline runs, visible on screen:
   **Upload → BG removal → Studio → Pack → Ready**.
3. You land on the result screen where the **before/after slider is the hero**: your original
   phone photo vs the studio shot, in the same frame.
4. A **Studio Suggestion** (heuristic — see Honest Notes) has already picked a style, backdrop and
   platform order for you. Change anything with one tap.
5. Pick a backdrop: **4 solid studio looks** — Studio White, Warm Ivory, Blush Pink, Soft Sage
   (all instant, all reliable; see Honest Notes for why we didn't ship the GenAI beta).
6. Hit **Create Seller Pack** → all 4 platform images download, correctly sized and named.

## How Cloudinary is used (the core of the project)

| Step | What happens | Cloudinary feature | Example chain |
| --- | --- | --- | --- |
| Upload | Photo goes **straight from the browser** to your cloud. No server in between. | **Upload API, unsigned preset** | `POST api.cloudinary.com/v1_1/<cloud>/image/upload` |
| Cutout | Product is separated from its background. | **AI Background Removal add-on** (`e_background_removal`) — returns a transparent PNG | `e_background_removal/<public_id>.png` |
| Solid backdrop | Cutout flattened onto a colour, padded to the platform frame. | Transformations: `fl_flatten`, `b_rgb`, `c_pad` | `e_background_removal/b_rgb:ffffff,fl_flatten/c_pad,w_1080,h_1080,b_rgb:ffffff/f_auto,q_auto` |
| Platform sizing | Each marketplace gets its exact required frame. | `c_pad` / `c_fill` per platform | Instagram 1080², Meesho 1080×1350, Amazon 2000², WhatsApp 1080² |
| Optimisation | Every delivered image is auto-format & auto-quality. | `f_auto,q_auto` | appended to every URL |
| Fair comparison | The "before" image in the slider is your original padded to the same frame. | `c_pad,b_rgb` | `c_pad,w_1080,h_1080,b_rgb:e9e4da/f_auto,q_auto` |

**A note on the GenAI beta:** during the build we also tested Cloudinary's Generative
Background Replace (`e_gen_background_replace`). It worked on our test cloud (~5–14 s
to first render), but it is a documented beta — it can return HTTP 420/423 while generating,
and its availability and credit quota vary by account. A demo that must impress in one
run cannot depend on a beta, so **we deliberately ship only the rock-solid chains above**.
The evaluated URL builder is kept in `src/lib/shoppics/cloudinary.ts` for reference.

## Setup (5 minutes)

### 1. Cloudinary

1. Create/log in to your [Cloudinary](https://cloudinary.com/) account.
2. **Settings → Add-ons → AI Background Removal** → enable the **free tier**.
3. **Settings → Upload → Add upload preset**:
   - Signing mode: **Unsigned**
   - Name it `shoppics_uploads` (any name works — you'll copy it into `.env.local`)
   - Leave folders/formats unrestricted so demo uploads work.
4. Copy your **Cloud name** from the dashboard.

### 2. Environment

```bash
cp .env.example .env.local
```

Fill in (both are `NEXT_PUBLIC_` — the app is 100% client-side, no secrets involved):

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=shoppics_uploads
```

### 3. Run

```bash
npm install
npm run dev      # http://localhost:3000
```

> Windows note: if `npm run dev` complains about `tee`, run `npx next dev -p 3000` instead.

### 4. Deploy to Vercel

1. Push this repo to a **public GitHub repo**.
2. [Vercel](https://vercel.com) → **Continue with GitHub** → import the repo (framework
   auto-detects Next.js; the build command is a plain `next build`).
3. Add the **same two env vars** above (Project → Settings → Environment Variables).
4. Deploy, open the live URL, and run the manual test below with a real photo.

## Manual test script (run this yourself before submitting)

1. `npm install && npm run build` — must pass with **zero errors** (Vercel runs build, not dev).
2. `npm run dev` → upload a **real product photo** on localhost. Keep the browser **Network
   tab** open and confirm:
   - the upload POST to `api.cloudinary.com` succeeds (200),
   - `e_background_removal` image requests succeed,
   - no 4xx/5xx that the UI doesn't recover from.
3. On the result screen confirm: the before/after slider drags, the Studio Suggestion card shows
   reasons, and all 4 backdrops switch instantly. Use the **Home** button (top nav or next to
   “New photo”) to return to the landing page, then reopen the shot from **History**.
4. Click **Create Seller Pack** → 4 files download with names like
   `shoppics-studio-white-meesho-1080x1350.jpg` and the correct pixel dimensions.
5. Reload the page → open **History** (top-right) → your session is still there (localStorage),
   and **Reopen** brings the result screen back.
6. Repeat steps 2–5 on the **live Vercel URL**, then repeat on a **phone** (file picker must work
   on iOS Safari — it does: the picker is a real `<input type="file">` behind a button).

## Honest Notes (please read before judging 🙂

- **"Studio Suggestion" is a heuristic, not computer vision.** It looks only at the photo's
  aspect ratio, pixel dimensions and file size (from Cloudinary's upload response) and applies
  rules of thumb. It is labelled as a heuristic in the UI and here. No vision model classifies
  your product.
- **We evaluated the GenAI beta and chose not to ship it.** `e_gen_background_replace` worked
  in our testing, but it's a Cloudinary beta (can return HTTP 420/423 while generating,
  availability and special transformation credits vary by account, and it can produce small
  artifacts). Every backdrop this demo ships is an instant, reliable delivery-URL chain.
  The evaluated URL builder is kept in the code for reference.
- **The ₹1,000 / 2 days savings stat is an illustrative estimate** based on typical Indian
  freelance product-photo rates. It is not a promise, measurement or guarantee.
- **Aisha's seller story is a fictional example.** The persona, quote and situation were created
  for this demo. The before/after pair in the story section is a real run of this exact pipeline
  on a demo product photo (made during development and cached in `/public/samples`).
- **Everything is localStorage-only.** Shot history lives in your browser. No accounts, no
  server-side storage, no analytics. Clearing browser data clears your history.
- **Security model:** the app runs entirely in the browser with an unsigned upload preset —
  that's what makes a no-backend demo possible. Anyone could upload to that preset if they knew
  your cloud name; the Cloudinary answer for that (signed uploads) needs a server, which this
  hackathon build deliberately doesn't have. Don't reuse this preset for anything sensitive.
- **Single photo at a time.** No batch upload (yet) — one good photo is the demo's story.

## Not included (deliberately cut for this submission)

- AI listing generator (titles/descriptions/tags)
- User accounts / login
- Pricing page
- Extra API routes (the app has none at all)
- Batch upload

## Tech stack

Next.js 16 (App Router, TypeScript) · Tailwind CSS 4 · shadcn/ui · Lucide icons ·
Framer Motion · Sonner — and **Cloudinary for everything image-related**:
unsigned Upload API, AI Background Removal add-on, `b_rgb` flatten, `c_pad`/`c_fill`
sizing, `f_auto/q_auto`.

Plain `<img>` tags are used throughout (no `next/image`), so no `remotePatterns` config is needed.

## Credits

Built by **Mohammed Khan — Team HYDRA** (solo) for the Cloudinary AI Hackathon 2026,
Pixels to Products, Track 3. Image magic: Cloudinary. Demo persona: fictional. Chai: real.
