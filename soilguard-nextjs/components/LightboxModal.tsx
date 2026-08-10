'use client';
import { useEffect } from 'react';

interface Props {
  src: string;
  caption: string;
  tag: string;
  onClose: () => void;
}

export default function LightboxModal({ src, caption, tag, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="lightbox-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={caption}
    >
      <div
        className="relative max-w-[90vw] max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3 rounded-t-2xl"
          style={{ background: '#0e1522', border: '1px solid rgba(255,255,255,0.10)', borderBottom: 'none' }}
        >
          <div>
            <p className="eyebrow mb-0.5 text-[9.5px]">{tag}</p>
            <p style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-[13.5px] font-bold text-[#e2ecff] max-w-[60vw] truncate">{caption}</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.05)] text-[#8ba3cc] hover:text-[#e2ecff] hover:bg-[rgba(255,255,255,0.09)] transition-all ml-4 shrink-0"
            aria-label="Close lightbox"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Image */}
        <div
          className="relative overflow-auto rounded-b-2xl"
          style={{ border: '1px solid rgba(255,255,255,0.10)', background: '#06090f' }}
        >
          <img
            src={src}
            alt={caption}
            style={{ maxWidth: '88vw', maxHeight: '80vh', display: 'block', margin: '0 auto' }}
          />
        </div>

        {/* Footer hint */}
        <p className="text-center text-[11px] text-[#4a6890] font-mono mt-3">
          Press ESC or click outside to close
        </p>
      </div>
    </div>
  );
}
