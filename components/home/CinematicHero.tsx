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
  [0.0, 0.018, 0.25, 0.31],
  [0.34, 0.395, 0.59, 0.65],
  [0.68, 0.735, 1.04, 1.1],
] as const;

const DRIFT = 12;
const FRAME_CACHE_LIMIT = 30;

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
    });

    if (!context) return;

    let progress = 0;
    let duration = 0;
    let frameCount =
      window.innerWidth >= 900 ? 120 : 84;
    let frameWidth =
      window.innerWidth >= 900 ? 1440 : 960;
    let currentFrame = 0;
    let drawnFrame = -1;
    let renderRaf = 0;
    let resizeRaf = 0;
    let started = false;
    let destroyed = false;
    let dpr = 1;

    const loadedFrames =
      new Map<number, HTMLImageElement>();
    const loadingFrames =
      new Map<number, Promise<HTMLImageElement | null>>();
    const lastUsed =
      new Map<number, number>();

    const setBootProgress = (value: number) => {
      const normalized = clamp(value, 0, 1);
      bootBar.style.transform =
        `scaleX(${normalized})`;
      bootPct.textContent =
        `LOADING ${Math.round(normalized * 100)}%`;
    };

    const frameTime = (index: number) => {
      if (!duration || frameCount <= 1) return 0;

      const safeDuration =
        Math.max(0, duration - 0.04);

      return (
        safeDuration *
        (index / (frameCount - 1))
      );
    };

    const frameUrl = (index: number) =>
      buildFrameUrl(
        frameTime(index),
        frameWidth
      );

    const touchFrame = (index: number) => {
      lastUsed.set(index, performance.now());
    };

    const trimFrameCache = (focusIndex: number) => {
      if (
        loadedFrames.size <= FRAME_CACHE_LIMIT
      ) {
        return;
      }

      const candidates = Array.from(
        loadedFrames.keys()
      )
        .filter((index) => index !== 0)
        .sort((a, b) => {
          const distanceA =
            Math.abs(a - focusIndex);
          const distanceB =
            Math.abs(b - focusIndex);

          if (distanceA !== distanceB) {
            return distanceB - distanceA;
          }

          return (
            (lastUsed.get(a) ?? 0) -
            (lastUsed.get(b) ?? 0)
          );
        });

      while (
        loadedFrames.size >
          FRAME_CACHE_LIMIT &&
        candidates.length
      ) {
        const index = candidates.shift();
        if (index == null) break;

        const image =
          loadedFrames.get(index);

        loadedFrames.delete(index);
        lastUsed.delete(index);

        if (image) {
          image.src = '';
        }
      }
    };

    const loadFrame = (
      index: number,
      priority: 'high' | 'low' | 'auto' = 'auto',
      attempt = 0
    ): Promise<HTMLImageElement | null> => {
      const boundedIndex = clamp(
        Math.round(index),
        0,
        frameCount - 1
      );

      const cached =
        loadedFrames.get(boundedIndex);

      if (cached) {
        touchFrame(boundedIndex);
        return Promise.resolve(cached);
      }

      const existing =
        loadingFrames.get(boundedIndex);

      if (existing) {
        return existing;
      }

      const request =
        new Promise<HTMLImageElement | null>(
          (resolve) => {
            const image = new Image();
            image.decoding = 'async';
            image.crossOrigin = 'anonymous';
            image.fetchPriority = priority;

            image.onload = () => {
              loadingFrames.delete(
                boundedIndex
              );

              if (destroyed) {
                resolve(null);
                return;
              }

              loadedFrames.set(
                boundedIndex,
                image
              );
              touchFrame(boundedIndex);
              trimFrameCache(currentFrame);

              if (boundedIndex === currentFrame) {
                scheduleRender();
              }

              resolve(image);
            };

            image.onerror = () => {
              loadingFrames.delete(
                boundedIndex
              );

              if (
                attempt < 2 &&
                !destroyed
              ) {
                window.setTimeout(() => {
                  loadFrame(
                    boundedIndex,
                    priority,
                    attempt + 1
                  ).then(resolve);
                }, 450 * (attempt + 1));
                return;
              }

              resolve(null);
            };

            image.src = frameUrl(
              boundedIndex
            );
          }
        );

      loadingFrames.set(
        boundedIndex,
        request
      );

      return request;
    };

    const nearestLoadedFrame = (
      target: number
    ) => {
      const exact =
        loadedFrames.get(target);

      if (exact) {
        touchFrame(target);
        return {
          index: target,
          image: exact,
        };
      }

      let nearestIndex = -1;
      let nearestDistance =
        Number.POSITIVE_INFINITY;

      loadedFrames.forEach(
        (image, index) => {
          const distance =
            Math.abs(index - target);

          if (
            distance < nearestDistance
          ) {
            nearestDistance = distance;
            nearestIndex = index;
          }
        }
      );

      if (nearestIndex < 0) {
        return null;
      }

      touchFrame(nearestIndex);

      return {
        index: nearestIndex,
        image:
          loadedFrames.get(nearestIndex)!,
      };
    };

    const resizeCanvas = () => {
      const rect =
        canvas.getBoundingClientRect();

      dpr = Math.min(
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

    const drawFrame = (
      image: HTMLImageElement
    ) => {
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const imageWidth =
        image.naturalWidth;
      const imageHeight =
        image.naturalHeight;

      if (
        !canvasWidth ||
        !canvasHeight ||
        !imageWidth ||
        !imageHeight
      ) {
        return;
      }

      const scale = Math.max(
        canvasWidth / imageWidth,
        canvasHeight / imageHeight
      );

      const drawWidth =
        imageWidth * scale;
      const drawHeight =
        imageHeight * scale;
      const x =
        (canvasWidth - drawWidth) * 0.5;
      const y =
        (canvasHeight - drawHeight) * 0.5;

      context.fillStyle = '#11131a';
      context.fillRect(
        0,
        0,
        canvasWidth,
        canvasHeight
      );

      context.drawImage(
        image,
        x,
        y,
        drawWidth,
        drawHeight
      );
    };

    const renderFrame = () => {
      renderRaf = 0;

      const frame =
        nearestLoadedFrame(
          currentFrame
        );

      if (!frame) return;

      if (
        frame.index !== drawnFrame
      ) {
        drawFrame(frame.image);
        drawnFrame = frame.index;
      }
    };

    function scheduleRender() {
      if (renderRaf) return;

      renderRaf =
        requestAnimationFrame(
          renderFrame
        );
    }

    const loadAround = (
      target: number
    ) => {
      const offsets = [
        0,
        1,
        -1,
        2,
        -2,
        3,
        -3,
        4,
        -4,
        6,
        -6,
        8,
        -8,
      ];

      offsets.forEach(
        (offset, position) => {
          const index = clamp(
            target + offset,
            0,
            frameCount - 1
          );

          void loadFrame(
            index,
            position < 5
              ? 'high'
              : 'auto'
          );
        }
      );
    };

    const prefetchFrame = async (
      index: number
    ) => {
      try {
        await fetch(frameUrl(index), {
          cache: 'force-cache',
          mode: 'cors',
          priority: 'low',
        } as RequestInit);
      } catch {
        // Prefetch is opportunistic. The focused loader retries when needed.
      }
    };

    const startBackgroundPrefetch =
      () => {
        const anchors = new Set<number>();

        for (
          let index = 0;
          index < frameCount;
          index += 12
        ) {
          anchors.add(index);
        }

        anchors.add(frameCount - 1);

        anchors.forEach((index) => {
          void loadFrame(index, 'low');
        });

        let next = 0;
        const workers = 2;

        const runWorker = async () => {
          while (
            next < frameCount &&
            !destroyed
          ) {
            const index = next;
            next += 1;

            if (
              !anchors.has(index)
            ) {
              await prefetchFrame(index);
            }
          }
        };

        for (
          let worker = 0;
          worker < workers;
          worker += 1
        ) {
          void runWorker();
        }
      };

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
          const scale =
            0.996 +
            opacity * 0.004;

          panel.style.opacity =
            opacity.toFixed(4);
          panel.style.transform =
            `translate3d(0,${y.toFixed(2)}px,0) scale(${scale.toFixed(4)})`;
          panel.style.pointerEvents =
            opacity > 0.62
              ? 'auto'
              : 'none';
        }
      );
    };

    const updateProgress = () => {
      const range = Math.max(
        1,
        track.offsetHeight -
          window.innerHeight
      );

      progress = clamp(
        lenis.scroll / range,
        0,
        1
      );

      currentFrame = Math.round(
        progress *
          (frameCount - 1)
      );

      loadAround(currentFrame);
      paintPanels();
      scheduleRender();
    };

    const start = () => {
      if (started) return;
      started = true;

      gsap.to(boot, {
        opacity: 0,
        duration: 0.46,
        ease: 'power3.out',
        onComplete: () => {
          boot.classList.add(
            'pointer-events-none',
            'invisible'
          );
        },
      });

      startBackgroundPrefetch();
      updateProgress();
    };

    const initializeSequence = async () => {
      duration =
        Number.isFinite(
          metadataVideo.duration
        )
          ? metadataVideo.duration
          : 0;

      if (!duration) return;

      frameCount =
        window.innerWidth >= 900
          ? 120
          : 84;
      frameWidth =
        window.innerWidth >= 900
          ? 1440
          : 960;

      resizeCanvas();
      setBootProgress(0.24);

      const firstFrame =
        await loadFrame(0, 'high');

      if (!firstFrame) {
        setBootProgress(1);
        start();
        return;
      }

      drawFrame(firstFrame);
      drawnFrame = 0;
      setBootProgress(0.7);

      await Promise.all([
        loadFrame(1, 'high'),
        loadFrame(2, 'high'),
        loadFrame(3, 'high'),
        loadFrame(4, 'high'),
      ]);

      setBootProgress(1);
      start();
    };

    const onMetadata = () => {
      void initializeSequence();
    };

    const onMetadataError = () => {
      setBootProgress(1);
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
      () => updateProgress();

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
          drawnFrame = -1;
          updateProgress();
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

      loadedFrames.forEach(
        (image) => {
          image.src = '';
        }
      );

      loadedFrames.clear();
      loadingFrames.clear();
      lastUsed.clear();
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
        className="relative z-[1] h-[360vh] min-h-[2200px]"
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
