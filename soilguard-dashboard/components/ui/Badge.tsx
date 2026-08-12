import { urgencyColor, type Urgency } from '@/lib/data';
import { TIER_NAMES, type Tier } from '@/lib/theme';

export default function Badge({ urgency }: { urgency: Urgency }) {
  const c = urgencyColor(urgency);
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono-data text-[10px] font-semibold tracking-widest"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
    >
      <span className="w-1 h-1 rounded-full inline-block" style={{ background: c.text }} />
      {urgency}
    </span>
  );
}

export function TierBadge({ tier }: { tier: Tier }) {
  return <Badge urgency={TIER_NAMES[tier]} />;
}
