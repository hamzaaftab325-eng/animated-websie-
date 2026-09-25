'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { useSmoothScroll } from '../motion/SmoothScrollProvider';

const VIDEO_URL =
  'https://res.cloudinary.com/diometfe9/video/upload/v1790182288/Create_cinematic_zoom_effect_video_20260923214757_m00y5v.mp4';

const CUES = [
  [0.0, 0.0, 0.15, 0.23],
  [0.35, 0.43, 0.57, 0.65],
  [0.77, 0.85, 1.1, 1.2],
] as const;

const DRIFT = 22;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const smooth = (value: number) =>
  value * value * (3 - 2 * value);

const ramp = (
  progress: number,
  start: number,
  end: number
) => {
  if (end <= start) {
    return progress >= end ? 1 : 0;
  }

  return smooth(
    clamp((progress - start) / (end - start), 0, 1)
  );
};

export function CinematicHero() {
  const { lenis } = useSmoothScroll();
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(SplitText);

    if (!rootRef.current) return;

    const context = gsap.context(() => {
      const panels = gsap.utils.toArray<HTMLElement>('[data-panel]');

      panels.forEach((panel) => {
        const title = panel.querySelector<HTMLElement>('[data-hero-title]');
        const copy = panel.querySelector<HTMLElement>('[data-hero-copy]');

        if (!title || !copy) return;

        const titleSplit = SplitText.create(title, {
          type: 'lines',
          mask: 'lines',
          linesClass: 'split-mask',
        });

        const copySplit = SplitText.create(copy, {
          type: 'lines',
          mask: 'lines',
          linesClass: 'split-mask',
        });

        panel.dataset.splitReady = 'true';

        gsap.set(titleSplit.lines, {
          yPercent: 105,
          opacity: 0,
        });

        gsap.set(copySplit.lines, {
          yPercent: 70,
          opacity: 0,
        });

        panel.dataset.revealed = 'false';

        const reveal = () => {
          if (panel.dataset.revealed === 'true') return;
          panel.dataset.revealed = 'true';

          gsap
            .timeline()
            .to(titleSplit.lines, {
              yPercent: 0,
              opacity: 1,
              duration: 1,
              stagger: 0.06,
              ease: 'expo.out',
            })
            .to(
              copySplit.lines,
              {
                yPercent: 0,
                opacity: 1,
                duration: 0.9,
                stagger: 0.04,
                ease: 'power4.out',
              },
              0.22
            );
        };

        (panel as HTMLElement & { __reveal?: () => void }).__reveal =
          reveal;
      });
    }, rootRef);

    return () => context.revert();
  }, []);

  useEffect(() => {
    if (!lenis || !rootRef.current) return;

    const root = rootRef.current;
    const clip = root.querySelector<HTMLVideoElement>('#clip');
    const boot = root.querySelector<HTMLElement>('#boot');
    const bootBar = root.querySelector<HTMLElement>('#bootBar');
    const bootPct = root.querySelector<HTMLElement>('#bootPct');
    const meter = root.querySelector<HTMLElement>('#meter');
    const panels = Array.from(
      root.querySelectorAll<HTMLElement>('[data-panel]')
    );

    if (!clip || !boot || !bootBar || !bootPct || !meter) {
      return;
    }

    let progress = 0;
    let seekTo = 0;
    let seekAt = 0;
    let duration = 0;
    let ready = false;
    let started = false;
    let attached = false;
    let rafId = 0;
    let blobUrl = '';
    let bailTimer = 0;
    let startTimer = 0;
    let abortController: AbortController | null = null;
    let detachVideo: (() => void) | undefined;

    const setProgress = (fraction: number) => {
      const value = clamp(fraction, 0, 1);
      bootBar.style.transform = `scaleX(${value})`;
      bootPct.textContent =
        `LOADING ${Math.round(value * 100)}%`;
    };

    const readScroll = () => {
      const max =
        document.documentElement.scrollHeight -
        window.innerHeight;

      progress =
        max > 0
          ? clamp(lenis.scroll / max, 0, 1)
          : 0;

      if (duration) {
        seekTo = progress * duration;
      }
    };

    const paint = () => {
      meter.style.transform = `scaleX(${progress})`;

      panels.forEach((panel, index) => {
        const cue = CUES[index];
        if (!cue) return;

        const enter = ramp(progress, cue[0], cue[1]);
        const leave = ramp(progress, cue[2], cue[3]);
        const opacity = enter * (1 - leave);
        const y =
          (1 - enter) * DRIFT -
          leave * DRIFT;

        panel.style.opacity = String(opacity);
        panel.style.transform =
          `translate3d(0,${y}px,0)`;
        panel.style.pointerEvents =
          opacity > 0.6 ? 'auto' : 'none';

        if (opacity > 0.55) {
          (
            panel as HTMLElement & {
              __reveal?: () => void;
            }
          ).__reveal?.();
        }
      });
    };

    const frame = () => {
      if (ready && duration) {
        const gap = seekTo - seekAt;

        if (Math.abs(gap) > 0.0008) {
          // Same interpolation as the supplied scrub reference.
          seekAt += gap * 0.115;

          if (clip.readyState >= 2 && !clip.seeking) {
            try {
              clip.currentTime = seekAt;
            } catch {}
          }
        }
      }

      paint();
      rafId = requestAnimationFrame(frame);
    };

    const start = () => {
      if (started) return;
      started = true;
      ready = true;
      readScroll();
      seekAt = seekTo;

      gsap.to(boot, {
        opacity: 0,
        duration: 0.72,
        ease: 'power3.out',
        onComplete: () => {
          boot.classList.add('pointer-events-none', 'invisible');
        },
      });
    };

    const attach = (src: string) => {
      if (attached) return undefined;
      attached = true;

      const onMetadata = () => {
        duration = clip.duration || 0;
        clip.pause();
        readScroll();
        seekAt = seekTo;

        try {
          clip.currentTime = seekAt;
        } catch {}
      };

      const onReady = () => start();
      const onError = () => start();

      clip.addEventListener('loadedmetadata', onMetadata);
      clip.addEventListener('loadeddata', onReady);
      clip.addEventListener('canplaythrough', onReady);
      clip.addEventListener('error', onError);

      clip.src = src;
      clip.load();

      startTimer = window.setTimeout(start, 12000);

      return () => {
        clip.removeEventListener('loadedmetadata', onMetadata);
        clip.removeEventListener('loadeddata', onReady);
        clip.removeEventListener('canplaythrough', onReady);
        clip.removeEventListener('error', onError);
      };
    };

    const preload = async () => {
      abortController =
        typeof AbortController !== 'undefined'
          ? new AbortController()
          : null;

      bailTimer = window.setTimeout(() => {
        if (attached) return;
        abortController?.abort();
        setProgress(1);
        detachVideo = attach(VIDEO_URL);
      }, 15000);

      try {
        const response = await fetch(VIDEO_URL, {
          signal: abortController?.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error('Video preload unavailable');
        }

        const total = Number(
          response.headers.get('content-length') || 0
        );
        const reader = response.body.getReader();
        const chunks: ArrayBuffer[] = [];
        let received = 0;

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          if (value) {
            const copy = new Uint8Array(value.byteLength);
            copy.set(value);
            chunks.push(copy.buffer);
            received += value.byteLength;

            setProgress(
              total
                ? received / total
                : Math.min(received / 11e6, 0.95)
            );
          }
        }

        window.clearTimeout(bailTimer);
        setProgress(1);

        blobUrl = URL.createObjectURL(
          new Blob(chunks, { type: 'video/mp4' })
        );

        detachVideo = attach(blobUrl);
      } catch {
        window.clearTimeout(bailTimer);
        setProgress(1);
        detachVideo = attach(VIDEO_URL);
      }
    };

    const unlock = () => {
      const promise = clip.play();

      if (promise && typeof promise.then === 'function') {
        promise
          .then(() => clip.pause())
          .catch(() => {});
      } else {
        clip.pause();
      }
    };

    const unlockEvents: Array<keyof WindowEventMap> = [
      'touchstart',
      'pointerdown',
      'wheel',
      'keydown',
    ];

    unlockEvents.forEach((eventName) => {
      window.addEventListener(eventName, unlock, {
        once: true,
        passive: true,
      });
    });

    const onLenisScroll = () => readScroll();
    const onResize = () => readScroll();

    lenis.on('scroll', onLenisScroll);
    window.addEventListener('resize', onResize);

    readScroll();
    paint();
    preload();
    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(bailTimer);
      window.clearTimeout(startTimer);
      abortController?.abort();
      detachVideo?.();
      lenis.off('scroll', onLenisScroll);
      window.removeEventListener('resize', onResize);

      unlockEvents.forEach((eventName) => {
        window.removeEventListener(eventName, unlock);
      });

      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [lenis]);

  return (
    <div ref={rootRef} className="relative bg-[#09090b]">
      <div
        id="boot"
        className="fixed inset-0 z-[90] flex flex-col items-center justify-center gap-4 bg-[#09090b]"
      >
        <div className="h-px w-[154px] overflow-hidden bg-white/15">
          <i
            id="bootBar"
            className="block h-full w-full origin-left scale-x-0 bg-white"
          />
        </div>
        <p
          id="bootPct"
          className="text-[11px] font-medium tracking-[0.16em] text-white/50"
        >
          LOADING 0%
        </p>
      </div>

      <div className="fixed inset-0 z-0 overflow-hidden bg-black">
        <video
          id="clip"
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          className="absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 scale-[1.045] object-cover contrast-[1.03] saturate-[.92]"
        />
        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background:
              'linear-gradient(180deg,rgba(5,6,9,.56) 0%,rgba(5,6,9,.10) 25%,rgba(5,6,9,.08) 66%,rgba(5,6,9,.64) 100%), radial-gradient(110% 90% at 60% 42%,rgba(6,6,8,0) 0%,rgba(4,4,6,.38) 100%)',
          }}
        />
        <div className="hero-grain pointer-events-none absolute -inset-1/2 z-[2] opacity-[.08] mix-blend-soft-light" />
      </div>

      <i
        id="meter"
        className="fixed left-0 top-0 z-[80] h-[2px] w-full origin-left scale-x-0 bg-white/85"
      />

      <main className="pointer-events-none fixed inset-0 z-20">
        <HeroPanel
          eyebrow="CREATIVE DIRECTION · DIGITAL CRAFT"
          title={<>Create what<br />doesn&apos;t exist yet.</>}
          copy="Ideas become visual systems, motion, and experiences built to feel unmistakably yours."
          href="/work"
          cta="View selected work"
        />

        <HeroPanel
          eyebrow="IMMERSIVE EXPERIENCE · MOTION DESIGN"
          title={<>See every idea<br />from a new angle.</>}
          copy="Cinematic interaction and precise motion turn exploration into part of the story."
          href="/about"
          cta="Discover the studio"
        />

        <HeroPanel
          eyebrow="FRAME & FORM · CREATIVE STUDIO"
          title={<>Transform vision<br />into something real.</>}
          copy="We shape digital ideas into refined, memorable experiences with depth and intent."
          href="/contact"
          cta="Start a project"
        />
      </main>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-end px-5 pb-[max(18px,calc(env(safe-area-inset-bottom)+14px))] md:px-10 lg:px-14">
        <p className="text-[10px] tracking-[0.08em] text-white/38 md:text-[11px]">
          FRAME &amp; FORM — DIGITAL EXPERIENCES IN MOTION
        </p>
      </div>

      <div
        aria-hidden="true"
        className="relative z-[1] h-[560vh] min-h-[3200px]"
      />
    </div>
  );
}

function HeroPanel({
  eyebrow,
  title,
  copy,
  href,
  cta,
}: {
  eyebrow: string;
  title: React.ReactNode;
  copy: string;
  href: string;
  cta: string;
}) {
  return (
    <section
      data-panel
      className="absolute inset-0 flex items-end justify-start px-5 pb-[max(86px,calc(env(safe-area-inset-bottom)+72px))] pt-[max(110px,calc(env(safe-area-inset-top)+94px))] opacity-0 md:px-10 lg:px-[clamp(40px,5vw,72px)]"
    >
      <div className="w-full max-w-[760px] text-left">
        <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.15em] text-white/55 md:text-[11px]">
          {eyebrow}
        </p>

        <h1
          data-hero-title
          className="max-w-[11ch] text-[clamp(3rem,6.8vw,6.6rem)] font-normal leading-[0.91] tracking-[-0.055em] text-white [text-wrap:balance]"
        >
          {title}
        </h1>

        <p
          data-hero-copy
          className="mt-6 max-w-[42ch] text-[clamp(.95rem,1.2vw,1.15rem)] leading-7 tracking-[-0.012em] text-white/68"
        >
          {copy}
        </p>

        <div className="mt-8 flex pointer-events-auto">
          <Link
            href={href}
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 bg-white px-6 text-[14px] font-medium tracking-[-0.01em] text-black transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] hover:-translate-y-0.5"
          >
            {cta}
          </Link>
        </div>
      </div>
    </section>
  );
}
