'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

type SmoothScrollContextValue = {
  lenis: Lenis | null;
};

const SmoothScrollContext =
  createContext<SmoothScrollContextValue>({
    lenis: null,
  });

export function SmoothScrollProvider({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [lenis, setLenis] =
    useState<Lenis | null>(null);
  const [nativeTouch, setNativeTouch] =
    useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const touchMode =
      window.matchMedia(
        '(max-width: 767px), (pointer: coarse)'
      ).matches;

    setNativeTouch(touchMode);

    if (touchMode) {
      setLenis(null);
      return;
    }

    const instance = new Lenis({
      lerp: 0.12,
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.95,
      overscroll: false,
      autoResize: true,
    });

    const onTick = (time: number) => {
      instance.raf(time * 1000);
    };

    const onScroll = () => {
      ScrollTrigger.update();
    };

    instance.on('scroll', onScroll);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);
    setLenis(instance);

    return () => {
      instance.off('scroll', onScroll);
      gsap.ticker.remove(onTick);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  useEffect(() => {
    if (!lenis && !nativeTouch) return;

    if (lenis) {
      lenis.scrollTo(0, {
        immediate: true,
      });
    } else {
      window.scrollTo(0, 0);
    }

    let revealContext:
      | gsap.Context
      | null = null;

    const frame =
      requestAnimationFrame(() => {
        revealContext = gsap.context(() => {
          gsap.utils
            .toArray<HTMLElement>(
              '[data-reveal]'
            )
            .forEach((element) => {
              gsap.fromTo(
                element,
                {
                  y: nativeTouch
                    ? 14
                    : 24,
                  opacity: 0,
                },
                {
                  y: 0,
                  opacity: 1,
                  duration: nativeTouch
                    ? 0.58
                    : 0.8,
                  ease: 'power3.out',
                  scrollTrigger: {
                    trigger: element,
                    start: 'top 92%',
                    once: true,
                  },
                }
              );
            });
        });

        ScrollTrigger.refresh();
      });

    return () => {
      cancelAnimationFrame(frame);
      revealContext?.revert();
    };
  }, [
    pathname,
    lenis,
    nativeTouch,
  ]);

  const value = useMemo(
    () => ({ lenis }),
    [lenis]
  );

  return (
    <SmoothScrollContext.Provider
      value={value}
    >
      {children}
    </SmoothScrollContext.Provider>
  );
}

export function useSmoothScroll() {
  return useContext(SmoothScrollContext);
}
