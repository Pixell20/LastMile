import { useEffect, useRef } from 'react';

/** Thin wrapper over the native <dialog>. Children mount only while open, so forms reset each time. */
export default function Dialog({ open, onClose, className, labelledBy, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog ref={ref} className={className} aria-labelledby={labelledBy} onClose={onClose}>
      {open ? children : null}
    </dialog>
  );
}
