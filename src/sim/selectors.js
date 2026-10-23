// Small read-only helpers that work on a simulation snapshot.
import { ACTIVE_STATUSES } from './rules';

export const findRider = (sim, id) => sim.riders.find((r) => r.id === id);
export const findShelter = (sim, id) => sim.shelters.find((s) => s.id === id);
export const findBatch = (sim, id) => sim.batches.find((b) => b.id === id);
export const findDonor = (sim, id) => sim.donors.find((d) => d.id === id);

export const openDeliveries = (sim) => sim.deliveries.filter((d) => d.status !== 'DELIVERED');
export const riskyDeliveries = (sim) => sim.deliveries.filter((d) => d.status === 'AT_RISK' || d.risk);
export const availableRiders = (sim) => sim.riders.filter((r) => r.status === 'AVAILABLE');
export const activeDeliveriesFor = (sim, riderId) =>
  sim.deliveries.filter((d) => d.riderId === riderId && ACTIVE_STATUSES.includes(d.status));

/** Visual tone of a delivery status badge. */
export const deliveryTone = (status) =>
  status === 'AT_RISK' ? 'risk' : status === 'DELIVERED' ? 'ok' : 'transit';
