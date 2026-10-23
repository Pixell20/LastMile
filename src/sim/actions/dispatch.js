import { getState, commit, logEvent } from '../store';
import { showToast } from '../toast';
import { riderCanCarry, shelterCanReceive } from '../rules';

const isDispatchable = (b) => b.unclaimedUnits > 0 && b.expireInMin > b.bufferMin && b.status !== 'EXPIRED';
const mostUrgent = (s) => s.batches.filter(isDispatchable).sort((a, b) => a.expireInMin - b.expireInMin)[0];

const pickRider = (s, batch) =>
  s.riders
    .filter((r) => r.status === 'AVAILABLE' && r.capacity - r.currentLoad > 0 && riderCanCarry(r, batch.category))
    .sort((a, b) => b.capacity - b.currentLoad - (a.capacity - a.currentLoad))[0];

const pickShelter = (s, batch) =>
  s.shelters.filter((sh) => shelterCanReceive(sh, batch.category)).sort((a, b) => b.demandUnits - a.demandUnits)[0];

function nextDeliveryId(s) {
  const numbers = s.deliveries.map((d) => Number((d.id.match(/(\d+)$/) || [])[1] || 100));
  return `del-${Math.max(100, ...numbers) + 1}`;
}

/** Creates one delivery for the best available rider and shelter, or returns null. */
function assignOne(s, batch) {
  const rider = pickRider(s, batch);
  const shelter = pickShelter(s, batch);
  if (!rider || !shelter) return null;
  const units = Math.min(batch.unclaimedUnits, rider.capacity - rider.currentLoad, shelter.demandUnits, shelter.capacityUnits);
  if (units <= 0) return null;

  batch.unclaimedUnits -= units;
  batch.status = batch.unclaimedUnits === 0 ? 'FULLY_CLAIMED' : 'PARTIALLY_CLAIMED';
  rider.currentLoad += units;
  rider.status = 'IN_TRANSIT';
  rider.heartbeatMin = s.timeMinutes;
  shelter.demandUnits -= units;
  shelter.capacityUnits -= units;

  const delivery = {
    id: nextDeliveryId(s),
    batchId: batch.id,
    riderId: rider.id,
    shelterId: shelter.id,
    units,
    status: 'IN_TRANSIT',
    deadlineMin: Math.max(0, batch.expireInMin - batch.bufferMin),
    risk: false,
    createdAtMin: s.timeMinutes,
  };
  s.deliveries.push(delivery);
  return { delivery, rider, shelter, units };
}

/** "Smart dispatch": one safe match for the most urgent batch. */
export function dispatchAll() {
  const s = getState();
  const batch = mostUrgent(s);
  if (!batch) {
    showToast('No unexpired batch has enough time beyond its safety buffer.', true);
    return;
  }
  const match = assignOne(s, batch);
  if (!match) {
    showToast('No safe match. Check demand, capacity, shelter acceptance, clean water/fuel and cold-chain requirements.', true);
    logEvent('DISPATCH_ENGINE', batch.id, 'MATCH_BLOCKED', 'No feasible match due to current capacity, expiry, or compatibility constraints.');
    commit();
    return;
  }
  const { delivery, rider, shelter, units } = match;
  logEvent('AUTO_DISPATCH', delivery.id, 'MATCHED', `Matched ${units} units from ${batch.id} to ${rider.name} → ${shelter.name}; compatibility checks passed.`);
  showToast(`Created safe match ${delivery.id} · ${units} units`);
  commit();
}

/** Splits one batch across as many riders as needed (max 20 assignments). */
export function dispatchBatchAcrossRiders(batchId = null) {
  const s = getState();
  const batch = batchId ? s.batches.find((b) => b.id === batchId) : mostUrgent(s);
  if (!batch || batch.unclaimedUnits <= 0 || batch.expireInMin <= batch.bufferMin) {
    showToast('No dispatchable units remain beyond the safety buffer.', true);
    return;
  }

  let created = 0;
  let unitsTotal = 0;
  while (batch.unclaimedUnits > 0 && batch.expireInMin > batch.bufferMin && created < 20) {
    const match = assignOne(s, batch);
    if (!match) break;
    logEvent('AUTO_DISPATCH', match.delivery.id, 'SPLIT_MATCH_CREATED', `Split ${batch.id}: ${match.units} units assigned to ${match.rider.name} for ${match.shelter.name}.`);
    created++;
    unitsTotal += match.units;
  }

  if (created) {
    showToast(`Split ${batch.id} into ${created} rider assignment(s) · ${unitsTotal} units`);
    commit();
  } else {
    showToast('No safe split possible. Check rider capacity, expiry, shelter demand and compatibility.', true);
  }
}
