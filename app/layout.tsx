import type {Metadata, Viewport} from 'next';
import { Inter_Tight } from 'next/font/google';
import './globals.css';

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter-tight',
});

export const metadata: Metadata = {
  title: 'Cast & Render — 3D Object Studio',
  description: 'A scroll-scrubbed video landing page with GSAP and Lenis smooth scrolling for Cast & Render 3D Object Studio.',
  openGraph: {
    title: 'Cast & Render — 3D Object Studio',
    description: 'A scroll-scrubbed video landing page for Cast & Render 3D Object Studio.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cast & Render — 3D Object Studio',
    description: 'A scroll-scrubbed video landing page for Cast & Render 3D Object Studio.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={interTight.variable}>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
