import { availableRiders, findBatch, findRider, findShelter, openDeliveries, riskyDeliveries } from '../sim/selectors';

export const BRIEF_QUESTION =
  'Generate a structured shift handover brief covering active deliveries, at-risk items, available riders, and priority action items.';

/** Asks the optional backend. Throws when it is missing or returns an error. */
export async function askBackend(question, sim) {
  const res = await fetch('/api/copilot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, snapshot: sim }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Copilot service unavailable');
  return data.answer || '';
}

/** Rule-based fallback used when the backend is not available. */
export function localCopilotAnswer(question, sim) {
  const q = question.toLowerCase();
  const risky = riskyDeliveries(sim);
  const available = availableRiders(sim);
  const coldViolations = sim.deliveries.filter((d) => {
    const batch = findBatch(sim, d.batchId);
    const rider = findRider(sim, d.riderId);
    const shelter = findShelter(sim, d.shelterId);
    return batch?.category === 'MEDICAL_COLD_CHAIN' && (!rider?.hasColdBox || !shelter?.refrig);
  });

  if (q.includes('risk') || q.includes('attention')) {
    return risky.length
      ? `At-risk deliveries: ${risky.map((d) => `${d.id} (${d.units} units, ${d.deadlineMin} minutes remaining)`).join('; ')}. Check rider status and reroute only to a shelter that accepts the batch and has the required facilities.`
      : 'No deliveries are currently flagged at risk.';
  }
  if (q.includes('rider') || q.includes('available') || q.includes('unassigned')) {
    return available.length
      ? `Available riders: ${available.map((r) => `${r.name} (${r.capacity - r.currentLoad} capacity remaining${r.hasColdBox ? ', cold box equipped' : ''})`).join('; ')}.`
      : 'There are no riders currently marked available.';
  }
  if (q.includes('cold') || q.includes('dependency') || q.includes('violation')) {
    return coldViolations.length
      ? `Cold-chain warnings: ${coldViolations.map((d) => `${d.id} has a missing rider cold box or destination refrigeration`).join('; ')}. Do not dispatch until requirements are satisfied.`
      : 'No cold-chain equipment/facility violations were detected in active deliveries.';
  }
  const waiting = sim.batches.filter((b) => b.unclaimedUnits > 0 && b.expireInMin > 0).length;
  return `Network snapshot: ${sim.deliveries.length} deliveries (${openDeliveries(sim).length} open), ${risky.length} at risk, ${available.length} riders available, and ${waiting} batches with unclaimed goods and time remaining. ${risky.length ? 'Prioritize at-risk deliveries first.' : 'Continue monitoring expiry windows and rider capacity.'}`;
}

export function buildLocalBrief(sim) {
  const risky = riskyDeliveries(sim);
  const available = availableRiders(sim);
  const open = openDeliveries(sim);
  const actions = risky.length
    ? risky.map((d) => `• Investigate ${d.id}; confirm rider availability and destination feasibility.`).join('\n')
    : '• Continue monitoring deadlines and expiry windows.';

  return `SHIFT HANDOVER · +${sim.timeMinutes} minutes in simulation

Open deliveries: ${open.length}
At-risk deliveries: ${risky.length ? risky.map((d) => `${d.id} (${d.deadlineMin} min remaining)`).join(', ') : 'None flagged'}
Available riders: ${available.length ? available.map((r) => r.name).join(', ') : 'None'}

Priority actions:
${actions}
• Do not dispatch expired batches or bypass cold-chain requirements.
• Confirm shelter demand and capacity before assigning additional goods.

Generated from the current local simulation snapshot.`;
}
