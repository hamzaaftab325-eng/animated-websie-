'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useSmoothScroll } from '../motion/SmoothScrollProvider';

const VIDEO_URL =
  'https://res.cloudinary.com/diometfe9/video/upload/v1790182288/Create_cinematic_zoom_effect_video_20260923214757_m00y5v.mp4';

const CLOUDINARY_BASE =
  'https://res.cloudinary.com/diometfe9/video/upload';
const CLOUDINARY_ASSET =
  'v1790182288/Create_cinematic_zoom_effect_video_20260923214757_m00y5v';

const CUES = [
  [0.0, 0.015, 0.255, 0.31],
  [0.345, 0.39, 0.595, 0.65],
  [0.685, 0.73, 1.04, 1.1],
] as const;

const DRIFT = 10;
const DECODE_CACHE_LIMIT = 18;
const PRELOAD_CONCURRENCY = 10;

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
  if (end <= start) {
    return progress >= end ? 1 : 0;
  }

  return smoothstep(
    clamp((progress - start) / (end - start), 0, 1)
  );
};

function buildFrameUrl(
  time: number,
  width: number
) {
  return (
    `${CLOUDINARY_BASE}/` +
    `so_${time.toFixed(3)},c_scale,w_${width},q_auto:good,f_webp/` +
    `${CLOUDINARY_ASSET}.webp`
  );
}

export function CinematicHero() {
  const { lenis } = useSmoothScroll();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lenis || !rootRef.current) return;

    const root = rootRef.current;
    const track =
      root.querySelector<HTMLElement>('[data-hero-track]');
    const canvas =
      root.querySelector<HTMLCanvasElement>('#frameCanvas');
    const metadataVideo =
      root.querySelector<HTMLVideoElement>('#frameMetadata');
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
      !metadataVideo ||
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
    let started = false;
    let duration = 0;
    let frameCount = 0;
    let frameWidth = 0;
    let progress = 0;
    let framePosition = 0;
    let renderRaf = 0;
    let resizeRaf = 0;

    const frameBlobs: Array<Blob | null> = [];
    const frameUrls: string[] = [];
    const decodedFrames = new Map<number, DecodedFrame>();
    const decodingFrames =
      new Map<number, Promise<DecodedFrame | null>>();
    const decodeUse = new Map<number, number>();

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

    const frameTime = (index: number) => {
      if (!duration || frameCount <= 1) return 0;

      const safeDuration =
        Math.max(0, duration - 0.035);

      return (
        safeDuration *
        (index / (frameCount - 1))
      );
    };

    const getFrameUrl = (index: number) =>
      buildFrameUrl(
        frameTime(index),
        frameWidth
      );

    const configureSequence = () => {
      const viewportWidth = window.innerWidth;

      if (viewportWidth >= 1280) {
        frameCount = 96;
        frameWidth = 1280;
      } else if (viewportWidth >= 768) {
        frameCount = 84;
        frameWidth = 1080;
      } else {
        frameCount = 72;
        frameWidth = 760;
      }

      frameBlobs.length = frameCount;
      frameUrls.length = frameCount;

      for (let index = 0; index < frameCount; index += 1) {
        frameBlobs[index] = null;
        frameUrls[index] = getFrameUrl(index);
      }
    };

    const preloadSequence = async () => {
      let nextIndex = 0;
      let completed = 0;

      const worker = async () => {
        while (!destroyed) {
          const index = nextIndex;
          nextIndex += 1;

          if (index >= frameCount) return;

          try {
            const response = await fetch(frameUrls[index], {
              cache: 'force-cache',
              mode: 'cors',
            });

            if (!response.ok) {
              throw new Error('Frame request failed');
            }

            frameBlobs[index] = await response.blob();
          } catch {
            // Remote URL remains available as a direct image fallback.
            frameBlobs[index] = null;
          }

          completed += 1;
          setBootProgress(
            0.08 + (completed / frameCount) * 0.82,
            'PREPARING FRAMES'
          );
        }
      };

      await Promise.all(
        Array.from(
          { length: PRELOAD_CONCURRENCY },
          () => worker()
        )
      );
    };

    const closeDecodedFrame = (
      frame: DecodedFrame | undefined
    ) => {
      try {
        frame?.close?.();
      } catch {}
    };

    const trimDecodeCache = (
      focusIndex: number
    ) => {
      if (
        decodedFrames.size <= DECODE_CACHE_LIMIT
      ) {
        return;
      }

      const removable = Array.from(
        decodedFrames.keys()
      )
        .filter(
          (index) =>
            Math.abs(index - focusIndex) > 4
        )
        .sort((a, b) => {
          const distanceA =
            Math.abs(a - focusIndex);
          const distanceB =
            Math.abs(b - focusIndex);

          if (distanceA !== distanceB) {
            return distanceB - distanceA;
          }

          return (
            (decodeUse.get(a) ?? 0) -
            (decodeUse.get(b) ?? 0)
          );
        });

      while (
        decodedFrames.size >
          DECODE_CACHE_LIMIT &&
        removable.length
      ) {
        const index = removable.shift();

        if (index == null) break;

        closeDecodedFrame(
          decodedFrames.get(index)
        );
        decodedFrames.delete(index);
        decodeUse.delete(index);
      }
    };

    const decodeViaImage = (
      index: number
    ) =>
      new Promise<DecodedFrame | null>(
        (resolve) => {
          const image = new Image();
          image.decoding = 'async';
          image.crossOrigin = 'anonymous';

          let localUrl = '';

          image.onload = () => {
            if (localUrl) {
              URL.revokeObjectURL(localUrl);
            }

            resolve(image);
          };

          image.onerror = () => {
            if (localUrl) {
              URL.revokeObjectURL(localUrl);
            }

            resolve(null);
          };

          const blob = frameBlobs[index];

          if (blob) {
            localUrl = URL.createObjectURL(blob);
            image.src = localUrl;
          } else {
            image.src = frameUrls[index];
          }
        }
      );

    const decodeFrame = (
      index: number
    ): Promise<DecodedFrame | null> => {
      const boundedIndex = clamp(
        Math.round(index),
        0,
        frameCount - 1
      );

      const cached =
        decodedFrames.get(boundedIndex);

      if (cached) {
        decodeUse.set(
          boundedIndex,
          performance.now()
        );

        return Promise.resolve(cached);
      }

      const existing =
        decodingFrames.get(boundedIndex);

      if (existing) {
        return existing;
      }

      const request = (async () => {
        let decoded: DecodedFrame | null = null;
        const blob = frameBlobs[boundedIndex];

        if (
          blob &&
          typeof createImageBitmap === 'function'
        ) {
          try {
            decoded =
              (await createImageBitmap(
                blob
              )) as DecodedFrame;
          } catch {
            decoded = null;
          }
        }

        if (!decoded) {
          decoded =
            await decodeViaImage(
              boundedIndex
            );
        }

        decodingFrames.delete(
          boundedIndex
        );

        if (
          decoded &&
          !destroyed
        ) {
          decodedFrames.set(
            boundedIndex,
            decoded
          );
          decodeUse.set(
            boundedIndex,
            performance.now()
          );
          trimDecodeCache(
            Math.round(framePosition)
          );
          scheduleRender();
          return decoded;
        }

        closeDecodedFrame(
          decoded ?? undefined
        );

        return null;
      })();

      decodingFrames.set(
        boundedIndex,
        request
      );

      return request;
    };

    const primeDecodedWindow = async (
      focusIndex: number
    ) => {
      const order = [
        0,
        1,
        -1,
        2,
        -2,
        3,
        -3,
        4,
        -4,
        5,
        -5,
      ];

      await Promise.all(
        order.map((offset) =>
          decodeFrame(
            clamp(
              focusIndex + offset,
              0,
              frameCount - 1
            )
          )
        )
      );
    };

    const resizeCanvas = () => {
      const rect =
        canvas.getBoundingClientRect();
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
      }
    };

    const drawCover = (
      frame: CanvasImageSource,
      alpha: number
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

      if (
        !sourceWidth ||
        !sourceHeight
      ) {
        return;
      }

      const scale = Math.max(
        canvas.width / sourceWidth,
        canvas.height / sourceHeight
      );

      const width =
        sourceWidth * scale;
      const height =
        sourceHeight * scale;
      const x =
        (canvas.width - width) * 0.5;
      const y =
        (canvas.height - height) * 0.5;

      context.globalAlpha = alpha;
      context.drawImage(
        frame,
        x,
        y,
        width,
        height
      );
    };

    const nearestDecoded = (
      index: number
    ) => {
      const exact =
        decodedFrames.get(index);

      if (exact) return exact;

      for (
        let distance = 1;
        distance < 8;
        distance += 1
      ) {
        const before =
          decodedFrames.get(
            index - distance
          );
        if (before) return before;

        const after =
          decodedFrames.get(
            index + distance
          );
        if (after) return after;
      }

      return null;
    };

    const renderCanvas = () => {
      renderRaf = 0;

      if (!frameCount) return;

      const lower = clamp(
        Math.floor(framePosition),
        0,
        frameCount - 1
      );
      const upper = clamp(
        lower + 1,
        0,
        frameCount - 1
      );
      const mix =
        framePosition - lower;

      const lowerFrame =
        nearestDecoded(lower);
      const upperFrame =
        nearestDecoded(upper);

      if (!lowerFrame && !upperFrame) {
        return;
      }

      context.globalAlpha = 1;
      context.fillStyle = '#11131a';
      context.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      if (lowerFrame) {
        drawCover(
          lowerFrame,
          upperFrame ? 1 - mix : 1
        );
      }

      if (upperFrame && upper !== lower) {
        drawCover(
          upperFrame,
          lowerFrame ? mix : 1
        );
      }

      context.globalAlpha = 1;
    };

    function scheduleRender() {
      if (renderRaf) return;

      renderRaf =
        requestAnimationFrame(
          renderCanvas
        );
    }

    const paintPanels = () => {
      meter.style.transform =
        `scaleX(${progress})`;

      panels.forEach(
        (panel, index) => {
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
        }
      );
    };

    const updateFromScroll = () => {
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

      framePosition =
        progress *
        (frameCount - 1);

      const focus =
        Math.round(framePosition);

      void primeDecodedWindow(
        focus
      );

      paintPanels();
      scheduleRender();
    };

    const start = () => {
      if (started) return;
      started = true;

      setBootProgress(1, 'READY');

      gsap.to(boot, {
        opacity: 0,
        duration: 0.42,
        ease: 'power3.out',
        onComplete: () => {
          boot.classList.add(
            'pointer-events-none',
            'invisible'
          );
        },
      });

      updateFromScroll();
    };

    const initializeSequence = async () => {
      duration =
        Number.isFinite(
          metadataVideo.duration
        )
          ? metadataVideo.duration
          : 0;

      if (!duration) {
        start();
        return;
      }

      configureSequence();
      resizeCanvas();

      setBootProgress(
        0.05,
        'PREPARING FRAMES'
      );

      await preloadSequence();

      if (destroyed) return;

      const initialFocus = Math.round(
        clamp(
          lenis.animatedScroll /
            Math.max(
              1,
              track.offsetHeight -
                window.innerHeight
            ),
          0,
          1
        ) *
          (frameCount - 1)
      );

      setBootProgress(
        0.92,
        'DECODING'
      );

      await primeDecodedWindow(
        initialFocus
      );

      if (destroyed) return;

      framePosition =
        initialFocus;

      renderCanvas();
      start();
    };

    const onMetadata = () => {
      void initializeSequence();
    };

    const onMetadataError = () => {
      start();
    };

    metadataVideo.addEventListener(
      'loadedmetadata',
      onMetadata
    );
    metadataVideo.addEventListener(
      'error',
      onMetadataError
    );

    metadataVideo.src = VIDEO_URL;
    metadataVideo.load();

    const onLenisScroll =
      () => updateFromScroll();

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
          updateFromScroll();
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

      metadataVideo.removeEventListener(
        'loadedmetadata',
        onMetadata
      );
      metadataVideo.removeEventListener(
        'error',
        onMetadataError
      );

      lenis.off(
        'scroll',
        onLenisScroll
      );

      window.removeEventListener(
        'resize',
        onResize
      );

      decodedFrames.forEach(
        (frame) => {
          closeDecodedFrame(frame);
        }
      );

      decodedFrames.clear();
      decodingFrames.clear();
      decodeUse.clear();
      frameBlobs.length = 0;
      frameUrls.length = 0;
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

      <video
        id="frameMetadata"
        aria-hidden="true"
        muted
        playsInline
        preload="metadata"
        className="hidden"
      />

      <div className="fixed inset-0 z-0 overflow-hidden bg-[#11131a]">
        <canvas
          id="frameCanvas"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
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
        className="relative z-[1] h-[280vh] min-h-[1800px]"
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
