import { useState } from 'react';
import Dialog from '../ui/Dialog';
import { createBatch } from '../../sim/actions';

const DEFAULTS = {
  donor: 'Morabadi Community Kitchen',
  location: 'Morabadi, Ranchi',
  category: 'COOKED_FOOD',
  units: '40',
  desc: 'Fresh cooked meal boxes',
  expiryHours: '2.0',
  bufferMin: '15',
};

function BatchForm({ onClose }) {
  const [form, setForm] = useState(DEFAULTS);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (createBatch(form)) onClose();
  };

  return (
    <>
      <div className="modal-head">
        <h2 id="batchModalTitle">Post Surplus Batch</h2>
        <button type="button" className="btn small" onClick={onClose} aria-label="Close">✕</button>
      </div>
      <form onSubmit={submit}>
        <div className="modal-body form-grid">
          <div className="field"><label htmlFor="mbDonor">Vendor / donor name</label><input id="mbDonor" value={form.donor} onChange={set('donor')} required /></div>
          <div className="field"><label htmlFor="mbLocation">Pickup location / landmark</label><input id="mbLocation" value={form.location} onChange={set('location')} required /></div>
          <div className="field">
            <label htmlFor="mbCat">Category</label>
            <select id="mbCat" value={form.category} onChange={set('category')}>
              <option value="COOKED_FOOD">Cooked Food</option>
              <option value="MEDICAL_COLD_CHAIN">Medical Cold Chain</option>
              <option value="RAW_RATION">Raw Ration Kit</option>
              <option value="INFANT_FORMULA">Infant Formula</option>
            </select>
          </div>
          <div className="field"><label htmlFor="mbUnits">Total Units</label><input id="mbUnits" type="number" min="1" value={form.units} onChange={set('units')} required /></div>
          <div className="field full"><label htmlFor="mbDesc">Description</label><input id="mbDesc" value={form.desc} onChange={set('desc')} required /></div>
          <div className="field"><label htmlFor="mbExpiry">Expiry Window (Hours)</label><input id="mbExpiry" type="number" step="0.5" value={form.expiryHours} onChange={set('expiryHours')} required /></div>
          <div className="field"><label htmlFor="mbBuffer">Safety Buffer (Mins)</label><input id="mbBuffer" type="number" value={form.bufferMin} onChange={set('bufferMin')} required /></div>
        </div>
        <div className="modal-foot">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn primary">Broadcast Batch</button>
        </div>
      </form>
    </>
  );
}

export default function BatchModal({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} labelledBy="batchModalTitle">
      <BatchForm onClose={onClose} />
    </Dialog>
  );
}
