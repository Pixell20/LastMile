import { useState } from 'react';
import { useSim } from '../../sim/store';
import { deliveryTone, findRider, findShelter } from '../../sim/selectors';
import { dispatchAll, dispatchBatchAcrossRiders, rerouteDelivery, updateDeliveryStatus } from '../../sim/actions';
import Section from '../../components/ui/Section';
import PageHead from '../../components/ui/PageHead';
import StatusBadge from '../../components/ui/StatusBadge';

const STATUS_FILTERS = ['IN_TRANSIT', 'CLAIMED', 'AT_RISK', 'DELIVERED', 'RELEASED'];

function RowActions({ d }) {
  return (
    <>
      {d.status === 'RELEASED' && <span className="hint">Released to network</span>}
      {d.status === 'DELIVERED' && <span className="hint">Delivered</span>}
      {d.status === 'AT_RISK' && <span className="hint">Resolve risk first</span>}
      {!['RELEASED', 'DELIVERED', 'AT_RISK'].includes(d.status) && (
        <button className="btn small primary" onClick={() => updateDeliveryStatus(d.id, 'DELIVERED')}>Complete</button>
      )}
      {d.status === 'AT_RISK' && <button className="btn small danger" onClick={() => rerouteDelivery(d.id)}>Reroute</button>}
    </>
  );
}

export default function Deliveries({ onNewBatch }) {
  const sim = useSim();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('priority');

  const q = query.toLowerCase();
  const list = sim.deliveries
    .filter((d) => {
      const rider = findRider(sim, d.riderId)?.name || '';
      const shelter = findShelter(sim, d.shelterId)?.name || '';
      const text = `${d.id} ${d.batchId} ${d.riderId} ${rider} ${shelter}`.toLowerCase();
      return text.includes(q) && (filter === 'all' || d.status === filter);
    })
    .sort((a, b) => {
      if (sort === 'newest') return b.id.localeCompare(a.id, undefined, { numeric: true });
      if (sort === 'units') return b.units - a.units;
      return (a.status === 'AT_RISK' ? 0 : 1) - (b.status === 'AT_RISK' ? 0 : 1) || a.deadlineMin - b.deadlineMin;
    });

  return (
    <Section id="deliveries">
      <PageHead title="Deliveries" subtitle="Track assignments, update progress, and resolve exceptions.">
        <button className="btn" onClick={dispatchAll}>⚡ Smart dispatch</button>
        <button className="btn" onClick={() => dispatchBatchAcrossRiders()}>⇉ Split batch across riders</button>
        <button className="btn primary" onClick={onNewBatch}>＋ New batch</button>
      </PageHead>

      <div className="panel table-panel">
        <div className="panel-head"><div><h2>Delivery queue</h2><p>All assignments in the current simulation</p></div></div>
        <div className="toolbar">
          <div className="search"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search ID, rider, shelter…" aria-label="Search deliveries" /></div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by status">
            <option value="all">All statuses</option>
            {STATUS_FILTERS.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort deliveries">
            <option value="priority">Sort: priority</option>
            <option value="newest">Newest first</option>
            <option value="units">Most units</option>
          </select>
        </div>
        <div className="table-scroll">
          <table>
            <thead><tr><th>ID / Batch</th><th>Rider</th><th>Destination</th><th>Units</th><th>Status</th><th>Deadline</th><th>Actions</th></tr></thead>
            <tbody>
              {list.length ? list.map((d) => (
                <tr key={d.id}>
                  <td className="primary-cell">{d.id}<div className="sub-cell">Batch: {d.batchId}</div></td>
                  <td>{findRider(sim, d.riderId)?.name ?? 'None'}</td>
                  <td>{findShelter(sim, d.shelterId)?.name ?? 'None'}</td>
                  <td><b>{d.units}</b> units</td>
                  <td><StatusBadge tone={deliveryTone(d.status)}>{d.status}</StatusBadge></td>
                  <td>{d.deadlineMin} mins</td>
                  <td><RowActions d={d} /></td>
                </tr>
              )) : <tr><td colSpan="7" className="empty">No deliveries match your filters.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </Section>
  );
}
