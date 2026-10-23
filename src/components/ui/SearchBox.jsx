export default function SearchBox({ value, onChange, placeholder, maxWidth, label }) {
  return (
    <div className="search" style={maxWidth ? { maxWidth } : undefined}>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={label || placeholder} />
    </div>
  );
}
