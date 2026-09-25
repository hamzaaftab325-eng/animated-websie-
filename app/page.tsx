'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import LiquidSection from '../components/LiquidSection';
import { initReferenceMotion } from '../lib/reference-motion';

interface CardInfo {
  id: string;
  title: string;
  description: string;
  longDesc: string;
  features: string[];
}

const CARDS_DATA: CardInfo[] = [
  {
    id: 'create',
    title: 'Create',
    description: 'Bring your ideas to life with intuitive tools.',
    longDesc: 'From procedural geometric meshes to complex architectural models, bring high-fidelity spatial concepts into reality with real-time responsive tooling.',
    features: ['Real-time 3D Viewport', 'Procedural Mesh Generation', 'PBR Shaders & Texturing', 'Automated Quad Remeshing']
  },
  {
    id: 'explore',
    title: 'Explore',
    description: 'Discover new perspectives and endless inspiration.',
    longDesc: 'Navigate through a curated multiverse of spatial design assets, material libraries, and dynamic lighting presets crafted for next-generation digital experiences.',
    features: ['Curated Asset Marketplace', 'Interactive Studio Environments', 'Spectral Lighting Presets', '360° Panoramic Previews']
  },
  {
    id: 'transform',
    title: 'Transform',
    description: 'Turn imagination into reality.',
    longDesc: 'Accelerate your production pipeline with cloud-distributed render farms, GPU-accelerated ray tracing, and automated optimization for web and mobile.',
    features: ['Distributed GPU Compute', 'Automated LOD Generation', 'Instant glTF & USDZ Exports', 'Real-time Raytracing Passes']
  },
  {
    id: 'grow',
    title: 'Grow',
    description: 'A brighter, more creative tomorrow awaits.',
    longDesc: 'Scale your design systems, collaborate in real time with global teams, and deploy immersive 3D scenes directly into production-grade applications.',
    features: ['Multi-user Sync & Branching', 'Enterprise Design Tokens', 'Global Edge CDN Delivery', 'Analytics & Engagement Telemetry']
  }
];

export default function Page() {
  const [activeModal, setActiveModal] = useState<CardInfo | null>(null);

  useEffect(() => {
    return initReferenceMotion();
  }, []);

  return (
    <>
      {/* Boot / Preloader */}
      <div className="boot" id="boot">
        <div className="bar"><i id="bootBar"></i></div>
        <p id="bootPct">LOADING 0%</p>
      </div>

      {/* Pure High-Quality Background Video Stage */}
      <div className="stage">
        <video id="clip" muted playsInline preload="auto" disablePictureInPicture></video>
      </div>

      {/* Scroll Meter */}
      <i className="meter" id="meter"></i>

      {/* Persistent Chrome Navigation Header */}
      <header className="chrome">
        <div className="mark">
          <span className="mark-star" aria-hidden="true">&#10037;</span>
          <span>Cast &amp; Render</span>
        </div>
        <nav className="nav">
          <a href="#board">Works</a>
          <a href="#visit">About</a>
          <a href="#possibilities">Possibilities</a>
          <a className="pill" href="#possibilities">Explore Suite</a>
        </nav>
      </header>

      {/* Main Narrative Text Panels Over Video */}
      <main className="panels">
        <section className="panel" data-panel>
          <div className="content-block">
            <div className="eyebrow">CREATE <span>/ 01</span></div>
            <h1 className="hero-title">CREATE</h1>
            <p className="sub">Where your <em>Vision</em> becomes Reality.</p>
          </div>
        </section>

        <section className="panel" data-panel>
          <div className="content-block">
            <div className="eyebrow">EXPLORE <span>/ 02</span></div>
            <h1 className="hero-title">EXPLORE</h1>
            <p className="sub">See every idea from a new perspective.</p>
          </div>
        </section>

        <section className="panel" data-panel>
          <div className="content-block">
            <div className="eyebrow">TRANSFORM <span>/ 03</span></div>
            <h1 className="hero-title">TRANSFORM</h1>
            <p className="sub">Turn imagination into something real.</p>
          </div>
        </section>
      </main>

      {/* Video Hero Scroll Track */}
      <div className="track" id="heroTrack"></div>

      {/* ============================================================== */}
      {/* NEW SECTION: "DISCOVER THE POSSIBILITIES — EVERYTHING YOU NEED" */}
      {/* ============================================================== */}
      <LiquidSection
        id="possibilities"
        className="possibilities-section"
        imageSrc="https://res.cloudinary.com/diometfe9/image/upload/v1790183196/download_enkn9u.png"
      >
        <span className="possibility-petal petal-1" aria-hidden="true"></span>
        <span className="possibility-petal petal-2" aria-hidden="true"></span>
        <span className="possibility-petal petal-3" aria-hidden="true"></span>
        <span className="possibility-petal petal-4" aria-hidden="true"></span>
        <span className="possibility-petal petal-5" aria-hidden="true"></span>

        {/* Section Header */}
        <div className="possibilities-header">
          <p className="possibilities-eyebrow">DISCOVER WHAT&apos;S POSSIBLE</p>
          <h2 className="possibilities-title">Everything You Need</h2>
          <p className="possibilities-desc">
            Create, explore, transform, and grow — all in one place.
          </p>
        </div>

        {/* 4 Frosted Glass Cards */}
        <div className="cards-grid">
          {/* Card 1: Create */}
          <div
            className="glass-card"
            onClick={() => setActiveModal(CARDS_DATA[0])}
            role="button"
            tabIndex={0}
            aria-label="Create: Bring your ideas to life with intuitive tools."
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveModal(CARDS_DATA[0]); }}
          >
            <div className="card-icon-wrap" aria-hidden="true">
              {/* Lotus flower icon */}
              <svg viewBox="0 0 32 32" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 5c1.8 3.5 2.5 6.5 2.5 9 0 3-1.2 5.5-2.5 6.5-1.3-1-2.5-3.5-2.5-6.5 0-2.5.7-5.5 2.5-9z" />
                <path d="M16 14c3.5-1 6.5-1 9 1 2.5 2 3 4.5 2 6.5-2.5 1-6 0-8.5-2" />
                <path d="M16 14c-3.5-1-6.5-1-9 1-2.5 2-3 4.5-2 6.5 2.5 1 6 0 8.5-2" />
                <path d="M7 23c4 1.5 14 1.5 18 0" />
              </svg>
            </div>
            <h3 className="card-title">Create</h3>
            <p className="card-desc">Bring your ideas to life with intuitive tools.</p>
            <div className="card-btn">
              <span>&rarr;</span>
            </div>
          </div>

          {/* Card 2: Explore */}
          <div
            className="glass-card"
            onClick={() => setActiveModal(CARDS_DATA[1])}
            role="button"
            tabIndex={0}
            aria-label="Explore: Discover new perspectives and endless inspiration."
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveModal(CARDS_DATA[1]); }}
          >
            <div className="card-icon-wrap" aria-hidden="true">
              {/* Mountain icon */}
              <svg viewBox="0 0 32 32" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 24L14 8l6 11 3-5 5 10H5z" />
                <path d="M11 19l3 5" />
                <path d="M21 16l3 8" />
              </svg>
            </div>
            <h3 className="card-title">Explore</h3>
            <p className="card-desc">Discover new perspectives and endless inspiration.</p>
            <div className="card-btn">
              <span>&rarr;</span>
            </div>
          </div>

          {/* Card 3: Transform */}
          <div
            className="glass-card"
            onClick={() => setActiveModal(CARDS_DATA[2])}
            role="button"
            tabIndex={0}
            aria-label="Transform: Turn imagination into reality."
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveModal(CARDS_DATA[2]); }}
          >
            <div className="card-icon-wrap" aria-hidden="true">
              {/* Sun icon */}
              <svg viewBox="0 0 32 32" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="16" cy="16" r="5" />
                <path d="M16 3v4M16 25v4M3 16h4M25 16h4M6.8 6.8l2.8 2.8M22.4 22.4l2.8 2.8M6.8 25.2l2.8-2.8M22.4 9.6l2.8-2.8" />
              </svg>
            </div>
            <h3 className="card-title">Transform</h3>
            <p className="card-desc">Turn imagination into reality.</p>
            <div className="card-btn">
              <span>&rarr;</span>
            </div>
          </div>

          {/* Card 4: Grow */}
          <div
            className="glass-card"
            onClick={() => setActiveModal(CARDS_DATA[3])}
            role="button"
            tabIndex={0}
            aria-label="Grow: A brighter, more creative tomorrow awaits."
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveModal(CARDS_DATA[3]); }}
          >
            <div className="card-icon-wrap" aria-hidden="true">
              {/* Leaf icon */}
              <svg viewBox="0 0 32 32" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 25c2-9 9-16 18-18-2 9-9 16-18 18z" />
                <path d="M7 25c4-4 9-9 14-14" />
                <path d="M15 17l4 1" />
                <path d="M12 20l2 3" />
              </svg>
            </div>
            <h3 className="card-title">Grow</h3>
            <p className="card-desc">A brighter, more creative tomorrow awaits.</p>
            <div className="card-btn">
              <span>&rarr;</span>
            </div>
          </div>
        </div>
      </LiquidSection>

      {/* Uploaded Izanami-style projects section */}
      <LiquidSection
        id="projectsSection"
        className="projects-liquid-section"
        imageSrc="https://res.cloudinary.com/diometfe9/image/upload/v1790258302/ChatGPT_Image_Sep_24_2026_03_46_32_PM_1_d3f6xc.webp"
        ariaLabelledby="projects-liquid-title"
      >

        <div className="projects-liquid-tint" aria-hidden="true"></div>

        <div className="projects-liquid-contents">
          <div className="projects-liquid-sticky">
            <div className="projects-liquid-main">
              <div className="projects-liquid-content">
                <h2
                  id="projects-liquid-title"
                  className="projects-liquid-title"
                  aria-label="Designing the Dimensions of Life"
                >
                  <span className="projects-liquid-line-mask">
                    <span className="projects-liquid-title-line">
                      Designing
                    </span>
                  </span>
                  <span className="projects-liquid-line-mask">
                    <span className="projects-liquid-title-line">
                      the Dimensions
                    </span>
                  </span>
                  <span className="projects-liquid-line-mask">
                    <span className="projects-liquid-title-line">
                      of Life
                    </span>
                  </span>
                </h2>

                <div className="projects-liquid-descriptions">
                  <p className="projects-liquid-description">
                    Through three practices,<br />
                    Izanami designs harmony across life.<br />
                    How life is nurtured, how living is enriched,<br />
                    and how one returns to oneself.
                  </p>
                </div>

                <div className="projects-liquid-button-wrap">
                  <a
                    className="projects-liquid-button"
                    href="#projectsSection"
                    aria-label="View Projects"
                  >
                    <span className="projects-liquid-button-block">
                      <span
                        className="projects-liquid-button-lines"
                        aria-hidden="true"
                      >
                        <span className="projects-liquid-button-line projects-liquid-button-line-first"></span>
                        <span className="projects-liquid-button-line projects-liquid-button-line-last"></span>
                      </span>
                      <span className="projects-liquid-button-copy">
                        <span className="projects-liquid-button-text">
                          View Projects
                        </span>
                      </span>
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </LiquidSection>

      <Script
        id="shared-liquid-webgl"
        src="/liquid-shared.js"
        type="module"
        strategy="afterInteractive"
      />

      {/* Interactive Detail Modal for clicked Card */}
      <div
        className={`feature-modal-backdrop ${activeModal ? 'open' : ''}`}
        onClick={() => setActiveModal(null)}
        role="dialog"
        aria-modal="true"
      >
        <div className="feature-modal-card" onClick={(e) => e.stopPropagation()}>
          <button
            className="modal-close-btn"
            onClick={() => setActiveModal(null)}
            aria-label="Close details"
          >
            &times;
          </button>
          {activeModal && (
            <div>
              <p className="possibilities-eyebrow" style={{ color: '#55655d', marginBottom: '8px' }}>
                POSSIBILITIES &bull; {activeModal.id.toUpperCase()}
              </p>
              <h3 className="font-serif" style={{ fontSize: '32px', color: '#172722', marginBottom: '12px', fontWeight: 600 }}>
                {activeModal.title}
              </h3>
              <p style={{ fontSize: '15.5px', lineHeight: 1.6, color: '#3b4c44', marginBottom: '20px' }}>
                {activeModal.longDesc}
              </p>
              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#172722', marginBottom: '10px' }}>
                  Key Capabilities
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {activeModal.features.map((f, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#2f4239' }}>
                      <span style={{ color: '#10b981', fontWeight: 'bold' }}>&bull;</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  className="pill"
                  style={{ background: '#172722', color: '#fff', width: '100%', height: '44px' }}
                  onClick={() => setActiveModal(null)}
                >
                  Launch {activeModal.title} Workspace
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
