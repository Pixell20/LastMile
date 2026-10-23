import { useEffect, useState } from 'react';
import { tickMovement } from './sim/actions';
import { useSession } from './state/SessionContext';
import { ROLES } from './state/roles';

import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import AccountMenu from './components/layout/AccountMenu';
import ToastArea from './components/layout/ToastArea';
import BatchModal from './components/modals/BatchModal';
import PortalLoginModal from './components/modals/PortalLoginModal';

import Overview from './pages/ops/Overview';
import Deliveries from './pages/ops/Deliveries';
import Batches from './pages/ops/Batches';
import Vendor from './pages/ops/Vendor';
import Riders from './pages/ops/Riders';
import Shelters from './pages/ops/Shelters';
import Copilot from './pages/ops/Copilot';
import ActivityLog from './pages/ops/ActivityLog';
import RiderPortal from './pages/rider/RiderPortal';
import ShelterPortal from './pages/shelter/ShelterPortal';

function PovBanner({ role }) {
  return (
    <div className="pov-banner" data-role={role}>
      <span className="pov-dot" />
      You're in the {ROLES[role].viewName.toLowerCase()}. Use the account button at the bottom left to switch views.
    </div>
  );
}

export default function App() {
  const { role } = useSession();
  const [tab, setTab] = useState('overview'); // operations-lead page
  const [batchOpen, setBatchOpen] = useState(false);

  // Visual-only rider movement between simulation steps.
  useEffect(() => {
    const id = setInterval(tickMovement, 1200);
    return () => clearInterval(id);
  }, []);

  const openBatch = () => setBatchOpen(true);
  const opsPages = {
    overview: <Overview onNavigate={setTab} onNewBatch={openBatch} />,
    deliveries: <Deliveries onNewBatch={openBatch} />,
    batches: <Batches onNewBatch={openBatch} />,
    vendor: <Vendor onNewBatch={openBatch} />,
    riders: <Riders />,
    shelters: <Shelters />,
    ai: <Copilot />,
    activity: <ActivityLog />,
  };

  return (
    <>
      <Header />
      <div className={`shell${role === 'ops' ? '' : ' pov'}`}>
        {role === 'ops' && <Sidebar tab={tab} onSelect={setTab} />}
        <main>
          {role === 'ops' && opsPages[tab]}
          {role === 'rider' && (<><PovBanner role="rider" /><RiderPortal /></>)}
          {role === 'shelter' && (<><PovBanner role="shelter" /><ShelterPortal /></>)}
        </main>
      </div>

      <AccountMenu />
      <BatchModal open={batchOpen} onClose={() => setBatchOpen(false)} />
      <PortalLoginModal />
      <ToastArea />
    </>
  );
}
