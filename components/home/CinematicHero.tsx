'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import SplitType from 'split-type';
import { ArrowUpRight } from 'lucide-react';
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

    const hiddenHeadingState = {
      opacity: 0.04,
      yPercent: 62,
      scale: 0.965,
      rotationX: -12,
      filter: 'blur(20px)',
      transformOrigin: '50% 72%',
      transformPerspective: 1100,
      force3D: true,
      willChange:
        'transform, opacity, filter',
    };

    // Keep the state array aligned with the panel array. The previous
    // implementation searched by DOM node and triggered from panel opacity;
    // an explicit scene index makes every chapter, especially EXPLORE,
    // deterministic.
    const headingStates = panels.map(
      (panel, index) => {
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
          ...hiddenHeadingState,
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
          index,
          split,
          chars,
          button,
          visible: false,
        };
      }
    );

    const revealHeading = (
      index: number
    ) => {
      if (!heroReady || prefersReducedMotion) {
        return;
      }

      const state = headingStates[index];

      if (!state || state.visible) return;

      state.visible = true;

      gsap.killTweensOf(state.chars);

      // Re-assert the full blur state before every reveal so all three
      // headings play the same animation on forward and reverse scrolling.
      gsap.set(state.chars, {
        ...hiddenHeadingState,
      });

      gsap.to(state.chars, {
        opacity: 1,
        yPercent: 0,
        scale: 1,
        rotationX: 0,
        filter: 'blur(0px)',
        duration: 1.12,
        stagger: {
          each: 0.032,
          from: 'start',
        },
        ease: 'expo.out',
        overwrite: 'auto',
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
          delay: 0.18,
          ease: 'power3.out',
          overwrite: true,
          clearProps:
            'transform,filter,opacity,willChange',
        });
      }
    };

    const resetHeading = (
      index: number
    ) => {
      if (prefersReducedMotion) return;

      const state = headingStates[index];

      if (!state || !state.visible) return;

      state.visible = false;

      gsap.killTweensOf(state.chars);
      gsap.set(state.chars, {
        ...hiddenHeadingState,
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

        const revealPoint =
          index === 0
            ? 0
            : cue[0] +
              (cue[1] - cue[0]) * 0.12;
        const resetPoint =
          cue[3] + 0.012;

        // Trigger from the chapter's own cue range instead of waiting for
        // panel opacity to cross a threshold. This prevents the second
        // heading's blur reveal from being visually swallowed by its fade.
        if (
          progress >= revealPoint &&
          progress < cue[3]
        ) {
          revealHeading(index);
        } else if (
          progress < cue[0] ||
          progress > resetPoint
        ) {
          resetHeading(index);
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
            window.dispatchEvent(
              new CustomEvent('hero-ready')
            );
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
        if (!state) return;

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

const SCRAMBLE_GLYPHS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function PremiumCta({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  const [active, setActive] = useState(false);

  return (
    <Link
      href={href}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
      className="group relative isolate inline-flex h-[46px] w-[154px] overflow-hidden rounded-full shadow-[0_10px_28px_rgba(22,15,30,.10)] transition-[transform,box-shadow] duration-700 ease-[cubic-bezier(.16,1,.3,1)] hover:-translate-y-[1px] hover:shadow-[0_16px_36px_rgba(22,15,30,.14)] active:translate-y-0 active:scale-[0.992] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-[1px] rounded-full bg-white/[0.055] shadow-[inset_0_1px_0_rgba(255,255,255,.15),inset_0_-1px_0_rgba(255,255,255,.025)] backdrop-blur-[20px] transition-[background-color,box-shadow] duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:bg-white/[0.075] group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,.22),inset_0_-1px_0_rgba(255,255,255,.05)]"
      />

      <svg
        aria-hidden="true"
        viewBox="0 0 154 46"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 z-[2] h-full w-full overflow-visible"
      >
        <rect
          x="0.75"
          y="0.75"
          width="152.5"
          height="44.5"
          rx="22.25"
          fill="none"
          stroke="rgba(255,255,255,.18)"
          strokeWidth="1.2"
          vectorEffect="non-scaling-stroke"
        />
        <rect
          x="0.75"
          y="0.75"
          width="152.5"
          height="44.5"
          rx="22.25"
          pathLength="1"
          fill="none"
          stroke="rgba(255,255,255,.82)"
          strokeWidth="1.35"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          className="opacity-0 [stroke-dasharray:.14_.86] [stroke-dashoffset:.14] transition-[stroke-dashoffset,opacity] duration-[1400ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:opacity-100 group-hover:[stroke-dashoffset:-.86]"
        />
      </svg>

      <span className="relative z-10 flex h-full w-full items-center justify-center gap-3 rounded-full px-6 text-[11px] font-medium tracking-[0.045em] text-white">
        <LetterSwapLabel
          label={label}
          active={active}
        />

        <ArrowUpRight
          aria-hidden="true"
          className="h-[14px] w-[14px] shrink-0 stroke-[1.45] text-white/80 transition-[transform,opacity] duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-[2px] group-hover:-translate-y-[2px] group-hover:rotate-[6deg] group-hover:text-white"
        />
      </span>
    </Link>
  );
}

function LetterSwapLabel({
  label,
  active,
}: {
  label: string;
  active: boolean;
}) {
  const [display, setDisplay] =
    useState(label);

  useEffect(() => {
    if (!active) {
      setDisplay(label);
      return;
    }

    let frame = 0;
    const letters = label.split('');
    const totalFrames =
      Math.max(10, letters.length * 2 + 4);

    const timer = window.setInterval(() => {
      frame += 1;

      const resolved = Math.floor(
        Math.max(0, frame - 2) / 2
      );

      setDisplay(
        letters
          .map((letter, index) => {
            if (letter === ' ') return ' ';
            if (index < resolved) return letter;

            const glyphIndex =
              (frame * 5 + index * 7) %
              SCRAMBLE_GLYPHS.length;

            return SCRAMBLE_GLYPHS[glyphIndex];
          })
          .join('')
      );

      if (
        frame >= totalFrames ||
        resolved >= letters.length
      ) {
        window.clearInterval(timer);
        setDisplay(label);
      }
    }, 46);

    return () => {
      window.clearInterval(timer);
    };
  }, [active, label]);

  return (
    <span
      aria-label={label}
      className="min-w-[8ch] text-center [font-variant-numeric:tabular-nums]"
    >
      <span aria-hidden="true">
        {display}
      </span>
    </span>
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
            <PremiumCta href={href} label={cta} />
          </div>
        </div>
      </div>
    </section>
  );
}
