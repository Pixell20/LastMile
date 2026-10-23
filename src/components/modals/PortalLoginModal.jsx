import { useEffect, useRef, useState } from 'react';
import Dialog from '../ui/Dialog';
import { ROLES } from '../../state/roles';
import { useSession } from '../../state/SessionContext';

function LoginForm({ role }) {
  const { signIn, closeLogin } = useSession();
  const account = ROLES[role];
  const [email, setEmail] = useState(account.email);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const passwordRef = useRef(null);

  useEffect(() => {
    passwordRef.current?.focus();
  }, []);

  const submit = (e) => {
    e.preventDefault();
    if (!signIn(role, email, password)) setError(true);
  };
  const fillDemo = () => {
    setEmail(account.email);
    setPassword(account.password);
    setError(false);
  };

  return (
    <>
      <div className="modal-head">
        <div>
          <div className="eyebrow">LASTMILE ACCESS</div>
          <h2 id="portalLoginTitle">{account.loginTitle} sign in</h2>
        </div>
        <button type="button" className="btn small" onClick={closeLogin} aria-label="Close login">✕</button>
      </div>
      <form onSubmit={submit}>
        <div className="modal-body">
          <div className="login-role-card">
            <div className="login-role-icon">{account.icon}</div>
            <div>
              <strong>{account.loginTitle}</strong>
              <p>{account.loginDescription}</p>
            </div>
          </div>
          <div className="field">
            <label htmlFor="portalLoginEmail">Login ID</label>
            <input id="portalLoginEmail" type="email" autoComplete="username" placeholder={account.email} value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field" style={{ marginTop: 12 }}>
            <label htmlFor="portalLoginPassword">Password</label>
            <input id="portalLoginPassword" ref={passwordRef} type="password" autoComplete="current-password" placeholder="Enter demo password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <p className="login-error" role="alert">Login details did not match this portal.</p>}
          <div className="demo-credentials">
            <strong>Demo credentials</strong>
            <div>
              <span>{account.email}</span>
              <button className="btn small" type="button" onClick={fillDemo}>Use demo login</button>
            </div>
            <small>Password: <code>{account.password}</code></small>
          </div>
          <p className="hint">Prototype-only role gate. These demo credentials are checked in the browser and are not production authentication.</p>
        </div>
        <div className="modal-foot">
          <button className="btn" type="button" onClick={closeLogin}>Cancel</button>
          <button className="btn primary" type="submit">Sign in ↗</button>
        </div>
      </form>
    </>
  );
}

export default function PortalLoginModal() {
  const { loginRole, closeLogin } = useSession();
  return (
    <Dialog open={Boolean(loginRole)} onClose={closeLogin} className="portal-login-dialog" labelledBy="portalLoginTitle">
      {loginRole ? <LoginForm key={loginRole} role={loginRole} /> : null}
    </Dialog>
  );
}
