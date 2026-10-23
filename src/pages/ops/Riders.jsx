import { useState } from 'react';
import { useSim } from '../../sim/store';
import { breakdownRider, repairRider } from '../../sim/actions';
import Section from '../../components/ui/Section';
import PageHead from '../../components/ui/PageHead';
import SearchBox from '../../components/ui/SearchBox';
import StatusBadge from '../../components/ui/StatusBadge';

const riderTone = (status) => (status === 'AVAILABLE' ? 'ok' : status === 'BREAKDOWN' ? 'risk' : 'transit');

export default function Riders() {
  const sim = useSim();
  const [query, setQuery] = useState('');
  const q = query.toLowerCase();
  const list = sim.riders.filter((r) => `${r.name} ${r.status}`.toLowerCase().includes(q));

  const load = sim.riders.reduce((sum, r) => sum + r.currentLoad, 0);
  const capacity = sim.riders.reduce((sum, r) => sum + r.capacity, 0);
  const pct = capacity ? Math.round((load / capacity) * 100) : 0;

  return (
    <Section id="riders">
      <PageHead title="Rider fleet" subtitle="Volunteer two-wheeler couriers, vehicle specs, and live statuses." />
      <div className="two-col">
        <div className="panel">
          <div className="panel-head">
            <h2>Active riders</h2>
            <span className="spacer" />
            <SearchBox value={query} onChange={setQuery} placeholder="Search rider…" maxWidth={200} />
          </div>
          {list.length ? list.map((r) => (
            <div className="rider-card" key={r.id}>
              <div className="avatar">{r.name[0]}</div>
              <div className="rider-info">
                <strong>{r.name}</strong>
                <small>Capacity: {r.currentLoad}/{r.capacity} units · Cold box: {r.hasColdBox ? 'Yes' : 'No'}</small>
              </div>
              <div className="rider-actions">
                <StatusBadge tone={riderTone(r.status)}>{r.status}</StatusBadge>
                {r.status === 'BREAKDOWN'
                  ? <button className="btn small" onClick={() => repairRider(r.id)}>Clear Breakdown</button>
                  : <button className="btn small danger" onClick={() => breakdownRider(r.id)}>Breakdown</button>}
              </div>
            </div>
          )) : <div className="empty">No riders match your search.</div>}
        </div>

        <div className="panel">
          <div className="panel-head"><h2>Fleet readiness & capacity</h2></div>
          <p className="hint">Ensure riders assigned to medical cold chain shipments have cold box equipment enabled.</p>
          <div style={{ marginTop: 15 }}>
            <div className="ai-coverage-row">
              <div>
                <strong>Total Fleet Active Load Capacity</strong>
                <small>{load} of {capacity} units currently allocated</small>
                <div className="progress"><i style={{ width: `${pct}%` }} /></div>
              </div>
              <div className="pct">{pct}%</div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
