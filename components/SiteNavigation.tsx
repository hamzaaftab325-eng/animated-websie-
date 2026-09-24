'use client';

import { useState } from 'react';

export default function SiteNavigation() {
  const [open, setOpen] = useState(false);
  return <nav className="nav" aria-label="Main navigation" onKeyDown={event => {
    if (event.key === 'Escape') { setOpen(false); event.currentTarget.querySelector<HTMLButtonElement>('.menu-toggle')?.focus(); }
  }}>
    <button type="button" className="menu-toggle" aria-expanded={open} aria-controls="navigation-links" onClick={() => setOpen(!open)}>Menu</button>
    <div id="navigation-links" className={`navigation-links ${open ? 'is-open' : ''}`} onClick={() => setOpen(false)}>
      <a href="#projectsSection">Works</a>
      <a href="#possibilities">Possibilities</a>
      <a href="/animation-lab">Motion Lab</a>
    </div>
    <a className="pill" href="#possibilities">Explore Suite</a>
  </nav>;
}
