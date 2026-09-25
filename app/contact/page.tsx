import type { Metadata } from 'next';
import Link from 'next/link';
import { PageIntro } from '../../components/motion/PageIntro';
import { SiteFooter } from '../../components/site/SiteFooter';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Start a digital experience project with Frame & Form Studio.',
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#09090b] pt-32 text-white">
      <section className="px-5 pb-24 pt-14 md:px-10 lg:px-14 lg:pb-36 lg:pt-24">
        <PageIntro
          eyebrow="Start a project"
          title="Bring us the idea before it is finished."
          body="The strongest collaborations begin early. Share the goal, the audience, and what the experience needs to make people feel — we can shape the rest together."
        />
      </section>

      <section className="border-t border-white/10 px-5 py-20 md:px-10 lg:px-14 lg:py-28">
        <div className="mx-auto grid max-w-[1440px] gap-5 lg:grid-cols-2">
          <div data-reveal className="border border-white/10 bg-white/[0.025] p-8 md:p-10">
            <p className="text-xs uppercase tracking-[0.16em] text-white/35">Project scope</p>
            <p className="mt-16 max-w-lg text-3xl leading-tight tracking-[-0.04em] text-white/88">
              Brand sites, campaign experiences, storytelling interfaces, motion systems, and creative front-end builds.
            </p>
          </div>

          <div data-reveal className="flex min-h-[360px] flex-col justify-between border border-white/10 bg-white/[0.025] p-8 md:p-10">
            <p className="max-w-md leading-7 text-white/52">
              Use the project brief route as the starting point. Your final production contact details can be connected here when the studio identity is finalized.
            </p>

            <Link
              href="/work"
              className="inline-flex w-fit min-h-12 items-center rounded-full bg-white px-6 text-sm font-medium text-black"
            >
              Review selected work
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
