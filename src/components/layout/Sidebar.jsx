import { useSim } from '../../sim/store';
import { openDeliveries } from '../../sim/selectors';

// Operations-lead navigation. Rider and shelter views live in the account menu.
export const OPS_TABS = [
  { id: 'overview', icon: '▦', label: 'Overview' },
  { id: 'deliveries', icon: '⇢', label: 'Deliveries', count: true },
  { id: 'batches', icon: '▤', label: 'Food & supplies' },
  { id: 'vendor', icon: '♧', label: 'Vendor portal' },
  { id: 'riders', icon: '♙', label: 'Rider fleet' },
  { id: 'shelters', icon: '⌂', label: 'Shelters' },
  { id: 'ai', icon: '✦', label: 'AI Copilot', badge: 'NEW' },
  { id: 'activity', icon: '◷', label: 'Activity log' },
];

export default function Sidebar({ tab, onSelect }) {
  const sim = useSim();
  return (
    <aside className="sidebar" aria-label="Main navigation">
      <div className="side-label">WORKSPACE</div>
      {OPS_TABS.map((t) => (
        <button key={t.id} className={`nav-btn${tab === t.id ? ' active' : ''}`} onClick={() => onSelect(t.id)}>
          <span className="ico">{t.icon}</span>
          {t.label}
          {t.count ? <span className="nav-count">{openDeliveries(sim).length}</span> : null}
          {t.badge ? <span className="nav-count">{t.badge}</span> : null}
        </button>
      ))}
      <div className="sidebar-note">
        <strong>Demo environment</strong>
        Sample Ranchi-area data. Actions update this session's simulation only; no real deliveries are dispatched.
      </div>
    </aside>
  );
}
