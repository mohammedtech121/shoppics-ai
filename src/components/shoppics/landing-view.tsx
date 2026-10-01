'use client';

import { motion } from 'framer-motion';
import {
  ArrowDown,
  BadgeCheck,
  Check,
  CloudUpload,
  Package,
  Palette,
  Scissors,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BeforeAfterSlider } from './before-after-slider';

interface LandingViewProps {
  onStart: () => void;
}

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.5 },
};

const HOW_IT_WORKS = [
  {
    icon: CloudUpload,
    title: 'Upload once',
    text: 'Drop a phone photo — it goes straight to Cloudinary with an unsigned upload preset. No account needed.',
  },
  {
    icon: Scissors,
    title: 'AI cutout',
    text: 'Cloudinary\u2019s AI Background Removal add-on cuts your product out of the clutter — e_background_removal.',
  },
  {
    icon: Palette,
    title: 'Pick a look',
    text: '4 instant studio backdrops — Studio White, Warm Ivory, Blush Pink and Soft Sage — tuned for Indian marketplace listings. Every switch is a live Cloudinary URL.',
  },
  {
    icon: Package,
    title: 'Seller Pack',
    text: 'One click downloads all 4 marketplace sizes: Instagram 1080², Meesho 4:5, Amazon 2000² and WhatsApp.',
  },
];

const CLOUDINARY_CHIPS = [
  'Upload API (unsigned)',
  'AI Background Removal add-on',
  'b_rgb flatten & c_pad framing',
  'f_auto / q_auto',
];

export function LandingView({ onStart }: LandingViewProps) {
  return (
    <main>
      {/* ---------------------------------------------------------------- HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(16,185,129,0.10),transparent)]" />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-14 pt-10 sm:pt-16 lg:grid-cols-2 lg:gap-14 lg:pb-20 lg:pt-20">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800"
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Cloudinary AI Hackathon 2026 · Pixels to Products
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-stone-900 sm:text-5xl lg:text-[3.4rem]"
            >
              Phone photo in.
              <br />
              <span className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Studio shot out.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.16 }}
              className="mt-5 max-w-xl text-base leading-relaxed text-stone-600 sm:text-lg"
            >
              ShopPics AI cuts your product out with Cloudinary AI, drops it on clean studio backdrops, and hands you a
              ready-to-post pack for <span className="font-semibold text-stone-800">Instagram, Meesho, Amazon &
              WhatsApp</span>. No photographer, no studio, no design app.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.24 }}
              className="mt-7 flex flex-wrap items-center gap-3"
            >
              <Button
                type="button"
                size="lg"
                onClick={onStart}
                className="h-13 rounded-2xl bg-emerald-700 px-7 text-base font-bold text-white shadow-lg shadow-emerald-900/25 transition hover:-translate-y-0.5 hover:bg-emerald-800"
              >
                <Sparkles className="mr-2 h-5 w-5" aria-hidden />
                Try it — free, no signup
              </Button>
              <a
                href="#seller-story"
                className="inline-flex h-13 items-center gap-2 rounded-2xl border border-stone-300 bg-white/70 px-6 text-base font-semibold text-stone-700 transition hover:-translate-y-0.5 hover:border-stone-400 hover:bg-white"
              >
                See an example
                <ArrowDown className="h-4 w-4" aria-hidden />
              </a>
            </motion.div>

            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.36 }}
              className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-stone-500"
            >
              {['Works right in your browser', 'History stays on your device', 'No signup, no server, no tracking'].map(
                (t) => (
                  <li key={t} className="inline-flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
                    {t}
                  </li>
                ),
              )}
            </motion.ul>
          </div>

          {/* Hero visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative mx-auto w-full max-w-md lg:max-w-none"
          >
            <div className="absolute -left-4 -top-4 -z-10 h-full w-full rotate-3 rounded-[2rem] border border-stone-200 bg-stone-100" aria-hidden />
            <div className="relative overflow-hidden rounded-[2rem] border border-stone-200/90 bg-white shadow-xl shadow-stone-900/10">
              <img
                src="/samples/story-after.jpg"
                alt="Example studio result — jhumka earrings on a warm ivory studio backdrop"
                width={1080}
                height={1080}
                className="aspect-square w-full object-cover"
                draggable={false}
              />
              <span className="absolute left-4 top-4 rounded-full bg-stone-900/60 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                Studio shot · example
              </span>
            </div>

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
              className="absolute -right-3 top-8 rounded-2xl border border-stone-200 bg-white/95 px-3.5 py-2.5 shadow-lg backdrop-blur-sm sm:-right-6"
            >
              <p className="text-[11px] font-semibold text-stone-800">Instagram</p>
              <p className="text-[10px] text-stone-500">1080 × 1080</p>
            </motion.div>
            <motion.div
              animate={{ y: [0, 9, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut', delay: 0.8 }}
              className="absolute -left-3 bottom-20 rounded-2xl border border-stone-200 bg-white/95 px-3.5 py-2.5 shadow-lg backdrop-blur-sm sm:-left-6"
            >
              <p className="text-[11px] font-semibold text-stone-800">Amazon</p>
              <p className="text-[10px] text-stone-500">2000 × 2000</p>
            </motion.div>
            <motion.div
              animate={{ y: [0, -7, 0] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut', delay: 1.6 }}
              className="absolute -bottom-4 right-8 rounded-2xl border border-emerald-200 bg-emerald-50/95 px-3.5 py-2.5 shadow-lg backdrop-blur-sm"
            >
              <p className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800">
                <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                Seller Pack · 4 sizes
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ------------------------------------------------------- SELLER STORY */}
      <section id="seller-story" className="border-y border-stone-200/70 bg-white/70 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div {...fadeUp} className="mb-10 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
              A seller story · fictional example
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl">
              Meet Aisha from Jaipur
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-stone-600">
              Aisha sells jhumka earrings on Meesho and Instagram. Her product photos were… her kitchen table, her chai
              cup, her shadow. A photographer quoted <span className="font-semibold text-stone-800">₹1,000 and two
              days</span> for five proper shots — that&apos;s normal. With ShopPics AI, she uploads one photo, picks a
              look, and downloads a full marketplace pack while her chai is still warm.
            </p>
          </motion.div>

          <div className="grid items-start gap-8 lg:grid-cols-[1.25fr_1fr]">
            <motion.div {...fadeUp}>
              <BeforeAfterSlider
                before="/samples/story-before.jpg"
                after="/samples/story-after.jpg"
                beforeLabel="Aisha's phone photo"
                afterLabel="ShopPics studio shot"
                initial={55}
                className="aspect-square w-full shadow-lg shadow-stone-900/10"
              />
              <p className="mt-3 text-center text-xs text-stone-500">
                Drag the handle — before/after from an example run of this exact pipeline (demo photo, processed with
                Cloudinary AI).
              </p>
            </motion.div>

            <motion.div {...fadeUp} className="flex flex-col gap-5">
              <Card className="border-stone-200/80 bg-white shadow-sm">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-start gap-4">
                    <img
                      src="/samples/aisha.png"
                      alt="Aisha (fictional example seller) at her work table"
                      className="h-14 w-14 rounded-2xl border border-stone-200 object-cover"
                      width={56}
                      height={56}
                      draggable={false}
                    />
                    <div>
                      <blockquote className="text-[15px] font-medium leading-relaxed text-stone-800">
                        “It feels like cheating. It&apos;s just my phone, my window light, and this.”
                      </blockquote>
                      <p className="mt-2 text-xs text-stone-500">
                        — Aisha K., Jaipur <span className="text-stone-400">(fictional persona for this demo)</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-amber-200/80 bg-amber-50/60 shadow-sm">
                <CardContent className="p-5 sm:p-6">
                  <p className="text-[13px] leading-relaxed text-amber-900">
                    <span className="font-bold">Honesty note:</span> Aisha is a fictional example seller created for
                    this demo — the savings figure is an illustrative estimate, not a promise. Her “studio shot” is a
                    real run of this exact pipeline: Cloudinary AI background removal → warm-ivory backdrop → 1080×1080
                    pad. The four shipped looks:
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {[
                      { name: 'Studio White', hex: '#ffffff' },
                      { name: 'Warm Ivory', hex: '#f5eee3' },
                      { name: 'Blush Pink', hex: '#f6e3de' },
                      { name: 'Soft Sage', hex: '#e7ede4' },
                    ].map((b) => (
                      <span
                        key={b.name}
                        className="flex items-center gap-2 rounded-xl border border-amber-200/80 bg-white/70 px-2.5 py-2"
                      >
                        <span
                          className="h-6 w-6 shrink-0 rounded-lg border border-stone-200"
                          style={{ backgroundColor: b.hex }}
                          aria-hidden
                        />
                        <span className="text-[11px] font-semibold text-amber-900">{b.name}</span>
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 text-center text-[11px] font-medium text-amber-800">
                    Instant, reliable delivery-URL transformations — every tap, no exceptions.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- HOW IT WORKS */}
      <section className="py-14 sm:py-20" aria-labelledby="how-it-works">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div {...fadeUp} className="mb-10 text-center">
            <h2 id="how-it-works" className="text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl">
              Four steps. One upload.
            </h2>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((s, i) => (
              <motion.div key={s.title} {...fadeUp} transition={{ duration: 0.45, delay: i * 0.08 }}>
                <Card className="h-full border-stone-200/80 bg-white/80 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                  <CardContent className="flex h-full flex-col gap-3 p-5">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-700/10 text-emerald-700">
                      <s.icon className="h-5.5 w-5.5" aria-hidden />
                    </span>
                    <p className="text-sm font-bold text-stone-900">
                      <span className="mr-1.5 text-emerald-700">{i + 1}.</span>
                      {s.title}
                    </p>
                    <p className="text-[13px] leading-relaxed text-stone-600">{s.text}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- CLOUDINARY STRIP */}
      <section className="border-y border-stone-200/70 bg-stone-900 py-10 text-white">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-400">
            Powered by Cloudinary, end to end
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-[13px] leading-relaxed text-stone-300">
            Every image this app shows is a live Cloudinary delivery-URL transformation — no image editing happens on
            our side, and there is no server at all.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {CLOUDINARY_CHIPS.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-stone-700 bg-stone-800/80 px-3.5 py-1.5 text-xs font-medium text-stone-200"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- FINAL CTA */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-3xl px-4">
          <motion.div
            {...fadeUp}
            className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900 px-6 py-12 text-center text-white shadow-xl shadow-emerald-900/25 sm:px-12"
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_20%,white_1px,transparent_1px),radial-gradient(circle_at_80%_80%,white_1px,transparent_1px)] [background-size:26px_26px]"
              aria-hidden
            />
            <h2 className="relative text-2xl font-extrabold tracking-tight sm:text-3xl">
              Ready to try it with your product?
            </h2>
            <p className="relative mx-auto mt-3 max-w-xl text-sm leading-relaxed text-emerald-100/90">
              Upload one photo and watch the whole pipeline run — then download your Seller Pack and post it the same
              evening.
            </p>
            <Button
              type="button"
              size="lg"
              onClick={onStart}
              className="relative mt-7 h-13 rounded-2xl bg-white px-7 text-base font-bold text-emerald-800 shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-50"
            >
              <Sparkles className="mr-2 h-5 w-5" aria-hidden />
              Open the Studio
            </Button>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
