'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/work', label: 'Work' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <header
      className={[
        'fixed inset-x-0 top-0 z-[70] flex items-center justify-between gap-4',
        'px-5 pb-5 pt-[max(18px,calc(env(safe-area-inset-top)+14px))] md:px-10 lg:px-14',
        isHome
          ? 'bg-gradient-to-b from-black/45 via-black/15 to-transparent'
          : 'border-b border-white/10 bg-[#09090b]/78 backdrop-blur-xl',
      ].join(' ')}
    >
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
          {links.slice(0, 2).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[14px] tracking-[-0.01em] text-white/70 transition-colors duration-300 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
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
