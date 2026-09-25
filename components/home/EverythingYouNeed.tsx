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
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                data-reveal
                className="group relative min-h-[304px] overflow-hidden rounded-[24px] border border-white/45 bg-white/[0.16] px-6 py-7 text-center text-white shadow-[inset_0_1px_0_rgba(255,255,255,.58),inset_0_-1px_0_rgba(255,255,255,.10),0_18px_50px_rgba(77,45,40,.18)] backdrop-blur-[18px] transition-[transform,background-color,border-color,box-shadow] duration-700 ease-[cubic-bezier(.16,1,.3,1)] hover:-translate-y-[7px] hover:scale-[1.008] hover:border-white/70 hover:bg-white/[0.20] hover:shadow-[inset_0_1px_0_rgba(255,255,255,.76),inset_0_-1px_0_rgba(255,255,255,.13),0_28px_68px_rgba(77,45,40,.24)]"
                style={{
                  backgroundImage:
                    'linear-gradient(145deg,rgba(255,230,219,.25),rgba(200,141,140,.20))',
                }}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-[1px] rounded-[23px] border border-white/[0.16]"
                />

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-6 top-0 h-px origin-center scale-x-[0.24] bg-white/55 opacity-40 transition-[transform,opacity] duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-x-100 group-hover:opacity-85"
                />

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 top-[76px] h-[96px] w-[96px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,221,203,.22)_0%,rgba(255,221,203,.08)_48%,transparent_72%)] opacity-70 blur-[16px] transition-[transform,opacity] duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.18] group-hover:opacity-95"
                />

                <div className="relative z-10 flex h-full flex-col items-center">
                  <div
                    className="feature-icon-float relative h-[84px] w-[84px] [perspective:800px]"
                    style={{
                      animationDelay: `-${index * 0.72}s`,
                    }}
                  >
                    <div className="absolute inset-0 [transform-style:preserve-3d] transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:[transform:rotateX(7deg)_rotateY(-9deg)_translateY(-4px)]">
                      <div className="absolute inset-[2px] rounded-full border border-white/55 bg-[radial-gradient(circle_at_34%_24%,rgba(255,255,255,.72)_0%,rgba(255,239,231,.30)_24%,rgba(218,145,139,.18)_58%,rgba(155,84,78,.16)_100%)] shadow-[inset_0_2px_3px_rgba(255,255,255,.62),inset_0_-9px_18px_rgba(120,65,59,.12),0_12px_30px_rgba(95,49,45,.22)] backdrop-blur-xl [transform:translateZ(0)] transition-[border-color,box-shadow] duration-700 group-hover:border-white/80 group-hover:shadow-[inset_0_2px_3px_rgba(255,255,255,.76),inset_0_-10px_20px_rgba(120,65,59,.14),0_18px_34px_rgba(95,49,45,.28)]" />

                      <div className="absolute inset-[9px] rounded-full border border-white/20 bg-white/[0.045] shadow-[inset_0_1px_0_rgba(255,255,255,.40)] [transform:translateZ(8px)]" />

                      <div className="absolute left-[17px] top-[13px] h-[22px] w-[36px] -rotate-[24deg] rounded-full bg-white/28 blur-[5px] [transform:translateZ(12px)] transition-[transform,opacity] duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-[4px] group-hover:-translate-y-[2px] group-hover:opacity-90" />

                      <Icon
                        aria-hidden="true"
                        className="absolute left-1/2 top-1/2 h-[33px] w-[33px] -translate-x-[calc(50%-1.5px)] -translate-y-[calc(50%-2px)] stroke-[1.7] text-[#9f5c58]/50 blur-[.35px] [transform:translateZ(13px)]"
                      />

                      <Icon
                        aria-hidden="true"
                        className="absolute left-1/2 top-1/2 h-[33px] w-[33px] -translate-x-1/2 -translate-y-1/2 stroke-[1.55] text-white drop-shadow-[0_2px_5px_rgba(112,57,52,.26)] [transform:translateZ(18px)] transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.08]"
                      />

                      <div className="absolute inset-[1px] rounded-full border border-white/20 [transform:translateZ(20px)]" />
                    </div>
                  </div>

                  <h3 className="mt-5 font-serif text-[1.7rem] font-normal leading-none tracking-[-0.025em] text-white [text-shadow:0_1px_12px_rgba(91,47,44,.20)] transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:-translate-y-[1px]">
                    {feature.title}
                  </h3>

                  <p className="mt-3 max-w-[190px] text-[14px] leading-[1.45] text-white/92">
                    {feature.description}
                  </p>

                  <Link
                    href={feature.href}
                    aria-label={`${feature.title} — learn more`}
                    className="mt-auto flex h-[38px] min-w-[92px] items-center justify-center rounded-full border border-white/55 bg-white/[0.14] px-5 shadow-[inset_0_1px_0_rgba(255,255,255,.48),0_5px_18px_rgba(93,50,46,.12)] backdrop-blur-xl transition-[transform,background-color,border-color,box-shadow] duration-600 ease-[cubic-bezier(.16,1,.3,1)] group-hover:border-white/80 group-hover:bg-white/[0.19] group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,.60),0_8px_20px_rgba(93,50,46,.16)]"
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
