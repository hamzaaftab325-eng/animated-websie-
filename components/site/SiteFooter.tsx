import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 px-5 py-10 md:px-10 lg:px-14">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-white/40">
            Frame &amp; Form Studio
          </p>
          <p className="mt-3 max-w-xl text-lg tracking-[-0.02em] text-white/72">
            Digital experiences shaped through motion, interaction, and visual craft.
          </p>
        </div>

        <nav className="flex gap-5 text-sm text-white/55">
          <Link href="/work" className="hover:text-white">Work</Link>
          <Link href="/about" className="hover:text-white">About</Link>
          <Link href="/contact" className="hover:text-white">Contact</Link>
        </nav>
      </div>
    </footer>
  );
}
