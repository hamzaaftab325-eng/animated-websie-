'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './animation-lab.module.css';
import { initAnimationLab } from './animations';

type Item = {
  index: string;
  label: string;
  title: string;
  copy: string;
  stat: string;
  note: string;
};

const items: Item[] = [
  {
    index: '01',
    label: 'CREATE',
    title: 'Shape the impossible',
    copy: 'Motion, material, and hierarchy tuned as one visual system.',
    stat: '73°',
    note: 'intentional angle',
  },
  {
    index: '02',
    label: 'EXPLORE',
    title: 'Find another depth',
    copy: 'Spatial transitions that guide the eye without slowing the story.',
    stat: '2.4x',
    note: 'perceived depth',
  },
  {
    index: '03',
    label: 'TRANSFORM',
    title: 'Move with purpose',
    copy: 'Every reveal earns its place through pacing, focus, and contrast.',
    stat: '08ms',
    note: 'motion response',
  },
  {
    index: '04',
    label: 'GROW',
    title: 'Scale without noise',
    copy: 'Desktop drama, tablet balance, and mobile motion that stays fluid.',
    stat: '4/4',
    note: 'device states',
  },
];

function CrackLines() {
  return (
    <svg className={styles.cracks} viewBox="0 0 320 430" preserveAspectRatio="none" aria-hidden="true">
      <path d="M8 64 48 86 32 116 74 132 58 166M270 12l-22 38 30 26-38 34 24 31M10 324l44-22 28 34 32-46M302 344l-46-18-22 36-44-14M90 8l26 38-16 30 38 28M208 428l-18-40 24-34-28-28" />
      <path d="M40 90 18 104M53 112l24-8M260 50l36-4M246 106l-30 14M72 332l-36 22M238 354l30 26M112 48l24-16M198 390l30 12" />
    </svg>
  );
}

function ShardCard({ item, variant }: { item: Item; variant: number }) {
  return (
    <article
      className={styles.shardCard}
      data-shard-card
      data-glass-card
      data-variant={variant}
      tabIndex={0}
    >
      <div className={styles.shardRefraction} aria-hidden="true" />
      <CrackLines />
      <div className={styles.shardTop}>
        <span>{item.label}</span>
        <small>{item.index}</small>
      </div>
      <div className={styles.shardCenter}>
        <strong>{item.stat}</strong>
        <h3>{item.title}</h3>
        <p>{item.copy}</p>
      </div>
      <div className={styles.shardFooter}>
        <em>{item.note}</em>
        <span>↗</span>
      </div>
    </article>
  );
}

function LensCard({ item }: { item: Item }) {
  return (
    <article className={styles.lensCard} data-lens-card data-glass-card tabIndex={0}>
      <div className={styles.lensRail} aria-hidden="true" />
      <div className={styles.lensDisk} data-lens-disk aria-hidden="true">
        <span>{item.index}</span>
      </div>
      <div className={styles.lensMeta}>
        <span>{item.label}</span>
        <small>OPTICAL / {item.index}</small>
      </div>
      <div className={styles.lensBody}>
        <h3>{item.title}</h3>
        <p>{item.copy}</p>
      </div>
      <div className={styles.lensFooter}>
        <span>{item.note}</span>
        <b>View</b>
      </div>
    </article>
  );
}

function PrismCard({ item, variant }: { item: Item; variant: number }) {
  return (
    <article className={styles.prismCard} data-prism-card data-glass-card data-variant={variant} tabIndex={0}>
      <div className={styles.prismSweep} data-prism-sweep aria-hidden="true" />
      <div className={styles.prismNumber}>{item.index}</div>
      <div className={styles.prismCopy}>
        <span>{item.label}</span>
        <h3>{item.title}</h3>
        <p>{item.copy}</p>
      </div>
      <div className={styles.prismFoot}>
        <strong>{item.stat}</strong>
        <small>{item.note}</small>
      </div>
    </article>
  );
}

function LayerCard({ item, variant }: { item: Item; variant: number }) {
  return (
    <article className={styles.layerCard} data-layer-card data-glass-card data-variant={variant} tabIndex={0}>
      <div className={styles.layerPlate + ' ' + styles.layerPlateBack} aria-hidden="true" />
      <div className={styles.layerPlate + ' ' + styles.layerPlateMid} aria-hidden="true" />
      <div className={styles.layerFace}>
        <div className={styles.layerHeader}>
          <span>{item.index}</span>
          <small>{item.label}</small>
        </div>
        <div className={styles.layerOrb} data-layer-orb aria-hidden="true">
          <i />
        </div>
        <h3>{item.title}</h3>
        <p>{item.copy}</p>
        <div className={styles.layerFooter}>
          <span>{item.stat}</span>
          <em>{item.note}</em>
        </div>
      </div>
    </article>
  );
}

function LiquidCard({ item, variant }: { item: Item; variant: number }) {
  return (
    <article className={styles.liquidCard} data-liquid-card data-glass-card data-variant={variant} tabIndex={0}>
      <div className={styles.liquidGlow} aria-hidden="true" />
      <div className={styles.liquidCore} data-liquid-core aria-hidden="true">
        <span />
      </div>
      <div className={styles.liquidTop}>
        <span>{item.label}</span>
        <b>{item.index}</b>
      </div>
      <div className={styles.liquidBody}>
        <h3>{item.title}</h3>
        <p>{item.copy}</p>
      </div>
      <div className={styles.liquidFooter}>
        <span>{item.note}</span>
        <strong>{item.stat}</strong>
      </div>
    </article>
  );
}

export default function AnimationLabPage() {
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    const root = rootRef.current;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let cleanup = initAnimationLab(root);
    const sync = () => { cleanup(); cleanup = initAnimationLab(root); };
    preference.addEventListener('change', sync);
    return () => { preference.removeEventListener('change', sync); cleanup(); };
  }, []);

  return (
    <main ref={rootRef} className={styles.lab}>
      <svg className={styles.filterDefs} width="0" height="0" aria-hidden="true">
        <defs>
          <filter id="lab-glass-warp" x="-25%" y="-25%" width="150%" height="150%">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.022" numOctaves="2" seed="11" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="12" xChannelSelector="R" yChannelSelector="B" />
          </filter>
          <filter id="lab-soft-warp" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="turbulence" baseFrequency="0.008 0.014" numOctaves="1" seed="5" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="7" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      <div className={styles.progress} data-progress />

      <header className={styles.header}>
        <Link href="/" className={styles.homeLink}>← HOME</Link>
        <div className={styles.headerTitle}>MOTION LAB / 2026</div>
        <div className={styles.headerMeta}>
          <span>GSAP 3.15</span>
          <span>SplitText</span>
          <span>Lenis</span>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroNoise} aria-hidden="true" />
        <div className={styles.heroShard} data-hero-shard aria-hidden="true">
          <div className={styles.heroShardInner} />
          <CrackLines />
        </div>
        <p className={styles.heroEyebrow}>REFRACTION / TYPE / SCROLL / MATERIAL</p>
        <h1>Not another<br />2024 motion reel.</h1>
        <p className={styles.heroCopy}>
          Ten rebuilt studies using modern split typography, scroll velocity, focus transitions,
          optical glass, broken shards, layered acrylic, and touch-aware motion.
        </p>
        <div className={styles.heroNav}>
          <a href="#type-01">5 text systems</a>
          <a href="#glass-01">5 glass systems</a>
        </div>
      </section>

      <div className={styles.chapter}>
        <span>01</span>
        <p>TYPE / SCROLL SYSTEMS</p>
      </div>

      <section className={styles.typeScene + ' ' + styles.typeReveal} id="type-01" data-type-scene="reveal">
        <div className={styles.sceneIndex}>01 / PRESSURE REVEAL</div>
        <div className={styles.revealGlass} data-reveal-glass aria-hidden="true" />
        <div className={styles.typeContent}>
          <p className={styles.kicker}>SPLITTEXT / LINE MASK / BLUR</p>
          <h2 data-split-lines>Beautiful motion should feel discovered, not applied.</h2>
          <p data-copy>
            The line enters through its own mask, sharpens from optical blur, then settles into a calm editorial composition.
          </p>
        </div>
      </section>

      <section className={styles.typeScene + ' ' + styles.typeVelocity} id="type-02" data-type-scene="velocity">
        <div className={styles.sceneIndex}>02 / VELOCITY RIBBON</div>
        <div className={styles.velocityRows} data-velocity-wrap>
          <div data-velocity-line data-direction="-1"><span>DESIGN</span><i>should move</i></div>
          <div data-velocity-line data-direction="1"><span>LIKE</span><i>light through</i></div>
          <div data-velocity-line data-direction="-1"><span>GLASS</span><i>not like slides</i></div>
        </div>
        <p className={styles.velocityNote}>Scroll speed feeds blur and skew, while direction controls the typography rails.</p>
      </section>

      <section className={styles.typeScene + ' ' + styles.typeFocus} id="type-03" data-type-scene="focus">
        <div className={styles.sceneIndex}>03 / SOFT FOCUS</div>
        <div className={styles.focusHalo} data-focus-halo aria-hidden="true" />
        <div className={styles.focusRing} data-focus-ring aria-hidden="true" />
        <div className={styles.focusContent}>
          <p className={styles.kicker}>VISION / MOTION / POSSIBILITY</p>
          <h2 data-split-words>CREATE</h2>
          <p className={styles.focusSubtitle} data-focus-subtitle>
            Where your <em>Vision</em> becomes Reality
          </p>
          <span className={styles.focusRule} data-focus-rule aria-hidden="true" />
          <div className={styles.focusBottom} data-focus-bottom>
            <span>Explore your creativity</span>
            <span>Beautiful ideas, shaped through motion.</span>
            <a href="#glass-01">Discover <b>→</b></a>
          </div>
        </div>
      </section>

      <section className={styles.typeScene + ' ' + styles.typeLens} id="type-04" data-type-scene="lens">
        <div className={styles.sceneIndex}>04 / REFRACTIVE TYPE</div>
        <div className={styles.lensBackdrop} aria-hidden="true">
          <span>FORM</span>
          <span>LIGHT</span>
          <span>PACE</span>
        </div>
        <div className={styles.typeLensBubble} data-type-lens aria-hidden="true">
          <div className={styles.typeLensRefraction}>REFRACT</div>
        </div>
        <div className={styles.typeLensCopy}>
          <p className={styles.kicker}>CHARACTER SPLIT / PIN / REFRACTION</p>
          <h2 data-split-chars>Let the interface bend around the story.</h2>
          <p data-copy>A moving optical lens crosses split characters while the scene remains pinned for one controlled cinematic beat.</p>
        </div>
      </section>

      <section className={styles.typeScene + ' ' + styles.typeCut} id="type-05" data-type-scene="cut">
        <div className={styles.sceneIndex}>05 / EDITORIAL CUT</div>
        <div className={styles.cutShard + ' ' + styles.cutShardOne} data-cut-shard aria-hidden="true" />
        <div className={styles.cutShard + ' ' + styles.cutShardTwo} data-cut-shard aria-hidden="true" />
        <div className={styles.cutCopy}>
          <p className={styles.kicker}>MASK / OFFSET / COMPOSITION</p>
          <div className={styles.cutLine}><h2 data-cut-line>Make space.</h2></div>
          <div className={styles.cutLine}><h2 data-cut-line>Break the grid.</h2></div>
          <div className={styles.cutLine}><h2 data-cut-line>Keep the rhythm.</h2></div>
          <p data-copy>Typography and translucent fragments enter from different axes, then lock into a single editorial frame.</p>
        </div>
      </section>

      <div className={styles.chapter + ' ' + styles.chapterGlass}>
        <span>02</span>
        <p>GLASS / CARD SYSTEMS</p>
      </div>

      <section className={styles.cardScene + ' ' + styles.shardScene} id="glass-01" data-card-scene="shard">
        <div className={styles.cardIntro}>
          <p>GLASS 01 / STACK → REVEAL</p>
          <h2>Four layers become<br />one balanced system.</h2>
          <span>The cards begin as a tactile glass stack, then separate into their final layout with depth, weight, and controlled spring.</span>
        </div>
        <div className={styles.shardGrid} data-stack-grid>
          {items.map((item, index) => <ShardCard key={item.index} item={item} variant={index + 1} />)}
        </div>
      </section>

      <section className={styles.cardScene + ' ' + styles.lensScene} id="glass-02" data-card-scene="lens">
        <div className={styles.cardIntro + ' ' + styles.lightIntro}>
          <p>GLASS 02 / OPTICAL LENS</p>
          <h2>Clearer. Thicker. More physical.</h2>
          <span>A floating optical disk, edge caustics, internal rails, and pointer-following light create a camera-lens feel.</span>
        </div>
        <div className={styles.lensGrid}>
          {items.map((item) => <LensCard key={item.index} item={item} />)}
        </div>
      </section>

      <section className={styles.cardScene + ' ' + styles.prismScene} id="glass-03" data-card-scene="prism">
        <div className={styles.cardIntro + ' ' + styles.darkIntro}>
          <p>GLASS 03 / CHROMATIC PRISM</p>
          <h2>Glass can carry color without becoming neon.</h2>
          <span>Controlled spectral edges, dark optical depth, and a travelling prism sweep keep the material premium.</span>
        </div>
        <div className={styles.prismGrid}>
          {items.map((item, index) => <PrismCard key={item.index} item={item} variant={index + 1} />)}
        </div>
      </section>

      <section className={styles.cardScene + ' ' + styles.layerScene} id="glass-04" data-card-scene="layer">
        <div className={styles.cardIntro + ' ' + styles.lightIntro}>
          <p>GLASS 04 / LAYERED ACRYLIC</p>
          <h2>Depth through material,<br />not extra decoration.</h2>
          <span>Three physical layers separate, settle, and re-stack while the central optical orb carries the motion.</span>
        </div>
        <div className={styles.layerGrid}>
          {items.map((item, index) => <LayerCard key={item.index} item={item} variant={index + 1} />)}
        </div>
      </section>

      <section className={styles.cardScene + ' ' + styles.liquidScene} id="glass-05" data-card-scene="liquid">
        <div className={styles.cardIntro + ' ' + styles.darkIntro}>
          <p>GLASS 05 / LIQUID OBJECTS</p>
          <h2>Soft geometry with a hard motion system.</h2>
          <span>Organic silhouettes, moving internal cores, magnetic pointer response, and restrained blur for touch performance.</span>
        </div>
        <div className={styles.liquidGrid}>
          {items.map((item, index) => <LiquidCard key={item.index} item={item} variant={index + 1} />)}
        </div>
      </section>

      <footer className={styles.footer}>
        <div>
          <small>ANIMATION LAB / 2026</small>
          <p>Choose one text system and one glass system. They are intentionally isolated from the homepage.</p>
        </div>
        <a href="#type-01">Back to studies ↑</a>
      </footer>
    </main>
  );
}
