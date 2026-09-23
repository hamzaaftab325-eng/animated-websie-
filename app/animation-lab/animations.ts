import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

type Cleanup = () => void;

function all(root: HTMLElement, selector: string): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(selector));
}

function one(root: HTMLElement, selector: string): HTMLElement | null {
  return root.querySelector<HTMLElement>(selector);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function initAnimationLab(root: HTMLElement): Cleanup {
  gsap.registerPlugin(ScrollTrigger, SplitText);

  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const lenis = new Lenis({
    duration: coarsePointer ? 0.46 : 0.82,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: !coarsePointer,
    touchMultiplier: coarsePointer ? 1.06 : 1.2,
    wheelMultiplier: 0.95,
  });

  lenis.on('scroll', ScrollTrigger.update);

  const ticker = (time: number) => {
    lenis.raf(time * 1000);
  };

  gsap.ticker.add(ticker);
  gsap.ticker.lagSmoothing(0);

  const listeners: Cleanup[] = [];
  const splitInstances: Array<ReturnType<typeof SplitText.create>> = [];
  const mm = gsap.matchMedia();

  all(root, 'a[href^="#"]').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href || href === '#') return;

    const click = (event: Event) => {
      const target = root.querySelector<HTMLElement>(href);
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target, {
        duration: coarsePointer ? 0.62 : 0.92,
        offset: -10,
      });
    };

    link.addEventListener('click', click);
    listeners.push(() => link.removeEventListener('click', click));
  });

  const progress = one(root, '[data-progress]');
  if (progress) {
    ScrollTrigger.create({
      trigger: root,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self: ScrollTrigger) => {
        gsap.set(progress, { scaleX: self.progress });
      },
    });
  }

  const heroShard = one(root, '[data-hero-shard]');
  if (heroShard && !reducedMotion) {
    gsap.to(heroShard, {
      yPercent: 12,
      rotateZ: 4,
      ease: 'none',
      scrollTrigger: {
        trigger: root,
        start: 'top top',
        end: '+=100%',
        scrub: 1.1,
      },
    });
  }

  function splitLines(target: HTMLElement) {
    const split = SplitText.create(target, {
      type: 'lines,words',
      mask: 'lines',
      linesClass: 'lab-split-line',
      wordsClass: 'lab-split-word',
    });
    splitInstances.push(split);
    return split;
  }

  function splitWords(target: HTMLElement) {
    const split = SplitText.create(target, {
      type: 'words',
      wordsClass: 'lab-focus-word',
    });
    splitInstances.push(split);
    return split;
  }

  function splitChars(target: HTMLElement) {
    const split = SplitText.create(target, {
      type: 'chars,words',
      charsClass: 'lab-lens-char',
      wordsClass: 'lab-lens-word',
    });
    splitInstances.push(split);
    return split;
  }

  if (!reducedMotion) {
    mm.add('(min-width: 901px)', () => {
      const revealScene = one(root, '[data-type-scene="reveal"]');
      const revealHeading = revealScene ? one(revealScene, '[data-split-lines]') : null;
      const revealCopy = revealScene ? one(revealScene, '[data-copy]') : null;
      const revealGlass = revealScene ? one(revealScene, '[data-reveal-glass]') : null;

      if (revealScene && revealHeading) {
        const split = splitLines(revealHeading);
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: revealScene,
            start: 'top 76%',
            end: 'center 40%',
            scrub: 0.9,
          },
        });

        timeline.fromTo(
          split.lines,
          {
            yPercent: 115,
            opacity: 0,
            rotateX: 18,
            filter: 'blur(16px)',
            transformOrigin: '50% 100%',
          },
          {
            yPercent: 0,
            opacity: 1,
            rotateX: 0,
            filter: 'blur(0px)',
            stagger: 0.08,
            ease: 'power4.out',
          },
          0
        );

        timeline.fromTo(
          split.words,
          { letterSpacing: '0.06em' },
          { letterSpacing: '-0.045em', stagger: 0.012, ease: 'power3.out' },
          0.05
        );

        if (revealCopy) {
          timeline.fromTo(
            revealCopy,
            { y: 28, opacity: 0, filter: 'blur(8px)' },
            { y: 0, opacity: 1, filter: 'blur(0px)', ease: 'power3.out' },
            0.28
          );
        }

        if (revealGlass) {
          timeline.fromTo(
            revealGlass,
            { xPercent: 28, yPercent: -18, rotateZ: 12, scale: 0.72, opacity: 0 },
            { xPercent: 0, yPercent: 0, rotateZ: -4, scale: 1, opacity: 1, ease: 'power3.out' },
            0.02
          );
        }
      }

      const velocityScene = one(root, '[data-type-scene="velocity"]');
      const velocityWrap = velocityScene ? one(velocityScene, '[data-velocity-wrap]') : null;
      const velocityLines = velocityScene ? all(velocityScene, '[data-velocity-line]') : [];

      if (velocityScene && velocityWrap && velocityLines.length) {
        const setBlur = gsap.quickSetter(velocityWrap, 'filter');
        const setSkew = gsap.quickTo(velocityWrap, 'skewY', { duration: 0.28, ease: 'power3.out' });

        velocityLines.forEach((line, index) => {
          const direction = line.getAttribute('data-direction') === '1' ? 1 : -1;
          gsap.fromTo(
            line,
            { xPercent: direction * (12 + index * 3) },
            {
              xPercent: direction * (-12 - index * 3),
              ease: 'none',
              scrollTrigger: {
                trigger: velocityScene,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.9,
              },
            }
          );
        });

        ScrollTrigger.create({
          trigger: velocityScene,
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: (self: ScrollTrigger) => {
            const speed = clamp(Math.abs(self.getVelocity()) / 2300, 0, 1);
            const direction = self.direction > 0 ? 1 : -1;
            setBlur('blur(' + (speed * 5.5).toFixed(2) + 'px)');
            setSkew(direction * speed * 1.8);
          },
          onLeave: () => {
            setBlur('blur(0px)');
            setSkew(0);
          },
          onLeaveBack: () => {
            setBlur('blur(0px)');
            setSkew(0);
          },
        });
      }

      const focusScene = one(root, '[data-type-scene="focus"]');
      const focusHeading = focusScene ? one(focusScene, '[data-split-words]') : null;
      const focusCopy = focusScene ? one(focusScene, '[data-copy]') : null;
      const focusHalo = focusScene ? one(focusScene, '[data-focus-halo]') : null;
      const focusRing = focusScene ? one(focusScene, '[data-focus-ring]') : null;

      if (focusScene && focusHeading) {
        const split = splitWords(focusHeading);
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: focusScene,
            start: 'top 74%',
            end: 'center 40%',
            scrub: 0.95,
          },
        });

        timeline.fromTo(
          split.words,
          {
            y: 34,
            scale: 1.22,
            opacity: 0.08,
            rotateX: 16,
            filter: 'blur(22px)',
          },
          {
            y: 0,
            scale: 1,
            opacity: 1,
            rotateX: 0,
            filter: 'blur(0px)',
            stagger: 0.055,
            ease: 'power4.out',
          },
          0
        );

        if (focusHalo) {
          timeline.fromTo(
            focusHalo,
            { scale: 0.42, opacity: 0.18, filter: 'blur(38px)' },
            { scale: 1.05, opacity: 0.86, filter: 'blur(12px)', ease: 'power3.out' },
            0
          );
        }

        if (focusRing) {
          timeline.fromTo(
            focusRing,
            { scale: 1.65, opacity: 0, rotateZ: -12 },
            { scale: 1, opacity: 1, rotateZ: 0, ease: 'power3.out' },
            0.1
          );
        }

        if (focusCopy) {
          timeline.fromTo(
            focusCopy,
            { y: 24, opacity: 0 },
            { y: 0, opacity: 1, ease: 'power2.out' },
            0.32
          );
        }
      }

      const lensScene = one(root, '[data-type-scene="lens"]');
      const lensHeading = lensScene ? one(lensScene, '[data-split-chars]') : null;
      const typeLens = lensScene ? one(lensScene, '[data-type-lens]') : null;
      const lensCopy = lensScene ? one(lensScene, '[data-copy]') : null;

      if (lensScene && lensHeading && typeLens) {
        const split = splitChars(lensHeading);

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: lensScene,
            start: 'top top',
            end: '+=150%',
            scrub: 1,
            pin: true,
            anticipatePin: 1,
          },
        });

        timeline
          .fromTo(
            split.chars,
            {
              yPercent: (index: number) => (index % 2 === 0 ? 46 : -38),
              opacity: 0.18,
              filter: 'blur(8px)',
              rotateZ: (index: number) => (index % 3 - 1) * 2.5,
            },
            {
              yPercent: 0,
              opacity: 1,
              filter: 'blur(0px)',
              rotateZ: 0,
              stagger: 0.012,
              ease: 'power3.out',
              duration: 0.8,
            },
            0
          )
          .fromTo(
            typeLens,
            { x: '-42vw', rotateZ: -12, scale: 0.72 },
            { x: '42vw', rotateZ: 10, scale: 1.08, duration: 1.9, ease: 'power1.inOut' },
            0.05
          )
          .to(
            split.chars,
            {
              scale: (index: number) => (index % 5 === 0 ? 1.06 : 1),
              y: (index: number) => (index % 4 === 0 ? -3 : 0),
              duration: 0.45,
              stagger: { each: 0.008, from: 'center' },
              ease: 'sine.inOut',
            },
            0.7
          );

        if (lensCopy) {
          timeline.fromTo(
            lensCopy,
            { y: 22, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.45, ease: 'power2.out' },
            1.05
          );
        }
      }

      const cutScene = one(root, '[data-type-scene="cut"]');
      const cutLines = cutScene ? all(cutScene, '[data-cut-line]') : [];
      const cutShards = cutScene ? all(cutScene, '[data-cut-shard]') : [];
      const cutCopy = cutScene ? one(cutScene, '[data-copy]') : null;

      if (cutScene && cutLines.length) {
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: cutScene,
            start: 'top 76%',
            end: 'center 38%',
            scrub: 0.9,
          },
        });

        cutLines.forEach((line, index) => {
          timeline.fromTo(
            line,
            {
              xPercent: index % 2 === 0 ? -14 : 14,
              clipPath: index % 2 === 0 ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)',
              opacity: 0.2,
            },
            {
              xPercent: 0,
              clipPath: 'inset(0 0% 0 0%)',
              opacity: 1,
              duration: 0.78,
              ease: 'power4.inOut',
            },
            index * 0.12
          );
        });

        cutShards.forEach((shard, index) => {
          timeline.fromTo(
            shard,
            {
              xPercent: index === 0 ? -70 : 70,
              yPercent: index === 0 ? 24 : -26,
              rotateZ: index === 0 ? -18 : 16,
              opacity: 0,
              scale: 0.7,
            },
            {
              xPercent: 0,
              yPercent: 0,
              rotateZ: index === 0 ? -7 : 8,
              opacity: 1,
              scale: 1,
              duration: 1,
              ease: 'power3.out',
            },
            0.08 + index * 0.08
          );
        });

        if (cutCopy) {
          timeline.fromTo(
            cutCopy,
            { y: 24, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.55, ease: 'power2.out' },
            0.45
          );
        }
      }

      const shardScene = one(root, '[data-card-scene="shard"]');
      const shardCards = shardScene ? all(shardScene, '[data-shard-card]') : [];

      if (shardScene && shardCards.length) {
        gsap.set(shardCards, { transformPerspective: 1100, transformOrigin: '50% 50%' });

        gsap.fromTo(
          shardCards,
          {
            y: 110,
            x: (index: number) => (index - 1.5) * 38,
            opacity: 0,
            scale: 0.82,
            rotateX: 16,
            rotateZ: (index: number) => (index - 1.5) * 6,
            filter: 'blur(10px)',
          },
          {
            y: 0,
            x: 0,
            opacity: 1,
            scale: 1,
            rotateX: 0,
            rotateZ: 0,
            filter: 'blur(0px)',
            duration: 1.1,
            stagger: 0.09,
            ease: 'power4.out',
            scrollTrigger: {
              trigger: shardScene,
              start: 'top 70%',
              once: true,
            },
          }
        );

        shardCards.forEach((card, index) => {
          const paths = Array.from(card.querySelectorAll<SVGPathElement>('path'));
          if (!paths.length) return;

          gsap.set(paths, {
            strokeDasharray: 620,
            strokeDashoffset: 620,
          });

          gsap.to(paths, {
            strokeDashoffset: 0,
            duration: 1.35,
            delay: 0.18 + index * 0.08,
            stagger: 0.025,
            ease: 'power2.inOut',
            scrollTrigger: {
              trigger: card,
              start: 'top 78%',
              once: true,
            },
          });
        });
      }

      const lensCardScene = one(root, '[data-card-scene="lens"]');
      const lensCards = lensCardScene ? all(lensCardScene, '[data-lens-card]') : [];

      if (lensCardScene && lensCards.length) {
        lensCards.forEach((card, index) => {
          const disk = one(card, '[data-lens-disk]');

          gsap.fromTo(
            card,
            {
              y: 80,
              opacity: 0,
              scale: 0.94,
              rotateY: index % 2 === 0 ? -10 : 10,
            },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              rotateY: 0,
              duration: 0.92,
              delay: index * 0.08,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: lensCardScene,
                start: 'top 72%',
                once: true,
              },
            }
          );

          if (disk) {
            gsap.fromTo(
              disk,
              { yPercent: -36, rotateZ: -14 },
              {
                yPercent: 28,
                rotateZ: 12,
                ease: 'none',
                scrollTrigger: {
                  trigger: lensCardScene,
                  start: 'top bottom',
                  end: 'bottom top',
                  scrub: 0.8,
                },
              }
            );
          }
        });
      }

      const prismScene = one(root, '[data-card-scene="prism"]');
      const prismCards = prismScene ? all(prismScene, '[data-prism-card]') : [];

      if (prismScene && prismCards.length) {
        gsap.set(prismCards, { transformPerspective: 1200 });

        prismCards.forEach((card, index) => {
          gsap.fromTo(
            card,
            {
              x: index % 2 === 0 ? -90 : 90,
              y: 60,
              opacity: 0,
              rotateY: index % 2 === 0 ? -24 : 24,
              scale: 0.9,
            },
            {
              x: 0,
              y: 0,
              opacity: 1,
              rotateY: 0,
              scale: 1,
              duration: 1.08,
              delay: index * 0.07,
              ease: 'power4.out',
              scrollTrigger: {
                trigger: prismScene,
                start: 'top 72%',
                once: true,
              },
            }
          );

          const sweep = one(card, '[data-prism-sweep]');
          if (sweep) {
            gsap.fromTo(
              sweep,
              { xPercent: -145, rotateZ: 18 },
              {
                xPercent: 145,
                rotateZ: 18,
                ease: 'none',
                scrollTrigger: {
                  trigger: card,
                  start: 'top 90%',
                  end: 'bottom 10%',
                  scrub: 0.7,
                },
              }
            );
          }
        });
      }

      const layerScene = one(root, '[data-card-scene="layer"]');
      const layerCards = layerScene ? all(layerScene, '[data-layer-card]') : [];

      if (layerScene && layerCards.length) {
        layerCards.forEach((card, index) => {
          const plates = Array.from(card.children).slice(0, 2) as HTMLElement[];
          const orb = one(card, '[data-layer-orb]');

          gsap.fromTo(
            card,
            {
              y: 92,
              opacity: 0,
              scale: 0.9,
              rotateZ: (index - 1.5) * 2.5,
            },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              rotateZ: 0,
              duration: 0.95,
              delay: index * 0.08,
              ease: 'back.out(1.25)',
              scrollTrigger: {
                trigger: layerScene,
                start: 'top 72%',
                once: true,
              },
            }
          );

          plates.forEach((plate, plateIndex) => {
            gsap.fromTo(
              plate,
              {
                x: 0,
                y: 0,
                rotateZ: 0,
              },
              {
                x: (plateIndex + 1) * (index % 2 === 0 ? -12 : 12),
                y: (plateIndex + 1) * 8,
                rotateZ: (plateIndex + 1) * (index % 2 === 0 ? -1.5 : 1.5),
                ease: 'none',
                scrollTrigger: {
                  trigger: layerScene,
                  start: 'top bottom',
                  end: 'bottom top',
                  scrub: 1,
                },
              }
            );
          });

          if (orb) {
            gsap.to(orb, {
              rotateZ: 150,
              scale: 1.08,
              ease: 'none',
              scrollTrigger: {
                trigger: layerScene,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1,
              },
            });
          }
        });
      }

      const liquidScene = one(root, '[data-card-scene="liquid"]');
      const liquidCards = liquidScene ? all(liquidScene, '[data-liquid-card]') : [];

      if (liquidScene && liquidCards.length) {
        liquidCards.forEach((card, index) => {
          const core = one(card, '[data-liquid-core]');

          gsap.fromTo(
            card,
            {
              y: 88,
              x: index % 2 === 0 ? -32 : 32,
              opacity: 0,
              scale: 0.86,
              rotateZ: index % 2 === 0 ? -4 : 4,
              filter: 'blur(9px)',
            },
            {
              y: 0,
              x: 0,
              opacity: 1,
              scale: 1,
              rotateZ: 0,
              filter: 'blur(0px)',
              duration: 1.05,
              delay: index * 0.08,
              ease: 'back.out(1.35)',
              scrollTrigger: {
                trigger: liquidScene,
                start: 'top 72%',
                once: true,
              },
            }
          );

          if (core) {
            gsap.to(core, {
              rotateZ: index % 2 === 0 ? 160 : -160,
              scale: 1.14,
              ease: 'none',
              scrollTrigger: {
                trigger: liquidScene,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.1,
              },
            });
          }
        });
      }
    });

    mm.add('(min-width: 581px) and (max-width: 900px)', () => {
      const splitTargets = all(root, '[data-split-lines], [data-split-words], [data-split-chars]');

      splitTargets.forEach((target) => {
        const split = SplitText.create(target, {
          type: 'lines,words',
          mask: 'lines',
        });
        splitInstances.push(split);

        gsap.fromTo(
          split.lines,
          { yPercent: 95, opacity: 0, filter: 'blur(9px)' },
          {
            yPercent: 0,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 0.74,
            stagger: 0.07,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: target,
              start: 'top 88%',
              once: true,
            },
          }
        );
      });

      all(root, '[data-cut-line]').forEach((line, index) => {
        gsap.fromTo(
          line,
          { x: index % 2 === 0 ? -38 : 38, opacity: 0, filter: 'blur(5px)' },
          {
            x: 0,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 0.7,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: line,
              start: 'top 90%',
              once: true,
            },
          }
        );
      });

      all(root, '[data-glass-card]').forEach((card, index) => {
        gsap.fromTo(
          card,
          {
            y: 44,
            x: index % 2 === 0 ? -22 : 22,
            opacity: 0,
            scale: 0.96,
          },
          {
            y: 0,
            x: 0,
            opacity: 1,
            scale: 1,
            duration: 0.7,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 91%',
              once: true,
            },
          }
        );
      });
    });

    mm.add('(max-width: 580px)', () => {
      const splitTargets = all(root, '[data-split-lines], [data-split-words], [data-split-chars]');

      splitTargets.forEach((target) => {
        const split = SplitText.create(target, {
          type: 'lines,words',
          mask: 'lines',
        });
        splitInstances.push(split);

        gsap.fromTo(
          split.lines,
          { yPercent: 78, opacity: 0, filter: 'blur(6px)' },
          {
            yPercent: 0,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 0.58,
            stagger: 0.055,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: target,
              start: 'top 91%',
              once: true,
            },
          }
        );
      });

      all(root, '[data-velocity-line], [data-cut-line]').forEach((line) => {
        gsap.fromTo(
          line,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: line,
              start: 'top 92%',
              once: true,
            },
          }
        );
      });

      all(root, '[data-glass-card]').forEach((card) => {
        gsap.fromTo(
          card,
          { y: 30, opacity: 0, scale: 0.975 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.58,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 93%',
              once: true,
            },
          }
        );
      });
    });
  }

  if (finePointer && !reducedMotion) {
    all(root, '[data-glass-card]').forEach((card) => {
      gsap.set(card, {
        transformPerspective: 1000,
        transformOrigin: '50% 50%',
      });

      const rotateX = gsap.quickTo(card, 'rotateX', { duration: 0.34, ease: 'power3.out' });
      const rotateY = gsap.quickTo(card, 'rotateY', { duration: 0.34, ease: 'power3.out' });
      const lift = gsap.quickTo(card, 'y', { duration: 0.34, ease: 'power3.out' });

      const lensDisk = one(card, '[data-lens-disk]');
      const liquidCore = one(card, '[data-liquid-core]');
      const prismSweep = one(card, '[data-prism-sweep]');

      const diskX = lensDisk ? gsap.quickTo(lensDisk, 'x', { duration: 0.38, ease: 'power3.out' }) : null;
      const diskY = lensDisk ? gsap.quickTo(lensDisk, 'y', { duration: 0.38, ease: 'power3.out' }) : null;
      const coreX = liquidCore ? gsap.quickTo(liquidCore, 'x', { duration: 0.42, ease: 'power3.out' }) : null;
      const coreY = liquidCore ? gsap.quickTo(liquidCore, 'y', { duration: 0.42, ease: 'power3.out' }) : null;
      const sweepX = prismSweep ? gsap.quickTo(prismSweep, 'xPercent', { duration: 0.32, ease: 'power2.out' }) : null;

      const move = (event: PointerEvent) => {
        const rect = card.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width;
        const py = (event.clientY - rect.top) / rect.height;
        const nx = px - 0.5;
        const ny = py - 0.5;

        card.style.setProperty('--mx', (px * 100).toFixed(2) + '%');
        card.style.setProperty('--my', (py * 100).toFixed(2) + '%');

        rotateX(-ny * 5.5);
        rotateY(nx * 6.5);
        lift(-7);

        if (diskX && diskY) {
          diskX(nx * 18);
          diskY(ny * 18);
        }

        if (coreX && coreY) {
          coreX(nx * 14);
          coreY(ny * 14);
        }

        if (sweepX) {
          sweepX(-20 + px * 40);
        }
      };

      const leave = () => {
        card.style.setProperty('--mx', '50%');
        card.style.setProperty('--my', '0%');

        rotateX(0);
        rotateY(0);
        lift(0);

        if (diskX && diskY) {
          diskX(0);
          diskY(0);
        }

        if (coreX && coreY) {
          coreX(0);
          coreY(0);
        }

        if (sweepX) {
          sweepX(0);
        }
      };

      card.addEventListener('pointermove', move);
      card.addEventListener('pointerleave', leave);

      listeners.push(() => {
        card.removeEventListener('pointermove', move);
        card.removeEventListener('pointerleave', leave);
      });
    });
  }

  if (reducedMotion) {
    gsap.set(
      all(root, '[data-copy], [data-cut-line], [data-velocity-line], [data-glass-card]'),
      {
        clearProps: 'all',
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        filter: 'none',
      }
    );
  }

  requestAnimationFrame(() => {
    ScrollTrigger.refresh();
  });

  return () => {
    listeners.forEach((cleanup) => cleanup());
    mm.revert();
    splitInstances.forEach((split) => split.revert());
    gsap.ticker.remove(ticker);
    lenis.destroy();
  };
}
