export default function Kpi({ label, icon, value, foot }) {
  return (
    <div className="kpi">
      <div className="kpi-top">
        {label} <span className="kpi-icon">{icon}</span>
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-foot">{foot}</div>
    </div>
  );
}
