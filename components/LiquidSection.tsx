'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import Image from 'next/image';

type LiquidSectionProps = {
  id: string;
  imageSrc: string;
  className?: string;
  ariaLabelledby?: string;
  children: ReactNode;
};

export default function LiquidSection({
  id,
  imageSrc,
  className = '',
  ariaLabelledby,
  children,
}: LiquidSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    // A public ES module keeps the optional WebGL dependency out of the React bundle.
    const moduleUrl = '/liquid-shared.js';
    import(/* webpackIgnore: true */ moduleUrl)
      .then(module => { if (!cancelled) cleanup = module.mountLiquidSection(section); })
      .catch(() => { section.classList.remove('is-liquid-ready'); });
    return () => { cancelled = true; cleanup?.(); };
  }, []);
  return (
    <section
      ref={sectionRef}
      id={id}
      className={`liquid-section ${className}`}
      data-liquid-surface
      data-liquid-image={imageSrc}
      aria-labelledby={ariaLabelledby}
    >
      <div className="liquid-media" data-liquid-bg aria-hidden="true">
        <Image
          className="liquid-image"
          src={imageSrc}
          alt=""
          fill
          sizes="100vw"
          draggable={false}
        />
      </div>

      <canvas
        className="liquid-canvas"
        data-liquid-canvas
        aria-hidden="true"
      />

      {children}
    </section>
  );
}
