import { useState } from 'react';
import { useSim } from '../../sim/store';
import { ACTIVE_STATUSES } from '../../sim/rules';
import { findShelter } from '../../sim/selectors';
import { rejectIncoming, saveShelterProfile, simulateDirectDonation } from '../../sim/actions';
import { useSession } from '../../state/SessionContext';
import Section from '../../components/ui/Section';
import PageHead from '../../components/ui/PageHead';
import StatusBadge from '../../components/ui/StatusBadge';

const toForm = (sh) => ({
  demandUnits: String(sh.demandUnits),
  capacityUnits: String(sh.capacityUnits),
  water: String(sh.water),
  fuel: String(sh.fuel),
  refrig: String(sh.refrig),
  isOpen: String(sh.isOpen),
});

function YesNo({ id, label, value, onChange, yes = 'Yes', no = 'No' }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="true">{yes}</option>
        <option value="false">{no}</option>
      </select>
    </div>
  );
}

/** Editable profile. Re-keyed by the parent so it resets when the shelter's saved values change. */
function ProfileForm({ shelter }) {
  const [form, setForm] = useState(() => toForm(shelter));
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const save = () =>
    saveShelterProfile(shelter.id, {
      demandUnits: form.demandUnits,
      capacityUnits: form.capacityUnits,
      water: form.water === 'true',
      fuel: form.fuel === 'true',
      refrig: form.refrig === 'true',
      isOpen: form.isOpen === 'true',
    });

  return (
    <>
      <div className="form-grid" style={{ marginTop: 0 }}>
        <div className="field"><label htmlFor="spDemand">Unmet demand (units)</label><input id="spDemand" type="number" min="0" value={form.demandUnits} onChange={(e) => set('demandUnits')(e.target.value)} /></div>
        <div className="field"><label htmlFor="spCapacity">Physical spare capacity (units)</label><input id="spCapacity" type="number" min="0" value={form.capacityUnits} onChange={(e) => set('capacityUnits')(e.target.value)} /></div>
        <YesNo id="spWater" label="Clean water available" value={form.water} onChange={set('water')} />
        <YesNo id="spFuel" label="Cooking fuel available" value={form.fuel} onChange={set('fuel')} />
        <YesNo id="spRefrig" label="Refrigeration available" value={form.refrig} onChange={set('refrig')} />
        <YesNo id="spOpen" label="Accepting deliveries" value={form.isOpen} onChange={set('isOpen')} yes="Open" no="Closed" />
      </div>
      <div className="rider-actions" style={{ marginTop: 14 }}>
        <button className="btn primary" onClick={save}>Save shelter status</button>
        <button className="btn" onClick={() => simulateDirectDonation(shelter.id)}>＋ Record direct donation</button>
      </div>
    </>
  );
}

/** Shelter point of view: receiving-centre status and incoming cargo. */
export default function ShelterPortal() {
  const sim = useSim();
  const { sessions, signOut } = useSession();
  const [shelterId, setShelterId] = useState(sim.shelters[0]?.id);
  const shelter = findShelter(sim, shelterId) || sim.shelters[0];
  if (!shelter) return null;

  const incoming = sim.deliveries.filter((d) => d.shelterId === shelter.id && ACTIVE_STATUSES.includes(d.status));
  const formKey = [shelter.id, shelter.demandUnits, shelter.capacityUnits, shelter.water, shelter.fuel, shelter.refrig, shelter.isOpen].join('|');

  return (
    <Section id="shelterPortal">
      <PageHead
        title="Shelter portal"
        subtitle="Signed-in receiving-center workspace: update demand, facilities, direct donations, and incoming cargo."
        note={`Signed in as ${sessions.shelter?.email} · demo role`}
      >
        <button className="btn" onClick={signOut}>↪ Sign out</button>
      </PageHead>

      <div className="two-col">
        <div className="panel">
          <div className="panel-head"><div><h2>Receiving center status</h2><p>Select a shelter to update its live simulation profile.</p></div></div>
          <div className="field full" style={{ marginBottom: 12 }}>
            <label htmlFor="shelterProfile">Shelter</label>
            <select id="shelterProfile" value={shelter.id} onChange={(e) => setShelterId(e.target.value)}>
              {sim.shelters.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <ProfileForm key={formKey} shelter={shelter} />
        </div>

        <div className="panel">
          <div className="panel-head"><div><h2>Incoming deliveries</h2><p>Review cargo already on the road before demand changes strand a rider.</p></div></div>
          {incoming.length ? incoming.map((d) => (
            <div className="task-card" key={d.id}>
              <div className="task-main">
                <strong>{d.id} · {d.units} units</strong>
                <p>Rider: {sim.riders.find((r) => r.id === d.riderId)?.name || d.riderId} · deadline {d.deadlineMin}m</p>
                <StatusBadge tone={d.status === 'AT_RISK' ? 'risk' : 'transit'}>{d.status}</StatusBadge>
              </div>
              <div className="task-actions"><button className="btn small danger" onClick={() => rejectIncoming(d.id)}>Reject / reroute</button></div>
            </div>
          )) : <div className="empty">No incoming deliveries for this shelter.</div>}
          <div className="notice" style={{ marginTop: 12 }}>Raw ration requires clean water and cooking fuel. Infant formula requires clean water. Medical cold-chain deliveries require both a cold-box rider and destination refrigeration.</div>
        </div>
      </div>
    </Section>
  );
}
