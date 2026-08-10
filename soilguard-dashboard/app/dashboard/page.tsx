import DashboardLayout from '@/components/layout/DashboardLayout';
import Topbar from '@/components/layout/Topbar';
import KPICards from '@/components/dashboard/KPICards';
import RiskChart from '@/components/dashboard/RiskChart';
import TierDonut from '@/components/dashboard/TierDonut';
import TopSectorsTable from '@/components/dashboard/TopSectorsTable';
import { STATS } from '@/lib/data';

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <Topbar title="Mission Overview" subtitle="Chhattisgarh SOC Deficiency Analysis · 22,702 ha · 25 Sectors" />
      <div className="p-6 space-y-6 animate-fade-in">

        {/* KPI row */}
        <KPICards />

        {/* Pipeline stats strip */}
        <div className="card px-5 py-3 flex flex-wrap gap-6">
          {[
            { label: 'Model', value: 'Random Forest', sub: '150 trees · depth 14' },
            { label: 'Accuracy', value: `${STATS.modelAccuracy}%`, sub: 'R² coefficient' },
            { label: 'Resolution', value: STATS.resolution, sub: 'Sentinel-2 pixel' },
            { label: 'Runtime', value: `${STATS.processingTimeSec}s`, sub: 'Full pipeline' },
            { label: 'Bare Soil Area', value: `${(STATS.totalBareHa / 1000).toFixed(1)}k ha`, sub: 'NDVI ≤ 0.30 mask' },
            { label: 'Sensor', value: 'Sentinel-2 L2A', sub: 'B02 B04 B08 B11' },
          ].map(s => (
            <div key={s.label}>
              <p className="font-mono-data text-[9px] text-[#3d5a80] tracking-widest mb-0.5">{s.label}</p>
              <p className="font-display text-[15px] font-bold text-white">{s.value}</p>
              <p className="text-[10px] text-[#4a6890]">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Risk chart full width */}
        <RiskChart />

        {/* Priority table + donut */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TopSectorsTable />
          </div>
          <TierDonut />
        </div>

        {/* AOI info footer */}
        <div className="card px-5 py-4 flex flex-wrap gap-x-8 gap-y-2 items-center">
          <div>
            <p className="font-mono-data text-[9px] text-[#3d5a80] tracking-widest">AOI BOUNDING BOX</p>
            <p className="font-mono-data text-[12px] text-[#5e7aa8]">81.60°E–81.80°E · 21.10°N–21.30°N · EPSG:32644</p>
          </div>
          <div>
            <p className="font-mono-data text-[9px] text-[#3d5a80] tracking-widest">GRID</p>
            <p className="font-mono-data text-[12px] text-[#5e7aa8]">5×5 zones · 4.4 km × 4.4 km each · A–E rows · 1–5 cols</p>
          </div>
          <div>
            <p className="font-mono-data text-[9px] text-[#3d5a80] tracking-widest">DATA SOURCE</p>
            <p className="font-mono-data text-[12px] text-[#5e7aa8]">Sentinel-2 L2A + SoilGrids 250m + ISRO Bhuvan API</p>
          </div>
          <div className="ml-auto">
            <p className="font-mono-data text-[9px] text-[#3d5a80] tracking-widest">BUILT FOR</p>
            <p className="font-mono-data text-[12px] text-[#00d4ff]">COSINE NIT Raipur × NRSC Ideathon 2026</p>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
