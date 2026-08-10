'use client';
import { useState } from 'react';

import Navbar            from '@/components/Navbar';
import HeroSection       from '@/components/HeroSection';
import ProblemSection    from '@/components/ProblemSection';
import PipelineSection   from '@/components/PipelineSection';
import ResultsSection    from '@/components/ResultsSection';
import RankingsSection   from '@/components/RankingsSection';
import MethodologySection from '@/components/MethodologySection';
import TerminalSection   from '@/components/TerminalSection';
import RoadmapSection    from '@/components/RoadmapSection';
import Footer            from '@/components/Footer';
import LightboxModal     from '@/components/LightboxModal';

interface LightboxData {
  src:     string;
  caption: string;
  tag:     string;
}

export default function Home() {
  const [lightbox, setLightbox] = useState<LightboxData | null>(null);

  return (
    <>
      <Navbar />

      <main>
        <HeroSection       onOpenLightbox={setLightbox} />
        <ProblemSection    />
        <PipelineSection   />
        <ResultsSection    onOpenLightbox={setLightbox} />
        <RankingsSection   />
        <MethodologySection />
        <TerminalSection   />
        <RoadmapSection    />
        <Footer            />
      </main>

      {lightbox && (
        <LightboxModal
          {...lightbox}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  );
}
