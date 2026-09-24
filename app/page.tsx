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
      duration: isTouch ? 0.52 : 1.0,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: !isTouch,
      syncTouch: false,
      touchMultiplier: isTouch ? 1.02 : 1.15,
      wheelMultiplier: isTablet ? 0.86 : 0.9,
      overscroll: false,
    });

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(500, 33);

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
      [0.00, 0.00, 0.25, 0.34],
      [0.34, 0.44, 0.64, 0.74],
      [0.72, 0.82, 1.00, 1.06]
    ];
    const DRIFT = isTouch ? 11 : 18;

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
    let duration = 0;
    let ready = false;
    let started = false;
    let attached = false;
    let lastVideoSeek = 0;
    let videoSeekQueued = false;
    const assumedFps = isTouch ? 24 : 30;
    const minSeekDelta = 0.75 / assumedFps;

    function readScroll() {
      const scrollY = window.pageYOffset;
      const trackHeight = heroTrack ? (heroTrack.offsetHeight - window.innerHeight) : (window.innerHeight * 1.5);
      
      // Lenis already provides the smoothing. Keep one authoritative progress
      // value so video, text and ScrollTrigger remain phase-locked.
      progress = trackHeight > 0 ? clamp(scrollY / trackHeight, 0, 1) : 0;

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

        // Do no expensive descendant work for fully hidden scenes.
        if (o <= 0.0005) {
          if (el.style.opacity !== "0") {
            el.style.opacity = "0";
            el.style.pointerEvents = "none";
          }
          continue;
        }

        const cueCenter = (c[1] + c[2]) * 0.5;
        const sceneParallax = (progress - cueCenter) * (isTouch ? -5 : -10) * o;
        const y = (1 - enter) * DRIFT - leave * DRIFT + sceneParallax;

        el.style.opacity = o.toFixed(4);
        el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
        el.style.pointerEvents = o > 0.5 ? "auto" : "none";

        const title = el.querySelector<HTMLElement>(".hero-title");
        const subtitle = el.querySelector<HTMLElement>(".sub");

        if (title) {
          const titleBlur = (1 - enter) * (isTouch ? 5 : 8) + leave * 3;
          title.style.filter = titleBlur < 0.12 ? "none" : `blur(${titleBlur.toFixed(2)}px)`;
        }

        if (subtitle) {
          const subtitleBlur = (1 - enter) * (isTouch ? 3 : 5) + leave * 2;
          subtitle.style.filter = subtitleBlur < 0.12 ? "none" : `blur(${subtitleBlur.toFixed(2)}px)`;
        }

        const chars = panelTitleChars[i] || [];
        const charMiddle = Math.max(1, (chars.length - 1) / 2);

        chars.forEach((char, index) => {
          const distance = Math.abs(index - charMiddle) / charMiddle;
          const stagger = distance * (isTouch ? 0.08 : 0.11);
          const reveal = smooth(
            clamp((enter - stagger) / Math.max(0.001, 1 - stagger), 0, 1)
          );
          const scale = 1 + (1 - reveal) * (isTouch ? 0.045 : 0.075);
          const charY = (1 - reveal) * (isTouch ? 5 : 8) - leave * 4;

          char.style.opacity = reveal.toFixed(4);
          char.style.transform =
            `translate3d(0, ${charY.toFixed(2)}px, 0) scale(${scale.toFixed(3)})`;
        });

        const words = panelSubtitleWords[i] || [];
        const wordMiddle = Math.max(1, (words.length - 1) / 2);

        words.forEach((word, index) => {
          const distance = Math.abs(index - wordMiddle) / wordMiddle;
          const stagger = 0.06 + distance * 0.045;
          const reveal = smooth(
            clamp((enter - stagger) / Math.max(0.001, 0.94 - stagger), 0, 1)
          );
          const wordY = (1 - reveal) * (isTouch ? 3 : 5);

          word.style.opacity = reveal.toFixed(4);
          word.style.transform = `translate3d(0, ${wordY.toFixed(2)}px, 0)`;
        });
      }
    }

    function updateVideoSeek() {
      if (!ready || !duration || !clip || clip.readyState < 2) return;

      const frameDuration = 1 / assumedFps;
      const desired = Math.round((progress * duration) / frameDuration) * frameDuration;
      const difference = desired - clip.currentTime;

      if (Math.abs(difference) < minSeekDelta) {
        videoSeekQueued = false;
        return;
      }

      if (clip.seeking) {
        videoSeekQueued = true;
        return;
      }

      const now = performance.now();
      const minInterval = isTouch ? 50 : 34;
      if (now - lastVideoSeek < minInterval) {
        videoSeekQueued = true;
        return;
      }

      lastVideoSeek = now;
      videoSeekQueued = false;

      try {
        clip.currentTime = clamp(desired, 0, Math.max(0, duration - frameDuration));
      } catch (e) {}
    }

    function renderScrollState() {
      readScroll();
      paint();
      updateVideoSeek();
      ScrollTrigger.update();
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
      renderScrollState();
      if (clip && duration) {
        updateVideoSeek();
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
        renderScrollState();
        updateVideoSeek();
      });

      clip.addEventListener("loadeddata", start);
      clip.addEventListener("canplaythrough", start);
      clip.addEventListener("error", start);
      clip.addEventListener("seeked", () => {
        if (videoSeekQueued) updateVideoSeek();
      });

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

    // Advanced card choreography: rise from the bottom into one merged glass stack,
    // then separate and settle down into the final floor-aligned layout.
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
          });
          return;
        }

        if (conditions.desktop && grid && cards.length) {
          const finalCenters = cards.map((card) => {
            const rect = card.getBoundingClientRect();
            return rect.left + rect.width / 2;
          });

          const gridRect = grid.getBoundingClientRect();
          const gridCenter = gridRect.left + gridRect.width / 2;

          const stackedX = finalCenters.map((center, index) => {
            const deckNudge = [-18, -6, 6, 18][index] ?? 0;
            return gridCenter - center + deckNudge;
          });

          const stackedY = [-4, 2, 8, 14];
          const stackedRotate = [-3.8, -1.4, 1.5, 4.2];
          const stackedScale = [0.965, 0.978, 0.99, 1];

          gsap.set(cards, {
            zIndex: (index: number) => cards.length - index,
            transformOrigin: "50% 92%",
            force3D: true,
          });

          let motionActive = true;
          grid.classList.add("is-card-motion");

          const stackTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: "#possibilities",
              start: "top top",
              end: "+=145%",
              scrub: true,
              pin: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onRefreshInit: () => {
                gsap.set(cards, { clearProps: "x,y,rotation,scale" });
              },
              onUpdate: (self) => {
                const nextActive = self.progress < 0.992;
                if (nextActive !== motionActive) {
                  motionActive = nextActive;
                  grid.classList.toggle("is-card-motion", motionActive);
                }
              },
              onLeaveBack: () => {
                motionActive = true;
                grid.classList.add("is-card-motion");
              },
              onLeave: () => {
                motionActive = false;
                grid.classList.remove("is-card-motion");
              },
            },
          });

          stackTimeline
            .fromTo(
              ".possibilities-header",
              { y: 18, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.16, ease: "none" },
              0
            )
            // 01 — exact center stack.
            .fromTo(
              cards,
              {
                x: (index: number) => stackedX[index] ?? 0,
                y: (index: number) => stackedY[index] ?? 0,
                rotation: (index: number) => stackedRotate[index] ?? 0,
                scale: (index: number) => stackedScale[index] ?? 1,
                opacity: 1,
              },
              {
                x: (index: number) => (stackedX[index] ?? 0) * 0.72,
                y: (index: number) => (stackedY[index] ?? 0) * 0.7,
                rotation: (index: number) => (stackedRotate[index] ?? 0) * 0.72,
                scale: (index: number) => 0.975 + index * 0.008,
                duration: 0.26,
                ease: "none",
              },
              0.08
            )
            // 02/03 — controlled fan-out while scrolling.
            .to(
              cards,
              {
                x: (index: number) => (stackedX[index] ?? 0) * 0.34,
                y: (index: number) => (index - 1.5) * 4,
                rotation: (index: number) => (stackedRotate[index] ?? 0) * 0.24,
                scale: 0.992,
                duration: 0.36,
                ease: "none",
              },
              0.34
            )
            // 04 — final row, perfectly aligned to the designed grid.
            .to(
              cards,
              {
                x: 0,
                y: 0,
                rotation: 0,
                scale: 1,
                duration: 0.38,
                stagger: {
                  each: 0.015,
                  from: "center",
                },
                ease: "none",
              },
              0.70
            );
        } else {
          gsap.fromTo(
            ".possibilities-header",
            { y: conditions.mobile ? 18 : 22, opacity: 0, filter: "blur(9px)" },
            {
              y: 0,
              opacity: 1,
              filter: "blur(0px)",
              duration: conditions.mobile ? 0.60 : 0.72,
              ease: "power3.out",
              scrollTrigger: {
                trigger: "#possibilities",
                start: conditions.mobile ? "top 91%" : "top 88%",
                once: true,
              },
            }
          );

          cards.forEach((card, index) => {
            const horizontal = conditions.tablet
              ? (index % 2 === 0 ? 34 : -34)
              : (index % 2 === 0 ? 18 : -18);

            gsap.fromTo(
              card,
              {
                x: horizontal,
                y: conditions.mobile ? 42 : 54,
                rotateZ: index % 2 === 0 ? -2 : 2,
                opacity: 0,
                scale: conditions.mobile ? 0.965 : 0.95,
              },
              {
                x: 0,
                y: 0,
                rotateZ: 0,
                opacity: 1,
                scale: 1,
                duration: conditions.mobile ? 0.60 : 0.72,
                delay: Math.min(index * 0.055, 0.16),
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
              scrub: true,
            },
          }
        );
      }
    );

    const possibilitiesSection = document.getElementById("possibilities");
    if (possibilitiesSection && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.fromTo(
        possibilitiesSection,
        { "--section-reveal": "0" } as gsap.TweenVars,
        {
          "--section-reveal": "1",
          ease: "none",
          scrollTrigger: {
            trigger: possibilitiesSection,
            start: "top 96%",
            end: "top 72%",
            scrub: true,
          },
        } as gsap.TweenVars
      );
    }

    // Cursor-following glass light without competing with the scroll transform.
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      document.querySelectorAll<HTMLElement>(".glass-card").forEach((card) => {
        const icon = card.querySelector<HTMLElement>(".card-icon-wrap");
        const iconX = icon ? gsap.quickTo(icon, "x", { duration: 0.28, ease: "power3.out" }) : null;
        const iconY = icon ? gsap.quickTo(icon, "y", { duration: 0.28, ease: "power3.out" }) : null;

        const onMove = (event: PointerEvent) => {
          const rect = card.getBoundingClientRect();
          const px = (event.clientX - rect.left) / rect.width;
          const py = (event.clientY - rect.top) / rect.height;

          card.style.setProperty("--mx", (px * 100).toFixed(2) + "%");
          card.style.setProperty("--my", (py * 100).toFixed(2) + "%");

          if (iconX && iconY) {
            iconX((px - 0.5) * 4);
            iconY((py - 0.5) * 4);
          }
        };

        const onLeave = () => {
          card.style.setProperty("--mx", "50%");
          card.style.setProperty("--my", "0%");

          if (iconX && iconY) {
            iconX(0);
            iconY(0);
          }
        };

        card.addEventListener("pointermove", onMove);
        card.addEventListener("pointerleave", onLeave);

        tiltCleanups.push(() => {
          card.removeEventListener("pointermove", onMove);
          card.removeEventListener("pointerleave", onLeave);
        });
      });
    }

    const onLenisScroll = () => {
      renderScrollState();
    };

    lenis.on("scroll", onLenisScroll);
    ScrollTrigger.refresh();

    window.addEventListener("resize", renderScrollState);

    renderScrollState();
    preload();

    return () => {
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      motion.revert();
      textSplits.forEach((split) => split.revert());
      tiltCleanups.forEach((cleanup) => cleanup());
      ScrollTrigger.getAll().forEach(t => t.kill());
      window.removeEventListener("resize", renderScrollState);
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
            <p className="sub">Where your <em>Vision</em> becomes Reality.</p>
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
