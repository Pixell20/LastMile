import { useEffect, useRef, useState } from 'react';
import { MENU_ORDER, ROLES } from '../../state/roles';
import { useSession } from '../../state/SessionContext';

/** Account circle pinned to the bottom-left. Opens a menu to switch between the three views. */
export default function AccountMenu() {
  const { role, sessions, switchRole, signOut } = useSession();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const current = ROLES[role];

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const choose = (target) => {
    setOpen(false);
    switchRole(target);
  };

  const subtitle = role === 'ops' ? 'Full network access' : sessions[role]?.email;

  return (
    <div className="account" ref={rootRef}>
      {open && (
        <div className="account-menu" role="menu" aria-label="Switch view">
          <div className="account-menu-head">
            <span className="account-circle small" data-role={role} aria-hidden="true">{current.initials}</span>
            <div>
              <strong>{current.viewName}</strong>
              <small>{subtitle}</small>
            </div>
          </div>
          {MENU_ORDER.map((id) => {
            const r = ROLES[id];
            const active = role === id;
            const status = id === 'ops' ? r.hint : sessions[id] ? 'Signed in · ' + r.hint : 'Sign-in required · ' + r.hint;
            return (
              <button key={id} role="menuitemradio" aria-checked={active} className={`account-option${active ? ' active' : ''}`} onClick={() => choose(id)}>
                <span className="account-option-icon" data-role={id}>{r.icon}</span>
                <span className="account-option-text">
                  <strong>{r.label}</strong>
                  <small>{status}</small>
                </span>
                {active ? <span className="account-check" aria-hidden="true">✓</span> : null}
              </button>
            );
          })}
          {role !== 'ops' && (
            <button role="menuitem" className="account-signout" onClick={() => { setOpen(false); signOut(); }}>
              Sign out of {current.short.toLowerCase()} view
            </button>
          )}
        </div>
      )}
      <button
        className="account-circle"
        data-role={role}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account: ${current.label}. Switch view`}
        onClick={() => setOpen((o) => !o)}
      >
        {current.initials}
      </button>
    </div>
  );
}
