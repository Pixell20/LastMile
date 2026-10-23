import { getState, commit, logEvent } from '../store';
import { showToast } from '../toast';
import { canHandOver, riderCanCarry, shelterAccepts, shelterHasFacilities } from '../rules';

export function updateDeliveryStatus(id, newStatus) {
  const s = getState();
  const d = s.deliveries.find((x) => x.id === id);
  if (!d || d.status === 'DELIVERED' || newStatus !== 'DELIVERED') return;

  const batch = s.batches.find((b) => b.id === d.batchId);
  const rider = s.riders.find((r) => r.id === d.riderId);
  const shelter = s.shelters.find((sh) => sh.id === d.shelterId);
  if (!canHandOver(d, batch, rider, shelter)) {
    showToast('Handover blocked: destination or cargo no longer passes safety checks. Reroute first.', true);
    return;
  }

  d.status = newStatus;
  rider.currentLoad = Math.max(0, rider.currentLoad - d.units);
  if (rider.currentLoad === 0) rider.status = 'AVAILABLE';
  logEvent('RIDER', id, 'STATUS_UPDATE', `Updated status to ${newStatus}`);
  showToast(`Delivery ${id} marked as ${newStatus}`);
  commit();
}

export function rerouteDelivery(id) {
  const s = getState();
  const d = s.deliveries.find((x) => x.id === id);
  if (!d) return;
  const batch = s.batches.find((b) => b.id === d.batchId);
  const rider = s.riders.find((r) => r.id === d.riderId);
  if (!batch || !rider) return;

  const target = s.shelters.find(
    (sh) =>
      sh.id !== d.shelterId &&
      sh.isOpen &&
      sh.demandUnits >= d.units &&
      sh.capacityUnits >= d.units &&
      shelterAccepts(sh, batch.category) &&
      shelterHasFacilities(sh, batch.category) &&
      riderCanCarry(rider, batch.category),
  );
  if (!target) {
    showToast('No safe fallback shelter has sufficient demand/capacity and required facilities.', true);
    return;
  }

  const old = s.shelters.find((sh) => sh.id === d.shelterId);
  if (old) {
    if (old.isOpen && old.demandUnits > 0) old.demandUnits += d.units;
    if (old.isOpen) old.capacityUnits += d.units;
  }
  target.demandUnits -= d.units;
  target.capacityUnits -= d.units;
  d.shelterId = target.id;
  d.status = 'IN_TRANSIT';
  d.risk = false;
  d.deadlineMin = Math.max(0, Math.min(d.deadlineMin, batch.expireInMin - batch.bufferMin));

  logEvent('DISPATCHER', id, 'REROUTED', `Rerouted to ${target.name} after compatibility and capacity checks.`);
  showToast(`Rerouted ${id} to ${target.name}`);
  commit();
}

function flag(d) {
  d.status = 'AT_RISK';
  d.risk = true;
}

export function reportDeliveryIssue(id) {
  const d = getState().deliveries.find((x) => x.id === id);
  if (!d) return;
  flag(d);
  logEvent('RIDER', id, 'ISSUE_REPORTED', 'Rider reported an issue; delivery requires dispatcher review.');
  showToast('Issue reported; delivery flagged for recovery.', true);
  commit();
}

export function rejectIncoming(id) {
  const d = getState().deliveries.find((x) => x.id === id);
  if (!d) return;
  flag(d);
  logEvent('SHELTER', id, 'DELIVERY_REJECTED', 'Receiving shelter rejected incoming cargo; reroute is required.');
  showToast('Delivery flagged for safe rerouting.', true);
  commit();
}
