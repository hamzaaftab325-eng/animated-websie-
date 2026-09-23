import type {Metadata, Viewport} from 'next';
import { Inter_Tight, Playfair_Display } from 'next/font/google';
import './globals.css';

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter-tight',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-serif',
});

export const metadata: Metadata = {
  title: 'Cast & Render — 3D Object Studio & Endless Possibilities',
  description: 'A scroll-scrubbed cinematic 3D experience and boundless possibilities suite with GSAP and Lenis smooth scrolling.',
  openGraph: {
    title: 'Cast & Render — 3D Object Studio & Endless Possibilities',
    description: 'A scroll-scrubbed cinematic 3D experience with GSAP and Lenis smooth scrolling.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cast & Render — 3D Object Studio & Endless Possibilities',
    description: 'A scroll-scrubbed cinematic 3D experience with GSAP and Lenis smooth scrolling.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${interTight.variable} ${playfair.variable}`}>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
