'use client';
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Topbar from '@/components/layout/Topbar';
import dynamic from 'next/dynamic';

const SoilMap = dynamic(() => import('@/components/SoilMap'), { ssr: false });

const DUMMY_DISTRICTS = [
  { name: 'Raipur', socDeficiency: 45, soilOrder: 'Vertisols' },
  { name: 'Bastar', socDeficiency: 20, soilOrder: 'Alfisols' },
  { name: 'Surguja', socDeficiency: 80, soilOrder: 'Entisols' },
  { name: 'Bilaspur', socDeficiency: 60, soilOrder: 'Inceptisols' },
  { name: 'Durg', socDeficiency: 30, soilOrder: 'Vertisols' }
  // other districts default to 0 and Unknown in SoilMap
];

export default function InteractiveMapPage() {
  const [viewMode, setViewMode] = useState<'socDeficiency' | 'soilOrder' | 'cloudGap'>('socDeficiency');
  const [showCloudGapAfter, setShowCloudGapAfter] = useState(false);

  return (
    <DashboardLayout>
      <Topbar title="Interactive Map" subtitle="Chhattisgarh District Level Analysis" />
      <div className="p-6 h-[calc(100vh-80px)] flex flex-col gap-4">
        <div className="flex gap-4">
            <button 
              className={`px-4 py-2 rounded ${viewMode === 'socDeficiency' ? 'bg-[#00d4ff] text-black' : 'bg-gray-800 text-white'}`}
              onClick={() => setViewMode('socDeficiency')}
            >
              SOC Deficiency
            </button>
            <button 
              className={`px-4 py-2 rounded ${viewMode === 'soilOrder' ? 'bg-[#00d4ff] text-black' : 'bg-gray-800 text-white'}`}
              onClick={() => setViewMode('soilOrder')}
            >
              Soil Orders
            </button>
            <button 
              className={`px-4 py-2 rounded ${viewMode === 'cloudGap' ? 'bg-[#00d4ff] text-black' : 'bg-gray-800 text-white'}`}
              onClick={() => setViewMode('cloudGap')}
            >
              CloudGap Inpainting
            </button>

            {viewMode === 'cloudGap' && (
              <button 
                className="px-4 py-2 rounded bg-amber-600 text-white ml-auto"
                onClick={() => setShowCloudGapAfter(!showCloudGapAfter)}
              >
                Toggle {showCloudGapAfter ? 'Before' : 'After'} Image
              </button>
            )}
        </div>

        <div className="flex-1 rounded-xl overflow-hidden border border-white/10">
          <SoilMap 
            districtData={DUMMY_DISTRICTS}
            viewMode={viewMode}
            cloudGapImageUrl={showCloudGapAfter ? '/after-inpainting.png' : '/before-inpainting.png'}
            cloudGapBounds={[[20.5, 81.0], [22.0, 82.5]] as L.LatLngBoundsExpression}
            onDistrictClick={(name) => console.log('Clicked', name)}
          />
        </div>
      </div>
    </DashboardLayout>
  )
}
