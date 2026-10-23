import { useState } from 'react';
import { useSim } from '../../sim/store';
import { findDonor } from '../../sim/selectors';
import { confirmVendorReady, markBatchReady, withdrawBatch } from '../../sim/actions';
import { showToast } from '../../sim/toast';
import Section from '../../components/ui/Section';
import PageHead from '../../components/ui/PageHead';
import Kpi from '../../components/ui/Kpi';
import StatusBadge from '../../components/ui/StatusBadge';

const PHOTOS = {
  medical: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=600&q=80',
  food: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
};

function VendorTile({ donor }) {
  const [imageFailed, setImageFailed] = useState(false);
  const medical = donor.type === 'PHARMACY';
  return (
    <div className="vendor-tile">
      <div className="vendor-art">
        {!imageFailed && (
          <img src={medical ? PHOTOS.medical : PHOTOS.food} alt={`Representative ${medical ? 'pharmacy' : 'food donor'} photo`} loading="lazy" onError={() => setImageFailed(true)} />
        )}
        {imageFailed && <span className="vendor-fallback" style={{ display: 'grid' }}>{medical ? '💊' : '🍲'}</span>}
      </div>
      <strong>{donor.name}</strong>
      <small>
        {donor.location || 'Pickup landmark not set'}
        <br />
        {donor.type || 'DONOR'} · representative photo
      </small>
    </div>
  );
}

const CHECKS = [
  ['packed', 'Goods packed and counted'],
  ['sealed', 'Food / supplies safely sealed'],
  ['handover', 'Handover contact available'],
];

export default function Vendor({ onNewBatch }) {
  const sim = useSim();
  const [checks, setChecks] = useState({ packed: false, sealed: false, handover: false });

  const active = sim.batches.filter((b) => b.unclaimedUnits > 0 && b.expireInMin > 0);
  const nearExpiry = (b) => b.expireInMin <= b.bufferMin + 20;

  const confirm = () => {
    if (!Object.values(checks).every(Boolean)) {
      showToast('Complete all three pickup-readiness checks first.', true);
      return;
    }
    confirmVendorReady();
  };

  return (
    <Section id="vendor">
      <PageHead title="Vendor portal" subtitle="Publish surplus, keep pickup readiness current, and release stock before it becomes a ghost reservation.">
        <button className="btn primary" onClick={onNewBatch}>＋ Publish donation</button>
      </PageHead>

      <div className="kpis">
        <Kpi label="Active listings" icon="▤" value={active.length} foot="With time left to redistribute" />
        <Kpi label="Unclaimed units" icon="◉" value={active.reduce((n, b) => n + b.unclaimedUnits, 0)} foot="Available for safe matching" />
        <Kpi label="Near expiry" icon="◷" value={active.filter(nearExpiry).length} foot="At or below safety buffer + 20m" />
        <Kpi label="Donor locations" icon="⌖" value={sim.donors.length} foot="Registered pickup points" />
      </div>

      <div className="two-col">
        <div className="panel">
          <div className="panel-head"><div><h2>Vendor & donor directory</h2><p>Registered pickup points · demo profile art, not verified vendor photography</p></div></div>
          <div className="vendor-directory">{sim.donors.map((d) => <VendorTile key={d.id} donor={d} />)}</div>
          <div style={{ margin: '14px 0', borderTop: '1px solid var(--line)' }} />
          <div className="panel-head"><div><h2>Surplus inventory</h2><p>All current donations and their expiry windows</p></div></div>
          {sim.batches.length ? sim.batches.map((b) => (
            <div className="task-card" key={b.id}>
              <div className="task-main">
                <strong>{b.desc} · {b.id}</strong>
                <p>{findDonor(sim, b.donorId)?.name || 'Unknown donor'} · {b.category} · {b.unclaimedUnits}/{b.totalUnits} unclaimed</p>
                <StatusBadge tone={nearExpiry(b) ? 'risk' : b.unclaimedUnits ? 'ok' : 'partial'}>{b.expireInMin}m to expiry · {b.status}</StatusBadge>
              </div>
              <div className="task-actions">
                {b.unclaimedUnits > 0 && b.expireInMin > 0 ? (
                  <>
                    <button className="btn small" onClick={() => markBatchReady(b.id)}>Ready for pickup</button>
                    <button className="btn small danger" onClick={() => withdrawBatch(b.id)}>Withdraw</button>
                  </>
                ) : <span className="hint">No open stock</span>}
              </div>
            </div>
          )) : <div className="empty">No donations listed yet.</div>}
        </div>

        <div className="panel">
          <div className="panel-head"><div><h2>Pickup readiness checklist</h2><p>Complete these checks before a rider arrives</p></div></div>
          <div className="checklist">
            {CHECKS.map(([key, label]) => (
              <label key={key}>
                <input type="checkbox" checked={checks[key]} onChange={(e) => setChecks((c) => ({ ...c, [key]: e.target.checked }))} /> {label}
              </label>
            ))}
          </div>
          <div className="notice" style={{ marginTop: 14 }}>Only untouched food and safe, in-date supplies should be listed. LastMile's simulation is not a substitute for food-safety or clinical checks.</div>
          <button className="btn primary" style={{ marginTop: 12 }} onClick={confirm}>Confirm pickup readiness</button>
        </div>
      </div>
    </Section>
  );
}
