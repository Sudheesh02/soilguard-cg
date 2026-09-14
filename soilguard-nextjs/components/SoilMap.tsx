'use client'
import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface DistrictData {
  name: string
  socDeficiency: number
  soilOrder: string
}

interface SoilMapProps {
  districtData: DistrictData[]
  onDistrictClick?: (district: string) => void
  viewMode: 'socDeficiency' | 'soilOrder' | 'cloudGap'
  cloudGapImageUrl?: string
  cloudGapBounds?: L.LatLngBoundsExpression
}

function deficiencyColor(score: number, min: number, max: number): string {
  if (score <= 0) return '#374151'
  const range = max - min || 1
  const t = Math.max(0, Math.min(1, (score - min) / range))
  // Green to Red gradient (reverse of risk)
  const stops = [
    { pos: 0,    r: 42,  g: 157, b: 143 }, // low deficiency = green
    { pos: 0.33, r: 245, g: 158, b: 11  },
    { pos: 0.66, r: 245, g: 130, b: 31  },
    { pos: 1,    r: 239, g: 68,  b: 68  }, // high deficiency = red
  ]
  let lo = stops[0], hi = stops[stops.length - 1]
  for (let i = 0; i < stops.length - 1; i++) {
    if (t >= stops[i].pos && t <= stops[i + 1].pos) {
      lo = stops[i]; hi = stops[i + 1]; break
    }
  }
  const f = (t - lo.pos) / (hi.pos - lo.pos || 1)
  const r = Math.round(lo.r + (hi.r - lo.r) * f)
  const g = Math.round(lo.g + (hi.g - lo.g) * f)
  const b = Math.round(lo.b + (hi.b - lo.b) * f)
  return `rgb(${r},${g},${b})`
}

function soilOrderColor(order: string): string {
  const colors: Record<string, string> = {
    Alfisols: '#2A9D8F',
    Vertisols: '#E9C46A',
    Inceptisols: '#F4A261',
    Entisols: '#E76F51',
    Ultisols: '#264653'
  }
  return colors[order] || '#374151'
}

export default function SoilMap({ districtData, onDistrictClick, viewMode, cloudGapImageUrl, cloudGapBounds }: SoilMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const geojsonLayerRef = useRef<L.GeoJSON | null>(null)
  const imageOverlayRef = useRef<L.ImageOverlay | null>(null)
  const [geojson, setGeojson] = useState<any>(null)

  const onClickRef = useRef(onDistrictClick)
  useEffect(() => { onClickRef.current = onDistrictClick }, [onDistrictClick])

  useEffect(() => {
    fetch('/chhattisgarh-districts.geojson')
      .then(r => r.json())
      .then(setGeojson)
      .catch(() => {})
  }, [])

  const dataByDistrict = useMemo(() => {
    const map: Record<string, DistrictData> = {}
    for (const d of districtData) map[d.name.toUpperCase()] = d
    return map
  }, [districtData])

  const { defMin, defMax } = useMemo(() => {
    const vals = districtData.map(d => d.socDeficiency).filter(r => r > 0)
    if (vals.length === 0) return { defMin: 0, defMax: 100 }
    return { defMin: Math.min(...vals), defMax: Math.max(...vals) }
  }, [districtData])

  const getDistrictInfo = useCallback(
    (name: string) => dataByDistrict[name.toUpperCase()] || { name, socDeficiency: 0, soilOrder: 'Unknown' },
    [dataByDistrict],
  )

  useEffect(() => {
    if (!containerRef.current) return
    if (mapRef.current) {
      mapRef.current.remove()
      mapRef.current = null
    }

    const map = L.map(containerRef.current, {
      center: [21.2787, 81.8661],
      zoom: 7,
      zoomControl: true,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    }).addTo(map)

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !geojson) return

    if (geojsonLayerRef.current) {
      geojsonLayerRef.current.remove()
      geojsonLayerRef.current = null
    }

    const layer = L.geoJSON(geojson, {
      style: (feature) => {
        const info = getDistrictInfo(feature?.properties?.Dist_Name ?? '')
        let color = '#374151'
        if (viewMode === 'socDeficiency') {
            color = deficiencyColor(info.socDeficiency, defMin, defMax)
        } else if (viewMode === 'soilOrder') {
            color = soilOrderColor(info.soilOrder)
        } else if (viewMode === 'cloudGap') {
            color = 'transparent' // Hide geojson fill to show overlay better if desired, or keep light overlay
        }
        
        return {
          fillColor: color,
          fillOpacity: viewMode === 'cloudGap' ? 0.2 : 0.7,
          color: 'rgba(42,157,143,0.5)',
          weight: 1,
        }
      },
      onEachFeature: (feature, lyr) => {
        const distName: string = feature?.properties?.Dist_Name ?? 'Unknown'
        const info = getDistrictInfo(distName)
        const dbName = info.name

        lyr.bindTooltip(`${dbName}: ${viewMode === 'soilOrder' ? info.soilOrder : info.socDeficiency.toFixed(1) + '% SOC Def'}`, { sticky: true, className: 'leaflet-tooltip-dark' })

        lyr.on({
          mouseover: (e: L.LeafletMouseEvent) => {
            const target = e.target
            target.setStyle({ fillOpacity: 0.85, weight: 2 })
            target.bringToFront()
          },
          mouseout: (e: L.LeafletMouseEvent) => {
            e.target.setStyle({ fillOpacity: viewMode === 'cloudGap' ? 0.2 : 0.7, weight: 1 })
          },
          click: () => {
            onClickRef.current?.(dbName)
          },
        })
      },
    }).addTo(map)

    geojsonLayerRef.current = layer
  }, [geojson, getDistrictInfo, defMin, defMax, districtData, viewMode])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (imageOverlayRef.current) {
        imageOverlayRef.current.remove()
        imageOverlayRef.current = null
    }

    if (viewMode === 'cloudGap' && cloudGapImageUrl && cloudGapBounds) {
        imageOverlayRef.current = L.imageOverlay(cloudGapImageUrl, cloudGapBounds, { opacity: 0.8 }).addTo(map)
    }
  }, [viewMode, cloudGapImageUrl, cloudGapBounds])

  return (
    <div className="flex-1 relative" style={{ minHeight: 400 }}>
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%', minHeight: 400, background: '#171c27' }}
      />
      {viewMode === 'socDeficiency' && (
      <div className="absolute bottom-4 left-4 z-[1000] bg-charcoal/90 border border-teal/20 rounded-lg p-3 text-xs space-y-2">
        <span className="text-white/80 font-medium text-[10px] uppercase tracking-wider">SOC Deficiency</span>
        <div className="flex items-center gap-1.5">
          <span className="text-white/50">{Math.round(defMin)}%</span>
          <div className="w-24 h-3 rounded-sm" style={{ background: 'linear-gradient(to right, #2A9D8F, #f59e0b, #F5821F, #ef4444)' }} />
          <span className="text-white/50">{Math.round(defMax)}%</span>
        </div>
        <div className="flex justify-between text-[10px] text-white/40 w-full" style={{ paddingLeft: '1.25rem', paddingRight: '1.25rem' }}>
          <span>Low</span>
          <span>High</span>
        </div>
      </div>
      )}
    </div>
  )
}
