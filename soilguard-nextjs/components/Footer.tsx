const LINKS = [
  {
    title: 'Platform',
    items: [
      { label: 'Overview',      href: '#overview' },
      { label: 'Problem',       href: '#problem' },
      { label: 'Pipeline',      href: '#pipeline' },
      { label: 'Spatial Results', href: '#results' },
    ],
  },
  {
    title: 'Analysis',
    items: [
      { label: 'Priority Rankings', href: '#rankings' },
      { label: 'Methodology',       href: '#methodology' },
      { label: 'Terminal Demo',     href: '#terminal' },
      { label: 'Roadmap',           href: '#roadmap' },
    ],
  },
  {
    title: 'Data & Tools',
    items: [
      { label: 'Sentinel-2 L2A',  href: '#' },
      { label: 'SoilGrids WCS',   href: '#' },
      { label: 'STAC Earth-Search', href: '#' },
      { label: 'Random Forest ML', href: '#' },
    ],
  },
];

export default function Footer() {
  const scrollTo = (href: string) =>
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <footer className="bg-[#06090f] border-t border-[rgba(255,255,255,0.07)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">

          {/* Brand */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-[rgba(0,212,255,0.10)] border border-[rgba(0,212,255,0.22)] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1L14 4.5v7L8 15l-6-3.5v-7L8 1Z" stroke="#00d4ff" strokeWidth="1.3" fill="rgba(0,212,255,0.1)"/>
                  <circle cx="8" cy="8" r="2.5" fill="#00d4ff"/>
                </svg>
              </div>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-[17px] font-extrabold text-[#e2ecff]">
                Soil<span className="text-[#00d4ff]">Guard</span>
                <span className="text-[#4a6890]">-CG</span>
              </span>
            </div>

            <p className="text-[13.5px] text-[#4a6890] leading-relaxed mb-5 max-w-sm">
              Terminal-native geospatial ML platform for satellite-driven soil health risk mapping. 22,702 ha evaluated at 10m resolution. Built for National Space Day Ideathon 2026.
            </p>

            <div className="flex flex-wrap gap-2">
              <span className="badge badge-amber">IDEATHON 2026</span>
              <span className="badge badge-cyan">COSINE NIT Raipur</span>
              <span className="badge badge-ghost">NRSC / ISRO</span>
            </div>
          </div>

          {/* Link columns */}
          {LINKS.map(col => (
            <div key={col.title} className="md:col-span-2">
              <p className="eyebrow mb-5">{col.title}</p>
              <ul className="space-y-3">
                {col.items.map(item => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      onClick={e => { if (item.href.startsWith('#')) { e.preventDefault(); scrollTo(item.href); } }}
                      className="text-[13px] text-[#4a6890] hover:text-[#8ba3cc] transition-colors cursor-pointer"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* AOI */}
          <div className="md:col-span-1">
            <p className="eyebrow mb-5">AOI Details</p>
            <div className="space-y-3 font-mono text-[11.5px]">
              {[
                { label: 'Min Lon', value: '81.60°E' },
                { label: 'Max Lon', value: '81.80°E' },
                { label: 'Min Lat', value: '21.10°N' },
                { label: 'Max Lat', value: '21.30°N' },
                { label: 'CRS',     value: 'EPSG:32644' },
                { label: 'Res',     value: '10m' },
              ].map(d => (
                <div key={d.label} className="flex flex-col">
                  <span className="text-[#4a6890]">{d.label}</span>
                  <span className="text-[#8ba3cc] font-semibold">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[rgba(255,255,255,0.06)] pt-7">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[12px] text-[#2d4060] font-mono text-center md:text-left">
              SoilGuard-CG v1.0 · National Space Day Ideathon 2026 · COSINE NIT Raipur × NRSC/ISRO<br/>
              Built with Sentinel-2 L2A · Random Forest ML · STAC Earth-Search · rasterio · scikit-learn
            </p>
            <div className="flex items-center gap-2">
              <div className="live-dot" />
              <span className="font-mono text-[11px] text-[#4a6890]">Sentinel-2 L2A · 100% Offline</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
