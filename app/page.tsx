'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import Script from 'next/script';
import LiquidSection from '../components/LiquidSection';

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

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;

    const VIDEO_URL =
      "https://res.cloudinary.com/diometfe9/video/upload/v1790182288/Create_cinematic_zoom_effect_video_20260923214757_m00y5v.mp4";

    const clip = document.getElementById("clip") as HTMLVideoElement | null;
    const boot = document.getElementById("boot");
    const bootBar = document.getElementById("bootBar");
    const bootPct = document.getElementById("bootPct");
    const meter = document.getElementById("meter");
    const heroTrack = document.getElementById("heroTrack");
    const chromeHeader = document.querySelector<HTMLElement>(".chrome");
    const possibilitiesSection = document.getElementById("possibilities");
    const projectsSection = document.getElementById("projectsSection");

    const textSplits: Array<ReturnType<typeof SplitText.create>> = [];
    const cleanupFns: Array<() => void> = [];
    const motion = gsap.matchMedia();

    const clamp = (value: number, min: number, max: number) =>
      Math.max(min, Math.min(max, value));

    const smoothstep = (edge0: number, edge1: number, value: number) => {
      const t = clamp(
        (value - edge0) / Math.max(0.0001, edge1 - edge0),
        0,
        1
      );
      return t * t * (3 - 2 * t);
    };

    const lenis = new Lenis({
      duration: isTouch ? 0.56 : 1.02,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: !isTouch,
      syncTouch: false,
      touchMultiplier: 1,
      wheelMultiplier: isTouch ? 1 : 0.94,
      overscroll: false,
    });

    const ticker = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(500, 33);

    const panels = gsap.utils.toArray<HTMLElement>("[data-panel]");
    const panelStates = panels.map((panel) => ({
      panel,
      content: panel.querySelector<HTMLElement>(".content-block"),
    }));

    const heroScenes = [
      { enter: 0.0, enterEnd: 0.025, leave: 0.255, leaveEnd: 0.35 },
      { enter: 0.31, enterEnd: 0.405, leave: 0.615, leaveEnd: 0.715 },
      { enter: 0.68, enterEnd: 0.775, leave: 1.01, leaveEnd: 1.08 },
    ];

    let heroEnd = 1;
    let possibilitiesTop = Number.POSITIVE_INFINITY;
    let possibilitiesBottom = Number.POSITIVE_INFINITY;
    let projectsTop = Number.POSITIVE_INFINITY;
    let projectsBottom = Number.POSITIVE_INFINITY;
    let projectsHeight = 1;

    const measureLayout = () => {
      const scrollY = lenis.scroll;

      heroEnd = heroTrack
        ? Math.max(1, heroTrack.offsetHeight - window.innerHeight)
        : Math.max(1, window.innerHeight * 1.75);

      if (possibilitiesSection) {
        const rect = possibilitiesSection.getBoundingClientRect();
        possibilitiesTop = rect.top + scrollY;
        possibilitiesBottom = possibilitiesTop + rect.height;
      }

      if (projectsSection) {
        const rect = projectsSection.getBoundingClientRect();
        projectsTop = rect.top + scrollY;
        projectsHeight = Math.max(1, rect.height);
        projectsBottom = projectsTop + projectsHeight;
      }
    };

    let videoDuration = 0;
    let videoReady = false;
    let seekFrame = 0;
    let seekTarget = 0;
    let lastSeekAt = 0;

    const setBootProgress = (value: number) => {
      const progress = clamp(value, 0, 1);
      if (bootBar) bootBar.style.transform = `scaleX(${progress})`;
      if (bootPct) bootPct.textContent = `LOADING ${Math.round(progress * 100)}%`;
    };

    const hideBoot = () => {
      if (!boot || boot.classList.contains("done")) return;
      gsap.to(boot, {
        opacity: 0,
        duration: 0.55,
        ease: "power2.out",
        onComplete: () => boot.classList.add("done"),
      });
    };

    const flushVideoSeek = () => {
      seekFrame = 0;
      if (!clip || !videoReady || !videoDuration || clip.readyState < 2) return;

      const now = performance.now();
      const minInterval = isTouch ? 48 : 34;

      if (now - lastSeekAt < minInterval || clip.seeking) return;
      if (Math.abs(clip.currentTime - seekTarget) < 0.018) return;

      lastSeekAt = now;

      try {
        clip.currentTime = clamp(
          seekTarget,
          0,
          Math.max(0, videoDuration - 0.02)
        );
      } catch {}
    };

    const queueVideoSeek = (heroProgress: number) => {
      if (!videoReady || !videoDuration) return;
      seekTarget = clamp(heroProgress, 0, 1) * videoDuration;
      if (!seekFrame) seekFrame = requestAnimationFrame(flushVideoSeek);
    };

    const renderHero = (scrollY: number) => {
      const progress = clamp(scrollY / heroEnd, 0, 1);

      if (meter) meter.style.transform = `scaleX(${progress})`;

      panelStates.forEach((state, index) => {
        const scene = heroScenes[index];
        if (!scene) return;

        const enter =
          index === 0
            ? 1
            : smoothstep(scene.enter, scene.enterEnd, progress);

        const leave =
          scene.leave > 1
            ? 0
            : smoothstep(scene.leave, scene.leaveEnd, progress);

        const opacity = enter * (1 - leave);
        const local = clamp(
          (progress - scene.enter) /
            Math.max(0.001, scene.leaveEnd - scene.enter),
          0,
          1
        );

        const y = (1 - enter) * 26 - leave * 20 + (local - 0.5) * -8;

        state.panel.style.opacity = opacity.toFixed(4);
        state.panel.style.pointerEvents = opacity > 0.55 ? "auto" : "none";
        state.panel.style.transform =
          `translate3d(0,${y.toFixed(2)}px,0)`;

        if (state.content) {
          const scale = 0.986 + opacity * 0.014;
          state.content.style.transform =
            `translate3d(0,0,0) scale(${scale.toFixed(4)})`;
        }
      });

      if (clip) {
        const scale = 1.045 + progress * 0.018;
        clip.style.transform =
          `translate3d(-50%,-50%,0) scale(${scale.toFixed(4)})`;
      }

      queueVideoSeek(progress);
    };

    if (clip) {
      const onLoadedMetadata = () => {
        videoDuration = Number.isFinite(clip.duration) ? clip.duration : 0;
        clip.pause();
        setBootProgress(0.72);
        queueVideoSeek(clamp(lenis.scroll / heroEnd, 0, 1));
      };

      const onCanPlay = () => {
        videoReady = true;
        setBootProgress(1);
        hideBoot();
        queueVideoSeek(clamp(lenis.scroll / heroEnd, 0, 1));
      };

      const onVideoError = () => {
        setBootProgress(1);
        hideBoot();
      };

      clip.addEventListener("loadedmetadata", onLoadedMetadata);
      clip.addEventListener("loadeddata", onCanPlay);
      clip.addEventListener("canplaythrough", onCanPlay);
      clip.addEventListener("error", onVideoError);
      clip.src = VIDEO_URL;
      clip.load();

      cleanupFns.push(() => {
        clip.removeEventListener("loadedmetadata", onLoadedMetadata);
        clip.removeEventListener("loadeddata", onCanPlay);
        clip.removeEventListener("canplaythrough", onCanPlay);
        clip.removeEventListener("error", onVideoError);
      });

      const bootFallback = window.setTimeout(() => {
        setBootProgress(1);
        hideBoot();
      }, 6500);

      cleanupFns.push(() => window.clearTimeout(bootFallback));
    } else {
      setBootProgress(1);
      hideBoot();
    }

    motion.add(
      {
        desktop:
          "(min-width: 901px) and (prefers-reduced-motion: no-preference)",
        compact:
          "(max-width: 900px) and (prefers-reduced-motion: no-preference)",
        reduce: "(prefers-reduced-motion: reduce)",
      },
      (context) => {
        const conditions =
          (context.conditions || {}) as Record<string, boolean>;
        const cards = gsap.utils.toArray<HTMLElement>(".glass-card");
        const grid = document.querySelector<HTMLElement>(".cards-grid");
        const header =
          document.querySelector<HTMLElement>(".possibilities-header");
        const visual =
          possibilitiesSection?.querySelector<HTMLElement>(
            "[data-liquid-visual]"
          );

        if (!possibilitiesSection || !grid || !cards.length) return;

        if (conditions.reduce) {
          gsap.set([header, ...cards], {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            rotateZ: 0,
          });
          return;
        }

        if (conditions.desktop) {
          let stackedX = cards.map(() => 0);

          const measureStack = () => {
            const gridRect = grid.getBoundingClientRect();
            const center = gridRect.left + gridRect.width * 0.5;
            stackedX = cards.map((card) => {
              const rect = card.getBoundingClientRect();
              return center - (rect.left + rect.width * 0.5);
            });
          };

          measureStack();

          gsap.set(cards, {
            zIndex: (index: number) => cards.length - index,
            transformOrigin: "50% 90%",
            force3D: true,
          });

          grid.classList.add("is-card-motion");

          const timeline = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: possibilitiesSection,
              start: "top top",
              end: "+=138%",
              scrub: true,
              pin: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onRefreshInit: measureStack,
              onLeave: () => grid.classList.remove("is-card-motion"),
              onEnterBack: () => grid.classList.add("is-card-motion"),
              onLeaveBack: () => grid.classList.add("is-card-motion"),
            },
          });

          if (header) {
            timeline.fromTo(
              header,
              { y: 22, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.15 },
              0
            );
          }

          timeline
            .fromTo(
              cards,
              {
                x: (index: number) => stackedX[index] ?? 0,
                y: () => window.innerHeight * 0.42,
                scale: 0.92,
                opacity: (index: number) => (index === 0 ? 1 : 0),
              },
              {
                x: (index: number) => stackedX[index] ?? 0,
                y: 0,
                scale: 1,
                opacity: (index: number) => (index === 0 ? 1 : 0),
                duration: 0.34,
              },
              0.08
            )
            .to(
              cards,
              { opacity: 1, duration: 0.08 },
              0.42
            )
            .to(
              cards,
              {
                x: 0,
                y: 0,
                scale: 1,
                duration: 0.56,
                stagger: { each: 0.014, from: "center" },
              },
              0.5
            );

          if (visual) {
            timeline.fromTo(
              visual,
              { yPercent: -1.4, scale: 1.028 },
              { yPercent: 1.4, scale: 1.028, duration: 1 },
              0
            );
          }
        }

        if (conditions.compact) {
          const entrance = gsap.timeline({
            scrollTrigger: {
              trigger: possibilitiesSection,
              start: "top 84%",
              once: true,
            },
          });

          if (header) {
            entrance.fromTo(
              header,
              { y: 24, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.72,
                ease: "power3.out",
              },
              0
            );
          }

          entrance.fromTo(
            cards,
            { y: 58, opacity: 0, scale: 0.965 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 0.78,
              stagger: 0.09,
              ease: "power3.out",
              clearProps: "transform",
            },
            0.12
          );
        }
      }
    );

    const cardsGrid = document.querySelector<HTMLElement>(".cards-grid");

    const onCardPointerMove = (event: PointerEvent) => {
      const card = (event.target as HTMLElement | null)?.closest(
        ".glass-card"
      ) as HTMLElement | null;

      if (!card) return;

      const rect = card.getBoundingClientRect();
      const x = clamp(
        (event.clientX - rect.left) / Math.max(1, rect.width),
        0,
        1
      );
      const y = clamp(
        (event.clientY - rect.top) / Math.max(1, rect.height),
        0,
        1
      );

      card.style.setProperty("--mx", `${x * 100}%`);
      card.style.setProperty("--my", `${y * 100}%`);
    };

    const onCardPointerLeave = () => {
      document
        .querySelectorAll<HTMLElement>(".glass-card")
        .forEach((card) => {
          card.style.setProperty("--mx", "50%");
          card.style.setProperty("--my", "0%");
        });
    };

    if (
      cardsGrid &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches
    ) {
      cardsGrid.addEventListener("pointermove", onCardPointerMove);
      cardsGrid.addEventListener("pointerleave", onCardPointerLeave);

      cleanupFns.push(() => {
        cardsGrid.removeEventListener("pointermove", onCardPointerMove);
        cardsGrid.removeEventListener("pointerleave", onCardPointerLeave);
      });
    }

    const projectsVisual =
      projectsSection?.querySelector<HTMLElement>("[data-liquid-visual]");

    const setProjectsParallax =
      projectsVisual && !reduceMotion
        ? (gsap.quickSetter(
            projectsVisual,
            "yPercent"
          ) as (value: number) => void)
        : null;

    const renderProjectsParallax = (scrollY: number) => {
      if (!setProjectsParallax || !projectsSection) return;

      const viewportCenter = scrollY + window.innerHeight * 0.5;
      const sectionCenter = projectsTop + projectsHeight * 0.5;
      const range = (projectsHeight + window.innerHeight) * 0.5;
      const normalized = clamp(
        (viewportCenter - sectionCenter) / Math.max(1, range),
        -1,
        1
      );

      setProjectsParallax(normalized * (isTouch ? 1.5 : 3.2));
    };

    if (projectsSection) {
      const titleLines =
        gsap.utils.toArray<HTMLElement>(
          ".projects-liquid-title-line",
          projectsSection
        );
      const description =
        projectsSection.querySelector<HTMLElement>(
          ".projects-liquid-description"
        );
      const buttonText =
        projectsSection.querySelector<HTMLElement>(
          ".projects-liquid-button-text"
        );
      const firstLine =
        projectsSection.querySelector<HTMLElement>(
          ".projects-liquid-button-line-first"
        );
      const lastLine =
        projectsSection.querySelector<HTMLElement>(
          ".projects-liquid-button-line-last"
        );

      let descriptionSplit:
        | ReturnType<typeof SplitText.create>
        | null = null;
      let buttonSplit:
        | ReturnType<typeof SplitText.create>
        | null = null;

      if (description) {
        descriptionSplit = SplitText.create(description, {
          type: "lines",
          linesClass: "projects-liquid-desc-line",
          mask: "lines",
        });
        textSplits.push(descriptionSplit);
      }

      if (buttonText) {
        buttonSplit = SplitText.create(buttonText, {
          type: "chars",
          charsClass: "projects-liquid-button-char",
        });
        textSplits.push(buttonSplit);
      }

      if (reduceMotion) {
        gsap.set(titleLines, {
          yPercent: 0,
          opacity: 1,
          rotateX: 0,
          filter: "none",
        });

        if (descriptionSplit) {
          gsap.set(descriptionSplit.lines, {
            yPercent: 0,
            opacity: 1,
            filter: "none",
          });
        }

        if (buttonSplit) {
          gsap.set(buttonSplit.chars, {
            y: 0,
            opacity: 1,
          });
        }
      } else {
        gsap.set(titleLines, {
          yPercent: 112,
          opacity: 0,
          rotateX: 6,
          filter: "blur(8px)",
          transformOrigin: "0% 100%",
          force3D: true,
        });

        if (descriptionSplit) {
          gsap.set(descriptionSplit.lines, {
            yPercent: 105,
            opacity: 0,
            filter: "blur(6px)",
            force3D: true,
          });
        }

        if (buttonSplit) {
          gsap.set(buttonSplit.chars, {
            y: 8,
            opacity: 0,
            force3D: true,
          });
        }

        const reveal = gsap.timeline({
          paused: true,
          defaults: { overwrite: "auto" },
        });

        reveal.to(
          titleLines,
          {
            yPercent: 0,
            opacity: 1,
            rotateX: 0,
            filter: "blur(0px)",
            duration: 1.08,
            stagger: 0.075,
            ease: "expo.out",
          },
          0
        );

        if (descriptionSplit) {
          reveal.to(
            descriptionSplit.lines,
            {
              yPercent: 0,
              opacity: 1,
              filter: "blur(0px)",
              duration: 0.95,
              stagger: 0.055,
              ease: "power3.out",
            },
            0.34
          );
        }

        if (firstLine) {
          reveal
            .to(
              firstLine,
              {
                clipPath: "inset(0% 0% 0% 0%)",
                duration: 0.46,
                ease: "power4.out",
              },
              0.68
            )
            .to(
              firstLine,
              {
                clipPath: "inset(0% 0% 0% 100%)",
                duration: 0.46,
                ease: "power4.inOut",
              },
              0.92
            );
        }

        if (lastLine) {
          reveal.fromTo(
            lastLine,
            { clipPath: "inset(0% 100% 0% 0%)" },
            {
              clipPath:
                window.innerWidth <= 767
                  ? "inset(0% calc(100% - 19.9004975124vw) 0% 0%)"
                  : "inset(0% calc(100% - 5vw) 0% 0%)",
              duration: 0.54,
              ease: "power4.out",
            },
            1.0
          );
        }

        if (buttonSplit) {
          reveal.to(
            buttonSplit.chars,
            {
              y: 0,
              opacity: 1,
              duration: 0.58,
              stagger: 0.018,
              ease: "power3.out",
            },
            0.98
          );
        }

        ScrollTrigger.create({
          trigger: projectsSection,
          start: "top 79%",
          once: true,
          onEnter: () => reveal.play(),
        });
      }
    }

    const renderChrome = (scrollY: number) => {
      if (!chromeHeader) return;

      const inProjects =
        scrollY >= projectsTop - 40 &&
        scrollY < projectsBottom - 20;

      const inPossibilities =
        scrollY >= possibilitiesTop - 40 &&
        scrollY < possibilitiesBottom - 20 &&
        !inProjects;

      chromeHeader.classList.toggle("over-projects-liquid", inProjects);
      chromeHeader.classList.toggle("over-possibilities", inPossibilities);
    };

    const onDocumentClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement | null)?.closest(
        "a[href^='#']"
      ) as HTMLAnchorElement | null;

      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;

      if (href === "#board") {
        event.preventDefault();
        lenis.scrollTo(heroEnd * 0.06, { duration: 0.9 });
        return;
      }

      if (href === "#visit") {
        event.preventDefault();
        lenis.scrollTo(heroEnd * 0.5, { duration: 0.95 });
        return;
      }

      if (href === "#order") {
        event.preventDefault();
        if (possibilitiesSection) {
          lenis.scrollTo(possibilitiesSection, { duration: 1.05 });
        }
        return;
      }

      const target = document.querySelector<HTMLElement>(href);
      if (!target) return;

      event.preventDefault();
      lenis.scrollTo(target, { duration: 1.05 });
    };

    document.addEventListener("click", onDocumentClick);
    cleanupFns.push(() =>
      document.removeEventListener("click", onDocumentClick)
    );

    const onLenisScroll = () => {
      const scrollY = lenis.scroll;
      renderHero(scrollY);
      renderProjectsParallax(scrollY);
      renderChrome(scrollY);
      ScrollTrigger.update();
    };

    lenis.on("scroll", onLenisScroll);

    let resizeFrame = 0;

    const onResize = () => {
      if (resizeFrame) cancelAnimationFrame(resizeFrame);

      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = 0;
        lenis.resize();
        measureLayout();
        renderHero(lenis.scroll);
        renderProjectsParallax(lenis.scroll);
        renderChrome(lenis.scroll);
        ScrollTrigger.refresh();
      });
    };

    window.addEventListener("resize", onResize, { passive: true });

    cleanupFns.push(() => {
      window.removeEventListener("resize", onResize);
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
    });

    requestAnimationFrame(() => {
      measureLayout();
      renderHero(lenis.scroll);
      renderProjectsParallax(lenis.scroll);
      renderChrome(lenis.scroll);
      ScrollTrigger.refresh();
    });

    return () => {
      initializedRef.current = false;

      if (seekFrame) cancelAnimationFrame(seekFrame);

      gsap.ticker.remove(ticker);
      motion.revert();

      cleanupFns.forEach((cleanup) => cleanup());
      textSplits.forEach((split) => split.revert());

      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      lenis.destroy();
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
      <LiquidSection
        id="possibilities"
        className="possibilities-section"
        imageSrc="https://res.cloudinary.com/diometfe9/image/upload/v1790183196/download_enkn9u.png"
      >
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
      </LiquidSection>

      {/* Uploaded Izanami-style projects section */}
      <LiquidSection
        id="projectsSection"
        className="projects-liquid-section"
        imageSrc="https://res.cloudinary.com/diometfe9/image/upload/v1790258302/ChatGPT_Image_Sep_24_2026_03_46_32_PM_1_d3f6xc.webp"
        ariaLabelledby="projects-liquid-title"
      >

        <div className="projects-liquid-tint" aria-hidden="true"></div>

        <div className="projects-liquid-contents">
          <div className="projects-liquid-sticky">
            <div className="projects-liquid-main">
              <div className="projects-liquid-content">
                <h2
                  id="projects-liquid-title"
                  className="projects-liquid-title"
                  aria-label="Designing the Dimensions of Life"
                >
                  <span className="projects-liquid-line-mask">
                    <span className="projects-liquid-title-line">
                      Designing
                    </span>
                  </span>
                  <span className="projects-liquid-line-mask">
                    <span className="projects-liquid-title-line">
                      the Dimensions
                    </span>
                  </span>
                  <span className="projects-liquid-line-mask">
                    <span className="projects-liquid-title-line">
                      of Life
                    </span>
                  </span>
                </h2>

                <div className="projects-liquid-descriptions">
                  <p className="projects-liquid-description">
                    Through three practices,<br />
                    Izanami designs harmony across life.<br />
                    How life is nurtured, how living is enriched,<br />
                    and how one returns to oneself.
                  </p>
                </div>

                <div className="projects-liquid-button-wrap">
                  <a
                    className="projects-liquid-button"
                    href="#projectsSection"
                    aria-label="View Projects"
                  >
                    <span className="projects-liquid-button-block">
                      <span
                        className="projects-liquid-button-lines"
                        aria-hidden="true"
                      >
                        <span className="projects-liquid-button-line projects-liquid-button-line-first"></span>
                        <span className="projects-liquid-button-line projects-liquid-button-line-last"></span>
                      </span>
                      <span className="projects-liquid-button-copy">
                        <span className="projects-liquid-button-text">
                          View Projects
                        </span>
                      </span>
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </LiquidSection>

      <Script
        id="shared-liquid-webgl"
        src="/liquid-shared.js"
        type="module"
        strategy="afterInteractive"
      />

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
