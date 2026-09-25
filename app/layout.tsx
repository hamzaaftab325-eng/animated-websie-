import type {Metadata, Viewport} from 'next';
import { Inter_Tight, Playfair_Display, Shippori_Mincho } from 'next/font/google';
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


const shippori = Shippori_Mincho({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  variable: '--font-shippori',
});

export const metadata: Metadata = {
  title: 'Frame & Form — Digital Experiences in Motion',
  description: 'Frame & Form is a cinematic digital studio shaping ideas through motion, interaction, and visual craft.',
  openGraph: {
    title: 'Frame & Form — Digital Experiences in Motion',
    description: 'A cinematic digital studio shaping ideas through motion, interaction, and visual craft.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Frame & Form — Digital Experiences in Motion',
    description: 'A cinematic digital studio shaping ideas through motion, interaction, and visual craft.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${interTight.variable} ${playfair.variable} ${shippori.variable}`}>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
