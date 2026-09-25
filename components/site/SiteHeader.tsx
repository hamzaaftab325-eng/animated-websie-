'use client';

import {
  useEffect,
  useRef,
  useState,
} from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const headerRef = useRef<HTMLElement>(null);
  const homeNavRef = useRef<HTMLElement>(null);
  const compactButtonRef =
    useRef<HTMLButtonElement>(null);
  const liquidMorphRef =
    useRef<HTMLSpanElement>(null);
  const hasCompactTransitionedRef =
    useRef(false);
  const menuPanelRef =
    useRef<HTMLDivElement>(null);
  const menuBackdropRef =
    useRef<HTMLButtonElement>(null);

  const [compact, setCompact] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [homeNavReady, setHomeNavReady] =
    useState(false);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const nav = isHome
      ? homeNavRef.current
      : header.querySelector<HTMLElement>(
          '[data-header-nav]'
        );

    if (!nav) return;

    const items = Array.from(
      nav.querySelectorAll<HTMLElement>(
        '[data-header-item]'
      )
    );

    const prefersReducedMotion =
      window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

    if (prefersReducedMotion) {
      gsap.set([nav, ...items], {
        clearProps: 'all',
      });

      if (isHome) {
        setHomeNavReady(true);
      }

      return;
    }

    let revealed = false;

    const reveal = () => {
      if (revealed) return;
      revealed = true;

      const tl = gsap.timeline({
        defaults: {
          ease: 'expo.out',
        },
        onComplete: () => {
          if (isHome) {
            setHomeNavReady(true);
          }
        },
      });

      tl.to(nav, {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        duration: 1.05,
      }).to(
        items,
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.72,
          stagger: 0.045,
        },
        0.18
      );
    };

    gsap.set(nav, {
      opacity: 0,
      y: -14,
      scale: 0.96,
      filter: 'blur(12px)',
      transformOrigin: '50% 0%',
      willChange:
        'transform, opacity, filter',
    });

    gsap.set(items, {
      opacity: 0,
      y: -4,
      filter: 'blur(6px)',
      willChange:
        'transform, opacity, filter',
    });

    if (isHome) {
      window.addEventListener(
        'hero-ready',
        reveal,
        { once: true }
      );
    } else {
      requestAnimationFrame(reveal);
    }

    const fallback = window.setTimeout(
      reveal,
      isHome ? 4500 : 300
    );

    return () => {
      window.removeEventListener(
        'hero-ready',
        reveal
      );
      window.clearTimeout(fallback);
      gsap.killTweensOf([nav, ...items]);
    };
  }, [isHome]);

  useEffect(() => {
    if (!isHome) return;

    let compactState = false;

    const update = () => {
      const y =
        window.scrollY ||
        document.documentElement.scrollTop;

      if (!compactState && y > 140) {
        compactState = true;
        setCompact(true);
      } else if (compactState && y < 72) {
        compactState = false;
        setCompact(false);
      }
    };

    update();
    window.addEventListener(
      'scroll',
      update,
      { passive: true }
    );

    return () => {
      window.removeEventListener(
        'scroll',
        update
      );
    };
  }, [isHome]);

  useEffect(() => {
    if (!isHome || !homeNavReady) return;

    const nav = homeNavRef.current;
    const button = compactButtonRef.current;
    const liquid = liquidMorphRef.current;

    if (!nav || !button || !liquid) return;

    const centerOffset = Math.max(
      0,
      window.innerWidth * 0.5 - 42
    );

    gsap.killTweensOf([
      nav,
      button,
      liquid,
    ]);

    const tl = gsap.timeline({
      defaults: {
        ease: 'expo.inOut',
      },
    });

    if (compact) {
      setMenuOpen(false);
      hasCompactTransitionedRef.current = true;

      gsap.set(liquid, {
        autoAlpha: 0,
        x: centerOffset,
        scaleX: 5.4,
        scaleY: 0.76,
        rotate: -3,
        filter: 'blur(8px)',
      });

      tl.to(
        nav,
        {
          autoAlpha: 0,
          y: -4,
          scale: 0.88,
          filter: 'blur(12px)',
          duration: 0.95,
          ease: 'power4.inOut',
          pointerEvents: 'none',
        },
        0
      )
        .to(
          liquid,
          {
            autoAlpha: 0.96,
            x: centerOffset * 0.58,
            scaleX: 3.35,
            scaleY: 0.88,
            rotate: -1.5,
            filter: 'blur(3px)',
            duration: 0.48,
            ease: 'power3.out',
          },
          0.08
        )
        .to(
          liquid,
          {
            x: 0,
            scaleX: 1,
            scaleY: 1,
            rotate: 0,
            filter: 'blur(0px)',
            duration: 0.82,
            ease: 'expo.out',
          },
          0.38
        )
        .fromTo(
          button,
          {
            autoAlpha: 0,
            scale: 0.64,
            filter: 'blur(10px)',
          },
          {
            autoAlpha: 1,
            scale: 1,
            filter: 'blur(0px)',
            duration: 0.72,
            ease: 'expo.out',
            pointerEvents: 'auto',
            overwrite: true,
          },
          0.62
        )
        .to(
          liquid,
          {
            autoAlpha: 0,
            scale: 0.86,
            duration: 0.36,
            ease: 'power2.out',
          },
          0.98
        );
    } else {
      setMenuOpen(false);

      // Initial page load: keep the compact control completely hidden.
      // Only play the reverse liquid morph after the user has actually
      // crossed the scroll threshold at least once.
      if (!hasCompactTransitionedRef.current) {
        gsap.set(button, {
          autoAlpha: 0,
          scale: 0.7,
          filter: 'blur(8px)',
          pointerEvents: 'none',
        });

        gsap.set(liquid, {
          autoAlpha: 0,
          x: 0,
          scaleX: 1,
          scaleY: 1,
          rotate: 0,
          filter: 'blur(0px)',
        });

        gsap.set(nav, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          pointerEvents: 'auto',
        });

        return;
      }

      gsap.set(liquid, {
        autoAlpha: 0,
        x: 0,
        scaleX: 1,
        scaleY: 1,
        rotate: 0,
        filter: 'blur(0px)',
      });

      tl.to(
        button,
        {
          autoAlpha: 0,
          scale: 0.7,
          filter: 'blur(8px)',
          duration: 0.54,
          ease: 'power3.inOut',
          pointerEvents: 'none',
        },
        0
      )
        .to(
          liquid,
          {
            autoAlpha: 0.94,
            scaleX: 1.12,
            scaleY: 0.92,
            duration: 0.28,
            ease: 'power2.out',
          },
          0.08
        )
        .to(
          liquid,
          {
            x: centerOffset * 0.58,
            scaleX: 3.2,
            scaleY: 0.86,
            rotate: 1.5,
            filter: 'blur(3px)',
            duration: 0.66,
            ease: 'power3.inOut',
          },
          0.22
        )
        .to(
          liquid,
          {
            x: centerOffset,
            scaleX: 5.2,
            scaleY: 0.78,
            filter: 'blur(7px)',
            duration: 0.5,
            ease: 'expo.in',
          },
          0.66
        )
        .to(
          liquid,
          {
            autoAlpha: 0,
            duration: 0.24,
            ease: 'power2.out',
          },
          0.98
        )
        .fromTo(
          nav,
          {
            autoAlpha: 0,
            y: -4,
            scale: 0.88,
            filter: 'blur(12px)',
          },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            filter: 'blur(0px)',
            duration: 1,
            ease: 'expo.out',
            pointerEvents: 'auto',
          },
          0.58
        );
    }
  }, [compact, homeNavReady, isHome]);

  useEffect(() => {
    if (!isHome) return;

    const panel = menuPanelRef.current;
    const backdrop = menuBackdropRef.current;

    if (!panel || !backdrop) return;

    const items = Array.from(
      panel.querySelectorAll<HTMLElement>(
        '[data-menu-item]'
      )
    );

    const prefersReducedMotion =
      window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

    gsap.killTweensOf([
      panel,
      backdrop,
      ...items,
    ]);

    if (prefersReducedMotion) {
      gsap.set(backdrop, {
        autoAlpha: menuOpen ? 1 : 0,
        pointerEvents: menuOpen
          ? 'auto'
          : 'none',
      });

      gsap.set(panel, {
        autoAlpha: menuOpen ? 1 : 0,
        pointerEvents: menuOpen
          ? 'auto'
          : 'none',
      });

      gsap.set(items, {
        autoAlpha: menuOpen ? 1 : 0,
        y: 0,
      });

      return;
    }

    if (menuOpen) {
      gsap.set(backdrop, {
        pointerEvents: 'auto',
      });

      gsap.to(backdrop, {
        autoAlpha: 1,
        duration: 0.34,
        ease: 'power2.out',
      });

      gsap.fromTo(
        panel,
        {
          autoAlpha: 0,
          y: -10,
          scale: 0.965,
          filter: 'blur(12px)',
          clipPath:
            'inset(0 0 100% 0 round 28px)',
        },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          clipPath:
            'inset(0 0 0% 0 round 28px)',
          duration: 0.88,
          ease: 'expo.out',
          pointerEvents: 'auto',
        }
      );

      gsap.fromTo(
        items,
        {
          autoAlpha: 0,
          x: -16,
          y: 8,
          filter: 'blur(6px)',
        },
        {
          autoAlpha: 1,
          x: 0,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.82,
          stagger: 0.07,
          delay: 0.16,
          ease: 'expo.out',
        }
      );
    } else {
      gsap.to(items, {
        autoAlpha: 0,
        x: -8,
        duration: 0.2,
        stagger: {
          each: 0.02,
          from: 'end',
        },
        ease: 'power2.in',
      });

      gsap.to(panel, {
        autoAlpha: 0,
        y: -6,
        scale: 0.98,
        filter: 'blur(7px)',
        clipPath:
          'inset(0 0 100% 0 round 28px)',
        duration: 0.42,
        ease: 'power3.inOut',
        pointerEvents: 'none',
      });

      gsap.to(backdrop, {
        autoAlpha: 0,
        duration: 0.3,
        ease: 'power2.inOut',
        pointerEvents: 'none',
      });
    }
  }, [isHome, menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;

    const closeOnEscape = (
      event: KeyboardEvent
    ) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    window.addEventListener(
      'keydown',
      closeOnEscape
    );

    return () => {
      window.removeEventListener(
        'keydown',
        closeOnEscape
      );
    };
  }, [menuOpen]);

  if (isHome) {
    return (
      <header
        ref={headerRef}
        className="pointer-events-none fixed inset-x-0 top-0 z-[85] h-0"
      >
        <div className="absolute left-1/2 top-[18px] z-20 -translate-x-1/2">
          <nav
            ref={homeNavRef}
            data-header-nav
            aria-label="Primary navigation"
            className="pointer-events-auto flex h-[48px] items-center justify-center gap-1 rounded-full border border-white/[0.20] bg-white/[0.075] px-3 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.16),0_14px_38px_rgba(35,26,45,.10)] backdrop-blur-2xl sm:min-w-[520px]"
          >
            <HeaderLink
              href="/about"
              label="About"
              hiddenOnMobile
            />
            <HeaderLink
              href="/work"
              label="Work"
              hiddenOnMobile
            />

            <Link
              data-header-item
              href="/"
              className="group relative isolate overflow-hidden rounded-full px-[20px] py-[10px] text-[16px] font-medium tracking-[-0.018em] text-white"
              aria-label="Frame & Form Studio home"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 scale-[0.45] rounded-full bg-white/[0.065] opacity-0 blur-[2px] transition-[transform,opacity] duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[4.2] group-hover:opacity-100"
              />
              <span className="relative z-10">
                Frame &amp; Form
              </span>
            </Link>

            <HeaderLink
              href="/contact"
              label="Contact"
              hiddenOnMobile
            />
            <HeaderLink
              href="/contact"
              label="Start"
            />
          </nav>
        </div>

        <span
          ref={liquidMorphRef}
          aria-hidden="true"
          className="pointer-events-none invisible absolute left-[18px] top-[18px] z-[28] h-[48px] w-[48px] rounded-full border border-white/[0.15] bg-white/[0.08] opacity-0 shadow-[inset_0_1px_0_rgba(255,255,255,.18),0_10px_30px_rgba(27,18,34,.12)] backdrop-blur-2xl will-change-transform md:left-[24px]"
        />

        <button
          ref={compactButtonRef}
          type="button"
          aria-label={
            menuOpen
              ? 'Close navigation'
              : 'Open navigation'
          }
          aria-expanded={menuOpen}
          onClick={() =>
            setMenuOpen((open) => !open)
          }
          className="pointer-events-none invisible absolute left-[18px] top-[18px] z-30 flex h-[48px] w-[48px] items-center justify-center overflow-hidden rounded-full border border-white/[0.20] bg-white/[0.075] text-white opacity-0 shadow-[inset_0_1px_0_rgba(255,255,255,.17),0_12px_34px_rgba(28,20,36,.12)] backdrop-blur-2xl transition-[border-color,background-color,box-shadow] duration-700 ease-[cubic-bezier(.16,1,.3,1)] hover:border-white/[0.34] hover:bg-white/[0.10] hover:shadow-[inset_0_1px_0_rgba(255,255,255,.22),0_16px_38px_rgba(28,20,36,.16)] md:left-[24px]"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-[1px] rounded-full border border-white/[0.06]"
          />

          <span className="relative h-[16px] w-[18px]">
            <span
              className={`absolute left-0 top-1/2 h-px w-[18px] bg-white transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] ${
                menuOpen
                  ? 'translate-y-0 rotate-45'
                  : '-translate-y-[4px]'
              }`}
            />
            <span
              className={`absolute left-0 top-1/2 h-px w-[18px] bg-white transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] ${
                menuOpen
                  ? 'translate-y-0 -rotate-45'
                  : 'translate-y-[4px]'
              }`}
            />
          </span>
        </button>

        <button
          ref={menuBackdropRef}
          type="button"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
          className="pointer-events-none fixed inset-0 z-0 bg-[#09090b]/22 opacity-0 backdrop-blur-[3px]"
        />

        <div
          ref={menuPanelRef}
          aria-hidden={!menuOpen}
          className="pointer-events-none fixed left-[18px] top-[78px] z-20 w-[min(360px,calc(100vw-36px))] overflow-hidden rounded-[28px] border border-white/[0.16] bg-[#121119]/55 p-3 text-white opacity-0 shadow-[inset_0_1px_0_rgba(255,255,255,.11),0_26px_80px_rgba(13,9,18,.28)] backdrop-blur-[28px] md:left-[24px] md:top-[82px]"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-[1px] rounded-[27px] border border-white/[0.055]"
          />

          <div className="relative z-10">
            <div
              data-menu-item
              className="flex items-center justify-between px-4 pb-3 pt-2 text-[10px] font-medium uppercase tracking-[0.18em] text-white/46"
            >
              <span>Frame &amp; Form</span>
              <span>Menu</span>
            </div>

            <div className="space-y-1">
              <MenuPanelLink
                href="/"
                index="01"
                label="Home"
                onClick={() =>
                  setMenuOpen(false)
                }
              />
              <MenuPanelLink
                href="/work"
                index="02"
                label="Work"
                onClick={() =>
                  setMenuOpen(false)
                }
              />
              <MenuPanelLink
                href="/about"
                index="03"
                label="About"
                onClick={() =>
                  setMenuOpen(false)
                }
              />
              <MenuPanelLink
                href="/contact"
                index="04"
                label="Contact"
                onClick={() =>
                  setMenuOpen(false)
                }
              />
            </div>

            <Link
              data-menu-item
              href="/contact"
              onClick={() =>
                setMenuOpen(false)
              }
              className="group relative mt-3 flex h-[48px] items-center justify-between overflow-hidden rounded-[18px] border border-white/[0.13] bg-white/[0.075] px-4 text-[12px] font-medium uppercase tracking-[0.08em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,.10)] transition-[background-color,border-color] duration-700 hover:border-white/[0.24] hover:bg-white/[0.11]"
            >
              <span>Start a project</span>
              <span
                aria-hidden="true"
                className="transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-[2px] group-hover:-translate-y-[2px]"
              >
                ↗
              </span>
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header
      ref={headerRef}
      className="fixed inset-x-0 top-0 z-[70] flex items-center justify-between gap-4 border-b border-white/10 bg-[#09090b]/78 px-5 pb-5 pt-[max(18px,calc(env(safe-area-inset-top)+14px))] backdrop-blur-xl md:px-10 lg:px-14"
    >
      <Link
        data-header-item
        href="/"
        className="group flex items-center gap-2.5 text-[15px] font-medium tracking-[-0.02em] text-white"
        aria-label="Frame & Form Studio home"
      >
        <span
          aria-hidden="true"
          className="text-[13px] opacity-80 transition-transform duration-700 ease-out group-hover:rotate-90"
        >
          ✦
        </span>
        <span>Frame &amp; Form Studio</span>
      </Link>

      <nav
        data-header-nav
        className="flex items-center gap-4 md:gap-7"
        aria-label="Primary navigation"
      >
        <div className="hidden items-center gap-7 md:flex">
          <Link
            data-header-item
            href="/work"
            className="group relative isolate overflow-hidden rounded-full px-3 py-2 text-[14px] tracking-[-0.01em] text-white/70 transition-colors duration-500 hover:text-white"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 scale-[0.35] rounded-full bg-white/[0.08] opacity-0 transition-[transform,opacity] duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[3] group-hover:opacity-100"
            />
            <span className="relative z-10">
              Work
            </span>
          </Link>

          <Link
            data-header-item
            href="/about"
            className="group relative isolate overflow-hidden rounded-full px-3 py-2 text-[14px] tracking-[-0.01em] text-white/70 transition-colors duration-500 hover:text-white"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 scale-[0.35] rounded-full bg-white/[0.08] opacity-0 transition-[transform,opacity] duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[3] group-hover:opacity-100"
            />
            <span className="relative z-10">
              About
            </span>
          </Link>
        </div>

        <Link
          data-header-item
          href="/contact"
          className="inline-flex h-10 items-center justify-center rounded-full border border-white/15 bg-white px-5 text-[14px] font-medium tracking-[-0.01em] text-black transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] hover:-translate-y-0.5"
        >
          Start a project
        </Link>
      </nav>
    </header>
  );
}

function HeaderLink({
  href,
  label,
  hiddenOnMobile = false,
}: {
  href: string;
  label: string;
  hiddenOnMobile?: boolean;
}) {
  return (
    <Link
      data-header-item
      href={href}
      className={`group relative isolate overflow-hidden rounded-full px-[18px] py-[10px] text-[10px] font-medium uppercase tracking-[0.04em] text-white/86 transition-colors duration-700 hover:text-white ${
        hiddenOnMobile ? 'hidden sm:block' : ''
      }`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 scale-[0.45] rounded-full bg-white/[0.07] opacity-0 blur-[2px] transition-[transform,opacity] duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[3.8] group-hover:opacity-100"
      />
      <span className="relative z-10">
        {label}
      </span>
    </Link>
  );
}

function MenuPanelLink({
  href,
  index,
  label,
  onClick,
}: {
  href: string;
  index: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      data-menu-item
      href={href}
      onClick={onClick}
      className="group relative flex min-h-[58px] items-center justify-between overflow-hidden rounded-[18px] px-4 text-white/88 transition-colors duration-700 hover:text-white"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-4 top-1/2 h-8 w-8 -translate-y-1/2 scale-[0.2] rounded-full bg-white/[0.075] opacity-0 blur-[2px] transition-[transform,opacity] duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[8] group-hover:opacity-100"
      />

      <span className="relative z-10 text-[10px] tracking-[0.16em] text-white/38">
        {index}
      </span>

      <span className="relative z-10 text-[27px] font-medium tracking-[-0.035em]">
        {label}
      </span>

      <span
        aria-hidden="true"
        className="relative z-10 text-[14px] text-white/44 transition-[transform,color] duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-[2px] group-hover:-translate-y-[2px] group-hover:text-white"
      >
        ↗
      </span>
    </Link>
  );
}
