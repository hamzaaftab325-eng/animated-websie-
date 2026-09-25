'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useSmoothScroll } from '../motion/SmoothScrollProvider';

const VIDEO_URL =
  'https://res.cloudinary.com/diometfe9/video/upload/v1790340573/613a50d4-f1da-4f2d-b494-40cd0f20f141_cd4zyw.mp4';

const CUES = [
  [0.0, 0.012, 0.235, 0.29],
  [0.32, 0.365, 0.555, 0.61],
  [0.64, 0.685, 1.2, 1.25],
] as const;

const DRIFT = 12;
const SEEK_EASE = 0.34;
const SEEK_INTERVAL = 24;
const VIDEO_COMPLETE_PROGRESS = 0.93;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const smoothstep = (value: number) =>
  value * value * (3 - 2 * value);

const ramp = (
  progress: number,
  start: number,
  end: number
) => {
  if (end <= start) {
    return progress >= end ? 1 : 0;
  }

  return smoothstep(
    clamp((progress - start) / (end - start), 0, 1)
  );
};

export function CinematicHero() {
  const { lenis } = useSmoothScroll();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lenis || !rootRef.current) return;

    const root = rootRef.current;
    const track = root.querySelector<HTMLElement>('[data-hero-track]');
    const clip = root.querySelector<HTMLVideoElement>('#clip');
    const boot = root.querySelector<HTMLElement>('#boot');
    const bootBar = root.querySelector<HTMLElement>('#bootBar');
    const bootPct = root.querySelector<HTMLElement>('#bootPct');
    const meter = root.querySelector<HTMLElement>('#meter');
    const panels = Array.from(
      root.querySelectorAll<HTMLElement>('[data-panel]')
    );

    if (
      !track ||
      !clip ||
      !boot ||
      !bootBar ||
      !bootPct ||
      !meter
    ) {
      return;
    }

    let progress = 0;
    let seekTarget = 0;
    let seekCurrent = 0;
    let duration = 0;
    let ready = false;
    let started = false;
    let rafId = 0;
    let lastSeekTime = 0;
    let fallbackTimer = 0;

    const setBootProgress = (value: number) => {
      const progressValue = clamp(value, 0, 1);
      bootBar.style.transform =
        `scaleX(${progressValue})`;
      bootPct.textContent =
        `LOADING ${Math.round(progressValue * 100)}%`;
    };

    const readScroll = () => {
      const range = Math.max(
        1,
        track.offsetHeight - window.innerHeight
      );

      progress = clamp(lenis.scroll / range, 0, 1);

      if (duration) {
        const videoProgress = clamp(
          progress / VIDEO_COMPLETE_PROGRESS,
          0,
          1
        );
        const finalFrameTime = Math.max(
          0,
          duration - 0.001
        );

        seekTarget =
          videoProgress * finalFrameTime;
      }
    };

    const paintPanels = () => {
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
        const scale = 0.994 + opacity * 0.006;

        panel.style.opacity = opacity.toFixed(4);
        panel.style.transform =
          `translate3d(0,${y.toFixed(2)}px,0) scale(${scale.toFixed(4)})`;
        panel.style.pointerEvents =
          opacity > 0.62 ? 'auto' : 'none';
      });
    };

    const renderFrame = (time: number) => {
      if (ready && duration) {
        const gap = seekTarget - seekCurrent;

        if (Math.abs(gap) > 0.001) {
          const nearEnd =
            progress >= VIDEO_COMPLETE_PROGRESS - 0.05;
          const almostSettled =
            Math.abs(gap) < 0.035;
          const catchUp =
            nearEnd ? 0.62 : SEEK_EASE;

          // Avoid the exponential "braking" tail at the end: normal motion
          // remains damped, while the final portion catches the target quickly.
          seekCurrent =
            progress >= VIDEO_COMPLETE_PROGRESS ||
            almostSettled
              ? seekTarget
              : seekCurrent + gap * catchUp;

          if (
            time - lastSeekTime >= SEEK_INTERVAL &&
            clip.readyState >= 2 &&
            !clip.seeking
          ) {
            lastSeekTime = time;

            try {
              clip.currentTime = clamp(
                seekCurrent,
                0,
                Math.max(0, duration - 0.001)
              );
            } catch {}
          }
        }
      }

      paintPanels();
      rafId = requestAnimationFrame(renderFrame);
    };

    const start = () => {
      if (started) return;
      started = true;
      ready = true;
      readScroll();
      seekCurrent = seekTarget;

      try {
        clip.currentTime = seekCurrent;
      } catch {}

      gsap.to(boot, {
        opacity: 0,
        duration: 0.48,
        ease: 'power3.out',
        onComplete: () => {
          boot.classList.add(
            'pointer-events-none',
            'invisible'
          );
        },
      });
    };

    const onMetadata = () => {
      duration =
        Number.isFinite(clip.duration) ? clip.duration : 0;
      clip.pause();
      setBootProgress(0.72);
      readScroll();
      seekCurrent = seekTarget;

      try {
        clip.currentTime = seekCurrent;
      } catch {}
    };

    const onProgress = () => {
      if (!clip.duration || !clip.buffered.length) return;

      const end =
        clip.buffered.end(clip.buffered.length - 1);
      setBootProgress(
        Math.max(0.72, Math.min(0.98, end / clip.duration))
      );
    };

    const onReady = () => {
      setBootProgress(1);
      start();
    };

    const onError = () => {
      setBootProgress(1);
      start();
    };

    clip.addEventListener('loadedmetadata', onMetadata);
    clip.addEventListener('progress', onProgress);
    clip.addEventListener('loadeddata', onReady);
    clip.addEventListener('canplaythrough', onReady);
    clip.addEventListener('error', onError);

    // Production path: let the browser/CDN buffer the MP4 immediately.
    // Waiting for a full Blob download made the experience feel unnecessarily slow.
    clip.src = VIDEO_URL;
    clip.load();

    fallbackTimer = window.setTimeout(start, 4500);

    const unlock = () => {
      const playback = clip.play();

      if (playback && typeof playback.then === 'function') {
        playback
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
    const onResize = () => {
      lenis.resize();
      readScroll();
      paintPanels();
    };

    lenis.on('scroll', onLenisScroll);
    window.addEventListener('resize', onResize, {
      passive: true,
    });

    readScroll();
    paintPanels();
    rafId = requestAnimationFrame(renderFrame);

    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(fallbackTimer);

      clip.removeEventListener(
        'loadedmetadata',
        onMetadata
      );
      clip.removeEventListener('progress', onProgress);
      clip.removeEventListener('loadeddata', onReady);
      clip.removeEventListener(
        'canplaythrough',
        onReady
      );
      clip.removeEventListener('error', onError);

      lenis.off('scroll', onLenisScroll);
      window.removeEventListener('resize', onResize);

      unlockEvents.forEach((eventName) => {
        window.removeEventListener(eventName, unlock);
      });
    };
  }, [lenis]);

  return (
    <div
      ref={rootRef}
      className="relative min-h-screen overflow-x-clip bg-[#09090b]"
    >
      <div
        id="boot"
        className="fixed inset-0 z-[90] flex flex-col items-center justify-center gap-4 bg-[#11131a]"
      >
        <div className="h-px w-[150px] overflow-hidden bg-white/20">
          <i
            id="bootBar"
            className="block h-full w-full origin-left scale-x-0 bg-white"
          />
        </div>
        <p
          id="bootPct"
          className="text-[10px] font-medium tracking-[0.16em] text-white/55"
        >
          LOADING 0%
        </p>
      </div>

      <div className="fixed inset-0 z-0 overflow-hidden bg-[#11131a]">
        <video
          id="clip"
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          className="absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 scale-[1.025] object-cover"
        />

        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background:
              'linear-gradient(180deg,rgba(68,78,103,.20) 0%,rgba(173,117,137,.12) 45%,rgba(157,101,117,.22) 100%), linear-gradient(180deg,rgba(8,10,15,.08) 0%,rgba(8,10,15,.02) 55%,rgba(8,10,15,.30) 100%)',
          }}
        />

        <div className="hero-grain pointer-events-none absolute -inset-1/2 z-[2] opacity-[.075] mix-blend-soft-light" />
      </div>

      <i
        id="meter"
        className="fixed left-0 top-0 z-[80] h-px w-full origin-left scale-x-0 bg-white/65"
      />

      <main className="pointer-events-none fixed inset-0 z-20">
        <HeroPanel
          eyebrow="FRAME & FORM"
          title="FRAME & FORM"
          subtitle={
            <>
              Where your <em className="font-normal italic">Vision</em> meets Reality
            </>
          }
          href="/contact"
          cta="TRY NOW"
        />

        <HeroPanel
          eyebrow="EXPLORE THE UNSEEN"
          title="EXPLORE"
          subtitle="See every idea from a new perspective"
          href="/work"
          cta="VIEW WORK"
        />

        <HeroPanel
          eyebrow="DIGITAL EXPERIENCES"
          title="TRANSFORM"
          subtitle="Turn imagination into a living experience"
          href="/about"
          cta="OUR STUDIO"
        />
      </main>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-5 pb-[max(20px,calc(env(safe-area-inset-bottom)+12px))] md:px-7 lg:px-8">
        <div className="grid min-h-[74px] grid-cols-2 gap-x-5 border-t border-white/25 pt-4 text-[10px] leading-[1.25] text-white/88 md:grid-cols-[1fr_1fr_1.55fr_36px] md:items-start md:gap-8">
          <p className="font-medium">
            Explore your creativity
          </p>

          <p className="font-medium">
            Frame &amp; Form AI
          </p>

          <p className="hidden max-w-[330px] justify-self-end md:block">
            Turn the imaginative creativity of your mind to reality
            with Frame &amp; Form. Your ideas, shaped into refined
            digital experiences.
          </p>

          <span
            aria-hidden="true"
            className="hidden justify-self-end text-[28px] leading-none text-white/40 md:block"
          >
            ✦
          </span>
        </div>
      </div>

      <div
        data-hero-track
        aria-hidden="true"
        className="relative z-[1] h-[320vh] min-h-[1950px]"
      />
    </div>
  );
}

function HeroPanel({
  eyebrow,
  title,
  subtitle,
  href,
  cta,
}: {
  eyebrow: string;
  title: string;
  subtitle: React.ReactNode;
  href: string;
  cta: string;
}) {
  return (
    <section
      data-panel
      className="absolute inset-0 opacity-0 will-change-[opacity,transform]"
    >
      <div className="absolute inset-x-0 bottom-[104px] px-5 md:bottom-[112px] md:px-7 lg:px-8">
        <div className="grid items-end gap-5 md:grid-cols-[1fr_auto]">
          <div className="max-w-[720px]">
            <p className="mb-2 text-[9px] font-medium uppercase tracking-[0.14em] text-white/60 md:text-[10px]">
              {eyebrow}
            </p>

            <h1 className="whitespace-nowrap text-[clamp(2.55rem,5.4vw,4.65rem)] font-normal leading-[0.96] tracking-[0.075em] text-white [text-shadow:0_2px_22px_rgba(20,13,20,.16)]">
              {title}
            </h1>

            <p className="mt-2 text-[clamp(.9rem,1.35vw,1.12rem)] font-normal tracking-[0.045em] text-white/82">
              {subtitle}
            </p>
          </div>

          <div className="pointer-events-auto hidden pb-1 md:block">
            <Link
              href={href}
              className="inline-flex h-[38px] min-w-[116px] items-center justify-center rounded-full border border-white/30 bg-white/10 px-6 text-[11px] font-medium tracking-[0.04em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,.18),0_8px_30px_rgba(40,20,35,.10)] backdrop-blur-md transition-[transform,background-color] duration-500 ease-[cubic-bezier(.16,1,.3,1)] hover:-translate-y-0.5 hover:bg-white/18"
            >
              {cta}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
