import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Motion Lab — Cast & Render', description: 'Ten interactive studies in typography, glass, and scroll animation.', alternates: { canonical: '/animation-lab' } };
export default function LabLayout({children}: {children: React.ReactNode}) { return children; }
