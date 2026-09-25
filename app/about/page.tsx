import type { Metadata } from 'next';
import { PageIntro } from '../../components/motion/PageIntro';
import { SiteFooter } from '../../components/site/SiteFooter';

export const metadata: Metadata = {
  title: 'About',
  description:
    'About Frame & Form Studio and our approach to motion-led digital experiences.',
};

const principles = [
  ['01', 'Direction before decoration', 'Every visual decision starts with narrative, hierarchy, and purpose.'],
  ['02', 'Motion with structure', 'Animation supports orientation and emotion without competing with the content.'],
  ['03', 'Systems that scale', 'Design and engineering are built together so the final experience remains maintainable.'],
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#09090b] pt-32 text-white">
      <section className="px-5 pb-24 pt-14 md:px-10 lg:px-14 lg:pb-36 lg:pt-24">
        <PageIntro
          eyebrow="About the studio"
          title="Designing motion with purpose."
          body="Frame & Form Studio combines design, front-end engineering, and cinematic motion to create digital experiences that feel intentional from the first frame to the final interaction."
        />
      </section>

      <section className="border-t border-white/10 px-5 py-20 md:px-10 lg:px-14 lg:py-28">
        <div className="mx-auto grid max-w-[1440px] gap-5 lg:grid-cols-3">
          {principles.map(([number, title, body]) => (
            <article
              key={number}
              data-reveal
              className="min-h-[300px] border border-white/10 bg-white/[0.025] p-7 md:p-9"
            >
              <p className="text-xs tracking-[0.16em] text-white/35">{number}</p>
              <h2 className="mt-20 max-w-[12ch] text-3xl tracking-[-0.04em]">{title}</h2>
              <p className="mt-5 max-w-sm leading-7 text-white/52">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
