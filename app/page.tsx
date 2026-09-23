'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

export default function Page() {
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    gsap.registerPlugin(ScrollTrigger);

    // Fast, ultra-smooth responsive Lenis instance
    const lenis = new Lenis({
      duration: 0.75,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -8 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 1.8,
      wheelMultiplier: 1.1,
    });

    lenis.on('scroll', ScrollTrigger.update);
    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    const VIDEO_URL = "https://res.cloudinary.com/diometfe9/video/upload/v1790182288/Create_cinematic_zoom_effect_video_20260923214757_m00y5v.mp4";

    const clip = document.getElementById("clip") as HTMLVideoElement | null;
    const boot = document.getElementById("boot");
    const bootBar = document.getElementById("bootBar");
    const bootPct = document.getElementById("bootPct");
    const meter = document.getElementById("meter");
    const panels = [].slice.call(document.querySelectorAll("[data-panel]")) as HTMLElement[];

    // Tighter, faster pacing for the 3 scenes
    const CUES = [
      [0.00, 0.00, 0.20, 0.30],
      [0.38, 0.48, 0.65, 0.75],
      [0.82, 0.90, 1.10, 1.20]
    ];
    const DRIFT = 20;

    function clamp(v: number, a: number, b: number) {
      return Math.max(a, Math.min(b, v));
    }

    function smooth(t: number) {
      return t * t * (3 - 2 * t);
    }

    function ramp(p: number, a: number, b: number) {
      if (b <= a) return p >= b ? 1 : 0;
      return smooth(clamp((p - a) / (b - a), 0, 1));
    }

    let progress = 0;
    let seekTo = 0;
    let seekAt = 0;
    let duration = 0;
    let ready = false;
    let started = false;
    let attached = false;
    let rafId: number;

    function readScroll() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress = max > 0 ? clamp(window.pageYOffset / max, 0, 1) : 0;
      if (duration) seekTo = progress * duration;
    }

    function paint() {
      if (meter) {
        meter.style.transform = `scaleX(${progress})`;
      }
      for (let i = 0; i < panels.length; i++) {
        const c = CUES[i];
        const el = panels[i];
        if (!c || !el) continue;
        const enter = ramp(progress, c[0], c[1]);
        const leave = ramp(progress, c[2], c[3]);
        const o = enter * (1 - leave);
        const y = (1 - enter) * DRIFT - leave * DRIFT;
        
        el.style.opacity = o.toString();
        el.style.transform = `translate3d(0, ${y}px, 0)`;
        el.style.pointerEvents = o > 0.5 ? "auto" : "none";
      }
    }

    // High performance rAF loop with fast and crisp video response
    function frame() {
      if (ready && duration) {
        const gap = seekTo - seekAt;
        if (Math.abs(gap) > 0.0004) {
          seekAt += gap * 0.28; // Snappy, responsive video playback tracking
          if (clip && clip.readyState >= 2 && !clip.seeking) {
            try {
              clip.currentTime = seekAt;
            } catch (e) {}
          }
        }
      }
      paint();
      rafId = requestAnimationFrame(frame);
    }

    function setProgress(f: number) {
      if (bootBar) {
        bootBar.style.transform = `scaleX(${f})`;
      }
      if (bootPct) {
        bootPct.textContent = `LOADING ${Math.round(f * 100)}%`;
      }
    }

    function start() {
      if (started) return;
      started = true;
      ready = true;
      if (boot) {
        gsap.to(boot, {
          opacity: 0,
          duration: 0.5,
          ease: "power2.out",
          onComplete: () => {
            boot.classList.add("done");
          }
        });
      }
      readScroll();
      seekAt = seekTo;
      if (clip && duration) {
        try {
          clip.currentTime = seekAt;
        } catch (e) {}
      }
    }

    function attach(src: string) {
      if (attached) return;
      attached = true;
      if (!clip) return;

      clip.addEventListener("loadedmetadata", function() {
        if (!clip) return;
        duration = clip.duration || 0;
        clip.pause();
        readScroll();
        seekAt = seekTo;
        try {
          clip.currentTime = seekAt;
        } catch (e) {}
      });

      clip.addEventListener("loadeddata", start);
      clip.addEventListener("canplaythrough", start);
      clip.addEventListener("error", start);

      clip.src = src;
      clip.load();
      setTimeout(start, 8000);
    }

    // Preload video as a memory Blob for lossless zero-latency seeking
    function preload() {
      const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
      const signal = controller ? controller.signal : undefined;

      const bail = setTimeout(() => {
        if (!attached) {
          if (controller) controller.abort();
          setProgress(1);
          attach(VIDEO_URL);
        }
      }, 12000);

      fetch(VIDEO_URL, { signal: signal })
        .then((res) => {
          if (!res.ok || !res.body) throw new Error("Fetch failed");
          const contentLength = res.headers.get("content-length");
          const total = contentLength ? parseInt(contentLength, 10) : 0;
          const reader = res.body.getReader();
          const chunks: BlobPart[] = [];
          let got = 0;

          function pump(): Promise<Blob> {
            return reader.read().then((result) => {
              if (result.done) {
                return new Blob(chunks, { type: "video/mp4" });
              }
              if (result.value) {
                chunks.push(result.value);
                got += result.value.length;
              }
              const frac = total ? (got / total) : Math.min(got / 11000000, 0.95);
              setProgress(frac);
              return pump();
            });
          }

          return pump();
        })
        .then((blob) => {
          clearTimeout(bail);
          setProgress(1);
          attach(URL.createObjectURL(blob));
        })
        .catch(() => {
          clearTimeout(bail);
          setProgress(1);
          attach(VIDEO_URL);
        });
    }

    function unlock() {
      if (!clip) return;
      const p = clip.play();
      if (p && p.then) {
        p.then(() => {
          if (clip) clip.pause();
        }).catch(() => {});
      } else {
        clip.pause();
      }
    }

    const unlockEvents = ["touchstart", "pointerdown", "wheel", "keydown"];
    unlockEvents.forEach((ev) => {
      window.addEventListener(ev, unlock, { once: true, passive: true });
    });

    // Fast smooth scroll navigation
    const navWorks = document.querySelector('a[href="#board"]');
    const navAbout = document.querySelector('a[href="#visit"]');
    const navBrief = document.querySelectorAll('a[href="#order"]');

    const handleNavScroll = (targetProgress: number) => (e: Event) => {
      e.preventDefault();
      const max = document.documentElement.scrollHeight - window.innerHeight;
      lenis.scrollTo(targetProgress * max, { duration: 0.8 });
    };

    if (navWorks) navWorks.addEventListener("click", handleNavScroll(0.02));
    if (navAbout) navAbout.addEventListener("click", handleNavScroll(0.50));
    navBrief.forEach((el) => {
      el.addEventListener("click", handleNavScroll(0.95));
    });

    window.addEventListener("scroll", readScroll, { passive: true });
    window.addEventListener("resize", readScroll);

    readScroll();
    paint();
    preload();
    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      window.removeEventListener("scroll", readScroll);
      window.removeEventListener("resize", readScroll);
      unlockEvents.forEach((ev) => {
        window.removeEventListener(ev, unlock);
      });
    };
  }, []);

  return (
    <>
      {/* Boot / Preloader */}
      <div className="boot" id="boot">
        <div className="bar"><i id="bootBar"></i></div>
        <p id="bootPct">LOADING 0%</p>
      </div>

      {/* Pure High-Quality Background Video Stage */}
      <div className="stage">
        <video id="clip" muted playsInline preload="auto" disablePictureInPicture></video>
      </div>

      {/* Scroll Meter */}
      <i className="meter" id="meter"></i>

      {/* Chrome Navigation Header */}
      <header className="chrome">
        <div className="mark">
          <span className="mark-star" aria-hidden="true">&#10037;</span>
          <span>Cast &amp; Render</span>
        </div>
        <nav className="nav">
          <a href="#board">Works</a>
          <a href="#visit">About</a>
          <a className="pill" href="#order">Start a brief</a>
        </nav>
      </header>

      {/* Main Narrative Text Panels Aligned Bottom-Left Without Glass Wrapper */}
      <main className="panels">
        {/* Panel 1 */}
        <section className="panel" data-panel>
          <div className="content-block">
            <div className="eyebrow">Objects studio <span>&middot;</span> No. 112 Render Lane</div>
            <h1>Built at four.<br />Out by seven.</h1>
            <p className="sub">Six kinds of mesh, one render farm, and a queue that starts before the sun does.</p>
            <div className="cta">
              <a className="pill" href="#board">View the reel</a>
            </div>
          </div>
        </section>

        {/* Panel 2 */}
        <section className="panel" data-panel>
          <div className="content-block">
            <div className="eyebrow">Across the studio</div>
            <h1>Flat, never bent.</h1>
            <p className="sub">The mesh should still be clean when it reaches the viewport. We export to order, never before.</p>
            <div className="cta">
              <a className="pill" href="#visit">Tour our space</a>
            </div>
          </div>
        </section>

        {/* Panel 3 */}
        <section className="panel" data-panel>
          <div className="content-block">
            <div className="eyebrow">The surface</div>
            <h1>Smooth enough to<br />hold a light pass.</h1>
            <p className="sub">Custom surface shaders whipped every morning, spread to the edge and weighed by the quarter pound.</p>
            <div className="cta">
              <a className="pill" href="#order">Start a brief</a>
            </div>
          </div>
        </section>
      </main>

      {/* Minimal Corner Footer */}
      <footer className="foot">112 Render Lane &nbsp;&middot;&nbsp; Tue–Sun, 9am till sold out</footer>

      {/* Fast Paced Scroll Track */}
      <div className="track"></div>
    </>
  );
}
