import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { ROLES } from './roles';
import { showToast } from '../sim/toast';

const SessionContext = createContext(null);

/**
 * Tracks which view (role) is active and who is signed in.
 * Rider and shelter views need a demo sign-in; the operations lead does not.
 * These credentials are checked in the browser only: prototype, not real auth.
 */
export function SessionProvider({ children }) {
  const [role, setRole] = useState('ops');
  const [sessions, setSessions] = useState({ rider: null, shelter: null });
  const [loginRole, setLoginRole] = useState(null); // role whose sign-in dialog is open

  const switchRole = useCallback(
    (target) => {
      if (target === 'ops' || sessions[target]) setRole(target);
      else setLoginRole(target);
    },
    [sessions],
  );

  const signIn = useCallback((target, email, password) => {
    const account = ROLES[target];
    if (email.trim().toLowerCase() !== account.email.toLowerCase() || password !== account.password) return false;
    setSessions((prev) => ({ ...prev, [target]: { email: account.email } }));
    setRole(target);
    setLoginRole(null);
    showToast(`Signed in to ${account.loginTitle}.`);
    return true;
  }, []);

  const signOut = useCallback(() => {
    if (role === 'ops') return;
    setSessions((prev) => ({ ...prev, [role]: null }));
    showToast(`Signed out of ${ROLES[role].loginTitle}.`);
    setRole('ops');
  }, [role]);

  const value = useMemo(
    () => ({ role, sessions, loginRole, switchRole, signIn, signOut, closeLogin: () => setLoginRole(null) }),
    [role, sessions, loginRole, switchRole, signIn, signOut],
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside <SessionProvider>');
  return ctx;
}
