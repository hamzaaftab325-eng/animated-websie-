import type { ReactNode } from 'react';

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
  return (
    <section
      id={id}
      className={`liquid-section ${className}`}
      data-liquid-surface
      data-liquid-image={imageSrc}
      aria-labelledby={ariaLabelledby}
    >
      <div className="liquid-visual" data-liquid-visual aria-hidden="true">
        <div className="liquid-media" data-liquid-bg>
          <img
            className="liquid-image"
            data-liquid-image-element
            src={imageSrc}
            alt=""
            crossOrigin="anonymous"
            draggable={false}
          />
        </div>

        <canvas
          className="liquid-canvas"
          data-liquid-canvas
          aria-hidden="true"
        />
      </div>

      {children}
    </section>
  );
}
