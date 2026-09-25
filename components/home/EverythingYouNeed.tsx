'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Flower2,
  Leaf,
  Mountain,
  SunMedium,
} from 'lucide-react';

const BACKGROUND_IMAGE =
  'https://res.cloudinary.com/diometfe9/image/upload/v1790183196/download_enkn9u.png';

const FEATURES = [
  {
    title: 'Create',
    description:
      'Bring your ideas to life with intuitive tools.',
    href: '/contact',
    icon: Flower2,
  },
  {
    title: 'Explore',
    description:
      'Discover new perspectives and endless inspiration.',
    href: '/work',
    icon: Mountain,
  },
  {
    title: 'Transform',
    description:
      'Turn imagination into reality.',
    href: '/contact',
    icon: SunMedium,
  },
  {
    title: 'Grow',
    description:
      'A brighter, more creative tomorrow awaits.',
    href: '/about',
    icon: Leaf,
  },
] as const;

export function EverythingYouNeed() {
  return (
    <section
      id="possibilities"
      className="relative z-40 isolate min-h-[100svh] overflow-hidden bg-[#e7b6a9] text-[#302b2a]"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url("${BACKGROUND_IMAGE}")`,
        }}
      />

      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg,rgba(255,239,226,.06) 0%,rgba(255,226,211,.035) 42%,rgba(64,42,39,.10) 100%)',
        }}
      />

      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 29%,rgba(255,248,237,.20) 0%,rgba(255,239,227,.07) 36%,rgba(70,45,41,.04) 76%,rgba(42,28,25,.10) 100%)',
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1180px] flex-col items-center px-5 pb-16 pt-[clamp(7.5rem,12vh,9.5rem)] md:px-8 md:pb-20">
        <div
          data-reveal
          className="mx-auto max-w-[760px] text-center"
        >
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.34em] text-[#4e4643]/86 md:text-[11px]">
            Discover the possibilities
          </p>

          <h2 className="font-serif text-[clamp(2.7rem,5.2vw,4.7rem)] font-normal leading-[0.94] tracking-[-0.035em] text-[#2c2a29] [text-shadow:0_1px_12px_rgba(255,255,255,.20)]">
            Everything You Need
          </h2>

          <p className="mx-auto mt-4 max-w-[650px] text-[clamp(.98rem,1.35vw,1.18rem)] leading-[1.45] tracking-[-0.01em] text-[#514845]/86">
            Powerful tools, boundless creativity, and a more
            beautiful future — all in one place.
          </p>
        </div>

        <div className="relative mt-[clamp(2.9rem,5.4vh,4.6rem)] grid w-full max-w-[840px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-[14px] lg:[transform:translateY(24px)_scale(0.92)]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-[7px] left-1/2 hidden h-[16px] w-[76%] -translate-x-1/2 rounded-[50%] bg-[#5c3733]/12 blur-[13px] lg:block"
          />
          {FEATURES.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                data-reveal
                className="group relative min-h-[205px] overflow-hidden rounded-[22px] border border-white/[0.44] bg-white/[0.07] px-5 py-[14px] text-center text-white shadow-[inset_0_1px_0_rgba(255,255,255,.35),inset_0_-1px_0_rgba(255,255,255,.05),0_9px_22px_rgba(75,44,40,.10)] backdrop-blur-[14px] transition-[transform,background-color,border-color,box-shadow] duration-700 ease-[cubic-bezier(.16,1,.3,1)] hover:-translate-y-[2px] hover:border-white/[0.58] hover:bg-white/[0.09] hover:shadow-[inset_0_1px_0_rgba(255,255,255,.48),inset_0_-1px_0_rgba(255,255,255,.07),0_15px_30px_rgba(75,44,40,.13)]"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-[1px] rounded-[21px] border border-white/[0.10]"
                />

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-[18px] top-0 h-px bg-white/[0.48] opacity-70"
                />

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-60"
                  style={{
                    background:
                      'linear-gradient(145deg,rgba(255,255,255,.05) 0%,rgba(255,219,207,.035) 44%,rgba(184,118,111,.045) 100%)',
                  }}
                />

                <div className="relative z-10 flex h-full flex-col items-center">
                  <div className="relative h-[54px] w-[54px] transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:-translate-y-[2px] group-hover:scale-[1.02]">
                    <div className="absolute inset-0 rounded-full border border-white/[0.50] bg-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,.46),inset_0_-7px_16px_rgba(111,66,60,.08),0_8px_22px_rgba(93,52,47,.13)] backdrop-blur-[14px]" />

                    <div
                      aria-hidden="true"
                      className="absolute inset-[6px] rounded-full border border-white/[0.12]"
                    />

                    <div
                      aria-hidden="true"
                      className="absolute left-[13px] top-[9px] h-[13px] w-[24px] -rotate-[22deg] rounded-full bg-white/[0.22] blur-[5px] opacity-80 transition-[transform,opacity] duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-[2px] group-hover:-translate-y-[1px] group-hover:opacity-100"
                    />

                    <Icon
                      aria-hidden="true"
                      className="absolute left-1/2 top-1/2 h-[27px] w-[27px] -translate-x-[calc(50%-1px)] -translate-y-[calc(50%-1.5px)] stroke-[1.7] text-[#a16660]/36 blur-[.3px]"
                    />

                    <Icon
                      aria-hidden="true"
                      className="absolute left-1/2 top-1/2 h-[27px] w-[27px] -translate-x-1/2 -translate-y-1/2 stroke-[1.5] text-white drop-shadow-[0_2px_4px_rgba(108,61,56,.18)] transition-[transform,filter] duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.055] group-hover:drop-shadow-[0_3px_7px_rgba(108,61,56,.22)]"
                    />
                  </div>

                  <h3 className="mt-3 font-serif text-[1.4rem] font-normal leading-none tracking-[-0.025em] text-white [text-shadow:0_1px_10px_rgba(91,47,44,.18)]">
                    {feature.title}
                  </h3>

                  <p className="mt-2 max-w-[162px] text-[12.5px] leading-[1.42] text-white/92">
                    {feature.description}
                  </p>

                  <Link
                    href={feature.href}
                    aria-label={`${feature.title} — learn more`}
                    className="mt-auto flex h-[30px] min-w-[76px] items-center justify-center rounded-full border border-white/[0.52] bg-white/[0.075] px-4 shadow-[inset_0_1px_0_rgba(255,255,255,.36),0_4px_12px_rgba(93,50,46,.09)] backdrop-blur-[14px] transition-[transform,background-color,border-color,box-shadow] duration-600 ease-[cubic-bezier(.16,1,.3,1)] hover:-translate-y-[1px] hover:border-white/[0.72] hover:bg-white/[0.105]"
                  >
                    <ArrowRight className="h-[17px] w-[17px] stroke-[1.4] transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-[2px]" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[18%]"
        style={{
          background:
            'linear-gradient(180deg,rgba(32,23,22,0),rgba(32,23,22,.08))',
        }}
      />
    </section>
  );
}
