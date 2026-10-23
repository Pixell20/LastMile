/** tone: '' | ok | risk | transit | partial | warn */
export default function StatusBadge({ tone = '', children }) {
  return <span className={`status ${tone}`.trim()}>{children}</span>;
}
