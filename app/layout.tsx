import type { Metadata, Viewport } from 'next';
import { Inter_Tight } from 'next/font/google';
import './globals.css';
import { SmoothScrollProvider } from '../components/motion/SmoothScrollProvider';
import { SiteHeader } from '../components/site/SiteHeader';

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter-tight',
});

export const metadata: Metadata = {
  title: {
    default: 'Frame & Form Studio — Digital Experiences in Motion',
    template: '%s — Frame & Form Studio',
  },
  description:
    'Frame & Form Studio creates cinematic digital experiences through motion, interaction, and visual craft.',
  openGraph: {
    title: 'Frame & Form Studio — Digital Experiences in Motion',
    description:
      'A cinematic digital studio shaping ideas through motion, interaction, and visual craft.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Frame & Form Studio — Digital Experiences in Motion',
    description:
      'A cinematic digital studio shaping ideas through motion, interaction, and visual craft.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#09090b',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={interTight.variable}>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="preload" as="image" type="image/webp" href="/hero-scroll-frames/frame-000.webp" fetchPriority="high" />
        <link rel="preload" as="image" type="image/webp" href="/hero-scroll-frames/frame-001.webp" fetchPriority="high" />
      </head>
      <body>
        <SmoothScrollProvider>
          <SiteHeader />
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
