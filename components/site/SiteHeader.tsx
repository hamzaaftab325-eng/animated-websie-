'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const nav = header.querySelector<HTMLElement>(
      '[data-header-nav]'
    );
    const items = Array.from(
      header.querySelectorAll<HTMLElement>(
        '[data-header-item]'
      )
    );

    if (!nav) return;

    const prefersReducedMotion =
      window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

    if (prefersReducedMotion) {
      gsap.set([nav, ...items], {
        clearProps: 'all',
      });
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

  if (isHome) {
    return (
      <header
        ref={headerRef}
        className="pointer-events-none fixed inset-x-0 top-[18px] z-[75] flex justify-center px-3"
      >
        <nav
          data-header-nav
          aria-label="Primary navigation"
          className="pointer-events-auto flex h-[36px] items-center rounded-full border border-white/[0.16] bg-white/[0.095] px-2 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.13),0_10px_32px_rgba(35,26,45,.08)] backdrop-blur-xl"
        >
          <HeaderLink href="/about" label="About" hiddenOnMobile />
          <HeaderLink href="/work" label="Work" hiddenOnMobile />

          <Link
            data-header-item
            href="/"
            className="group relative isolate overflow-hidden rounded-full px-4 py-1 text-[14px] font-medium tracking-[-0.015em] text-white"
            aria-label="Frame & Form Studio home"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 scale-x-75 rounded-full bg-white/[0.06] opacity-0 blur-[7px] transition-[transform,opacity] duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-x-100 group-hover:opacity-100"
            />
            <span className="relative z-10">
              Frame &amp; Form
            </span>
          </Link>

          <HeaderLink href="/contact" label="Contact" hiddenOnMobile />
          <HeaderLink href="/contact" label="Start" />
        </nav>
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
            className="text-[14px] tracking-[-0.01em] text-white/70 transition-colors duration-300 hover:text-white"
          >
            Work
          </Link>
          <Link
            data-header-item
            href="/about"
            className="text-[14px] tracking-[-0.01em] text-white/70 transition-colors duration-300 hover:text-white"
          >
            About
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
      className={`group relative isolate overflow-hidden rounded-full px-3 py-1 text-[9px] font-medium uppercase tracking-[0.03em] text-white/88 transition-colors duration-700 hover:text-white ${
        hiddenOnMobile ? 'hidden sm:block' : ''
      }`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-1 bottom-0 h-[65%] translate-y-[72%] rounded-full bg-white/[0.08] opacity-0 blur-[5px] transition-[transform,opacity] duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-y-[38%] group-hover:opacity-100"
      />
      <span className="relative z-10">
        {label}
      </span>
    </Link>
  );
}
