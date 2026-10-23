import { getState, commit, logEvent } from '../store';
import { showToast } from '../toast';
import { releaseRiderAssignments } from './riders';

/** Moves in-transit riders toward their shelter. Returns true if anyone moved. */
function moveRiders(s, stepX, stepY) {
  let moved = false;
  s.riders.forEach((r) => {
    if (r.status !== 'IN_TRANSIT') return;
    const d = s.deliveries.find((x) => x.riderId === r.id && ['IN_TRANSIT', 'AT_RISK'].includes(x.status));
    const shelter = d && s.shelters.find((x) => x.id === d.shelterId);
    if (!shelter) return;
    const dx = Math.sign(shelter.x - r.x) * Math.min(stepX, Math.abs(shelter.x - r.x));
    const dy = Math.sign(shelter.y - r.y) * Math.min(stepY, Math.abs(shelter.y - r.y));
    if (dx || dy) moved = true;
    r.x += dx;
    r.y += dy;
  });
  return moved;
}

export function togglePause() {
  const s = getState();
  s.paused = !s.paused;
  showToast(s.paused ? 'Simulation clock paused' : 'Simulation clock resumed');
  commit();
}

export function stepTime() {
  const s = getState();
  if (s.paused) {
    showToast('Resume the simulation clock before advancing time.', true);
    return;
  }
  s.timeMinutes += 5;

  s.batches.forEach((b) => {
    b.expireInMin = Math.max(0, b.expireInMin - 5);
    if (b.expireInMin === 0 && b.unclaimedUnits > 0) b.status = 'EXPIRED';
  });

  s.riders.forEach((r) => {
    if (r.status === 'UNRESPONSIVE' && s.timeMinutes - (r.heartbeatMin ?? 0) >= 15) {
      releaseRiderAssignments(r.id, 'HEARTBEAT_TIMEOUT');
    }
  });

  s.deliveries.forEach((d) => {
    if (!['IN_TRANSIT', 'AT_RISK'].includes(d.status)) return;
    d.deadlineMin = Math.max(0, d.deadlineMin - 5);
    const batch = s.batches.find((b) => b.id === d.batchId);
    if (batch && batch.expireInMin <= batch.bufferMin) {
      d.risk = true;
      d.status = 'AT_RISK';
    }
    if (d.deadlineMin <= 15 && !d.risk) {
      d.risk = true;
      d.status = 'AT_RISK';
      logEvent('SYSTEM_MONITOR', d.id, 'RISK_FLAGGED', 'Delivery deadline entered critical safety buffer.');
    }
  });

  // Simulated movement only; positions are illustrative, never real GPS.
  moveRiders(s, 10, 8);
  logEvent('CLOCK', 'SIMULATION', 'STEP', `Advanced time by +5 mins (Total: +${s.timeMinutes}m)`);
  commit();
}

/** Small visual-only movement, called every ~1.2s while the clock is running. */
export function tickMovement() {
  const s = getState();
  if (s.paused) return;
  if (moveRiders(s, 1.2, 1)) commit();
}
