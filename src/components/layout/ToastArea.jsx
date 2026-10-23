import { useToasts } from '../../sim/toast';

export default function ToastArea() {
  const toasts = useToasts();
  return (
    <div className="toast-area" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast${t.isError ? ' error' : ''}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
