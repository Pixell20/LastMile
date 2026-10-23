import { getState, commit, logEvent } from '../store';
import { showToast } from '../toast';

/**
 * form: { donor, location, category, units, desc, expiryHours, bufferMin }
 * Returns true when the batch was created.
 */
export function createBatch(form) {
  const s = getState();
  const units = parseInt(form.units, 10);
  const expiryHours = parseFloat(form.expiryHours);
  const bufferMin = Number(form.bufferMin);

  if (!Number.isFinite(units) || units < 1 || !Number.isFinite(expiryHours) || expiryHours <= 0 || !Number.isFinite(bufferMin) || bufferMin < 0 || expiryHours * 60 <= bufferMin) {
    showToast('Enter valid units and an expiry window greater than the safety buffer.', true);
    return false;
  }

  let id;
  do {
    id = `b${Math.floor(100 + Math.random() * 900)}`;
  } while (s.batches.some((b) => b.id === id));

  const donorName = form.donor.trim();
  const location = form.location.trim();
  let donor = s.donors.find((d) => d.name.toLowerCase() === donorName.toLowerCase());
  if (!donor) {
    donor = {
      id: `d${s.donors.length + 1}`,
      name: donorName,
      location,
      type: form.category === 'MEDICAL_COLD_CHAIN' ? 'PHARMACY' : 'RESTAURANT',
      x: 70 + ((s.donors.length * 83) % 500),
      y: 70 + ((s.donors.length * 47) % 220),
    };
    s.donors.push(donor);
  } else {
    donor.location = location;
  }

  s.batches.push({
    id,
    donorId: donor.id,
    category: form.category,
    desc: form.desc,
    totalUnits: units,
    unclaimedUnits: units,
    readyInMin: 0,
    expireInMin: Math.round(expiryHours * 60),
    bufferMin,
    status: 'AVAILABLE',
  });

  logEvent('DONOR', id, 'BATCH_CREATED', `Created new surplus batch: ${form.desc} (${units} units)`);
  showToast(`Surplus batch ${id} broadcast successfully!`);
  commit();
  return true;
}

export function markBatchReady(id) {
  const batch = getState().batches.find((b) => b.id === id);
  if (!batch || !batch.unclaimedUnits || !batch.expireInMin) {
    showToast('This batch is no longer available.', true);
    return;
  }
  batch.readyInMin = 0;
  logEvent('VENDOR', id, 'PICKUP_READY', 'Vendor confirmed batch packed and ready for collection.');
  showToast(`${id} marked ready for pickup`);
  commit();
}

export function withdrawBatch(id) {
  const batch = getState().batches.find((b) => b.id === id);
  if (!batch || batch.unclaimedUnits <= 0) {
    showToast('No unclaimed stock remains to withdraw.', true);
    return;
  }
  batch.status = 'WITHDRAWN';
  batch.unclaimedUnits = 0;
  logEvent('VENDOR', id, 'BATCH_WITHDRAWN', 'Vendor withdrew remaining unclaimed units from matching.');
  showToast(`${id} withdrawn from matching`);
  commit();
}

export function confirmVendorReady() {
  logEvent('VENDOR', 'PICKUP_DESK', 'READINESS_CONFIRMED', 'Vendor confirmed packing, sealing and handover contact.');
  showToast('Pickup readiness confirmed.');
  commit();
}
