import { useSim } from '../../sim/store';
import { deliveryTone, findRider, findShelter } from '../../sim/selectors';
import { exportSnapshot } from '../../utils/exportSnapshot';
import Section from '../../components/ui/Section';
import PageHead from '../../components/ui/PageHead';
import Kpi from '../../components/ui/Kpi';
import StatusBadge from '../../components/ui/StatusBadge';
import NetworkMap from '../../components/map/NetworkMap';

export default function Overview({ onNavigate, onNewBatch }) {
  const sim = useSim();
  const open = sim.deliveries.filter((d) => d.status !== 'DELIVERED').length;
  const moving = sim.deliveries.filter((d) => d.status === 'IN_TRANSIT').length;
  const risk = sim.deliveries.filter((d) => d.status === 'AT_RISK').length;
  const delivered = sim.deliveries.filter((d) => d.status === 'DELIVERED').reduce((sum, d) => sum + d.units, 0);
  const ready = sim.riders.filter((r) => r.status === 'AVAILABLE').length;

  return (
    <Section id="overview">
      <PageHead title="Operations overview" subtitle="Here's what's happening across your last-mile network.">
        <button className="btn" onClick={() => exportSnapshot(sim)}>⇩ Export data</button>
        <button className="btn primary" onClick={onNewBatch}>＋ New batch</button>
      </PageHead>

      <div className="kpis">
        <Kpi label="Open deliveries" icon="⇢" value={open} foot={<><span className="up">{moving} moving</span> · in your network</>} />
        <Kpi label="Units delivered" icon="✓" value={delivered} foot="Successfully handed over" />
        <Kpi label="Available riders" icon="♙" value={`${ready}/${sim.riders.length}`} foot="Riders marked ready" />
        <Kpi label="At-risk deliveries" icon="⚠" value={risk} foot="Needs dispatcher attention" />
      </div>

      <div className="grid-main">
        <div className="panel">
          <div className="panel-head">
            <div><h2>Network activity</h2><p>Illustrative route view · Ranchi</p></div>
            <span className="spacer" />
            <span className="status ok"><i className="dot" />Live demo</span>
          </div>
          <NetworkMap />
          <div className="map-legend">
            <span className="legend-item"><i className="legend-dot" style={{ background: '#2d7a57' }} />Donor</span>
            <span className="legend-item"><i className="legend-dot" style={{ background: '#d89c20' }} />Rider</span>
            <span className="legend-item"><i className="legend-dot" style={{ background: '#447bc4' }} />Shelter</span>
            <span className="legend-item">ⓘ Illustrative positions, not GPS</span>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div><h2>Latest activity</h2><p>Recent events from the network</p></div>
            <span className="spacer" />
            <button className="btn small" onClick={() => onNavigate('activity')}>View all ↗</button>
          </div>
          <div className="feed">
            {sim.logs.slice(0, 4).map((l, i) => (
              <div className="feed-item" key={i}>
                <div className="feed-icon">↗</div>
                <div>
                  <strong>[{l.actor}] {l.event}</strong>
                  <p>{l.desc}</p>
                  <time>{l.time}</time>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel table-panel">
        <div className="panel-head">
          <div><h2>Priority deliveries</h2><p>Keep an eye on the deliveries that need you most.</p></div>
          <span className="spacer" />
          <button className="btn small" onClick={() => onNavigate('deliveries')}>All deliveries →</button>
        </div>
        <div className="table-scroll">
          <table>
            <thead><tr><th>Delivery</th><th>Rider → Shelter</th><th>Units</th><th>Status</th><th>Deadline</th><th>Action</th></tr></thead>
            <tbody>
              {sim.deliveries.slice(0, 3).map((d) => (
                <tr key={d.id}>
                  <td className="primary-cell">{d.id}</td>
                  <td>{findRider(sim, d.riderId)?.name || 'Unassigned'} → {findShelter(sim, d.shelterId)?.name || 'Unassigned'}</td>
                  <td>{d.units} units</td>
                  <td><StatusBadge tone={deliveryTone(d.status)}>{d.status}</StatusBadge></td>
                  <td>{d.deadlineMin} mins left</td>
                  <td><button className="btn small" onClick={() => onNavigate('deliveries')}>Manage</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Section>
  );
}
