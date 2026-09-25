'use client';

import { useEffect } from 'react';

const VIDEO_URL =
  'https://res.cloudinary.com/diometfe9/video/upload/v1790182288/Create_cinematic_zoom_effect_video_20260923214757_m00y5v.mp4';

const CUES = [
  [0.0, 0.0, 0.15, 0.23],
  [0.35, 0.43, 0.57, 0.65],
  [0.77, 0.85, 1.1, 1.2],
] as const;

const DRIFT = 22;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function smooth(value: number) {
  return value * value * (3 - 2 * value);
}

function ramp(progress: number, start: number, end: number) {
  if (end <= start) return progress >= end ? 1 : 0;
  return smooth(clamp((progress - start) / (end - start), 0, 1));
}

export default function Page() {
  useEffect(() => {
    const clip = document.getElementById('clip') as HTMLVideoElement | null;
    const boot = document.getElementById('boot');
    const bootBar = document.getElementById('bootBar');
    const bootPct = document.getElementById('bootPct');
    const meter = document.getElementById('meter');
    const panels = Array.from(
      document.querySelectorAll<HTMLElement>('[data-panel]')
    );

    if (!clip || !boot || !bootBar || !bootPct || !meter) return;

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
    let streamStartTimer = 0;
    let abortController: AbortController | null = null;

    const readScroll = () => {
      const max =
        document.documentElement.scrollHeight - window.innerHeight;

      progress =
        max > 0
          ? clamp(window.pageYOffset / max, 0, 1)
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
      });
    };

    const frame = () => {
      if (ready && duration) {
        const gap = seekTo - seekAt;

        if (Math.abs(gap) > 0.0008) {
          // Exact reference easing factor from the supplied motion prompt.
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

    const setProgress = (fraction: number) => {
      const value = clamp(fraction, 0, 1);
      bootBar.style.transform =
        `scaleX(${value})`;
      bootPct.textContent =
        `LOADING ${Math.round(value * 100)}%`;
    };

    const start = () => {
      if (started) return;

      started = true;
      ready = true;
      boot.classList.add('done');
      readScroll();
      seekAt = seekTo;

      try {
        clip.currentTime = seekAt;
      } catch {}
    };

    const attach = (src: string) => {
      if (attached) return;
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

      streamStartTimer = window.setTimeout(start, 12000);

      return () => {
        clip.removeEventListener('loadedmetadata', onMetadata);
        clip.removeEventListener('loadeddata', onReady);
        clip.removeEventListener('canplaythrough', onReady);
        clip.removeEventListener('error', onError);
      };
    };

    let detachVideo: (() => void) | undefined;

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
        const chunks: Uint8Array[] = [];
        let received = 0;

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          if (value) {
            chunks.push(value);
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

    // iOS needs a one-time play/pause nudge before it will reliably paint
    // arbitrary scrubbed frames from a paused video.
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

    const scrollToProgress = (target: number) => {
      const max =
        document.documentElement.scrollHeight -
        window.innerHeight;

      window.scrollTo({
        top: max * target,
        behavior: 'smooth',
      });
    };

    const onNavClick = (event: MouseEvent) => {
      const anchor = (
        event.target as HTMLElement | null
      )?.closest<HTMLAnchorElement>('a[data-progress]');

      if (!anchor) return;

      event.preventDefault();
      scrollToProgress(
        Number(anchor.dataset.progress || 0)
      );
    };

    document.addEventListener('click', onNavClick);
    window.addEventListener('scroll', readScroll, {
      passive: true,
    });
    window.addEventListener('resize', readScroll);

    readScroll();
    paint();
    preload();
    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(bailTimer);
      window.clearTimeout(streamStartTimer);
      abortController?.abort();
      detachVideo?.();

      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }

      document.removeEventListener('click', onNavClick);
      window.removeEventListener('scroll', readScroll);
      window.removeEventListener('resize', readScroll);

      unlockEvents.forEach((eventName) => {
        window.removeEventListener(eventName, unlock);
      });
    };
  }, []);

  return (
    <>
      <div className="boot" id="boot">
        <div className="bar">
          <i id="bootBar" />
        </div>
        <p id="bootPct">LOADING 0%</p>
      </div>

      <div className="stage">
        <video
          id="clip"
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
        />
        <div className="veil" />
        <div className="grain" />
      </div>

      <i className="meter" id="meter" />

      <header className="chrome">
        <div className="mark">
          <span
            className="mark-star"
            aria-hidden="true"
          >
            ✦
          </span>
          <span>Frame &amp; Form</span>
        </div>

        <nav className="nav" aria-label="Primary">
          <a href="#create" data-progress="0.04">
            Create
          </a>
          <a href="#explore" data-progress="0.39">
            Explore
          </a>
          <a
            className="pill"
            href="#transform"
            data-progress="0.81"
          >
            Enter the Studio
          </a>
        </nav>
      </header>

      <main className="panels">
        <section
          className="panel"
          id="create"
          data-panel
        >
          <div className="content-block">
            <div className="eyebrow">
              CREATIVE DIRECTION
              <span>•</span>
              DIGITAL CRAFT
            </div>
            <h1 className="hero-title">
              Create what
              <br />
              doesn&apos;t exist yet.
            </h1>
            <p className="sub">
              Ideas become visual systems, motion,
              and experiences built to feel unmistakably yours.
            </p>
            <div className="cta">
              <a
                className="pill hero-pill"
                href="#explore"
                data-progress="0.39"
              >
                Explore the process
              </a>
            </div>
          </div>
        </section>

        <section
          className="panel"
          id="explore"
          data-panel
        >
          <div className="content-block">
            <div className="eyebrow">
              IMMERSIVE EXPERIENCE
              <span>•</span>
              MOTION DESIGN
            </div>
            <h1 className="hero-title">
              See every idea
              <br />
              from a new angle.
            </h1>
            <p className="sub">
              Cinematic interaction and precise motion
              turn exploration into part of the story.
            </p>
            <div className="cta">
              <a
                className="pill hero-pill"
                href="#transform"
                data-progress="0.81"
              >
                Continue the journey
              </a>
            </div>
          </div>
        </section>

        <section
          className="panel"
          id="transform"
          data-panel
        >
          <div className="content-block">
            <div className="eyebrow">
              FRAME &amp; FORM
              <span>•</span>
              CREATIVE STUDIO
            </div>
            <h1 className="hero-title">
              Transform vision
              <br />
              into something real.
            </h1>
            <p className="sub">
              We shape digital ideas into refined,
              memorable experiences with depth and intent.
            </p>
            <div className="cta">
              <a
                className="pill hero-pill"
                href="#create"
                data-progress="0.04"
              >
                Return to the beginning
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="foot">
        Frame &amp; Form — Digital Experiences in Motion
      </footer>

      <div className="track" aria-hidden="true" />
    </>
  );
}
