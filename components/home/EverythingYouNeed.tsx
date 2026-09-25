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
            'linear-gradient(180deg,rgba(255,238,224,.08) 0%,rgba(255,224,207,.06) 38%,rgba(80,52,48,.12) 100%)',
        }}
      />

      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 31%,rgba(255,245,232,.22) 0%,rgba(255,234,219,.08) 36%,rgba(56,37,34,.06) 78%,rgba(37,24,22,.12) 100%)',
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1180px] flex-col items-center px-5 pb-16 pt-[clamp(7rem,11vh,9rem)] md:px-8 md:pb-20">
        <div
          data-reveal
          className="mx-auto max-w-[760px] text-center"
        >
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.34em] text-[#4f4744]/85 md:text-[11px]">
            Discover the possibilities
          </p>

          <h2 className="font-serif text-[clamp(2.7rem,5.2vw,4.7rem)] font-normal leading-[0.94] tracking-[-0.035em] text-[#2b2928] [text-shadow:0_1px_12px_rgba(255,255,255,.24)]">
            Everything You Need
          </h2>

          <p className="mx-auto mt-4 max-w-[650px] text-[clamp(.98rem,1.4vw,1.22rem)] leading-[1.45] tracking-[-0.01em] text-[#514845]/88">
            Powerful tools, boundless creativity, and a more
            beautiful future
            <span className="hidden sm:inline">
              {' '}
              — all in one place.
            </span>
            <span className="sm:hidden">
              {' '}
              — all in one place.
            </span>
          </p>
        </div>

        <div className="mt-[clamp(4rem,8vh,7rem)] grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4 xl:gap-5">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                data-reveal
                className="group relative min-h-[290px] overflow-hidden rounded-[24px] border border-white/45 bg-white/[0.16] px-6 py-7 text-center text-white shadow-[inset_0_1px_0_rgba(255,255,255,.55),inset_0_-1px_0_rgba(255,255,255,.10),0_18px_50px_rgba(77,45,40,.18)] backdrop-blur-[18px] transition-[transform,background-color,border-color,box-shadow] duration-700 ease-[cubic-bezier(.16,1,.3,1)] hover:-translate-y-[5px] hover:border-white/65 hover:bg-white/[0.20] hover:shadow-[inset_0_1px_0_rgba(255,255,255,.72),inset_0_-1px_0_rgba(255,255,255,.13),0_24px_60px_rgba(77,45,40,.22)]"
                style={{
                  backgroundImage:
                    'linear-gradient(145deg,rgba(255,230,219,.24),rgba(200,141,140,.20))',
                }}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-[1px] rounded-[23px] border border-white/[0.16]"
                />

                <div className="relative z-10 flex h-full flex-col items-center">
                  <div className="flex h-[74px] w-[74px] items-center justify-center rounded-full border border-white/45 bg-white/[0.15] shadow-[inset_0_1px_0_rgba(255,255,255,.52),0_8px_26px_rgba(112,63,57,.16)] backdrop-blur-xl transition-[transform,background-color,border-color] duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.04] group-hover:border-white/70 group-hover:bg-white/[0.19]">
                    <Icon
                      className="h-[31px] w-[31px] stroke-[1.45]"
                      aria-hidden="true"
                    />
                  </div>

                  <h3 className="mt-5 font-serif text-[1.7rem] font-normal leading-none tracking-[-0.025em] text-white [text-shadow:0_1px_12px_rgba(91,47,44,.20)]">
                    {feature.title}
                  </h3>

                  <p className="mt-3 max-w-[190px] text-[14px] leading-[1.45] text-white/92">
                    {feature.description}
                  </p>

                  <Link
                    href={feature.href}
                    aria-label={`${feature.title} — learn more`}
                    className="mt-auto flex h-[38px] min-w-[92px] items-center justify-center rounded-full border border-white/55 bg-white/[0.14] px-5 shadow-[inset_0_1px_0_rgba(255,255,255,.48),0_5px_18px_rgba(93,50,46,.12)] backdrop-blur-xl transition-[transform,background-color,border-color] duration-600 ease-[cubic-bezier(.16,1,.3,1)] group-hover:border-white/75 group-hover:bg-white/[0.19]"
                  >
                    <ArrowRight className="h-5 w-5 stroke-[1.45] transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-[3px]" />
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
            'linear-gradient(180deg,rgba(32,23,22,0),rgba(32,23,22,.10))',
        }}
      />
    </section>
  );
}
