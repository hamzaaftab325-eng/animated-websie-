# Cast & Render

Next.js website with a cinematic video hero, glass cards, optional WebGL backgrounds, and an animation lab.

## Development

Use Node.js 22 and npm. Run `npm ci`, then `npm run dev`.

- `npm run lint`: zero-warning lint gate
- `npm run typecheck`: TypeScript validation
- `npm run build`: production build with lint and type checks
- `npm run clean`: remove generated Next.js output

The existing Vercel Git integration handles deployment. This repository does not need Gemini or Firebase credentials. `package-lock.json` is the authoritative dependency lockfile. If an install command was manually overridden in Vercel, use `npm ci`.

## Structure

- `app/page.tsx`: homepage content
- `hooks/use-homepage-animation.ts`: scoped GSAP/Lenis lifecycle and streaming video synchronization
- `components/FeatureDialog.tsx`: native accessible card dialog
- `components/LiquidSection.tsx`: image fallback and optional liquid effect lifecycle
- `public/liquid-shared.js`: WebGL renderer with explicit mount/disposal
- `app/animation-lab`: independent motion studies

`/index.html` redirects to `/`; the duplicate legacy HTML pages are retired.

## Interaction checks

Before publishing visual changes, check desktop, tablet and mobile widths; scroll the hero in both directions; resize the card stack within its desktop breakpoint; open cards with Enter and Space; close dialogs with Escape; verify focus returns to the card; use the mobile menu; and enable reduced motion while the page is open. Test navigation to the animation lab and back to confirm effects remount cleanly.

Remote Cloudinary media and the optional Three.js CDN module require network access. Static background images remain visible if WebGL is unavailable. No invented workspace/project destinations are used: card details dismiss back to the page and the editorial CTA opens the motion studies.
