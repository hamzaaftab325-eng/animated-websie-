'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useSmoothScroll } from '../motion/SmoothScrollProvider';

const FRAME_COUNT = 82;
const SPRITE_COLS = 10;
const SPRITE_TILE_WIDTH = 720;
const SPRITE_TILE_HEIGHT = 405;
const ANIMATION_COMPLETE_PROGRESS = 0.95;
const SPRITE_URL = '/hero-sequence/cinematic-zoom-82frames.avif';

const CUES = [
  [0.0, 0.012, 0.235, 0.29],
  [0.32, 0.365, 0.555, 0.61],
  [0.64, 0.685, 1.2, 1.25],
] as const;

const DRIFT = 10;

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
    const track =
      root.querySelector<HTMLElement>('[data-hero-track]');
    const canvas =
      root.querySelector<HTMLCanvasElement>('#heroSequence');
    const boot =
      root.querySelector<HTMLElement>('#boot');
    const bootBar =
      root.querySelector<HTMLElement>('#bootBar');
    const bootPct =
      root.querySelector<HTMLElement>('#bootPct');
    const meter =
      root.querySelector<HTMLElement>('#meter');
    const panels = Array.from(
      root.querySelectorAll<HTMLElement>('[data-panel]')
    );

    if (
      !track ||
      !canvas ||
      !boot ||
      !bootBar ||
      !bootPct ||
      !meter
    ) {
      return;
    }

    const context = canvas.getContext('2d', {
      alpha: false,
      desynchronized: true,
    });

    if (!context) return;

    let destroyed = false;
    let sprite: HTMLImageElement | null = null;
    let progress = 0;
    let currentFrame = -1;
    let requestedFrame = 0;
    let renderRaf = 0;
    let resizeRaf = 0;

    const setBootProgress = (
      value: number,
      label = 'LOADING'
    ) => {
      const normalized = clamp(value, 0, 1);

      bootBar.style.transform =
        `scaleX(${normalized})`;
      bootPct.textContent =
        `${label} ${Math.round(normalized * 100)}%`;
    };

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(
        window.devicePixelRatio || 1,
        1.5
      );

      const width = Math.max(
        1,
        Math.round(rect.width * dpr)
      );
      const height = Math.max(
        1,
        Math.round(rect.height * dpr)
      );

      if (
        canvas.width !== width ||
        canvas.height !== height
      ) {
        canvas.width = width;
        canvas.height = height;
        currentFrame = -1;
      }
    };

    const drawFrame = (frameIndex: number) => {
      if (!sprite) return;

      const index = clamp(
        Math.round(frameIndex),
        0,
        FRAME_COUNT - 1
      );

      const sourceX =
        (index % SPRITE_COLS) * SPRITE_TILE_WIDTH;
      const sourceY =
        Math.floor(index / SPRITE_COLS) *
        SPRITE_TILE_HEIGHT;

      const scale = Math.max(
        canvas.width / SPRITE_TILE_WIDTH,
        canvas.height / SPRITE_TILE_HEIGHT
      );

      const drawWidth =
        SPRITE_TILE_WIDTH * scale;
      const drawHeight =
        SPRITE_TILE_HEIGHT * scale;
      const x =
        (canvas.width - drawWidth) * 0.5;
      const y =
        (canvas.height - drawHeight) * 0.5;

      context.globalAlpha = 1;
      context.fillStyle = '#11131a';
      context.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
      );
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';

      context.drawImage(
        sprite,
        sourceX,
        sourceY,
        SPRITE_TILE_WIDTH,
        SPRITE_TILE_HEIGHT,
        x,
        y,
        drawWidth,
        drawHeight
      );

      currentFrame = index;
    };

    const render = () => {
      renderRaf = 0;

      if (
        !sprite ||
        requestedFrame === currentFrame
      ) {
        return;
      }

      drawFrame(requestedFrame);
    };

    const scheduleRender = () => {
      if (renderRaf) return;

      renderRaf =
        requestAnimationFrame(render);
    };

    const paintPanels = () => {
      meter.style.transform =
        `scaleX(${progress})`;

      panels.forEach((panel, index) => {
        const cue = CUES[index];
        if (!cue) return;

        const enter = ramp(
          progress,
          cue[0],
          cue[1]
        );
        const leave = ramp(
          progress,
          cue[2],
          cue[3]
        );
        const opacity =
          enter * (1 - leave);
        const y =
          (1 - enter) * DRIFT -
          leave * DRIFT;

        panel.style.opacity =
          opacity.toFixed(4);
        panel.style.transform =
          `translate3d(0,${y.toFixed(2)}px,0)`;
        panel.style.pointerEvents =
          opacity > 0.62
            ? 'auto'
            : 'none';
      });
    };

    const readScroll = () => {
      const range = Math.max(
        1,
        track.offsetHeight -
          window.innerHeight
      );

      progress = clamp(
        lenis.animatedScroll / range,
        0,
        1
      );

      const sequenceProgress = clamp(
        progress /
          ANIMATION_COMPLETE_PROGRESS,
        0,
        1
      );

      // 0.00 -> frame 000, 1.00 -> frame 081.
      // The final frame is guaranteed and then held for the last 5%.
      requestedFrame = Math.min(
        FRAME_COUNT - 1,
        Math.floor(
          sequenceProgress * FRAME_COUNT
        )
      );

      paintPanels();
      scheduleRender();
    };

    const loadSprite = () =>
      new Promise<HTMLImageElement>(
        (resolve, reject) => {
          const image = new Image();
          image.decoding = 'async';
          image.fetchPriority = 'high';

          image.onload = () => {
            resolve(image);
          };

          image.onerror = () => {
            reject(
              new Error(
                'Hero frame sprite failed to load.'
              )
            );
          };

          image.src = SPRITE_URL;
        }
      );

    const start = async () => {
      setBootProgress(
        0.15,
        'LOADING FRAMES'
      );

      try {
        sprite = await loadSprite();

        if (destroyed) return;

        setBootProgress(
          0.9,
          'DECODING FRAMES'
        );

        try {
          await sprite.decode();
        } catch {
          // onload already guarantees the image is drawable.
        }

        if (destroyed) return;

        resizeCanvas();
        readScroll();

        // Force the first exact requested frame to paint before
        // the loader disappears.
        drawFrame(requestedFrame);

        setBootProgress(1, 'READY');

        gsap.to(boot, {
          opacity: 0,
          duration: 0.45,
          ease: 'power3.out',
          onComplete: () => {
            boot.classList.add(
              'pointer-events-none',
              'invisible'
            );
          },
        });
      } catch {
        bootPct.textContent =
          'FRAME SEQUENCE FAILED TO LOAD';
      }
    };

    const onLenisScroll =
      () => readScroll();

    const onResize = () => {
      if (resizeRaf) {
        cancelAnimationFrame(
          resizeRaf
        );
      }

      resizeRaf =
        requestAnimationFrame(() => {
          resizeRaf = 0;
          lenis.resize();
          resizeCanvas();
          readScroll();
          scheduleRender();
        });
    };

    lenis.on(
      'scroll',
      onLenisScroll
    );

    window.addEventListener(
      'resize',
      onResize,
      { passive: true }
    );

    resizeCanvas();
    paintPanels();
    void start();

    return () => {
      destroyed = true;

      if (renderRaf) {
        cancelAnimationFrame(
          renderRaf
        );
      }

      if (resizeRaf) {
        cancelAnimationFrame(
          resizeRaf
        );
      }

      lenis.off(
        'scroll',
        onLenisScroll
      );

      window.removeEventListener(
        'resize',
        onResize
      );

      if (sprite) {
        sprite.src = '';
        sprite = null;
      }
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
          LOADING FRAMES 0%
        </p>
      </div>

      <div className="fixed inset-0 z-0 overflow-hidden bg-[#11131a]">
        <canvas
          id="heroSequence"
          aria-hidden="true"
          className="absolute inset-0 h-full w-full"
        />

        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background:
              'linear-gradient(180deg,rgba(68,78,103,.16) 0%,rgba(173,117,137,.08) 45%,rgba(157,101,117,.16) 100%), linear-gradient(180deg,rgba(8,10,15,.05) 0%,rgba(8,10,15,.01) 55%,rgba(8,10,15,.22) 100%)',
          }}
        />

        <div className="hero-grain pointer-events-none absolute -inset-1/2 z-[2] opacity-[.055] mix-blend-soft-light" />
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
              Where your{' '}
              <em className="font-normal italic">
                Vision
              </em>{' '}
              meets Reality
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
