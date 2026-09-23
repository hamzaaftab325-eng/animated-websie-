'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

interface CardInfo {
  id: string;
  title: string;
  description: string;
  longDesc: string;
  features: string[];
}

const CARDS_DATA: CardInfo[] = [
  {
    id: 'create',
    title: 'Create',
    description: 'Bring your ideas to life with intuitive tools.',
    longDesc: 'From procedural geometric meshes to complex architectural models, bring high-fidelity spatial concepts into reality with real-time responsive tooling.',
    features: ['Real-time 3D Viewport', 'Procedural Mesh Generation', 'PBR Shaders & Texturing', 'Automated Quad Remeshing']
  },
  {
    id: 'explore',
    title: 'Explore',
    description: 'Discover new perspectives and endless inspiration.',
    longDesc: 'Navigate through a curated multiverse of spatial design assets, material libraries, and dynamic lighting presets crafted for next-generation digital experiences.',
    features: ['Curated Asset Marketplace', 'Interactive Studio Environments', 'Spectral Lighting Presets', '360° Panoramic Previews']
  },
  {
    id: 'transform',
    title: 'Transform',
    description: 'Turn imagination into reality.',
    longDesc: 'Accelerate your production pipeline with cloud-distributed render farms, GPU-accelerated ray tracing, and automated optimization for web and mobile.',
    features: ['Distributed GPU Compute', 'Automated LOD Generation', 'Instant glTF & USDZ Exports', 'Real-time Raytracing Passes']
  },
  {
    id: 'grow',
    title: 'Grow',
    description: 'A brighter, more creative tomorrow awaits.',
    longDesc: 'Scale your design systems, collaborate in real time with global teams, and deploy immersive 3D scenes directly into production-grade applications.',
    features: ['Multi-user Sync & Branching', 'Enterprise Design Tokens', 'Global Edge CDN Delivery', 'Analytics & Engagement Telemetry']
  }
];

export default function Page() {
  const initializedRef = useRef(false);
  const [activeModal, setActiveModal] = useState<CardInfo | null>(null);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    gsap.registerPlugin(ScrollTrigger, SplitText);

    // Device-aware motion tuning: preserve cinematic desktop motion while
    // keeping touch scrolling native-feeling and responsive on tablets/phones.
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const isTablet = window.innerWidth <= 900 && window.innerWidth > 580;

    const lenis = new Lenis({
      duration: isTouch ? 0.42 : 0.72,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -9 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: !isTouch,
      touchMultiplier: isTouch ? 1.08 : 1.35,
      wheelMultiplier: isTablet ? 0.9 : 1.0,
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
    const textSplits: Array<ReturnType<typeof SplitText.create>> = [];
    const panelTitleChars: HTMLElement[][] = [];
    const panelSubtitleWords: HTMLElement[][] = [];

    panels.forEach((panel) => {
      const title = panel.querySelector<HTMLElement>(".hero-title");
      const subtitle = panel.querySelector<HTMLElement>(".sub");

      if (title) {
        const split = SplitText.create(title, {
          type: "chars",
          charsClass: "hero-char",
        });
        textSplits.push(split);
        panelTitleChars.push(split.chars as HTMLElement[]);
      } else {
        panelTitleChars.push([]);
      }

      if (subtitle) {
        const split = SplitText.create(subtitle, {
          type: "words",
          wordsClass: "sub-word",
        });
        textSplits.push(split);
        panelSubtitleWords.push(split.words as HTMLElement[]);
      } else {
        panelSubtitleWords.push([]);
      }
    });

    const heroTrack = document.getElementById("heroTrack");
    const chromeHeader = document.querySelector(".chrome");
    const footNote = document.querySelector(".foot") as HTMLElement | null;

    // 3 narrative cue zones within hero track (0..1)
    const CUES = [
      [0.00, 0.00, 0.22, 0.32],
      [0.40, 0.50, 0.68, 0.78],
      [0.84, 0.92, 1.00, 1.05]
    ];
    const DRIFT = isTouch ? 13 : 20;

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
    let lastVideoSeek = 0;
    const videoSeekInterval = isTouch ? 48 : 28;
    const seekLerp = isTouch ? 0.42 : 0.30;

    function readScroll() {
      const scrollY = window.pageYOffset;
      const trackHeight = heroTrack ? (heroTrack.offsetHeight - window.innerHeight) : (window.innerHeight * 1.5);
      
      // Video hero progress (0..1 during hero track)
      progress = trackHeight > 0 ? clamp(scrollY / trackHeight, 0, 1) : 0;
      if (duration) seekTo = progress * duration;

      // Header adapt style when scrolled into possibilities section
      if (chromeHeader) {
        if (scrollY > trackHeight - 40) {
          chromeHeader.classList.add("over-possibilities");
        } else {
          chromeHeader.classList.remove("over-possibilities");
        }
      }

      // Hide hero corner foot note once past hero
      if (footNote) {
        footNote.style.opacity = scrollY > trackHeight * 0.9 ? "0" : "1";
      }
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

        const chars = panelTitleChars[i] || [];
        chars.forEach((char, index) => {
          const stagger = Math.min(index * (isTouch ? 0.035 : 0.045), 0.34);
          const reveal = smooth(clamp((enter - stagger) / Math.max(0.001, 1 - stagger), 0, 1));
          const blur = (1 - reveal) * (isTouch ? 15 : 25) + leave * (isTouch ? 7 : 12);
          const scale = 1 + (1 - reveal) * (isTouch ? 0.10 : 0.20);
          const charY = (1 - reveal) * (isTouch ? 12 : 22) - leave * 8;

          char.style.opacity = reveal.toString();
          char.style.filter = `blur(${blur.toFixed(2)}px)`;
          char.style.transform = `translate3d(0, ${charY.toFixed(2)}px, 0) scale(${scale.toFixed(3)})`;
        });

        const words = panelSubtitleWords[i] || [];
        words.forEach((word, index) => {
          const stagger = Math.min(index * 0.035, 0.22);
          const reveal = smooth(clamp((enter - 0.12 - stagger) / Math.max(0.001, 0.88 - stagger), 0, 1));
          const blur = (1 - reveal) * (isTouch ? 8 : 13) + leave * 6;
          const wordY = (1 - reveal) * (isTouch ? 8 : 14);

          word.style.opacity = reveal.toString();
          word.style.filter = `blur(${blur.toFixed(2)}px)`;
          word.style.transform = `translate3d(0, ${wordY.toFixed(2)}px, 0)`;
        });
      }
    }

    // High-performance scrub loop. Touch devices seek less often to avoid
    // decode thrashing while still catching up quickly to the scroll position.
    function frame(now = 0) {
      if (ready && duration) {
        const gap = seekTo - seekAt;
        if (Math.abs(gap) > 0.001) {
          seekAt += gap * seekLerp;

          if (
            clip &&
            clip.readyState >= 2 &&
            !clip.seeking &&
            now - lastVideoSeek >= videoSeekInterval
          ) {
            lastVideoSeek = now;
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

    function preload() {
      // Avoid buffering the full MP4 into JavaScript memory on touch devices.
      // Direct media streaming gives mobile Safari/Chrome much smoother seeking.
      if (isTouch) {
        setProgress(0.35);
        attach(VIDEO_URL);
        return;
      }

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

    // Nav smooth scroll handlers
    const navWorks = document.querySelector('a[href="#board"]');
    const navAbout = document.querySelector('a[href="#visit"]');
    const navPossibilities = document.querySelector('a[href="#possibilities"]');
    const navBrief = document.querySelectorAll('a[href="#order"]');

    if (navWorks) {
      navWorks.addEventListener("click", (e) => {
        e.preventDefault();
        const trackHeight = heroTrack ? (heroTrack.offsetHeight - window.innerHeight) : 0;
        lenis.scrollTo(trackHeight * 0.05, { duration: 0.8 });
      });
    }

    if (navAbout) {
      navAbout.addEventListener("click", (e) => {
        e.preventDefault();
        const trackHeight = heroTrack ? (heroTrack.offsetHeight - window.innerHeight) : 0;
        lenis.scrollTo(trackHeight * 0.52, { duration: 0.8 });
      });
    }

    if (navPossibilities) {
      navPossibilities.addEventListener("click", (e) => {
        e.preventDefault();
        const el = document.getElementById("possibilities");
        if (el) lenis.scrollTo(el, { duration: 1.1, offset: 0 });
      });
    }

    navBrief.forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        const target = document.getElementById("possibilities");
        if (target) lenis.scrollTo(target, { duration: 1.1 });
      });
    });

    // Final homepage motion: compact header + stacked glass cards that resolve into the grid.
    const motion = gsap.matchMedia();
    const tiltCleanups: Array<() => void> = [];

    motion.add(
      {
        desktop: "(min-width: 901px) and (prefers-reduced-motion: no-preference)",
        tablet: "(min-width: 581px) and (max-width: 900px) and (prefers-reduced-motion: no-preference)",
        mobile: "(max-width: 580px) and (prefers-reduced-motion: no-preference)",
        reduce: "(prefers-reduced-motion: reduce)",
      },
      (context) => {
        const conditions = (context.conditions || {}) as Record<string, boolean>;
        const cards = gsap.utils.toArray<HTMLElement>(".glass-card");
        const grid = document.querySelector<HTMLElement>(".cards-grid");

        if (conditions.reduce) {
          gsap.set([".possibilities-header", ".glass-card"], {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            rotateX: 0,
            rotateY: 0,
            rotateZ: 0,
            filter: "none",
          });
          return;
        }

        if (conditions.desktop && grid && cards.length) {
          const stackOffsetX = (index: number, target: HTMLElement) => {
            const gridRect = grid.getBoundingClientRect();
            const rect = target.getBoundingClientRect();
            return gridRect.left + gridRect.width / 2 - (rect.left + rect.width / 2);
          };

          const stackY = [-16, -5, 6, 17];
          const stackRotate = [-7, -2.5, 2.5, 7];
          const stackScale = [0.93, 0.955, 0.98, 1];

          gsap.set(cards, {
            zIndex: (index: number) => cards.length - index,
          });

          const stackTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: "#possibilities",
              start: "top top",
              end: "+=118%",
              scrub: 1,
              pin: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          stackTimeline
            .fromTo(
              ".possibilities-header",
              {
                y: -10,
                opacity: 0,
                filter: "blur(14px)",
              },
              {
                y: 0,
                opacity: 1,
                filter: "blur(0px)",
                duration: 0.32,
                ease: "power3.out",
              },
              0
            )
            .fromTo(
              cards,
              {
                x: (index: number, target: HTMLElement) => stackOffsetX(index, target),
                y: (index: number) => stackY[index] ?? 0,
                rotateY: (index: number) => (index - 1.5) * 4.5,
                rotateZ: (index: number) => stackRotate[index] ?? 0,
                scale: (index: number) => stackScale[index] ?? 1,
                filter: "blur(5px)",
                opacity: 0.94,
              },
              {
                x: 0,
                y: 0,
                rotateY: 0,
                rotateZ: 0,
                scale: 1,
                filter: "blur(0px)",
                opacity: 1,
                duration: 0.92,
                stagger: {
                  each: 0.035,
                  from: "center",
                },
                ease: "power3.inOut",
              },
              0.12
            )
            .to(
              cards,
              {
                y: -7,
                duration: 0.14,
                stagger: 0.02,
                ease: "power2.out",
              },
              0.87
            )
            .to(
              cards,
              {
                y: 0,
                duration: 0.2,
                stagger: 0.02,
                ease: "back.out(1.6)",
              },
              0.98
            );
        } else {
          gsap.fromTo(
            ".possibilities-header",
            {
              y: conditions.mobile ? 18 : 24,
              opacity: 0,
              filter: "blur(10px)",
            },
            {
              y: 0,
              opacity: 1,
              filter: "blur(0px)",
              duration: conditions.mobile ? 0.62 : 0.76,
              ease: "power3.out",
              scrollTrigger: {
                trigger: "#possibilities",
                start: conditions.mobile ? "top 91%" : "top 87%",
                once: true,
              },
            }
          );

          cards.forEach((card, index) => {
            gsap.fromTo(
              card,
              {
                x: conditions.tablet ? (index % 2 === 0 ? -28 : 28) : (index % 2 === 0 ? -14 : 14),
                y: conditions.mobile ? 26 : 34,
                rotateZ: conditions.mobile ? (index % 2 === 0 ? -1.5 : 1.5) : 0,
                opacity: 0,
                scale: conditions.mobile ? 0.975 : 0.96,
                filter: conditions.mobile ? "blur(5px)" : "blur(7px)",
              },
              {
                x: 0,
                y: 0,
                rotateZ: 0,
                opacity: 1,
                scale: 1,
                filter: "blur(0px)",
                duration: conditions.mobile ? 0.58 : 0.72,
                delay: conditions.mobile ? 0 : index * 0.06,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: card,
                  start: conditions.mobile ? "top 94%" : "top 91%",
                  once: true,
                },
              }
            );
          });
        }

        gsap.fromTo(
          ".possibility-petal",
          { yPercent: -18, rotation: -7 },
          {
            yPercent: 24,
            rotation: 12,
            ease: "none",
            scrollTrigger: {
              trigger: "#possibilities",
              start: "top bottom",
              end: "bottom top",
              scrub: conditions.mobile ? 0.3 : 0.6,
            },
          }
        );
      }
    );

    // Premium cursor-following glass highlight and subtle 3D tilt.
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      document.querySelectorAll<HTMLElement>(".glass-card").forEach((card) => {
        gsap.set(card, { transformPerspective: 900, transformOrigin: "center center" });
        const rotateX = gsap.quickTo(card, "rotateX", { duration: 0.34, ease: "power3.out" });
        const rotateY = gsap.quickTo(card, "rotateY", { duration: 0.34, ease: "power3.out" });
        const lift = gsap.quickTo(card, "y", { duration: 0.34, ease: "power3.out" });
        const scale = gsap.quickTo(card, "scale", { duration: 0.34, ease: "power3.out" });

        const onMove = (event: PointerEvent) => {
          const rect = card.getBoundingClientRect();
          const px = (event.clientX - rect.left) / rect.width;
          const py = (event.clientY - rect.top) / rect.height;

          card.style.setProperty("--mx", (px * 100) + "%");
          card.style.setProperty("--my", (py * 100) + "%");
          rotateX((0.5 - py) * 5);
          rotateY((px - 0.5) * 6);
          lift(-7);
          scale(1.012);
        };

        const onLeave = () => {
          card.style.setProperty("--mx", "50%");
          card.style.setProperty("--my", "0%");
          rotateX(0);
          rotateY(0);
          lift(0);
          scale(1);
        };

        card.addEventListener("pointermove", onMove);
        card.addEventListener("pointerleave", onLeave);

        tiltCleanups.push(() => {
          card.removeEventListener("pointermove", onMove);
          card.removeEventListener("pointerleave", onLeave);
        });
      });
    }

    ScrollTrigger.refresh();

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
      motion.revert();
      textSplits.forEach((split) => split.revert());
      tiltCleanups.forEach((cleanup) => cleanup());
      ScrollTrigger.getAll().forEach(t => t.kill());
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

      {/* Persistent Chrome Navigation Header */}
      <header className="chrome">
        <div className="mark">
          <span className="mark-star" aria-hidden="true">&#10037;</span>
          <span>Cast &amp; Render</span>
        </div>
        <nav className="nav">
          <a href="#board">Works</a>
          <a href="#visit">About</a>
          <a href="#possibilities">Possibilities</a>
          <a className="pill" href="#possibilities">Explore Suite</a>
        </nav>
      </header>

      {/* Main Narrative Text Panels Over Video */}
      <main className="panels">
        <section className="panel" data-panel>
          <div className="content-block">
            <div className="eyebrow">CREATE <span>/ 01</span></div>
            <h1 className="hero-title">CREATE</h1>
            <p className="sub">Where your <em>vision</em> becomes reality.</p>
          </div>
        </section>

        <section className="panel" data-panel>
          <div className="content-block">
            <div className="eyebrow">EXPLORE <span>/ 02</span></div>
            <h1 className="hero-title">EXPLORE</h1>
            <p className="sub">See every idea from a new perspective.</p>
          </div>
        </section>

        <section className="panel" data-panel>
          <div className="content-block">
            <div className="eyebrow">TRANSFORM <span>/ 03</span></div>
            <h1 className="hero-title">TRANSFORM</h1>
            <p className="sub">Turn imagination into something real.</p>
          </div>
        </section>
      </main>

      {/* Minimal Corner Footer for Video Hero */}
      <footer className="foot">112 Render Lane &nbsp;&middot;&nbsp; Tue–Sun, 9am till sold out</footer>

      {/* Video Hero Scroll Track */}
      <div className="track" id="heroTrack"></div>

      {/* ============================================================== */}
      {/* NEW SECTION: "DISCOVER THE POSSIBILITIES — EVERYTHING YOU NEED" */}
      {/* ============================================================== */}
      <section id="possibilities" className="possibilities-section">
        <span className="possibility-petal petal-1" aria-hidden="true"></span>
        <span className="possibility-petal petal-2" aria-hidden="true"></span>
        <span className="possibility-petal petal-3" aria-hidden="true"></span>
        <span className="possibility-petal petal-4" aria-hidden="true"></span>
        <span className="possibility-petal petal-5" aria-hidden="true"></span>

        {/* Section Header */}
        <div className="possibilities-header">
          <p className="possibilities-eyebrow">DISCOVER WHAT&apos;S POSSIBLE</p>
          <h2 className="possibilities-title">Everything You Need</h2>
          <p className="possibilities-desc">
            Create, explore, transform, and grow — all in one place.
          </p>
        </div>

        {/* 4 Frosted Glass Cards */}
        <div className="cards-grid">
          {/* Card 1: Create */}
          <div
            className="glass-card"
            onClick={() => setActiveModal(CARDS_DATA[0])}
            role="button"
            tabIndex={0}
            aria-label="Create: Bring your ideas to life with intuitive tools."
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveModal(CARDS_DATA[0]); }}
          >
            <div className="card-icon-wrap" aria-hidden="true">
              {/* Lotus flower icon */}
              <svg viewBox="0 0 32 32" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 5c1.8 3.5 2.5 6.5 2.5 9 0 3-1.2 5.5-2.5 6.5-1.3-1-2.5-3.5-2.5-6.5 0-2.5.7-5.5 2.5-9z" />
                <path d="M16 14c3.5-1 6.5-1 9 1 2.5 2 3 4.5 2 6.5-2.5 1-6 0-8.5-2" />
                <path d="M16 14c-3.5-1-6.5-1-9 1-2.5 2-3 4.5-2 6.5 2.5 1 6 0 8.5-2" />
                <path d="M7 23c4 1.5 14 1.5 18 0" />
              </svg>
            </div>
            <h3 className="card-title">Create</h3>
            <p className="card-desc">Bring your ideas to life with intuitive tools.</p>
            <div className="card-btn">
              <span>&rarr;</span>
            </div>
          </div>

          {/* Card 2: Explore */}
          <div
            className="glass-card"
            onClick={() => setActiveModal(CARDS_DATA[1])}
            role="button"
            tabIndex={0}
            aria-label="Explore: Discover new perspectives and endless inspiration."
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveModal(CARDS_DATA[1]); }}
          >
            <div className="card-icon-wrap" aria-hidden="true">
              {/* Mountain icon */}
              <svg viewBox="0 0 32 32" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 24L14 8l6 11 3-5 5 10H5z" />
                <path d="M11 19l3 5" />
                <path d="M21 16l3 8" />
              </svg>
            </div>
            <h3 className="card-title">Explore</h3>
            <p className="card-desc">Discover new perspectives and endless inspiration.</p>
            <div className="card-btn">
              <span>&rarr;</span>
            </div>
          </div>

          {/* Card 3: Transform */}
          <div
            className="glass-card"
            onClick={() => setActiveModal(CARDS_DATA[2])}
            role="button"
            tabIndex={0}
            aria-label="Transform: Turn imagination into reality."
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveModal(CARDS_DATA[2]); }}
          >
            <div className="card-icon-wrap" aria-hidden="true">
              {/* Sun icon */}
              <svg viewBox="0 0 32 32" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="16" cy="16" r="5" />
                <path d="M16 3v4M16 25v4M3 16h4M25 16h4M6.8 6.8l2.8 2.8M22.4 22.4l2.8 2.8M6.8 25.2l2.8-2.8M22.4 9.6l2.8-2.8" />
              </svg>
            </div>
            <h3 className="card-title">Transform</h3>
            <p className="card-desc">Turn imagination into reality.</p>
            <div className="card-btn">
              <span>&rarr;</span>
            </div>
          </div>

          {/* Card 4: Grow */}
          <div
            className="glass-card"
            onClick={() => setActiveModal(CARDS_DATA[3])}
            role="button"
            tabIndex={0}
            aria-label="Grow: A brighter, more creative tomorrow awaits."
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveModal(CARDS_DATA[3]); }}
          >
            <div className="card-icon-wrap" aria-hidden="true">
              {/* Leaf icon */}
              <svg viewBox="0 0 32 32" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 25c2-9 9-16 18-18-2 9-9 16-18 18z" />
                <path d="M7 25c4-4 9-9 14-14" />
                <path d="M15 17l4 1" />
                <path d="M12 20l2 3" />
              </svg>
            </div>
            <h3 className="card-title">Grow</h3>
            <p className="card-desc">A brighter, more creative tomorrow awaits.</p>
            <div className="card-btn">
              <span>&rarr;</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Detail Modal for clicked Card */}
      <div
        className={`feature-modal-backdrop ${activeModal ? 'open' : ''}`}
        onClick={() => setActiveModal(null)}
        role="dialog"
        aria-modal="true"
      >
        <div className="feature-modal-card" onClick={(e) => e.stopPropagation()}>
          <button
            className="modal-close-btn"
            onClick={() => setActiveModal(null)}
            aria-label="Close details"
          >
            &times;
          </button>
          {activeModal && (
            <div>
              <p className="possibilities-eyebrow" style={{ color: '#55655d', marginBottom: '8px' }}>
                POSSIBILITIES &bull; {activeModal.id.toUpperCase()}
              </p>
              <h3 className="font-serif" style={{ fontSize: '32px', color: '#172722', marginBottom: '12px', fontWeight: 600 }}>
                {activeModal.title}
              </h3>
              <p style={{ fontSize: '15.5px', lineHeight: 1.6, color: '#3b4c44', marginBottom: '20px' }}>
                {activeModal.longDesc}
              </p>
              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#172722', marginBottom: '10px' }}>
                  Key Capabilities
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {activeModal.features.map((f, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#2f4239' }}>
                      <span style={{ color: '#10b981', fontWeight: 'bold' }}>&bull;</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  className="pill"
                  style={{ background: '#172722', color: '#fff', width: '100%', height: '44px' }}
                  onClick={() => setActiveModal(null)}
                >
                  Launch {activeModal.title} Workspace
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
