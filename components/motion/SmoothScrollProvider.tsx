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
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const instance = new Lenis({
      lerp: 0.085,
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.9,
      touchMultiplier: 1,
      overscroll: false,
    });

    const onTick = (time: number) => {
      instance.raf(time * 1000);
    };

    const onScroll = () => {
      ScrollTrigger.update();
    };

    instance.on('scroll', onScroll);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(500, 33);
    setLenis(instance);

    return () => {
      instance.off('scroll', onScroll);
      gsap.ticker.remove(onTick);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  useEffect(() => {
    if (!lenis) return;

    lenis.scrollTo(0, { immediate: true });

    const frame = requestAnimationFrame(() => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());

      gsap.utils
        .toArray<HTMLElement>('[data-reveal]')
        .forEach((element) => {
          gsap.fromTo(
            element,
            {
              y: 34,
              opacity: 0,
            },
            {
              y: 0,
              opacity: 1,
              duration: 1.05,
              ease: 'power4.out',
              scrollTrigger: {
                trigger: element,
                start: 'top 88%',
                once: true,
              },
            }
          );
        });

      ScrollTrigger.refresh();
    });

    return () => cancelAnimationFrame(frame);
  }, [pathname, lenis]);

  const value = useMemo(() => ({ lenis }), [lenis]);

  return (
    <SmoothScrollContext.Provider value={value}>
      {children}
    </SmoothScrollContext.Provider>
  );
}

export function useSmoothScroll() {
  return useContext(SmoothScrollContext);
}
