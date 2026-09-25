'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import SplitType from 'split-type';

type PageIntroProps = {
  eyebrow: string;
  title: string;
  body: string;
};

export function PageIntro({
  eyebrow,
  title,
  body,
}: PageIntroProps) {
  const root = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    if (!root.current || !titleRef.current || !bodyRef.current) {
      return;
    }

    const context = gsap.context(() => {
      const titleSplit = new SplitType(titleRef.current!, {
        types: 'lines',
        lineClass: 'split-mask',
      });

      const bodySplit = new SplitType(bodyRef.current!, {
        types: 'lines',
        lineClass: 'split-mask',
      });

      gsap.set(titleSplit.lines ?? [], {
        yPercent: 108,
        opacity: 0,
      });

      gsap.set(bodySplit.lines ?? [], {
        yPercent: 80,
        opacity: 0,
      });

      const timeline = gsap.timeline({
        defaults: {
          ease: 'expo.out',
        },
      });

      timeline
        .fromTo(
          '[data-intro-eyebrow]',
          { y: 12, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8 },
          0
        )
        .to(
          titleSplit.lines ?? [],
          {
            yPercent: 0,
            opacity: 1,
            duration: 1.15,
            stagger: 0.07,
          },
          0.08
        )
        .to(
          bodySplit.lines ?? [],
          {
            yPercent: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.05,
          },
          0.36
        );

      return () => {
        titleSplit.revert();
        bodySplit.revert();
      };
    }, root);

    return () => context.revert();
  }, []);

  return (
    <div ref={root} className="max-w-[1120px]">
      <p
        data-intro-eyebrow
        className="mb-6 text-[11px] font-medium uppercase tracking-[0.18em] text-white/45"
      >
        {eyebrow}
      </p>
      <h1
        ref={titleRef}
        className="max-w-[12ch] text-[clamp(3.4rem,8vw,8.5rem)] font-normal leading-[0.9] tracking-[-0.055em] text-white"
      >
        {title}
      </h1>
      <p
        ref={bodyRef}
        className="mt-8 max-w-2xl text-[clamp(1rem,1.35vw,1.25rem)] leading-7 tracking-[-0.015em] text-white/58"
      >
        {body}
      </p>
    </div>
  );
}
