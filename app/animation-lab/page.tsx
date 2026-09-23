'use client';

import { useEffect, useRef } from 'react';
import styles from './animation-lab.module.css';
import { initAnimationLab } from './animations';

type CardItem = {
  kicker: string;
  title: string;
  description: string;
  metric: string;
  metricLabel: string;
  chips: string[];
  icon: 'spark' | 'mountain' | 'sun' | 'leaf';
};

const cards: CardItem[] = [
  {
    kicker: 'CREATE',
    title: 'Build with intention',
    description: 'Shape ideas into polished experiences with a system that keeps motion, layout, and hierarchy working together.',
    metric: '01',
    metricLabel: 'creative system',
    chips: ['Motion-ready', 'Responsive'],
    icon: 'spark',
  },
  {
    kicker: 'EXPLORE',
    title: 'Discover new depth',
    description: 'Layer perspective, atmosphere, and timing so every scroll feels spatial rather than simply animated.',
    metric: '02',
    metricLabel: 'depth language',
    chips: ['Parallax', 'Perspective'],
    icon: 'mountain',
  },
  {
    kicker: 'TRANSFORM',
    title: 'Turn motion into meaning',
    description: 'Use reveals, focus shifts, and sequence to direct attention without overwhelming the visual composition.',
    metric: '03',
    metricLabel: 'motion rhythm',
    chips: ['GSAP', 'ScrollTrigger'],
    icon: 'sun',
  },
  {
    kicker: 'GROW',
    title: 'Scale the experience',
    description: 'Keep every effect adaptable across desktop, tablet, and mobile with performance-aware interaction rules.',
    metric: '04',
    metricLabel: 'device strategy',
    chips: ['Touch-safe', 'Adaptive'],
    icon: 'leaf',
  },
];

function Icon({ type }: { type: CardItem['icon'] }) {
  if (type === 'mountain') {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M4 25 13 9l6 10 3-5 6 11H4Z" />
        <path d="m10 20 3 5M21 17l3 8" />
      </svg>
    );
  }

  if (type === 'sun') {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="5" />
        <path d="M16 3v4M16 25v4M3 16h4M25 16h4M6.8 6.8l2.8 2.8M22.4 22.4l2.8 2.8M6.8 25.2l2.8-2.8M22.4 9.6l2.8-2.8" />
      </svg>
    );
  }

  if (type === 'leaf') {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M7 25c2-9 9-16 18-18-2 9-9 16-18 18Z" />
        <path d="M7 25c4-4 9-9 14-14M15 17l4 1M12 20l2 3" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 4c1.7 3.3 2.5 6.3 2.5 8.8 0 3-1.2 5.4-2.5 6.5-1.3-1.1-2.5-3.5-2.5-6.5C13.5 10.3 14.3 7.3 16 4Z" />
      <path d="M16 14c3.6-1 6.6-.8 9 1.2 2.4 2 2.9 4.5 1.9 6.5-2.6 1-6 .1-8.5-1.9M16 14c-3.6-1-6.6-.8-9 1.2-2.4 2-2.9 4.5-1.9 6.5 2.6 1 6 .1 8.5-1.9M7 24c4 1.5 14 1.5 18 0" />
    </svg>
  );
}

function Words({ text }: { text: string }) {
  return (
    <span className={styles.wordLine}>
      {text.split(' ').map((word, index) => (
        <span className={styles.wordClip} key={word + index}>
          <span className={styles.word} data-word>{word}</span>
        </span>
      ))}
    </span>
  );
}

function Characters({ text }: { text: string }) {
  return (
    <span className={styles.characterLine} aria-label={text}>
      {Array.from(text).map((character, index) => (
        <span
          key={character + index}
          className={character === ' ' ? styles.characterSpace : styles.characterClip}
          aria-hidden="true"
        >
          {character === ' ' ? ' ' : <span className={styles.character} data-char>{character}</span>}
        </span>
      ))}
    </span>
  );
}

function DetailCard({
  item,
  index,
  stack = false,
}: {
  item: CardItem;
  index: number;
  stack?: boolean;
}) {
  return (
    <article
      className={styles.detailCard}
      data-detail-card
      data-tilt-card
      data-stack-card={stack ? '' : undefined}
      tabIndex={0}
    >
      <div className={styles.cardTop}>
        <span className={styles.cardKicker}>0{index + 1} / {item.kicker}</span>
        <span className={styles.cardIcon}>
          <Icon type={item.icon} />
        </span>
      </div>

      <div className={styles.cardBody}>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
      </div>

      <div className={styles.cardMetric}>
        <strong>{item.metric}</strong>
        <span>{item.metricLabel}</span>
      </div>

      <div className={styles.cardChips}>
        {item.chips.map((chip) => <span key={chip}>{chip}</span>)}
      </div>

      <div className={styles.cardFooter}>
        <span>Explore system</span>
        <span className={styles.cardArrow} aria-hidden="true">↗</span>
      </div>
    </article>
  );
}

export default function AnimationLabPage() {
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    return initAnimationLab(rootRef.current);
  }, []);

  return (
    <main ref={rootRef} className={styles.lab}>
      <div className={styles.progress} data-lab-progress />

      <header className={styles.labHeader}>
        <a href="/" className={styles.backLink}>← Home</a>
        <div className={styles.headerMeta}>
          <span>GSAP</span>
          <span>ScrollTrigger</span>
          <span>Lenis</span>
        </div>
      </header>

      <section className={styles.intro}>
        <p className={styles.overline}>MOTION SYSTEM / 10 DIRECTIONS</p>
        <h1>Animation Lab</h1>
        <p>
          Five professional text-scroll systems and five card-motion systems, built as isolated options
          so you can choose one direction and move it to the homepage without disturbing the current design.
        </p>
        <div className={styles.introIndex}>
          <a href="#text-systems">01 — Text systems</a>
          <a href="#card-systems">02 — Card systems</a>
        </div>
      </section>

      <div className={styles.sectionMarker} id="text-systems">
        <span>01</span>
        <p>SCROLL + TEXT ANIMATIONS</p>
      </div>

      <section className={styles.textDemo + ' ' + styles.textDemoOne} data-text-demo="1">
        <div className={styles.demoLabel}>
          <span>TEXT 01</span>
          <p>Cinematic word rise</p>
        </div>
        <div className={styles.textStage}>
          <p className={styles.textKicker}>SCENE ONE / CONTROLLED REVEAL</p>
          <h2><Words text="Ideas should arrive with weight." /></h2>
          <p className={styles.textCopy} data-fade-copy>
            Words rise through a clipped baseline with perspective, soft opacity, and a measured stagger.
          </p>
          <span className={styles.revealRule} data-reveal-rule />
        </div>
      </section>

      <section className={styles.textDemo + ' ' + styles.textDemoTwo} data-text-demo="2">
        <div className={styles.demoLabel}>
          <span>TEXT 02</span>
          <p>Editorial mask wipe</p>
        </div>
        <div className={styles.maskGrid}>
          <div className={styles.maskVisual} data-mask-visual>
            <span className={styles.maskOrb} />
          </div>
          <div className={styles.maskCopy}>
            <p className={styles.textKicker}>SCENE TWO / MASKED EDITORIAL</p>
            <div className={styles.maskLine} data-mask-line>
              <h2>Reveal the idea.</h2>
            </div>
            <div className={styles.maskLine} data-mask-line>
              <h2>Then the detail.</h2>
            </div>
            <p data-mask-body>
              A directional wipe lets typography and imagery share the same visual rhythm without competing.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.textDemo + ' ' + styles.textDemoThree} data-text-demo="3">
        <div className={styles.demoLabel}>
          <span>TEXT 03</span>
          <p>Depth + focus shift</p>
        </div>
        <div className={styles.focusStage}>
          <span className={styles.focusHalo} data-focus-halo />
          <p className={styles.textKicker}>SCENE THREE / DEPTH OF FIELD</p>
          <h2 data-focus-title>Move from atmosphere to clarity.</h2>
          <p data-focus-copy>
            Blur, scale, and luminance resolve together so the message feels like a camera finding focus.
          </p>
        </div>
      </section>

      <section className={styles.textDemo + ' ' + styles.textDemoFour} data-text-demo="4">
        <div className={styles.demoLabel}>
          <span>TEXT 04</span>
          <p>Character wave</p>
        </div>
        <div className={styles.characterStage}>
          <p className={styles.textKicker}>SCENE FOUR / KINETIC TYPE</p>
          <h2><Characters text="Motion can feel alive." /></h2>
          <p data-character-copy>
            Individual characters move as one coordinated wave, then settle into a clean editorial lockup.
          </p>
        </div>
      </section>

      <section className={styles.textDemo + ' ' + styles.textDemoFive} data-text-demo="5">
        <div className={styles.demoLabel}>
          <span>TEXT 05</span>
          <p>Pinned kinetic statement</p>
        </div>
        <div className={styles.kineticStage}>
          <p className={styles.textKicker}>SCENE FIVE / PINNED STORY MOMENT</p>
          <div className={styles.kineticWindow}>
            <h2 data-kinetic-line>Design the pause.</h2>
            <h2 data-kinetic-line>Direct the eye.</h2>
            <h2 data-kinetic-line>Release the scene.</h2>
          </div>
          <p data-kinetic-copy>
            On desktop this becomes a short pinned moment. On touch screens it converts to a lighter sequential reveal.
          </p>
        </div>
      </section>

      <div className={styles.sectionMarker} id="card-systems">
        <span>02</span>
        <p>CARD ANIMATION SYSTEMS</p>
      </div>

      <section className={styles.cardDemo + ' ' + styles.cardDemoOne} data-card-demo="1">
        <div className={styles.cardDemoIntro}>
          <p>CARDS 01 / CASCADE LIFT</p>
          <h2>Elegant depth, one card at a time.</h2>
          <span>Staggered elevation + perspective settle + premium hover response.</span>
        </div>
        <div className={styles.cardGrid}>
          {cards.map((item, index) => <DetailCard key={item.title} item={item} index={index} />)}
        </div>
      </section>

      <section className={styles.cardDemo + ' ' + styles.cardDemoTwo} data-card-demo="2">
        <div className={styles.cardDemoIntro}>
          <p>CARDS 02 / PERSPECTIVE FAN</p>
          <h2>Cards enter as a spatial composition.</h2>
          <span>Alternating 3D angles resolve into a perfectly balanced grid.</span>
        </div>
        <div className={styles.cardGrid}>
          {cards.map((item, index) => <DetailCard key={item.title} item={item} index={index} />)}
        </div>
      </section>

      <section className={styles.cardDemo + ' ' + styles.cardDemoThree} data-card-demo="3">
        <div className={styles.cardDemoIntro}>
          <p>CARDS 03 / GLASS SPOTLIGHT</p>
          <h2>Light travels through the interface.</h2>
          <span>Masked reveal, directional sheen, and cursor-following glass highlights.</span>
        </div>
        <div className={styles.cardGrid}>
          {cards.map((item, index) => <DetailCard key={item.title} item={item} index={index} />)}
        </div>
      </section>

      <section className={styles.cardDemo + ' ' + styles.cardDemoFour} data-card-demo="4">
        <div className={styles.cardDemoIntro}>
          <p>CARDS 04 / STACKED STORY</p>
          <h2>One stack. Four progressive ideas.</h2>
          <span>Desktop uses a pinned deck transition; tablet and mobile use an efficient sequential version.</span>
        </div>
        <div className={styles.cardGrid + ' ' + styles.stackGrid} data-stack-grid>
          {cards.map((item, index) => <DetailCard key={item.title} item={item} index={index} stack />)}
        </div>
      </section>

      <section className={styles.cardDemo + ' ' + styles.cardDemoFive} data-card-demo="5">
        <div className={styles.cardDemoIntro}>
          <p>CARDS 05 / MAGNETIC FLOW</p>
          <h2>A softer, more organic arrival.</h2>
          <span>Cards drift from opposing directions, settle with spring-like timing, then respond subtly to pointer movement.</span>
        </div>
        <div className={styles.cardGrid}>
          {cards.map((item, index) => <DetailCard key={item.title} item={item} index={index} />)}
        </div>
      </section>

      <footer className={styles.labFooter}>
        <p>Animation Lab — choose a system, then move only that system into the homepage.</p>
        <a href="#text-systems">Back to top ↑</a>
      </footer>
    </main>
  );
}
