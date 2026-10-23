import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { SessionProvider } from './state/SessionContext';
import App from './App';

// Order matters: later files override earlier ones (same as the original single file).
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/responsive.css';
import './styles/copilot.css';
import './styles/polish.css';
import './styles/portals.css';
import './styles/roles.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SessionProvider>
      <App />
    </SessionProvider>
  </StrictMode>,
);
