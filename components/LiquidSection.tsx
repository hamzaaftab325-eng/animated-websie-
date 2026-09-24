import type { ReactNode } from 'react';

type LiquidSectionProps = {
  id: string;
  imageSrc: string;
  className?: string;
  mediaClassName?: string;
  canvasClassName?: string;
  ariaLabelledby?: string;
  children: ReactNode;
};

export default function LiquidSection({
  id,
  imageSrc,
  className = '',
  mediaClassName = '',
  canvasClassName = '',
  ariaLabelledby,
  children,
}: LiquidSectionProps) {
  return (
    <section
      id={id}
      className={`liquid-section ${className}`}
      data-liquid-surface
      data-liquid-image={imageSrc}
      aria-labelledby={ariaLabelledby}
    >
      <div
        className={`liquid-media ${mediaClassName}`}
        data-liquid-bg
        aria-hidden="true"
      >
        <img
          className="liquid-image"
          src={imageSrc}
          alt=""
          draggable={false}
        />
      </div>

      <canvas
        className={`liquid-canvas ${canvasClassName}`}
        data-liquid-canvas
        aria-hidden="true"
      />

      {children}
    </section>
  );
}
