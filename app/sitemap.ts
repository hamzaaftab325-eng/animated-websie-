import type { MetadataRoute } from 'next';
export default function sitemap(): MetadataRoute.Sitemap { return ['', '/animation-lab'].map(path => ({ url: 'https://animated-websie.vercel.app'+path })); }
