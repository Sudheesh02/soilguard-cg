import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SoilGuard SOC Dashboard',
  description: 'Satellite-driven Soil Organic Carbon deficiency monitoring for Chhattisgarh agricultural belt',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
