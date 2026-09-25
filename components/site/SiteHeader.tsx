'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  if (isHome) {
    return (
      <header className="pointer-events-none fixed inset-x-0 top-[18px] z-[75] flex justify-center px-3">
        <nav
          aria-label="Primary navigation"
          className="pointer-events-auto flex h-[34px] items-center rounded-full border border-white/15 bg-white/[0.10] px-2 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.12),0_10px_32px_rgba(35,26,45,.08)] backdrop-blur-xl"
        >
          <Link
            href="/about"
            className="hidden px-3 text-[9px] font-medium uppercase tracking-[0.03em] text-white/88 transition-colors hover:text-white sm:block"
          >
            About
          </Link>

          <Link
            href="/work"
            className="hidden px-3 text-[9px] font-medium uppercase tracking-[0.03em] text-white/88 transition-colors hover:text-white sm:block"
          >
            Work
          </Link>

          <Link
            href="/"
            className="px-4 text-[14px] font-medium tracking-[-0.015em] text-white"
            aria-label="Frame & Form Studio home"
          >
            Frame &amp; Form
          </Link>

          <Link
            href="/contact"
            className="hidden px-3 text-[9px] font-medium uppercase tracking-[0.03em] text-white/88 transition-colors hover:text-white sm:block"
          >
            Contact
          </Link>

          <Link
            href="/contact"
            className="px-3 text-[9px] font-medium uppercase tracking-[0.03em] text-white/88 transition-colors hover:text-white"
          >
            Start
          </Link>
        </nav>
      </header>
    );
  }

  return (
    <header className="fixed inset-x-0 top-0 z-[70] flex items-center justify-between gap-4 border-b border-white/10 bg-[#09090b]/78 px-5 pb-5 pt-[max(18px,calc(env(safe-area-inset-top)+14px))] backdrop-blur-xl md:px-10 lg:px-14">
      <Link
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
        className="flex items-center gap-4 md:gap-7"
        aria-label="Primary navigation"
      >
        <div className="hidden items-center gap-7 md:flex">
          <Link
            href="/work"
            className="text-[14px] tracking-[-0.01em] text-white/70 transition-colors duration-300 hover:text-white"
          >
            Work
          </Link>
          <Link
            href="/about"
            className="text-[14px] tracking-[-0.01em] text-white/70 transition-colors duration-300 hover:text-white"
          >
            About
          </Link>
        </div>

        <Link
          href="/contact"
          className="inline-flex h-10 items-center justify-center rounded-full border border-white/15 bg-white px-5 text-[14px] font-medium tracking-[-0.01em] text-black transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] hover:-translate-y-0.5"
        >
          Start a project
        </Link>
      </nav>
    </header>
  );
}
