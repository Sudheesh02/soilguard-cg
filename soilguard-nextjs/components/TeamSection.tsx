'use client';
import StatCard from '@/components/StatCard';

export default function TeamSection() {
  return (
    <section id="team" className="py-16 bg-[#090d16] section-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <p className="eyebrow eyebrow-cyan mb-3">Innovation & Development</p>
            <h2 className="section-title mb-4">
              Engineered by <span className="text-[#00d4ff]">Team BioXtreme</span>
            </h2>
            <p className="section-body">
              Pioneering satellite-driven geospatial Machine Learning infrastructure for soil organic carbon risk mapping, agricultural intelligence, and climate resilience.
            </p>
          </div>
        </div>

        {/* Team Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          
          {/* Main Team Bio Card */}
          <div className="md:col-span-8">
            <StatCard
              className="p-8 h-full relative overflow-hidden flex flex-col justify-between"
              background="radial-gradient(ellipse 100% 80% at 0% 0%, rgba(0,212,255,0.08), transparent), #0f172a"
              border="1px solid rgba(0,212,255,0.2)"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center text-[#00d4ff]">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-xl font-extrabold text-white">
                        Team BioXtreme
                      </h3>
                      <p className="text-xs font-mono text-[#00d4ff]">Geospatial AI & Remote Sensing Innovation</p>
                    </div>
                  </div>
                  <span className="badge badge-emerald flex items-center gap-1.5">
                    <span className="live-dot" />
                    IDEATHON SUBMISSION
                  </span>
                </div>

                <p className="text-[14.5px] text-[#8ba3cc] leading-relaxed mb-6">
                  SoilGuard-CG is developed by Team BioXtreme to solve micro-spatial soil carbon monitoring challenges across the agricultural plains of Chhattisgarh. By combining 10m Sentinel-2 multispectral imagery with offline Random Forest ML pipelines, we deliver actionable agronomic intelligence with zero field-sampling latency.
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {['Satellite Telemetry', 'Random Forest Regressor', '10m Spatial Resolution', 'Regenerative Agriculture', 'Zero-Target Leakage'].map(tag => (
                    <span key={tag} className="badge badge-ghost text-[11px] px-3 py-1">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    <polyline points="9 12 11 14 15 10"></polyline>
                  </svg>
                  <span className="font-mono text-xs text-[#8ba3cc]">Verified Technical Architecture</span>
                </div>
                <a
                  href="mailto:sudheesh.singh02@gmail.com"
                  className="btn-primary py-2 px-5 text-xs font-bold flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <span>Contact Team Lead</span>
                </a>
              </div>
            </StatCard>
          </div>

          {/* Contact & Support Card */}
          <div className="md:col-span-4">
            <StatCard
              className="p-8 h-full flex flex-col justify-between"
              background="#0f172a"
              border="1px solid rgba(255,255,255,0.08)"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-5">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <h4 style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-lg font-bold text-white mb-2">
                  Direct Inquiries
                </h4>
                <p className="text-xs text-[#8ba3cc] leading-relaxed mb-6">
                  Reach out for research collaborations, technical inquiries, or presentation briefings regarding SoilGuard-CG.
                </p>
                
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] mb-6">
                  <p className="font-mono text-[10px] text-[#4a6890] uppercase tracking-wider mb-1">Official Contact Email</p>
                  <a 
                    href="mailto:sudheesh.singh02@gmail.com" 
                    className="font-mono text-xs font-bold text-[#00d4ff] hover:underline break-all"
                  >
                    sudheesh.singh02@gmail.com
                  </a>
                </div>
              </div>

              <a
                href="mailto:sudheesh.singh02@gmail.com"
                className="w-full btn-ghost py-2.5 text-xs font-semibold justify-center text-center"
              >
                Send Email Message ✉️
              </a>
            </StatCard>
          </div>

        </div>

      </div>
    </section>
  );
}
