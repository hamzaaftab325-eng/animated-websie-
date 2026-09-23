import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

type Cleanup = () => void;

function elements(root: HTMLElement, selector: string) {
  return Array.from(root.querySelectorAll<HTMLElement>(selector));
}

function element(root: HTMLElement, selector: string) {
  return root.querySelector<HTMLElement>(selector);
}

export function initAnimationLab(root: HTMLElement): Cleanup {
  gsap.registerPlugin(ScrollTrigger);

  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fineHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const lenis = new Lenis({
    duration: coarsePointer ? 0.42 : 0.72,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -9 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: !coarsePointer,
    touchMultiplier: coarsePointer ? 1.05 : 1.2,
    wheelMultiplier: 1,
  });

  lenis.on('scroll', ScrollTrigger.update);

  const ticker = (time: number) => {
    lenis.raf(time * 1000);
  };

  gsap.ticker.add(ticker);
  gsap.ticker.lagSmoothing(0);

  const listenerCleanups: Cleanup[] = [];
  const matchMedia = gsap.matchMedia();

  const progress = element(root, '[data-lab-progress]');
  if (progress) {
    ScrollTrigger.create({
      trigger: root,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        gsap.set(progress, { scaleX: self.progress });
      },
    });
  }

  elements(root, 'a[href^="#"]').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href || href === '#') return;

    const onClick = (event: Event) => {
      const target = root.querySelector<HTMLElement>(href);
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target, { duration: coarsePointer ? 0.6 : 0.9, offset: -20 });
    };

    link.addEventListener('click', onClick);
    listenerCleanups.push(() => link.removeEventListener('click', onClick));
  });

  if (reducedMotion) {
    gsap.set(
      elements(root, '[data-word], [data-char], [data-detail-card], [data-mask-line], [data-mask-visual], [data-focus-title], [data-focus-copy], [data-kinetic-line]'),
      { clearProps: 'all', opacity: 1, x: 0, y: 0, scale: 1, rotation: 0, rotateX: 0, rotateY: 0, filter: 'none', clipPath: 'inset(0 0% 0 0)' }
    );
  } else {
    matchMedia.add('(min-width: 901px)', () => {
      const demo1 = element(root, '[data-text-demo="1"]');
      if (demo1) {
        const words = elements(demo1, '[data-word]');
        const copy = element(demo1, '[data-fade-copy]');
        const rule = element(demo1, '[data-reveal-rule]');

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: demo1,
            start: 'top 66%',
            end: 'top 18%',
            scrub: 0.85,
          },
        });

        timeline
          .fromTo(
            words,
            { yPercent: 125, opacity: 0.08, rotateX: 22 },
            { yPercent: 0, opacity: 1, rotateX: 0, stagger: 0.055, ease: 'power3.out' },
            0
          )
          .fromTo(copy, { y: 22, opacity: 0 }, { y: 0, opacity: 1, ease: 'power2.out' }, 0.2)
          .fromTo(rule, { scaleX: 0 }, { scaleX: 1, ease: 'power2.inOut' }, 0.1);
      }

      const demo2 = element(root, '[data-text-demo="2"]');
      if (demo2) {
        const lines = elements(demo2, '[data-mask-line]');
        const visual = element(demo2, '[data-mask-visual]');
        const body = element(demo2, '[data-mask-body]');

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: demo2,
            start: 'top 70%',
            end: 'center 42%',
            scrub: 0.9,
          },
        });

        lines.forEach((line, index) => {
          timeline.fromTo(
            line,
            { clipPath: 'inset(0 100% 0 0)', x: -32 },
            { clipPath: 'inset(0 0% 0 0)', x: 0, ease: 'power3.inOut' },
            index * 0.12
          );
        });

        timeline
          .fromTo(visual, { scale: 0.86, rotate: -4, opacity: 0.35 }, { scale: 1, rotate: 0, opacity: 1, ease: 'power3.out' }, 0)
          .fromTo(body, { y: 24, opacity: 0 }, { y: 0, opacity: 1, ease: 'power2.out' }, 0.28);
      }

      const demo3 = element(root, '[data-text-demo="3"]');
      if (demo3) {
        const title = element(demo3, '[data-focus-title]');
        const copy = element(demo3, '[data-focus-copy]');
        const halo = element(demo3, '[data-focus-halo]');

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: demo3,
            start: 'top 72%',
            end: 'center 45%',
            scrub: 0.8,
          },
        });

        timeline
          .fromTo(
            title,
            { scale: 1.2, opacity: 0.18, filter: 'blur(18px)', letterSpacing: '0.03em' },
            { scale: 1, opacity: 1, filter: 'blur(0px)', letterSpacing: '-0.045em', ease: 'power3.out' },
            0
          )
          .fromTo(copy, { y: 28, opacity: 0, filter: 'blur(8px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', ease: 'power2.out' }, 0.26)
          .fromTo(halo, { scale: 0.55, opacity: 0 }, { scale: 1.12, opacity: 0.8, ease: 'power2.out' }, 0);
      }

      const demo4 = element(root, '[data-text-demo="4"]');
      if (demo4) {
        const chars = elements(demo4, '[data-char]');
        const copy = element(demo4, '[data-character-copy]');

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: demo4,
            start: 'top 70%',
            end: 'center 42%',
            scrub: 0.72,
          },
        });

        timeline
          .fromTo(
            chars,
            { yPercent: 135, rotateZ: 7, opacity: 0.15 },
            { yPercent: 0, rotateZ: 0, opacity: 1, stagger: 0.018, ease: 'back.out(1.25)' },
            0
          )
          .fromTo(copy, { y: 22, opacity: 0 }, { y: 0, opacity: 1, ease: 'power2.out' }, 0.22);
      }

      const demo5 = element(root, '[data-text-demo="5"]');
      if (demo5) {
        const lines = elements(demo5, '[data-kinetic-line]');
        const copy = element(demo5, '[data-kinetic-copy]');

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: demo5,
            start: 'top top',
            end: '+=135%',
            scrub: 1,
            pin: true,
            anticipatePin: 1,
          },
        });

        gsap.set(lines, { opacity: 0.16 });

        lines.forEach((line, index) => {
          timeline
            .to(lines, { opacity: 0.13, duration: 0.18 }, index)
            .fromTo(
              line,
              { xPercent: index % 2 === 0 ? -12 : 12, y: 38, opacity: 0.13, scale: 0.92 },
              { xPercent: 0, y: 0, opacity: 1, scale: 1, duration: 0.45, ease: 'power3.out' },
              index
            )
            .to(line, { y: -24, opacity: 0.18, duration: 0.38, ease: 'power2.in' }, index + 0.55);
        });

        timeline.fromTo(copy, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 }, 2.35);
      }

      const cards1 = elements(root, '[data-card-demo="1"] [data-detail-card]');
      if (cards1.length) {
        gsap.fromTo(
          cards1,
          { y: 96, opacity: 0, scale: 0.92, rotateX: 12 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            rotateX: 0,
            duration: 1,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: '[data-card-demo="1"]',
              start: 'top 72%',
              once: true,
            },
          }
        );
      }

      const cards2 = elements(root, '[data-card-demo="2"] [data-detail-card]');
      const demoCards2 = element(root, '[data-card-demo="2"]');
      if (cards2.length && demoCards2) {
        cards2.forEach((card, index) => {
          gsap.fromTo(
            card,
            {
              x: index % 2 === 0 ? -110 : 110,
              y: 50 + index * 8,
              opacity: 0,
              rotateY: index % 2 === 0 ? -28 : 28,
              rotateZ: (index - 1.5) * 2.2,
              scale: 0.88,
            },
            {
              x: 0,
              y: 0,
              opacity: 1,
              rotateY: 0,
              rotateZ: 0,
              scale: 1,
              duration: 1.05,
              delay: index * 0.07,
              ease: 'power4.out',
              scrollTrigger: {
                trigger: demoCards2,
                start: 'top 72%',
                once: true,
              },
            }
          );
        });
      }

      const cards3 = elements(root, '[data-card-demo="3"] [data-detail-card]');
      if (cards3.length) {
        gsap.fromTo(
          cards3,
          { y: 52, opacity: 0, filter: 'blur(12px)', clipPath: 'inset(18% 8% 18% 8% round 34px)', scale: 0.96 },
          {
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            clipPath: 'inset(0% 0% 0% 0% round 28px)',
            scale: 1,
            duration: 0.95,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: '[data-card-demo="3"]',
              start: 'top 74%',
              once: true,
            },
          }
        );
      }

      const stackSection = element(root, '[data-card-demo="4"]');
      const stackCards = elements(root, '[data-card-demo="4"] [data-stack-card]');
      if (stackSection && stackCards.length) {
        gsap.set(stackCards, {
          y: (index: number) => 150 + index * 74,
          scale: (index: number) => 1 - index * 0.035,
          rotateZ: (index: number) => (index - 1.5) * 1.6,
          zIndex: (index: number) => stackCards.length - index,
        });

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: stackSection,
            start: 'top top',
            end: '+=185%',
            scrub: 0.9,
            pin: true,
            anticipatePin: 1,
          },
        });

        stackCards.forEach((card, index) => {
          timeline.to(
            card,
            {
              y: index * 18,
              x: (index - 1.5) * 14,
              scale: 1 - index * 0.025,
              rotateZ: (index - 1.5) * 0.7,
              duration: 0.75,
              ease: 'power3.out',
            },
            index * 0.24
          );
        });

        timeline.to(stackCards, {
          x: (index: number) => (index - 1.5) * 245,
          y: 0,
          scale: 0.94,
          rotateZ: 0,
          duration: 1.1,
          stagger: 0.05,
          ease: 'power3.inOut',
        });
      }

      const cards5 = elements(root, '[data-card-demo="5"] [data-detail-card]');
      const demoCards5 = element(root, '[data-card-demo="5"]');
      if (cards5.length && demoCards5) {
        cards5.forEach((card, index) => {
          const direction = index % 2 === 0 ? -1 : 1;
          gsap.fromTo(
            card,
            { x: direction * (70 + index * 14), y: 70, rotateZ: direction * 3.5, opacity: 0, scale: 0.94 },
            {
              x: 0,
              y: 0,
              rotateZ: 0,
              opacity: 1,
              scale: 1,
              duration: 1.1,
              delay: index * 0.08,
              ease: 'back.out(1.35)',
              scrollTrigger: {
                trigger: demoCards5,
                start: 'top 74%',
                once: true,
              },
            }
          );
        });
      }
    });

    matchMedia.add('(min-width: 581px) and (max-width: 900px)', () => {
      const textDemos = elements(root, '[data-text-demo]');
      textDemos.forEach((demo) => {
        const animated = elements(demo, '[data-word], [data-char], [data-mask-line], [data-focus-title], [data-kinetic-line]');
        if (!animated.length) return;

        gsap.fromTo(
          animated,
          { y: 34, opacity: 0, filter: 'blur(5px)' },
          {
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 0.72,
            stagger: 0.035,
            ease: 'power3.out',
            scrollTrigger: { trigger: demo, start: 'top 86%', once: true },
          }
        );
      });

      elements(root, '[data-card-demo]').forEach((demo) => {
        const cards = elements(demo, '[data-detail-card]');
        cards.forEach((card, index) => {
          gsap.fromTo(
            card,
            { x: index % 2 === 0 ? -34 : 34, y: 42, opacity: 0, scale: 0.96 },
            {
              x: 0,
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 0.72,
              delay: index * 0.07,
              ease: 'power3.out',
              scrollTrigger: { trigger: demo, start: 'top 88%', once: true },
            }
          );
        });
      });
    });

    matchMedia.add('(max-width: 580px)', () => {
      elements(root, '[data-text-demo]').forEach((demo) => {
        const titlePieces = elements(demo, '[data-word], [data-char], [data-mask-line], [data-focus-title], [data-kinetic-line]');
        if (!titlePieces.length) return;

        gsap.fromTo(
          titlePieces,
          { y: 24, opacity: 0, filter: 'blur(4px)' },
          {
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 0.58,
            stagger: 0.022,
            ease: 'power3.out',
            scrollTrigger: { trigger: demo, start: 'top 91%', once: true },
          }
        );
      });

      elements(root, '[data-card-demo]').forEach((demo) => {
        const cards = elements(demo, '[data-detail-card]');
        cards.forEach((card) => {
          gsap.fromTo(
            card,
            { y: 30, opacity: 0, scale: 0.975 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 0.58,
              ease: 'power3.out',
              scrollTrigger: { trigger: card, start: 'top 92%', once: true },
            }
          );
        });
      });
    });
  }

  if (fineHover && !reducedMotion) {
    elements(root, '[data-tilt-card]').forEach((card) => {
      if (card.hasAttribute('data-stack-card')) return;

      gsap.set(card, {
        transformPerspective: 900,
        transformOrigin: 'center center',
      });

      const rotateX = gsap.quickTo(card, 'rotateX', { duration: 0.35, ease: 'power3.out' });
      const rotateY = gsap.quickTo(card, 'rotateY', { duration: 0.35, ease: 'power3.out' });
      const lift = gsap.quickTo(card, 'y', { duration: 0.35, ease: 'power3.out' });

      const onMove = (event: PointerEvent) => {
        const rect = card.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width;
        const py = (event.clientY - rect.top) / rect.height;

        card.style.setProperty('--mx', (px * 100).toFixed(2) + '%');
        card.style.setProperty('--my', (py * 100).toFixed(2) + '%');
        rotateX((0.5 - py) * 5);
        rotateY((px - 0.5) * 6);
        lift(-7);
      };

      const onLeave = () => {
        card.style.setProperty('--mx', '50%');
        card.style.setProperty('--my', '0%');
        rotateX(0);
        rotateY(0);
        lift(0);
      };

      card.addEventListener('pointermove', onMove);
      card.addEventListener('pointerleave', onLeave);

      listenerCleanups.push(() => {
        card.removeEventListener('pointermove', onMove);
        card.removeEventListener('pointerleave', onLeave);
      });
    });
  }

  requestAnimationFrame(() => ScrollTrigger.refresh());

  return () => {
    listenerCleanups.forEach((cleanup) => cleanup());
    matchMedia.revert();
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    gsap.ticker.remove(ticker);
    lenis.destroy();
  };
}
