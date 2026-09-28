'use client';

import {
  useEffect,
  useRef,
} from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';
import { UnifiedLiquidEffect } from '../motion/UnifiedLiquidEffect';

const STORY_IMAGE =
  '/hero-scroll-frames/frame-081.webp';

export function LiquidStorySection() {
  const sectionRef =
    useRef<HTMLElement>(null);
  const imageRef =
    useRef<HTMLImageElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const image = imageRef.current;
    const canvas =
      section?.querySelector<HTMLCanvasElement>(
        '[data-liquid-canvas]'
      );
    const content =
      section?.querySelector<HTMLElement>(
        '[data-story-content]'
      );
    const kicker =
      section?.querySelector<HTMLElement>(
        '[data-story-kicker]'
      );
    const words = Array.from(
      section?.querySelectorAll<HTMLElement>(
        '[data-story-word]'
      ) ?? []
    );

    if (
      !section ||
      !image ||
      !canvas ||
      !content
    ) {
      return;
    }

    const reducedMotion =
      window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

    if (reducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        [image, canvas],
        {
          yPercent: -5.5,
          scale: 1.16,
        },
        {
          yPercent: 6.5,
          scale: 1.105,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.75,
            invalidateOnRefresh: true,
          },
        }
      );

      gsap.fromTo(
        content,
        { y: 42 },
        {
          y: -54,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        }
      );

      if (kicker) {
        gsap.fromTo(
          kicker,
          {
            opacity: 0,
            y: 18,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 76%',
              once: true,
            },
          }
        );
      }

      gsap.fromTo(
        words,
        {
          yPercent: 110,
          opacity: 0,
          rotateX: 8,
          filter: 'blur(10px)',
        },
        {
          yPercent: 0,
          opacity: 1,
          rotateX: 0,
          filter: 'blur(0px)',
          duration: 1.15,
          stagger: 0.08,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 72%',
            once: true,
          },
        }
      );
    }, section);

    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="liquidStory"
      aria-labelledby="liquidStoryTitle"
    >
      <div
        className="liquidStory_media"
        aria-hidden="true"
      >
        <img
          ref={imageRef}
          src={STORY_IMAGE}
          alt=""
          draggable={false}
        />

        <UnifiedLiquidEffect
          sectionRef={sectionRef}
          sourceType="image"
          sourceValue={STORY_IMAGE}
          className="liquidStory_liquidCanvas"
        />
      </div>

      <div
        className="liquidStory_tint"
        aria-hidden="true"
      />

      <div
        className="liquidStory_grid"
        aria-hidden="true"
      />

      <div
        data-story-content
        className="liquidStory_content"
      >
        <div className="liquidStory_topline">
          <p
            data-story-kicker
            className="liquidStory_kicker"
          >
            04 / IMMERSION
          </p>

          <p className="liquidStory_meta">
            DIGITAL EXPERIENCES
            <span />
            FRAME &amp; FORM
          </p>
        </div>

        <div className="liquidStory_stage">
          <h2
            id="liquidStoryTitle"
            className="liquidStory_title"
            aria-label="Beyond the Frame"
          >
            <span className="liquidStory_mask">
              <span data-story-word>
                Beyond
              </span>
            </span>
            <span className="liquidStory_mask liquidStory_mask--offset">
              <span data-story-word>
                the Frame
              </span>
            </span>
          </h2>

          <div className="liquidStory_copy">
            <p>
              We build digital spaces that respond,
              breathe, and move with the person
              experiencing them.
            </p>

            <Link
              href="/work"
              className="liquidStory_link"
            >
              <span>Explore the work</span>
              <ArrowUpRight
                aria-hidden="true"
                className="h-[15px] w-[15px]"
              />
            </Link>
          </div>
        </div>

        <div className="liquidStory_footer">
          <p>
            MOTION / INTERACTION / ATMOSPHERE
          </p>
          <p>
            SCROLL TO CONTINUE
          </p>
        </div>
      </div>
    </section>
  );
}
