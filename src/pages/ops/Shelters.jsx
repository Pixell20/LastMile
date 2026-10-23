import { useState } from 'react';
import { useSim } from '../../sim/store';
import { toggleShelter } from '../../sim/actions';
import Section from '../../components/ui/Section';
import PageHead from '../../components/ui/PageHead';
import SearchBox from '../../components/ui/SearchBox';
import StatusBadge from '../../components/ui/StatusBadge';

const tick = (v) => (v ? '✓' : '✕');

export default function Shelters() {
  const sim = useSim();
  const [query, setQuery] = useState('');
  const q = query.toLowerCase();
  const list = sim.shelters.filter((s) => `${s.name} ${s.id}`.toLowerCase().includes(q));

  return (
    <Section id="shelters">
      <PageHead title="Shelter network" subtitle="Relief camps, capacity limits, and on-site utility rules." />
      <div className="panel table-panel">
        <div className="panel-head">
          <h2>Registered shelters</h2>
          <span className="spacer" />
          <SearchBox value={query} onChange={setQuery} placeholder="Search shelter…" maxWidth={240} />
        </div>
        <div className="table-scroll">
          <table>
            <thead><tr><th>Shelter Name</th><th>Location</th><th>Demand / Cap</th><th>Utilities & Facilities</th><th>Operating Window</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {list.length ? list.map((s) => (
                <tr key={s.id}>
                  <td className="primary-cell">{s.name}</td>
                  <td>{s.location || 'Ranchi, India'}</td>
                  <td><b>{s.demandUnits}</b> / {s.capacityUnits} units</td>
                  <td>Water: {tick(s.water)} · Fuel: {tick(s.fuel)} · Cold: {tick(s.refrig)}</td>
                  <td>Open now</td>
                  <td><StatusBadge tone={s.isOpen ? 'ok' : 'risk'}>{s.isOpen ? 'OPEN' : 'CLOSED'}</StatusBadge></td>
                  <td><button className="btn small" onClick={() => toggleShelter(s.id)}>{s.isOpen ? 'Close Camp' : 'Open Camp'}</button></td>
                </tr>
              )) : <tr><td colSpan="7" className="empty">No shelters match your search.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </Section>
  );
}
