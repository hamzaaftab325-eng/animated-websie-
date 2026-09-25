import type { Metadata } from 'next';
import Link from 'next/link';
import { PageIntro } from '../../components/motion/PageIntro';
import { SiteFooter } from '../../components/site/SiteFooter';

export const metadata: Metadata = {
  title: 'Work',
  description:
    'Selected motion-led digital work and experience directions from Frame & Form Studio.',
};

const work = [
  ['Cinematic Commerce', 'Direction / Motion / Front-end', 'Scroll-led storytelling for a premium digital launch.'],
  ['Editorial Systems', 'UX / Interaction / Development', 'A modular visual system designed for expressive content.'],
  ['Spatial Interfaces', 'Creative Development / WebGL', 'Depth, parallax, and responsive motion for immersive web experiences.'],
  ['Brand in Motion', 'Identity / Digital / Animation', 'A motion language connecting identity and interaction across screens.'],
];

export default function WorkPage() {
  return (
    <main className="min-h-screen bg-[#09090b] pt-32 text-white">
      <section className="px-5 pb-24 pt-14 md:px-10 lg:px-14 lg:pb-36 lg:pt-24">
        <PageIntro
          eyebrow="Selected work"
          title="Systems built to move."
          body="A selection of experience directions spanning cinematic storytelling, interaction design, creative development, and motion systems."
        />
      </section>

      <section className="border-t border-white/10 px-5 pb-28 md:px-10 lg:px-14">
        <div className="mx-auto max-w-[1440px]">
          {work.map(([title, meta, description], index) => (
            <article
              key={title}
              data-reveal
              className="group grid gap-5 border-b border-white/10 py-10 md:grid-cols-[90px_1fr_1fr] md:items-end md:py-14"
            >
              <p className="text-xs text-white/30">0{index + 1}</p>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-white/36">{meta}</p>
                <h2 className="mt-3 text-[clamp(2rem,4vw,4.6rem)] leading-none tracking-[-0.05em]">
                  {title}
                </h2>
              </div>
              <p className="max-w-md leading-7 text-white/48 md:justify-self-end">
                {description}
              </p>
            </article>
          ))}

          <div data-reveal className="pt-16">
            <Link
              href="/contact"
              className="inline-flex min-h-12 items-center rounded-full bg-white px-6 text-sm font-medium text-black"
            >
              Discuss a project
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
