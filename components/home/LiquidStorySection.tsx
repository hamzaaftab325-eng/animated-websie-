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
      !canvas
    ) {
      return;
    }

    const reducedMotion =
      window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
    const touchMode =
      window.matchMedia(
        '(max-width: 767px), (pointer: coarse)'
      ).matches;

    if (reducedMotion) return;

    const ctx = gsap.context(() => {
      if (!touchMode) {
        gsap.fromTo(
          [image, canvas],
          {
            yPercent: -3.25,
            scale: 1.15,
          },
          {
            yPercent: 4.25,
            scale: 1.12,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.9,
            },
          }
        );
      }

      if (kicker) {
        gsap.fromTo(
          kicker,
          {
            opacity: 0,
            y: touchMode ? 10 : 16,
          },
          {
            opacity: 1,
            y: 0,
            duration: touchMode
              ? 0.55
              : 0.78,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 82%',
              once: true,
            },
          }
        );
      }

      gsap.fromTo(
        words,
        {
          yPercent: touchMode
            ? 55
            : 95,
          opacity: 0,
          rotateX: touchMode
            ? 0
            : 6,
          filter: touchMode
            ? 'none'
            : 'blur(7px)',
        },
        {
          yPercent: 0,
          opacity: 1,
          rotateX: 0,
          filter: 'blur(0px)',
          duration: touchMode
            ? 0.7
            : 1,
          stagger: touchMode
            ? 0.05
            : 0.07,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 78%',
            once: true,
          },
        }
      );
    }, section);

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
