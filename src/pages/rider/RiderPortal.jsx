import { useState } from 'react';
import { useSim } from '../../sim/store';
import { activeDeliveriesFor, findBatch, findRider, findShelter } from '../../sim/selectors';
import { rerouteDelivery, reportDeliveryIssue, sendHeartbeat, simulateGhostReservation, updateDeliveryStatus } from '../../sim/actions';
import { useSession } from '../../state/SessionContext';
import Section from '../../components/ui/Section';
import PageHead from '../../components/ui/PageHead';
import Kpi from '../../components/ui/Kpi';
import StatusBadge from '../../components/ui/StatusBadge';

/** Rider point of view: one rider's cargo, safety checks and heartbeat. */
export default function RiderPortal() {
  const sim = useSim();
  const { sessions, signOut } = useSession();
  const [riderId, setRiderId] = useState(sim.riders[0]?.id);
  const rider = findRider(sim, riderId) || sim.riders[0];
  if (!rider) return null;

  const tasks = sim.deliveries.filter((d) => d.riderId === rider.id && d.status !== 'DELIVERED' && d.status !== 'RELEASED');
  const openTasks = activeDeliveriesFor(sim, rider.id).length;

  return (
    <Section id="riderPortal">
      <PageHead
        title="Rider portal"
        subtitle="Signed-in volunteer workspace: assigned cargo, capacity, safety checks, heartbeat and recovery."
        note={`Signed in as ${sessions.rider?.email} · demo role`}
      >
        <button className="btn" onClick={() => sendHeartbeat(rider.id)}>♥ Send heartbeat</button>
        <button className="btn danger" onClick={() => simulateGhostReservation(rider.id)}>Simulate unresponsive rider</button>
        <button className="btn" onClick={signOut}>↪ Sign out</button>
      </PageHead>

      <div className="panel">
        <div className="form-grid">
          <div className="field">
            <label htmlFor="riderProfile">Rider profile</label>
            <select id="riderProfile" value={rider.id} onChange={(e) => setRiderId(e.target.value)}>
              {sim.riders.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Current status</label>
            <div className="notice"><strong>{rider.status}</strong> · reliability {rider.reliability}% · map position is simulated</div>
          </div>
        </div>

        <div className="kpis" style={{ marginTop: 14 }}>
          <Kpi label="Cargo load" icon="▣" value={`${rider.currentLoad}/${rider.capacity}`} foot="Units against rider capacity" />
          <Kpi label="Open tasks" icon="⇢" value={openTasks} foot="Assigned deliveries" />
          <Kpi label="Cold-chain ready" icon="❄" value={rider.hasColdBox ? 'Yes' : 'No'} foot="Required for medical cold-chain" />
          <Kpi label="Heartbeat" icon="♥" value={`+${Math.max(0, sim.timeMinutes - (rider.heartbeatMin ?? 0))}m ago`} foot="Last response in sim time" />
        </div>

        <div className="panel-head"><div><h2>My delivery tasks</h2><p>Mark pickup/delivery progress; safety constraints remain enforced.</p></div></div>
        {tasks.length ? tasks.map((d) => {
          const batch = findBatch(sim, d.batchId);
          const shelter = findShelter(sim, d.shelterId);
          const atRisk = d.status === 'AT_RISK';
          return (
            <div className="task-card" key={d.id}>
              <div className="task-main">
                <strong>{d.id} · {d.units} units</strong>
                <p>{batch?.desc || d.batchId} → {shelter?.name || 'Destination unavailable'}</p>
                <StatusBadge tone={atRisk ? 'risk' : 'transit'}>{d.status} · {d.deadlineMin}m safety window</StatusBadge>
              </div>
              <div className="task-actions">
                {atRisk
                  ? <button className="btn small danger" onClick={() => rerouteDelivery(d.id)}>Find safe fallback</button>
                  : <button className="btn small primary" onClick={() => updateDeliveryStatus(d.id, 'DELIVERED')}>Confirm handover</button>}
                <button className="btn small" onClick={() => reportDeliveryIssue(d.id)}>Report issue</button>
              </div>
            </div>
          );
        }) : <div className="empty">No active tasks for this rider. Ready riders can be matched by the operations lead.</div>}
      </div>
    </Section>
  );
}
