// Starting data for the simulation. Edit this file to change the demo scenario.
export function createInitialState() {
  return {
    timeMinutes: 0,
    paused: false,
    donors: [
      { id: 'd1', name: 'Morabadi Community Kitchen', location: 'Morabadi, Ranchi', type: 'RESTAURANT', x: 85, y: 245 },
      { id: 'd2', name: 'Metro Pharmacy Main Road', location: 'Main Road, Ranchi', type: 'PHARMACY', x: 280, y: 120 },
    ],
    batches: [
      { id: 'b101', donorId: 'd1', category: 'COOKED_FOOD', desc: '120 Rice & Curry Packets', totalUnits: 120, unclaimedUnits: 40, readyInMin: 0, expireInMin: 75, bufferMin: 15, status: 'PARTIALLY_CLAIMED' },
      { id: 'b102', donorId: 'd2', category: 'MEDICAL_COLD_CHAIN', desc: '20 Vials Insulin', totalUnits: 20, unclaimedUnits: 0, readyInMin: 0, expireInMin: 180, bufferMin: 20, status: 'FULLY_CLAIMED' },
    ],
    riders: [
      { id: 'r1', name: 'Aarav Kumar (Bike)', capacity: 40, currentLoad: 40, hasColdBox: false, status: 'IN_TRANSIT', reliability: 95, x: 190, y: 170 },
      { id: 'r2', name: 'Priya Sharma (Med-Rider)', capacity: 30, currentLoad: 20, hasColdBox: true, status: 'IN_TRANSIT', reliability: 98, x: 400, y: 100 },
      { id: 'r3', name: 'Rahul Singh (Scooter)', capacity: 40, currentLoad: 0, hasColdBox: false, status: 'AVAILABLE', reliability: 88, heartbeatMin: 0, x: 300, y: 280 },
      { id: 'r4', name: 'Vikram Das', capacity: 35, currentLoad: 0, hasColdBox: false, status: 'BREAKDOWN', reliability: 60, x: 100, y: 100 },
    ],
    shelters: [
      { id: 's1', name: 'Doranda Relief Shelter', location: 'Doranda, Ranchi', demandUnits: 50, capacityUnits: 100, accepts: 'COOKED_FOOD, RAW_RATION', water: true, fuel: true, refrig: false, isOpen: true, status: 'OPEN', x: 515, y: 90 },
      { id: 's2', name: 'Kantatoli Hope Camp', location: 'Kantatoli, Ranchi', demandUnits: 80, capacityUnits: 150, accepts: 'COOKED_FOOD, MEDICAL_COLD_CHAIN', water: true, fuel: false, refrig: true, isOpen: true, status: 'OPEN', x: 530, y: 270 },
    ],
    deliveries: [
      { id: 'del-101', batchId: 'b101', riderId: 'r1', shelterId: 's1', units: 40, status: 'IN_TRANSIT', deadlineMin: 35, risk: false },
      { id: 'del-102', batchId: 'b102', riderId: 'r2', shelterId: 's2', units: 20, status: 'IN_TRANSIT', deadlineMin: 140, risk: false },
      { id: 'del-103', batchId: 'b101', riderId: 'r4', shelterId: 's1', units: 40, status: 'AT_RISK', deadlineMin: 20, risk: true },
    ],
    logs: [
      { time: '10:00 AM', actor: 'SYSTEM', entity: 'NETWORK', event: 'INITIALIZED', desc: 'Ranchi last-mile simulation started.' },
      { time: '10:15 AM', actor: 'DISPATCHER', event: 'MATCH_CREATED', entity: 'del-101', desc: 'Assigned 40 cooked meals to Aarav Kumar for Doranda Shelter.' },
    ],
  };
}
