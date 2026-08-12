'use client';

interface MapCardProps {
  src: string;
  alt: string;
  onClick: () => void;
  bottomEyebrow?: string;
  bottomTitle: string;
  /** Optional badge shown top-right (e.g. EPSG chip or phase badge). */
  topRight?: React.ReactNode;
}

/**
 * The interactive map preview card (image + overlay + badges + expand hint)
 * shared by the Hero and Results sections. Clicking it opens the lightbox.
 */
export default function MapCard({ src, alt, onClick, bottomEyebrow, bottomTitle, topRight }: MapCardProps) {
  return (
    <div
      className="map-card group"
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`View full resolution ${alt}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="w-full aspect-[4/3] object-cover" />
      <div className="map-overlay" />

      {/* Top badges */}
      <div className="absolute top-4 left-4 flex items-center gap-1.5 glass px-3 py-1.5">
        <span className="live-dot" />
        <span className="font-mono text-[10px] text-[#10b981] font-semibold">SENTINEL-2 L2A</span>
      </div>
      {topRight && <span className="absolute top-4 right-4">{topRight}</span>}

      {/* Bottom overlay */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="glass px-4 py-3">
          {bottomEyebrow && <p className="eyebrow mb-1">{bottomEyebrow}</p>}
          <p style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-[13.5px] font-bold text-[#e2ecff]">
            {bottomTitle}
          </p>
        </div>
      </div>

      {/* Expand hint */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="glass px-4 py-2 flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1h4M1 1v4M13 13h-4M13 13v-4M1 13h4M1 13v-4M13 1h-4M13 1v4" stroke="#00d4ff" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="text-[11px] font-mono text-[#00d4ff] font-semibold">CLICK TO EXPAND</span>
        </div>
      </div>
    </div>
  );
}
