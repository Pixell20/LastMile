// Safety and compatibility rules. Every place that matches cargo to a rider or
// shelter goes through these helpers, so a rule only needs fixing once.

export const MEDICAL = 'MEDICAL_COLD_CHAIN';
export const INFANT = 'INFANT_FORMULA';
export const RAW = 'RAW_RATION';

export const ACTIVE_STATUSES = ['IN_TRANSIT', 'AT_RISK', 'CLAIMED'];

export const shelterAccepts = (shelter, category) =>
  shelter.accepts.split(', ').includes(category);

/** Does the shelter have the facilities this category needs? */
export function shelterHasFacilities(shelter, category) {
  if (category === MEDICAL) return shelter.refrig;
  if (category === INFANT) return shelter.water;
  if (category === RAW) return shelter.water && shelter.fuel;
  return true;
}

export const riderCanCarry = (rider, category) =>
  category !== MEDICAL || rider.hasColdBox;

/** Open, has demand and room, accepts the category and has the facilities. */
export const shelterCanReceive = (shelter, category) =>
  shelter.isOpen &&
  shelter.demandUnits > 0 &&
  shelter.capacityUnits > 0 &&
  shelterAccepts(shelter, category) &&
  shelterHasFacilities(shelter, category);

/** Final check before a rider may hand cargo over. */
export function canHandOver(delivery, batch, rider, shelter) {
  if (!batch || !rider || !shelter || !shelter.isOpen) return false;
  if (delivery.status === 'RELEASED' || delivery.status === 'AT_RISK') return false;
  if (batch.expireInMin <= 0) return false;
  return riderCanCarry(rider, batch.category) && shelterHasFacilities(shelter, batch.category);
}
