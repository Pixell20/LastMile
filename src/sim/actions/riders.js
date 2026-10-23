import { getState, commit, logEvent } from '../store';
import { showToast } from '../toast';
import { ACTIVE_STATUSES } from '../rules';

/**
 * Returns a rider's cargo to the network (used after a heartbeat timeout or a
 * repair). Does not commit; the caller does.
 */
export function releaseRiderAssignments(riderId, reason = 'MANUAL_RELEASE') {
  const s = getState();
  const rider = s.riders.find((r) => r.id === riderId);
  if (!rider) return;
  let released = 0;

  s.deliveries
    .filter((d) => d.riderId === riderId && ACTIVE_STATUSES.includes(d.status))
    .forEach((d) => {
      const batch = s.batches.find((b) => b.id === d.batchId);
      const shelter = s.shelters.find((sh) => sh.id === d.shelterId);
      if (batch && batch.expireInMin > batch.bufferMin) {
        batch.unclaimedUnits += d.units;
        batch.status = 'PARTIALLY_CLAIMED';
      } else if (batch) {
        batch.status = 'EXPIRED';
      }
      if (shelter) {
        if (shelter.isOpen && shelter.demandUnits > 0) shelter.demandUnits += d.units;
        if (shelter.isOpen) shelter.capacityUnits += d.units;
      }
      d.status = 'RELEASED';
      d.risk = false;
      released += d.units;
    });

  rider.currentLoad = 0;
  rider.status = 'AVAILABLE';
  logEvent('SYSTEM_RECOVERY', riderId, reason, `Released ${released} assigned units and returned feasible stock to matching after rider heartbeat timeout.`);
  if (released) showToast(`${released} units released back to the network`);
}

export function breakdownRider(id) {
  const s = getState();
  const rider = s.riders.find((r) => r.id === id);
  if (!rider) return;
  rider.status = 'BREAKDOWN';
  s.deliveries.filter((d) => d.riderId === id).forEach((d) => {
    d.status = 'AT_RISK';
    d.risk = true;
  });
  logEvent('SIMULATOR', id, 'BREAKDOWN_INJECTED', `Injected vehicle breakdown for ${rider.name}`);
  showToast(`Breakdown reported for ${rider.name}`, true);
  commit();
}

export function repairRider(id) {
  const s = getState();
  const rider = s.riders.find((r) => r.id === id);
  if (!rider) return;
  releaseRiderAssignments(id, 'RECOVERY_RELEASE');
  rider.status = 'AVAILABLE';
  rider.currentLoad = 0;
  logEvent('SIMULATOR', id, 'REPAIRED', `Rider ${rider.name} back in service; any active cargo was returned to safe matching.`);
  showToast(`${rider.name} is back online`);
  commit();
}

export function sendHeartbeat(riderId) {
  const s = getState();
  const rider = s.riders.find((r) => r.id === riderId);
  if (!rider) return;
  rider.heartbeatMin = s.timeMinutes;
  if (rider.status === 'UNRESPONSIVE') rider.status = rider.currentLoad ? 'IN_TRANSIT' : 'AVAILABLE';
  logEvent('RIDER', rider.id, 'HEARTBEAT_RECEIVED', `${rider.name} sent a heartbeat at simulation +${s.timeMinutes}m.`);
  showToast('Heartbeat received');
  commit();
}

export function simulateGhostReservation(riderId) {
  const s = getState();
  const rider = s.riders.find((r) => r.id === riderId);
  if (!rider) return;
  rider.status = 'UNRESPONSIVE';
  rider.heartbeatMin = s.timeMinutes;
  logEvent('SYSTEM_MONITOR', rider.id, 'HEARTBEAT_MISSED', `${rider.name} marked unresponsive; assignments will be released after the timeout.`);
  showToast(`${rider.name} marked unresponsive. Advance time 3 times to trigger recovery.`, true);
  commit();
}
