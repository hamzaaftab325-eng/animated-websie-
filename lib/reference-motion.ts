import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

type Cleanup = () => void;
type SplitRecord = {
  split: ReturnType<typeof SplitText.create>;
  reverted: boolean;
};

const TEXT_DURATION = 1.4;
const TEXT_STAGGER = 0.07;
const BUTTON_LINE_DURATION = 0.7;
const BUTTON_FIRST_WIPE_DELAY = 0.35;
const BUTTON_LAST_LINE_DELAY = 0.45;
const BUTTON_CHAR_DURATION = 1.2;
const BUTTON_CHAR_DELAY = 0.45;
const BUTTON_CHAR_STAGGER = 0.01;

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

export function initReferenceMotion(): Cleanup {
  gsap.registerPlugin(SplitText);

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const finePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  ).matches;
  const desktop = window.matchMedia("(min-width: 901px)").matches;

  const cleanupFns: Cleanup[] = [];
  const splitRecords: SplitRecord[] = [];
  const observers: IntersectionObserver[] = [];

  // The reference uses Lenis with its defaults and drives it with a plain rAF.
  const lenis = new Lenis();
  lenis.stop();

  const clip = document.getElementById("clip") as HTMLVideoElement | null;
  const boot = document.getElementById("boot");
  const bootBar = document.getElementById("bootBar");
  const bootPct = document.getElementById("bootPct");
  const meter = document.getElementById("meter");
  const heroTrack = document.getElementById("heroTrack");
  const chrome = document.querySelector<HTMLElement>(".chrome");
  const possibilities = document.getElementById("possibilities");
  const projects = document.getElementById("projectsSection");

  const VIDEO_URL =
    "https://res.cloudinary.com/diometfe9/video/upload/v1790182288/Create_cinematic_zoom_effect_video_20260923214757_m00y5v.mp4";

  let rafId = 0;
  let resizeRaf = 0;
  let started = false;

  let heroEnd = 1;
  let possibilitiesTop = Number.POSITIVE_INFINITY;
  let possibilitiesHeight = 1;
  let possibilitiesBottom = Number.POSITIVE_INFINITY;
  let projectsTop = Number.POSITIVE_INFINITY;
  let projectsHeight = 1;
  let projectsBottom = Number.POSITIVE_INFINITY;

  const cards = gsap.utils.toArray<HTMLElement>(".glass-card");
  const cardsGrid = document.querySelector<HTMLElement>(".cards-grid");
  let stackedX = cards.map(() => 0);

  const possibilitiesVisual =
    possibilities?.querySelector<HTMLElement>("[data-liquid-visual]") ?? null;
  const projectsVisual =
    projects?.querySelector<HTMLElement>("[data-liquid-visual]") ?? null;

  const setPossibilitiesX =
    possibilitiesVisual && !reduceMotion
      ? (gsap.quickSetter(
          possibilitiesVisual,
          "xPercent"
        ) as (value: number) => void)
      : null;

  const setProjectsX =
    projectsVisual && !reduceMotion
      ? (gsap.quickSetter(
          projectsVisual,
          "xPercent"
        ) as (value: number) => void)
      : null;

  const createSplit = (
    elements: Element | Element[]
  ): SplitRecord => {
    const split = SplitText.create(elements, {
      autoSplit: true,
      linesClass: "reference-line",
      tag: "span",
      type: "lines",
      reduceWhiteSpace: false,
    });

    gsap.set(split.lines, {
      y: "100%",
      opacity: 0,
      force3D: true,
    });

    const record = { split, reverted: false };
    splitRecords.push(record);
    return record;
  };

  const revealSplit = (
    record: SplitRecord,
    delay = 0,
    revertOnComplete = true
  ) => {
    const lines = record.split.lines;
    gsap.killTweensOf(lines);

    gsap.to(lines, {
      opacity: 1,
      duration: TEXT_DURATION,
      delay,
      stagger: TEXT_STAGGER,
      ease: "none",
    });

    gsap.to(lines, {
      y: "0%",
      duration: TEXT_DURATION,
      delay,
      stagger: TEXT_STAGGER,
      ease: "expo.out",
      force3D: true,
      onComplete: () => {
        if (revertOnComplete && !record.reverted) {
          record.split.revert();
          record.reverted = true;
        }
      },
    });
  };

  const setupTextReveal = (
    target: Element | null,
    elements: Element[],
    delay = 0
  ) => {
    if (!target || !elements.length) return;

    if (reduceMotion) {
      gsap.set(elements, { opacity: 1, y: 0, clearProps: "transform,filter" });
      return;
    }

    const record = createSplit(elements);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);

        requestAnimationFrame(() => {
          revealSplit(record, delay, true);
        });
      });
    });

    observer.observe(target);
    observers.push(observer);
  };

  const setupButtonReveal = (
    target: HTMLElement | null,
    delay = 0
  ) => {
    if (!target) return;

    const firstLine =
      target.querySelector<HTMLElement>(
        ".projects-liquid-button-line-first"
      );
    const lastLine =
      target.querySelector<HTMLElement>(
        ".projects-liquid-button-line-last"
      );
    const text =
      target.querySelector<HTMLElement>(
        ".projects-liquid-button-text"
      );

    if (!firstLine || !lastLine || !text) return;

    if (reduceMotion) {
      gsap.set([firstLine, lastLine], {
        clipPath: "inset(0% 0% 0% 0%)",
      });
      gsap.set(text, { opacity: 1 });
      return;
    }

    const split = SplitText.create(text, {
      aria: "hidden",
      autoSplit: true,
      charsClass: "reference-char",
      tag: "span",
      type: "chars",
      reduceWhiteSpace: false,
    });

    const record = { split, reverted: false };
    splitRecords.push(record);

    gsap.set(target, { pointerEvents: "none" });
    gsap.set([firstLine, lastLine], {
      clipPath: "inset(0% 100% 0% 0%)",
    });
    gsap.set(split.chars, { opacity: 0 });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);

        requestAnimationFrame(() => {
          gsap.killTweensOf([
            firstLine,
            lastLine,
            ...split.chars,
          ]);

          gsap.to(firstLine, {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: BUTTON_LINE_DURATION,
            delay,
            ease: "power4.out",
          });

          gsap.to(firstLine, {
            clipPath: "inset(0% 0% 0% 100%)",
            duration: BUTTON_LINE_DURATION,
            delay: BUTTON_FIRST_WIPE_DELAY + delay,
            ease: "power4.out",
          });

          gsap.to(lastLine, {
            clipPath:
              window.innerWidth <= 767
                ? "inset(0% calc(100% - 19.9004975124vw) 0% 0%)"
                : "inset(0% 0% 0% 0%)",
            duration: BUTTON_LINE_DURATION,
            delay: BUTTON_LAST_LINE_DELAY + delay,
            ease: "power4.out",
            onComplete: () => {
              gsap.set(target, {
                clearProps: "pointerEvents",
              });
            },
          });

          gsap.to(split.chars, {
            opacity: 1,
            duration: BUTTON_CHAR_DURATION,
            delay: BUTTON_CHAR_DELAY + delay,
            stagger: BUTTON_CHAR_STAGGER,
            ease: "none",
            force3D: true,
          });
        });
      });
    });

    observer.observe(target);
    observers.push(observer);
  };

  // Reference-style one-time text reveals.
  if (possibilities) {
    setupTextReveal(
      possibilities,
      [
        possibilities.querySelector(".possibilities-eyebrow"),
        possibilities.querySelector(".possibilities-title"),
        possibilities.querySelector(".possibilities-desc"),
      ].filter(Boolean) as Element[],
      0
    );

    const inViewObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        possibilities.classList.toggle(
          "-in-view",
          entry.isIntersecting
        );
      });
    });

    inViewObserver.observe(possibilities);
    observers.push(inViewObserver);
  }

  if (projects) {
    setupTextReveal(
      projects,
      [
        ...gsap.utils.toArray<Element>(
          ".projects-liquid-title-line",
          projects
        ),
        projects.querySelector(".projects-liquid-description"),
      ].filter(Boolean) as Element[],
      0
    );

    setupButtonReveal(
      projects.querySelector<HTMLElement>(
        ".projects-liquid-button"
      ),
      0
    );
  }

  // Hero uses the same line timings, but scene activation is tied to hero scroll.
  const panelRecords = gsap
    .utils.toArray<HTMLElement>("[data-panel]")
    .map((panel) => {
      const title = panel.querySelector<HTMLElement>(".hero-title");
      const sub = panel.querySelector<HTMLElement>(".sub");
      const eyebrow =
        panel.querySelector<HTMLElement>(".eyebrow");

      const elements = [title, sub].filter(Boolean) as Element[];
      const split =
        !reduceMotion && elements.length
          ? createSplit(elements)
          : null;

      gsap.set(panel, {
        autoAlpha: 0,
        pointerEvents: "none",
      });

      if (eyebrow && !reduceMotion) {
        gsap.set(eyebrow, {
          autoAlpha: 0,
          y: 8,
        });
      }

      return {
        panel,
        eyebrow,
        split,
      };
    });

  let activePanel = -1;

  const activatePanel = (index: number) => {
    if (index === activePanel || index < 0 || index >= panelRecords.length) {
      return;
    }

    const previous =
      activePanel >= 0 ? panelRecords[activePanel] : null;
    const next = panelRecords[index];

    if (previous) {
      gsap.killTweensOf(previous.panel);
      gsap.to(previous.panel, {
        autoAlpha: 0,
        duration: 0.5,
        ease: "power3.out",
        onComplete: () => {
          gsap.set(previous.panel, {
            pointerEvents: "none",
          });

          if (previous.split && !previous.split.reverted) {
            gsap.set(previous.split.split.lines, {
              y: "100%",
              opacity: 0,
            });
          }

          if (previous.eyebrow) {
            gsap.set(previous.eyebrow, {
              autoAlpha: 0,
              y: 8,
            });
          }
        },
      });
    }

    activePanel = index;

    gsap.killTweensOf(next.panel);
    gsap.set(next.panel, {
      autoAlpha: 1,
      pointerEvents: "auto",
    });

    if (next.split && !next.split.reverted) {
      gsap.set(next.split.split.lines, {
        y: "100%",
        opacity: 0,
      });
      revealSplit(next.split, 0, false);
    }

    if (next.eyebrow) {
      gsap.fromTo(
        next.eyebrow,
        {
          autoAlpha: 0,
          y: 8,
        },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          ease: "power4.out",
        }
      );
    }
  };

  let videoDuration = 0;
  let videoReady = false;
  let lastSeekAt = 0;

  const setBootProgress = (value: number) => {
    const progress = clamp(value, 0, 1);

    if (bootBar) {
      bootBar.style.transform = `scaleX(${progress})`;
    }

    if (bootPct) {
      bootPct.textContent =
        `LOADING ${Math.round(progress * 100)}%`;
    }
  };

  const startExperience = () => {
    if (started) return;
    started = true;

    if (chrome) {
      gsap.fromTo(
        chrome,
        {
          opacity: 0,
          scale: 0.97,
          transformOrigin: "50% 0%",
        },
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "power3.out",
          clearProps: "transform",
        }
      );
    }

    const complete = () => {
      if (boot) {
        boot.classList.add("done");
      }
      lenis.start();
      measure();
      render();
    };

    if (boot) {
      gsap.to(boot, {
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        onComplete: complete,
      });
    } else {
      complete();
    }
  };

  if (chrome) {
    gsap.set(chrome, { opacity: 0 });
  }

  if (clip) {
    const onMetadata = () => {
      videoDuration =
        Number.isFinite(clip.duration) ? clip.duration : 0;
      clip.pause();
      setBootProgress(0.72);
    };

    const onReady = () => {
      videoReady = true;
      setBootProgress(1);
      startExperience();
    };

    const onError = () => {
      setBootProgress(1);
      startExperience();
    };

    clip.addEventListener("loadedmetadata", onMetadata);
    clip.addEventListener("loadeddata", onReady);
    clip.addEventListener("canplaythrough", onReady);
    clip.addEventListener("error", onError);

    clip.src = VIDEO_URL;
    clip.load();

    cleanupFns.push(() => {
      clip.removeEventListener("loadedmetadata", onMetadata);
      clip.removeEventListener("loadeddata", onReady);
      clip.removeEventListener("canplaythrough", onReady);
      clip.removeEventListener("error", onError);
    });
  } else {
    setBootProgress(1);
    startExperience();
  }

  const fallback = window.setTimeout(() => {
    setBootProgress(1);
    startExperience();
  }, 6500);

  cleanupFns.push(() => {
    window.clearTimeout(fallback);
  });

  const measure = () => {
    const scroll = lenis.animatedScroll;
    heroEnd = heroTrack
      ? Math.max(1, heroTrack.offsetHeight - window.innerHeight)
      : Math.max(1, window.innerHeight * 1.5);

    if (possibilities) {
      const rect = possibilities.getBoundingClientRect();
      possibilitiesTop = rect.top + scroll;
      possibilitiesHeight = Math.max(1, rect.height);
      possibilitiesBottom =
        possibilitiesTop + possibilitiesHeight;
    }

    if (projects) {
      const rect = projects.getBoundingClientRect();
      projectsTop = rect.top + scroll;
      projectsHeight = Math.max(1, rect.height);
      projectsBottom = projectsTop + projectsHeight;
    }

    if (cardsGrid && cards.length) {
      cards.forEach((card) => {
        card.style.transform = "";
      });

      const gridRect = cardsGrid.getBoundingClientRect();
      const center = gridRect.left + gridRect.width * 0.5;

      stackedX = cards.map((card) => {
        const rect = card.getBoundingClientRect();
        return center - (rect.left + rect.width * 0.5);
      });
    }
  };

  const renderVideo = (progress: number) => {
    if (!clip) return;

    const yPercent = -50 - progress * 2.6;
    const scale = 1.05 + progress * 0.012;

    clip.style.transform =
      `translate3d(-50%, ${yPercent.toFixed(3)}%, 0) scale(${scale.toFixed(4)})`;

    if (!videoReady || !videoDuration || clip.readyState < 2) {
      return;
    }

    const now = performance.now();
    if (now - lastSeekAt < (finePointer ? 34 : 48)) {
      return;
    }

    const frame = 1 / (finePointer ? 30 : 24);
    const desired =
      Math.round(
        (progress * videoDuration) / frame
      ) * frame;

    if (
      clip.seeking ||
      Math.abs(clip.currentTime - desired) < frame * 0.7
    ) {
      return;
    }

    lastSeekAt = now;

    try {
      clip.currentTime = clamp(
        desired,
        0,
        Math.max(0, videoDuration - frame)
      );
    } catch {}
  };

  const renderHero = (scroll: number) => {
    const progress = clamp(scroll / heroEnd, 0, 1);

    if (meter) {
      meter.style.transform =
        `scaleX(${progress.toFixed(5)})`;
    }

    const nextIndex =
      progress < 0.335
        ? 0
        : progress < 0.67
        ? 1
        : 2;

    activatePanel(nextIndex);
    renderVideo(progress);
  };

  const renderCards = (scroll: number) => {
    if (
      !desktop ||
      !possibilities ||
      !cardsGrid ||
      !cards.length
    ) {
      return;
    }

    const start =
      possibilitiesTop - window.innerHeight * 0.9;
    const end =
      possibilitiesTop + window.innerHeight * 0.08;

    const progress = clamp(
      (scroll - start) / Math.max(1, end - start),
      0,
      1
    );

    const rise = smoothstep(0.0, 0.48, progress);
    const reveal = smoothstep(0.34, 0.48, progress);
    const spread = smoothstep(0.44, 1.0, progress);
    const riseY =
      (1 - rise) *
      Math.min(330, window.innerHeight * 0.4);

    cardsGrid.classList.toggle(
      "is-card-motion",
      progress < 0.995
    );

    cards.forEach((card, index) => {
      const x =
        (stackedX[index] ?? 0) * (1 - spread);
      const scale = 0.94 + rise * 0.06;
      const opacity =
        index === 0 ? rise : rise * reveal;

      card.style.opacity = opacity.toFixed(4);
      card.style.transform =
        `translate3d(${x.toFixed(2)}px, ${riseY.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
    });
  };

  const renderSectionParallax = (scroll: number) => {
    const renderOne = (
      top: number,
      height: number,
      setter: ((value: number) => void) | null
    ) => {
      if (!setter || !Number.isFinite(top)) return;

      const start = top - window.innerHeight;
      const end = top + height;
      const progress = clamp(
        (scroll - start) / Math.max(1, end - start),
        0,
        1
      );

      // The supplied Projects mesh advances UVs horizontally from 0 -> 1.
      // This DOM/WebGL wrapper mirrors that traversal while keeping image
      // and liquid canvas pixel-locked.
      setter((progress - 0.5) * 5.6);
    };

    renderOne(
      possibilitiesTop,
      possibilitiesHeight,
      setPossibilitiesX
    );
    renderOne(
      projectsTop,
      projectsHeight,
      setProjectsX
    );
  };

  const renderChrome = (scroll: number) => {
    if (!chrome) return;

    const inProjects =
      scroll >= projectsTop - 40 &&
      scroll < projectsBottom - 20;

    const inPossibilities =
      scroll >= possibilitiesTop - 40 &&
      scroll < possibilitiesBottom - 20 &&
      !inProjects;

    chrome.classList.toggle(
      "over-projects-liquid",
      inProjects
    );
    chrome.classList.toggle(
      "over-possibilities",
      inPossibilities
    );
  };

  const render = () => {
    const scroll = lenis.animatedScroll;

    renderHero(scroll);
    renderCards(scroll);
    renderSectionParallax(scroll);
    renderChrome(scroll);
  };

  const raf = (time: number) => {
    lenis.raf(time);
    if (started) {
      render();
    }
    rafId = requestAnimationFrame(raf);
  };

  rafId = requestAnimationFrame(raf);

  const onResize = () => {
    if (resizeRaf) {
      cancelAnimationFrame(resizeRaf);
    }

    resizeRaf = requestAnimationFrame(() => {
      resizeRaf = 0;
      lenis.resize();
      measure();
      render();
    });
  };

  window.addEventListener("resize", onResize, {
    passive: true,
  });

  cleanupFns.push(() => {
    window.removeEventListener("resize", onResize);
  });

  const onClick = (event: MouseEvent) => {
    const anchor = (event.target as HTMLElement | null)?.closest(
      "a[href^='#']"
    ) as HTMLAnchorElement | null;

    if (!anchor) return;

    const href = anchor.getAttribute("href");
    if (!href || href === "#") return;

    if (href === "#board") {
      event.preventDefault();
      lenis.scrollTo(heroEnd * 0.05);
      return;
    }

    if (href === "#visit") {
      event.preventDefault();
      lenis.scrollTo(heroEnd * 0.5);
      return;
    }

    if (href === "#order") {
      event.preventDefault();
      if (possibilities) {
        lenis.scrollTo(possibilities);
      }
      return;
    }

    const target =
      document.querySelector<HTMLElement>(href);

    if (!target) return;

    event.preventDefault();
    lenis.scrollTo(target);
  };

  document.addEventListener("click", onClick);
  cleanupFns.push(() => {
    document.removeEventListener("click", onClick);
  });

  requestAnimationFrame(() => {
    measure();
    if (reduceMotion) {
      gsap.set(panelRecords.map((item) => item.panel), {
        clearProps: "all",
      });
      if (panelRecords[0]) {
        gsap.set(panelRecords[0].panel, {
          autoAlpha: 1,
        });
      }
    }
  });

  return () => {
    cancelAnimationFrame(rafId);
    if (resizeRaf) cancelAnimationFrame(resizeRaf);

    observers.forEach((observer) => observer.disconnect());

    splitRecords.forEach((record) => {
      if (!record.reverted) {
        record.split.revert();
        record.reverted = true;
      }
    });

    cleanupFns.forEach((cleanup) => cleanup());

    gsap.killTweensOf([
      chrome,
      boot,
      ...panelRecords.map((item) => item.panel),
      ...cards,
    ]);

    cards.forEach((card) => {
      card.style.opacity = "";
      card.style.transform = "";
    });

    cardsGrid?.classList.remove("is-card-motion");
    possibilities?.classList.remove("-in-view");

    lenis.destroy();
  };
}
