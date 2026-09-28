'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { UnifiedLiquidEffect } from '../motion/UnifiedLiquidEffect';

const PROJECTS_BACKGROUND =
  'https://res.cloudinary.com/diometfe9/image/upload/v1790258302/ChatGPT_Image_Sep_24_2026_03_46_32_PM_1_d3f6xc.webp';

const BUTTON_LABEL = 'View Projects';

export function ProjectsLiquidSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const image = imageRef.current;
    const canvas =
      section?.querySelector<HTMLCanvasElement>(
        '[data-liquid-canvas]'
      );

    if (!section || !image || !canvas) return;

    const titleLines = Array.from(
      section.querySelectorAll<HTMLElement>(
        '[data-projects-title-line]'
      )
    );
    const descLines = Array.from(
      section.querySelectorAll<HTMLElement>(
        '[data-projects-desc-line]'
      )
    );
    const buttonChars = Array.from(
      section.querySelectorAll<HTMLElement>(
        '[data-projects-button-char]'
      )
    );
    const firstLine =
      section.querySelector<HTMLElement>(
        '[data-projects-line-first]'
      );
    const lastLine =
      section.querySelector<HTMLElement>(
        '[data-projects-line-last]'
      );
    const contents =
      section.querySelector<HTMLElement>(
        '[data-projects-contents]'
      );
    const label =
      section.querySelector<HTMLElement>(
        '[data-projects-label]'
      );
    const tint =
      section.querySelector<HTMLElement>(
        '[data-projects-tint]'
      );

    const reducedMotion =
      window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
    const isMobile = window.matchMedia(
      '(max-width: 767px)'
    ).matches;

    let revealObserver:
      | IntersectionObserver
      | null = null;

    const ctx = gsap.context(() => {
      if (reducedMotion) {
        gsap.set(
          [
            ...titleLines,
            ...descLines,
            ...buttonChars,
          ],
          {
            opacity: 1,
            y: 0,
            yPercent: 0,
            rotateX: 0,
            filter: 'none',
          }
        );

        if (lastLine) {
          gsap.set(lastLine, {
            clipPath:
              'inset(0% calc(100% - 5vw) 0% 0%)',
          });
        }

        return;
      }

      gsap.set(titleLines, {
        yPercent: 125,
        opacity: 0,
        rotateX: 9,
        filter: 'blur(10px)',
        transformOrigin: '0% 100%',
        force3D: true,
      });

      gsap.set(descLines, {
        yPercent: 115,
        opacity: 0,
        filter: 'blur(7px)',
        force3D: true,
      });

      gsap.set(buttonChars, {
        y: 10,
        opacity: 0,
        force3D: true,
      });

      if (isMobile) {
        if (image) {
          gsap.fromTo(
            image,
            {
              yPercent: -4.5,
              scale: 1.15,
            },
            {
              yPercent: 6,
              scale: 1.13,
              ease: 'none',
              scrollTrigger: {
                trigger: section,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.7,
              },
            }
          );
        }

        if (contents) {
          gsap.fromTo(
            contents,
            { y: 36 },
            {
              y: -68,
              ease: 'none',
              scrollTrigger: {
                trigger: section,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.7,
              },
            }
          );
        }
      } else {
        if (image) {
          gsap.fromTo(
            image,
            {
              yPercent: -6.5,
              scale: 1.19,
            },
            {
              yPercent: 7.5,
              scale: 1.165,
              ease: 'none',
              scrollTrigger: {
                trigger: section,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.7,
              },
            }
          );
        }

        gsap.fromTo(
          canvas,
          {
            yPercent: -6.5,
            scale: 1.19,
          },
          {
            yPercent: 7.5,
            scale: 1.165,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.7,
            },
          }
        );

        if (contents) {
          gsap.fromTo(
            contents,
            { y: 68 },
            {
              y: -112,
              ease: 'none',
              scrollTrigger: {
                trigger: section,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.7,
              },
            }
          );
        }

        if (label) {
          gsap.fromTo(
            label,
            { y: 14 },
            {
              y: -44,
              ease: 'none',
              scrollTrigger: {
                trigger: section,
                start: 'top center',
                end: 'bottom top',
                scrub: 0.7,
              },
            }
          );
        }
      }

      if (tint) {
        gsap.fromTo(
          tint,
          { opacity: 0.88 },
          {
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'center center',
              scrub: 0.7,
            },
          }
        );
      }

      let referencePlayed = false;

      const playReferenceAnimation = () => {
        if (referencePlayed) return;
        referencePlayed = true;
        gsap.to(titleLines, {
          opacity: 1,
          duration: 0.72,
          stagger: 0.055,
          ease: 'power2.out',
        });

        gsap.to(titleLines, {
          yPercent: 0,
          rotateX: 0,
          filter: 'blur(0px)',
          duration: 1.02,
          stagger: 0.055,
          ease: 'expo.out',
          force3D: true,
        });

        gsap.to(descLines, {
          opacity: 1,
          duration: 0.78,
          delay: 0.34,
          stagger: 0.05,
          ease: 'power2.out',
        });

        gsap.to(descLines, {
          yPercent: 0,
          filter: 'blur(0px)',
          duration: 1.02,
          delay: 0.34,
          stagger: 0.05,
          ease: 'expo.out',
          force3D: true,
        });

        if (firstLine) {
          gsap.to(firstLine, {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 0.52,
            delay: 0.66,
            ease: 'power4.out',
          });

          gsap.to(firstLine, {
            clipPath: 'inset(0% 0% 0% 100%)',
            duration: 0.52,
            delay: 0.92,
            ease: 'power4.inOut',
          });
        }

        if (lastLine) {
          gsap.fromTo(
            lastLine,
            {
              clipPath:
                'inset(0% 100% 0% 0%)',
            },
            {
              clipPath:
                window.innerWidth <= 767
                  ? 'inset(0% calc(100% - 19.9004975124vw) 0% 0%)'
                  : 'inset(0% calc(100% - 5vw) 0% 0%)',
              duration: 0.58,
              delay: 1,
              ease: 'power4.out',
            }
          );
        }

        gsap.to(buttonChars, {
          y: 0,
          opacity: 1,
          duration: 0.72,
          delay: 0.98,
          stagger: 0.018,
          ease: 'power3.out',
          force3D: true,
        });
      };

      ScrollTrigger.create({
        trigger: section,
        start: 'top 90%',
        once: true,
        onEnter: playReferenceAnimation,
        onEnterBack: playReferenceAnimation,
      });

      // Keep the content reveal independent from ScrollTrigger/Lenis timing.
      // This prevents the projects copy from remaining at opacity:0 while
      // the section itself is already visible.
      revealObserver =
        new IntersectionObserver(
          ([entry]) => {
            if (entry?.isIntersecting) {
              playReferenceAnimation();
              revealObserver?.disconnect();
              revealObserver = null;
            }
          },
          {
            threshold: 0.08,
            rootMargin:
              '12% 0px 12% 0px',
          }
        );

      revealObserver.observe(section);

      requestAnimationFrame(() => {
        const rect =
          section.getBoundingClientRect();

        if (
          rect.top <
            window.innerHeight * 0.96 &&
          rect.bottom > 0
        ) {
          playReferenceAnimation();
        }
      });
    }, section);

    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    const onImageReady = () => {
      ScrollTrigger.refresh();
    };

    image.addEventListener('load', onImageReady);

    if (image.decode) {
      image
        .decode()
        .then(onImageReady)
        .catch(() => {});
    }

    return () => {
      image.removeEventListener(
        'load',
        onImageReady
      );
      revealObserver?.disconnect();
      revealObserver = null;
      ctx.revert();
    };
  }, []);

  

  return (
    <section
      ref={sectionRef}
      id="projectsSection"
      aria-labelledby="projectsTitle"
      className="ffProjects"
    >
      <div
        className="ffProjects_bg"
        aria-hidden="true"
      >
        <img
          ref={imageRef}
          src={PROJECTS_BACKGROUND}
          alt=""
          draggable={false}
        />
        <UnifiedLiquidEffect
          sectionRef={sectionRef}
          sourceType="image"
          sourceValue={PROJECTS_BACKGROUND}
          className="ffProjects_liquidCanvas"
        />
      </div>

      <div
        data-projects-tint
        className="ffProjects_tint"
        aria-hidden="true"
      />

      <div
        data-projects-contents
        className="ffProjects_contents"
      >
        <div className="ffProjects_inner">
          <div className="ffProjects_sticky">
            <div className="ffProjects_stickySub">
              <h2
                data-projects-label
                className="ffProjects_label"
              >
                projects
              </h2>
            </div>

            <div className="ffProjects_stickyMain">
              <div className="ffProjects_content">
                <p
                  id="projectsTitle"
                  className="ffProjects_title"
                  aria-label="Creating Digital Worlds with Feeling"
                >
                  <span className="ffProjects_lineMask">
                    <span
                      data-projects-title-line
                      className="ffProjects_titleLine"
                    >
                      Creating
                    </span>
                  </span>
                  <span className="ffProjects_lineMask">
                    <span
                      data-projects-title-line
                      className="ffProjects_titleLine"
                    >
                      Digital Worlds
                    </span>
                  </span>
                  <span className="ffProjects_lineMask">
                    <span
                      data-projects-title-line
                      className="ffProjects_titleLine"
                    >
                      with Feeling
                    </span>
                  </span>
                </p>

                <div className="ffProjects_descriptions">
                  <p className="ffProjects_description">
                    {[
                      'Frame & Form turns imagination into experience.',
                      'We shape digital worlds through design, motion,',
                      'interaction, and atmosphere — creating work',
                      'that feels intentional, immersive, and alive.',
                    ].map((line) => (
                      <span
                        key={line}
                        className="ffProjects_descMask"
                      >
                        <span
                          data-projects-desc-line
                          className="ffProjects_descLine"
                        >
                          {line}
                        </span>
                      </span>
                    ))}
                  </p>
                </div>

                <div className="ffProjects_buttonWrap">
                  <Link
                    className="ffProjects_button"
                    href="/work"
                    aria-label="View Projects"
                  >
                    <span className="ffProjects_buttonBlock">
                      <span
                        className="ffProjects_buttonLines"
                        aria-hidden="true"
                      >
                        <span
                          data-projects-line-first
                          className="ffProjects_buttonLine ffProjects_buttonLineFirst"
                        />
                        <span
                          data-projects-line-last
                          className="ffProjects_buttonLine ffProjects_buttonLineLast"
                        />
                      </span>

                      <span className="ffProjects_buttonText">
                        <span className="ffProjects_buttonTextContent">
                          {BUTTON_LABEL.split(
                            ''
                          ).map(
                            (
                              char,
                              index
                            ) => (
                              <span
                                key={
                                  char +
                                  index
                                }
                                data-projects-button-char
                                className="ffProjects_buttonChar"
                              >
                                {char ===
                                ' '
                                  ? '\u00A0'
                                  : char}
                              </span>
                            )
                          )}
                        </span>
                      </span>
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
