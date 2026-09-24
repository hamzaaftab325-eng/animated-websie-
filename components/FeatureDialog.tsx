'use client';

import { useEffect, useRef } from 'react';

type Card = { id: string; title: string; longDesc: string; features: string[] };

export default function FeatureDialog({ card, onClose }: { card: Card | null; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !card) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      previousFocus?.focus({ preventScroll: true });
    };
  }, [card]);

  return (
    <dialog ref={dialogRef} className="feature-dialog" aria-labelledby="feature-dialog-title" aria-describedby="feature-dialog-description" data-lenis-prevent
      onCancel={(event) => { event.preventDefault(); closeRef.current(); }}
      onClick={(event) => { if (event.target === event.currentTarget) closeRef.current(); }}>
      {card && <div className="feature-modal-card">
        <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close details" autoFocus>×</button>
        <p className="dialog-eyebrow">POSSIBILITIES · {card.id.toUpperCase()}</p>
        <h2 id="feature-dialog-title" className="font-serif">{card.title}</h2>
        <p id="feature-dialog-description">{card.longDesc}</p>
        <h3>Key Capabilities</h3>
        <ul className="dialog-features">{card.features.map(feature => <li key={feature}>{feature}</li>)}</ul>
        <button type="button" className="pill dialog-done" onClick={onClose}>Back to possibilities</button>
      </div>}
    </dialog>
  );
}
