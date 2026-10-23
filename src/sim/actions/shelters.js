import { getState, commit, logEvent } from '../store';
import { showToast } from '../toast';

const flagIncoming = (s, shelterId) =>
  s.deliveries
    .filter((d) => d.shelterId === shelterId && ['IN_TRANSIT', 'AT_RISK'].includes(d.status))
    .forEach((d) => {
      d.risk = true;
      d.status = 'AT_RISK';
    });

export function toggleShelter(id) {
  const s = getState();
  const shelter = s.shelters.find((x) => x.id === id);
  if (!shelter) return;
  shelter.isOpen = !shelter.isOpen;
  shelter.status = shelter.isOpen ? 'OPEN' : 'CLOSED';
  if (!shelter.isOpen) {
    flagIncoming(s, id);
    logEvent('SHELTER_MGR', id, 'SHELTER_CLOSED', `Closed ${shelter.name}; incoming cargo flagged for recovery.`);
  } else {
    logEvent('SHELTER_MGR', id, 'SHELTER_OPENED', `Reopened ${shelter.name}.`);
  }
  showToast(`Shelter ${shelter.name} is now ${shelter.status}${shelter.isOpen ? '' : ' · incoming deliveries flagged'}`);
  commit();
}

/** form: { demandUnits, capacityUnits, water, fuel, refrig, isOpen } */
export function saveShelterProfile(id, form) {
  const s = getState();
  const shelter = s.shelters.find((x) => x.id === id);
  if (!shelter) return;
  shelter.demandUnits = Math.max(0, Number(form.demandUnits) || 0);
  shelter.capacityUnits = Math.max(0, Number(form.capacityUnits) || 0);
  shelter.water = form.water;
  shelter.fuel = form.fuel;
  shelter.refrig = form.refrig;
  shelter.isOpen = form.isOpen;
  shelter.status = shelter.isOpen ? 'OPEN' : 'CLOSED';

  if (!shelter.isOpen || shelter.demandUnits === 0 || shelter.capacityUnits === 0) flagIncoming(s, id);

  if (!shelter.isOpen) logEvent('SHELTER_MGR', id, 'SHELTER_CLOSED', 'Shelter is closed to new deliveries; incoming cargo flagged.');
  else logEvent('SHELTER_MGR', id, 'PROFILE_UPDATED', `Updated demand, capacity, facilities and open status for ${shelter.name}.`);
  showToast('Shelter profile saved. Review any incoming at-risk deliveries.');
  commit();
}

export function simulateDirectDonation(id) {
  const s = getState();
  const shelter = s.shelters.find((x) => x.id === id);
  if (!shelter) return;
  const amount = Math.min(shelter.demandUnits, Math.max(1, Math.ceil(shelter.demandUnits / 2)));
  shelter.demandUnits = Math.max(0, shelter.demandUnits - amount);
  shelter.capacityUnits = Math.max(0, shelter.capacityUnits - amount);
  if (shelter.demandUnits === 0) flagIncoming(s, id);
  logEvent('SHELTER', 'DIRECT_DONATION', 'DEMAND_REDUCED', `Direct donation supplied ${amount} units to ${shelter.name}; remaining demand ${shelter.demandUnits}. Incoming deliveries reviewed.`);
  showToast(`Recorded ${amount} direct-donation units; demand is now ${shelter.demandUnits}.`);
  commit();
}
