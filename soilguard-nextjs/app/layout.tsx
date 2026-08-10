import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SoilGuard-CG — Sentinel-2 Soil Health Risk Intelligence Platform',
  description:
    'SoilGuard-CG maps Soil Health Risk at 10m resolution across 22,702 ha of the Raipur agricultural belt, Chhattisgarh, using Sentinel-2 satellite imagery and a Random Forest ML pipeline. Built for National Space Day Ideathon 2026 — COSINE NIT Raipur × NRSC/ISRO.',
  keywords: [
    'soil health', 'Sentinel-2', 'machine learning', 'geospatial', 'Raipur',
    'Chhattisgarh', 'soil risk', 'NDVI', 'remote sensing', 'ISRO', 'NRSC',
    'NIT Raipur', 'COSINE', 'ideathon', 'agriculture', 'SoilGuard',
  ],
  authors: [{ name: 'SoilGuard-CG Team' }],
  openGraph: {
    title: 'SoilGuard-CG — Soil Health Risk Intelligence',
    description: 'High-resolution 10m soil degradation risk maps for the Raipur agricultural belt, powered by Sentinel-2 + Random Forest ML.',
    type: 'website',
  },
  robots: 'index, follow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
