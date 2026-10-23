import { useState } from 'react';
import { useSim } from '../../sim/store';
import { dispatchBatchAcrossRiders } from '../../sim/actions';
import Section from '../../components/ui/Section';
import PageHead from '../../components/ui/PageHead';
import SearchBox from '../../components/ui/SearchBox';
import StatusBadge from '../../components/ui/StatusBadge';

export default function Batches({ onNewBatch }) {
  const sim = useSim();
  const [query, setQuery] = useState('');
  const q = query.toLowerCase();
  const list = sim.batches.filter((b) => `${b.id} ${b.desc} ${b.category}`.toLowerCase().includes(q));

  return (
    <Section id="batches">
      <PageHead title="Food & supplies" subtitle="Manage donated goods, quantities, readiness and expiry windows.">
        <button className="btn primary" onClick={onNewBatch}>＋ Create batch</button>
      </PageHead>
      <div className="notice">Safety first: expired goods must not be delivered. This demo highlights expiry risk but does not validate real food or medical safety requirements.</div>
      <div className="panel table-panel">
        <div className="panel-head">
          <h2>Donation batches</h2>
          <span className="spacer" />
          <SearchBox value={query} onChange={setQuery} placeholder="Search batches…" maxWidth={280} />
        </div>
        <div className="table-scroll">
          <table>
            <thead><tr><th>Batch ID / Donor</th><th>Category</th><th>Units</th><th>Expiry Window</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {list.length ? list.map((b) => (
                <tr key={b.id}>
                  <td className="primary-cell">{b.id}<div className="sub-cell">{b.desc}</div></td>
                  <td><StatusBadge>{b.category}</StatusBadge></td>
                  <td><b>{b.unclaimedUnits}</b> / {b.totalUnits} left</td>
                  <td>{b.expireInMin} mins</td>
                  <td><StatusBadge tone={b.status === 'AVAILABLE' ? 'ok' : 'partial'}>{b.status}</StatusBadge></td>
                  <td><button className="btn small" onClick={() => dispatchBatchAcrossRiders(b.id)}>Split / match</button></td>
                </tr>
              )) : <tr><td colSpan="6" className="empty">No batches match your search.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </Section>
  );
}
