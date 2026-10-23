import { useSim } from '../../sim/store';
import { ACTIVE_STATUSES } from '../../sim/rules';

const ROADS =
  'M-20 80 C100 120 120 30 250 85 S420 180 670 100 M-20 260 C120 180 210 320 340 240 S500 190 680 280 M100 -20 C160 100 100 200 210 360 M440 -20 C380 80 490 180 430 360';
const firstWord = (name) => name.split(' ')[0];

/** Illustrative map. Positions are simulated, never real GPS. */
export default function NetworkMap() {
  const sim = useSim();
  const active = sim.riders.filter((r) => !['BREAKDOWN', 'UNRESPONSIVE'].includes(r.status)).length;
  const openShelters = sim.shelters.filter((s) => s.isOpen).length;

  return (
    <div className="map-wrap">
      <div className="map-chip">
        <span style={{ color: 'var(--muted)' }}>NETWORK STATUS</span>
        <strong>{`${active} riders online · ${openShelters} shelters open`}</strong>
      </div>
      <svg viewBox="0 0 640 340" role="img" aria-label="Illustrative map showing donors, riders and shelters">
        <defs>
          <pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.3" fill="#91a995" opacity=".38" />
          </pattern>
        </defs>
        <rect width="640" height="340" fill="url(#dots)" />
        <path d={ROADS} stroke="#fff" strokeWidth="15" fill="none" opacity=".8" />
        <path d={ROADS} stroke="#b8c9b8" strokeWidth="2" fill="none" />
        <path d="M85 245 Q190 170 280 120 T515 90 M85 245 Q210 280 360 235 T530 270" stroke="#317d61" strokeWidth="3" strokeDasharray="7 7" fill="none" opacity=".9" />
        <g fill="#d8e6d4" stroke="#a8bda9">
          <rect x="250" y="25" width="95" height="28" rx="7" />
          <rect x="25" y="155" width="86" height="28" rx="7" />
          <rect x="475" y="160" width="120" height="28" rx="7" />
          <rect x="260" y="290" width="100" height="26" rx="7" />
        </g>
        <g fontSize="10" fill="#496452" fontWeight="700">
          <text x="297" y="43" textAnchor="middle">MAIN ROAD</text>
          <text x="68" y="173" textAnchor="middle">MORABADI</text>
          <text x="535" y="178" textAnchor="middle">KANTATOLI</text>
          <text x="310" y="307" textAnchor="middle">DORANDA</text>
        </g>

        <g>
          {sim.donors.map((d) => (
            <g key={d.id}>
              <circle cx={d.x} cy={d.y} r="9" fill="#2d7a57" stroke="#fff" strokeWidth="2" />
              <text className="location-label" x={d.x} y={d.y + 21} textAnchor="middle">{firstWord(d.name)}</text>
            </g>
          ))}
          {sim.shelters.map((sh) => (
            <g key={sh.id}>
              <rect x={sh.x - 9} y={sh.y - 9} width="18" height="18" rx="4" fill={sh.isOpen ? '#447bc4' : '#8c9690'} stroke="#fff" strokeWidth="2" />
              <text className="location-label" x={sh.x} y={sh.y + 22} textAnchor="middle">
                {firstWord(sh.name)}{sh.isOpen ? '' : ' · CLOSED'}
              </text>
            </g>
          ))}
          {sim.deliveries.filter((d) => ACTIVE_STATUSES.includes(d.status)).map((d) => {
            const rider = sim.riders.find((r) => r.id === d.riderId);
            const sh = sim.shelters.find((s) => s.id === d.shelterId);
            if (!rider || !sh) return null;
            return (
              <path
                key={d.id}
                className="route-dash"
                d={`M ${rider.x} ${rider.y} Q ${(rider.x + sh.x) / 2} ${Math.min(rider.y, sh.y) - 24} ${sh.x} ${sh.y}`}
                fill="none"
                stroke={d.status === 'AT_RISK' ? '#c44b42' : '#d89c20'}
                strokeWidth="2.5"
                opacity=".9"
              />
            );
          })}
          {sim.riders.map((r) => {
            const color = r.status === 'BREAKDOWN' || r.status === 'UNRESPONSIVE' ? '#c44b42' : r.status === 'IN_TRANSIT' ? '#d89c20' : '#103d33';
            return (
              <g key={r.id}>
                <circle cx={r.x} cy={r.y} r="13" fill={color} opacity=".16" />
                <circle className="map-rider" cx={r.x} cy={r.y} r="7" fill={color} stroke="#fff" strokeWidth="2" />
                <text className="location-label" x={r.x} y={r.y - 12} textAnchor="middle">{firstWord(r.name)}</text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
