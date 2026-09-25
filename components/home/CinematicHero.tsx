'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import SplitType from 'split-type';
import { useSmoothScroll } from '../motion/SmoothScrollProvider';

const FRAME_COUNT = 82;
const LAST_FRAME_INDEX = 81;
const SOURCE_WIDTH = 1920;
const SOURCE_HEIGHT = 1080;
const ANIMATION_COMPLETE_PROGRESS = 0.95;
const BACKGROUND_PRELOAD_CONCURRENCY = 10;
const INITIAL_FRAMES = [
  0, 1, 2, 3, 4, 5, 6, 7, LAST_FRAME_INDEX,
] as const;

const CUES = [
  [0.0, 0.0, 0.235, 0.29],
  [0.32, 0.365, 0.555, 0.61],
  [0.64, 0.685, 1.2, 1.25],
] as const;

const DRIFT = 10;

type DecodedFrame = CanvasImageSource & {
  close?: () => void;
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const smoothstep = (value: number) =>
  value * value * (3 - 2 * value);

const ramp = (
  progress: number,
  start: number,
  end: number
) => {
  if (end <= start) return progress >= end ? 1 : 0;

  return smoothstep(
    clamp((progress - start) / (end - start), 0, 1)
  );
};

const frameUrl = (index: number) =>
  `/hero-scroll-frames/frame-${String(index).padStart(3, '0')}.webp`;

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

    const frameBlobs: Array<Blob | null> =
      new Array(FRAME_COUNT).fill(null);
    const frameRequests =
      new Map<number, Promise<Blob | null>>();
    const decodedFrames =
      new Map<number, DecodedFrame>();
    const decodingFrames =
      new Map<number, Promise<DecodedFrame | null>>();
    const decodeUse =
      new Map<number, number>();

    const decodedLimit =
      window.innerWidth < 768 ? 10 : 18;
    const decodeBehind =
      window.innerWidth < 768 ? 1 : 2;
    const decodeAhead =
      window.innerWidth < 768 ? 4 : 6;

    let destroyed = false;
    let progress = 0;
    let requestedFrame = 0;
    let paintedFrame = -1;
    let renderRaf = 0;
    let resizeRaf = 0;
    let heroReady = false;

    const prefersReducedMotion =
      window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

    const headingStates = panels
      .map((panel) => {
        const heading =
          panel.querySelector<HTMLElement>(
            '[data-hero-heading]'
          );

        if (!heading || prefersReducedMotion) {
          return null;
        }

        const split = new SplitType(heading, {
          types: 'chars',
          charClass: 'hero-heading-char',
        });

        const chars = split.chars ?? [];
        const button =
          panel.querySelector<HTMLElement>(
            '[data-hero-button]'
          );

        gsap.set(chars, {
          display: 'inline-block',
          opacity: 0,
          yPercent: 78,
          scale: 0.96,
          rotationX: -16,
          filter: 'blur(14px)',
          transformOrigin: '50% 100%',
          transformPerspective: 900,
          willChange:
            'transform, opacity, filter',
        });

        if (button) {
          gsap.set(button, {
            opacity: 0,
            y: 12,
            scale: 0.96,
            filter: 'blur(5px)',
            willChange:
              'transform, opacity, filter',
          });
        }

        return {
          panel,
          split,
          chars,
          button,
          visible: false,
        };
      })
      .filter(
        (
          state
        ): state is {
          panel: HTMLElement;
          split: SplitType;
          chars: HTMLElement[];
          button: HTMLElement | null;
          visible: boolean;
        } => Boolean(state)
      );

    const revealHeading = (
      panel: HTMLElement
    ) => {
      if (!heroReady || prefersReducedMotion) {
        return;
      }

      const state = headingStates.find(
        (item) => item.panel === panel
      );

      if (!state || state.visible) return;

      state.visible = true;

      gsap.killTweensOf(state.chars);

      gsap.to(state.chars, {
        opacity: 1,
        yPercent: 0,
        scale: 1,
        rotationX: 0,
        filter: 'blur(0px)',
        duration: 0.95,
        stagger: {
          each: 0.026,
          from: 'start',
        },
        ease: 'power4.out',
        overwrite: true,
        clearProps:
          'willChange,transformOrigin,transformPerspective',
      });

      if (state.button) {
        gsap.killTweensOf(state.button);
        gsap.to(state.button, {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.72,
          delay: 0.16,
          ease: 'power3.out',
          overwrite: true,
          clearProps:
            'transform,filter,opacity,willChange',
        });
      }
    };

    const resetHeading = (
      panel: HTMLElement
    ) => {
      if (prefersReducedMotion) return;

      const state = headingStates.find(
        (item) => item.panel === panel
      );

      if (!state || !state.visible) return;

      state.visible = false;

      gsap.killTweensOf(state.chars);
      gsap.set(state.chars, {
        opacity: 0,
        yPercent: 78,
        scale: 0.96,
        rotationX: -16,
        filter: 'blur(14px)',
        transformOrigin: '50% 100%',
        transformPerspective: 900,
        willChange:
          'transform, opacity, filter',
      });

      if (state.button) {
        gsap.killTweensOf(state.button);
        gsap.set(state.button, {
          opacity: 0,
          y: 12,
          scale: 0.96,
          filter: 'blur(5px)',
          willChange:
            'transform, opacity, filter',
        });
      }
    };

    const setBootProgress = (
      value: number,
      label = 'STARTING'
    ) => {
      const normalized = clamp(value, 0, 1);
      bootBar.style.transform = `scaleX(${normalized})`;
      bootPct.textContent =
        `${label} ${Math.round(normalized * 100)}%`;
    };

    const closeFrame = (
      frame: DecodedFrame | undefined
    ) => {
      try {
        frame?.close?.();
      } catch {}
    };

    const trimDecodedCache = (focus: number) => {
      if (decodedFrames.size <= decodedLimit) return;

      const removable = Array.from(decodedFrames.keys())
        .filter(
          (index) =>
            index !== requestedFrame &&
            index !== 0 &&
            index !== LAST_FRAME_INDEX
        )
        .sort((a, b) => {
          const distanceA = Math.abs(a - focus);
          const distanceB = Math.abs(b - focus);

          if (distanceA !== distanceB) {
            return distanceB - distanceA;
          }

          return (
            (decodeUse.get(a) ?? 0) -
            (decodeUse.get(b) ?? 0)
          );
        });

      while (
        decodedFrames.size > decodedLimit &&
        removable.length
      ) {
        const index = removable.shift();

        if (index == null) break;

        closeFrame(decodedFrames.get(index));
        decodedFrames.delete(index);
        decodeUse.delete(index);
      }
    };

    const ensureFrameBlob = (
      index: number
    ): Promise<Blob | null> => {
      const bounded = clamp(
        Math.round(index),
        0,
        LAST_FRAME_INDEX
      );

      const cached = frameBlobs[bounded];
      if (cached) {
        return Promise.resolve(cached);
      }

      const active = frameRequests.get(bounded);
      if (active) {
        return active;
      }

      const request = (async () => {
        try {
          const response = await fetch(
            frameUrl(bounded),
            {
              cache: 'force-cache',
            }
          );

          if (!response.ok) {
            throw new Error(
              `Frame ${bounded} failed with ${response.status}.`
            );
          }

          const blob = await response.blob();

          if (!destroyed) {
            frameBlobs[bounded] = blob;
          }

          return blob;
        } catch (error) {
          console.error(
            `Hero frame ${bounded} failed to load:`,
            error
          );
          return null;
        } finally {
          frameRequests.delete(bounded);
        }
      })();

      frameRequests.set(bounded, request);
      return request;
    };

    const decodeWithImage = (
      blob: Blob
    ) =>
      new Promise<DecodedFrame | null>(
        (resolve) => {
          const image = new Image();
          const objectUrl =
            URL.createObjectURL(blob);

          image.decoding = 'async';

          image.onload = async () => {
            try {
              await image.decode();
            } catch {}

            URL.revokeObjectURL(objectUrl);
            resolve(image);
          };

          image.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(null);
          };

          image.src = objectUrl;
        }
      );

    const decodeFrame = (
      index: number
    ): Promise<DecodedFrame | null> => {
      const bounded = clamp(
        Math.round(index),
        0,
        LAST_FRAME_INDEX
      );

      const cached = decodedFrames.get(bounded);

      if (cached) {
        decodeUse.set(bounded, performance.now());
        return Promise.resolve(cached);
      }

      const active = decodingFrames.get(bounded);
      if (active) return active;

      const request = (async () => {
        const blob = await ensureFrameBlob(bounded);

        if (!blob || destroyed) {
          decodingFrames.delete(bounded);
          return null;
        }

        let decoded: DecodedFrame | null = null;

        if (typeof createImageBitmap === 'function') {
          try {
            decoded =
              (await createImageBitmap(blob)) as DecodedFrame;
          } catch {
            decoded = null;
          }
        }

        if (!decoded) {
          decoded = await decodeWithImage(blob);
        }

        decodingFrames.delete(bounded);

        if (decoded && !destroyed) {
          decodedFrames.set(bounded, decoded);
          decodeUse.set(bounded, performance.now());
          trimDecodedCache(requestedFrame);
          scheduleRender();
          return decoded;
        }

        closeFrame(decoded ?? undefined);
        return null;
      })();

      decodingFrames.set(bounded, request);
      return request;
    };

    const primeDecodeWindow = (focus: number) => {
      for (
        let index = focus - decodeBehind;
        index <= focus + decodeAhead;
        index += 1
      ) {
        if (
          index >= 0 &&
          index < FRAME_COUNT
        ) {
          void decodeFrame(index);
        }
      }
    };

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();

      const sourceSafeDpr = Math.max(
        1,
        Math.min(
          SOURCE_WIDTH / Math.max(rect.width, 1),
          SOURCE_HEIGHT / Math.max(rect.height, 1)
        )
      );

      const dpr = Math.min(
        window.devicePixelRatio || 1,
        2,
        sourceSafeDpr
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
        paintedFrame = -1;
      }
    };

    const drawCover = (
      frame: CanvasImageSource
    ) => {
      const sourceWidth =
        'naturalWidth' in frame
          ? frame.naturalWidth
          : 'width' in frame
          ? Number(frame.width)
          : 0;
      const sourceHeight =
        'naturalHeight' in frame
          ? frame.naturalHeight
          : 'height' in frame
          ? Number(frame.height)
          : 0;

      if (!sourceWidth || !sourceHeight) return;

      const scale = Math.max(
        canvas.width / sourceWidth,
        canvas.height / sourceHeight
      );

      const width = sourceWidth * scale;
      const height = sourceHeight * scale;
      const x = (canvas.width - width) * 0.5;
      const y = (canvas.height - height) * 0.5;

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
        frame,
        x,
        y,
        width,
        height
      );
    };

    const nearestDecoded = (
      target: number
    ) => {
      const exact = decodedFrames.get(target);

      if (exact) {
        decodeUse.set(target, performance.now());
        return {
          index: target,
          frame: exact,
        };
      }

      let bestIndex = -1;
      let bestDistance =
        Number.POSITIVE_INFINITY;

      decodedFrames.forEach((frame, index) => {
        const distance =
          Math.abs(index - target);

        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = index;
        }
      });

      if (bestIndex < 0) return null;

      decodeUse.set(bestIndex, performance.now());

      return {
        index: bestIndex,
        frame: decodedFrames.get(bestIndex)!,
      };
    };

    const render = () => {
      renderRaf = 0;

      const resolved =
        nearestDecoded(requestedFrame);

      if (!resolved) return;

      if (
        resolved.index === paintedFrame &&
        requestedFrame === paintedFrame
      ) {
        return;
      }

      drawCover(resolved.frame);
      paintedFrame = resolved.index;
    };

    function scheduleRender() {
      if (renderRaf) return;
      renderRaf = requestAnimationFrame(render);
    }

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

        if (opacity > 0.48) {
          revealHeading(panel);
        } else if (opacity < 0.08) {
          resetHeading(panel);
        }
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

      requestedFrame =
        sequenceProgress >= 1
          ? LAST_FRAME_INDEX
          : Math.round(
              sequenceProgress *
                LAST_FRAME_INDEX
            );

      primeDecodeWindow(requestedFrame);
      paintPanels();
      scheduleRender();
    };

    const preloadInitialFrames = async () => {
      let completed = 0;

      await Promise.all(
        INITIAL_FRAMES.map(async (index) => {
          const blob =
            await ensureFrameBlob(index);

          if (!blob) {
            throw new Error(
              `Initial hero frame ${index} failed to load.`
            );
          }

          completed += 1;
          setBootProgress(
            completed /
              INITIAL_FRAMES.length,
            'STARTING'
          );
        })
      );
    };

    const preloadRemainingFrames = async () => {
      let nextIndex = 0;

      const worker = async () => {
        while (!destroyed) {
          while (
            nextIndex < FRAME_COUNT &&
            frameBlobs[nextIndex]
          ) {
            nextIndex += 1;
          }

          const index = nextIndex;
          nextIndex += 1;

          if (index >= FRAME_COUNT) return;

          await ensureFrameBlob(index);
        }
      };

      await Promise.all(
        Array.from(
          {
            length:
              BACKGROUND_PRELOAD_CONCURRENCY,
          },
          () => worker()
        )
      );
    };

    const start = async () => {
      try {
        setBootProgress(0, 'STARTING');

        // Only the opening frames and exact final frame 081 block startup.
        // The remaining frames stream in immediately after the hero appears.
        await preloadInitialFrames();

        if (destroyed) return;

        await Promise.all([
          decodeFrame(0),
          decodeFrame(1),
          decodeFrame(2),
          decodeFrame(3),
          decodeFrame(4),
          decodeFrame(LAST_FRAME_INDEX),
        ]);

        if (destroyed) return;

        resizeCanvas();
        readScroll();

        const initial =
          nearestDecoded(requestedFrame);

        if (initial) {
          drawCover(initial.frame);
          paintedFrame = initial.index;
        }

        gsap.to(boot, {
          opacity: 0,
          duration: 0.36,
          ease: 'power3.out',
          onComplete: () => {
            boot.classList.add(
              'pointer-events-none',
              'invisible'
            );

            heroReady = true;
            paintPanels();
          },
        });

        // Fill the complete 000–081 sequence in the background.
        void preloadRemainingFrames();
      } catch (error) {
        console.error(
          'Hero startup failed:',
          error
        );

        bootPct.textContent =
          'FRAME SEQUENCE FAILED TO LOAD';
      }
    };

    const onLenisScroll =
      () => readScroll();

    const onResize = () => {
      if (resizeRaf) {
        cancelAnimationFrame(resizeRaf);
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

    lenis.on('scroll', onLenisScroll);

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
        cancelAnimationFrame(renderRaf);
      }

      if (resizeRaf) {
        cancelAnimationFrame(resizeRaf);
      }

      lenis.off('scroll', onLenisScroll);
      window.removeEventListener(
        'resize',
        onResize
      );

      decodedFrames.forEach((frame) => {
        closeFrame(frame);
      });

      decodedFrames.clear();
      decodingFrames.clear();
      decodeUse.clear();
      frameRequests.clear();

      headingStates.forEach((state) => {
        gsap.killTweensOf(state.chars);

        if (state.button) {
          gsap.killTweensOf(state.button);
        }

        state.split.revert();
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
          STARTING 0%
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

            <h1
              data-hero-heading
              className="whitespace-nowrap text-[clamp(2.55rem,5.4vw,4.65rem)] font-normal leading-[0.96] tracking-[0.075em] text-white [text-shadow:0_2px_22px_rgba(20,13,20,.16)]"
            >
              {title}
            </h1>

            <p className="mt-2 text-[clamp(.9rem,1.35vw,1.12rem)] font-normal tracking-[0.045em] text-white/82">
              {subtitle}
            </p>
          </div>

          <div
            data-hero-button
            className="pointer-events-auto hidden pb-1 md:block"
          >
            <Link
              href={href}
              className="group relative isolate inline-flex h-[44px] min-w-[138px] transform-gpu items-center justify-between overflow-hidden rounded-full border border-white/[0.24] bg-white/[0.06] pl-6 pr-[7px] text-[11px] font-medium tracking-[0.045em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,.16),inset_0_-1px_0_rgba(255,255,255,.03),0_10px_26px_rgba(22,15,30,.10)] backdrop-blur-[18px] transition-[transform,background-color,border-color,box-shadow] duration-[800ms] ease-[cubic-bezier(.16,1,.3,1)] hover:-translate-y-[1px] hover:border-white/[0.39] hover:bg-white/[0.085] hover:shadow-[inset_0_1px_0_rgba(255,255,255,.21),inset_0_-1px_0_rgba(255,255,255,.05),0_15px_34px_rgba(22,15,30,.14)] active:translate-y-0 active:scale-[0.992] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-[1px] rounded-full border border-white/[0.06] transition-colors duration-[800ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:border-white/[0.11]"
              />

              <span className="relative z-10 transition-[transform,opacity] duration-[800ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:-translate-x-[1px] group-hover:opacity-95">
                {cta}
              </span>

              <span
                aria-hidden="true"
                className="relative z-10 ml-5 flex h-[30px] w-[30px] shrink-0 transform-gpu items-center justify-center rounded-full border border-white/[0.15] bg-white/[0.035] shadow-[inset_0_1px_0_rgba(255,255,255,.11)] backdrop-blur-md transition-[transform,background-color,border-color,box-shadow] duration-[800ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.025] group-hover:border-white/[0.26] group-hover:bg-white/[0.06] group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,.16),0_4px_14px_rgba(10,8,14,.07)]"
              >
                <span className="transform-gpu transition-transform duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-[2px] group-hover:-translate-y-[2px]">
                  <svg
                    viewBox="0 0 18 18"
                    className="h-[14px] w-[14px]"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 13L13 5"
                      stroke="currentColor"
                      strokeWidth="1.35"
                      strokeLinecap="round"
                    />
                    <path
                      d="M7.6 5H13V10.4"
                      stroke="currentColor"
                      strokeWidth="1.35"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
