# LastMile

Last-mile delivery simulation for surplus food and supplies (Ranchi demo data), built with React + Vite.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Three views, one account circle

The circle at the bottom-left switches the whole app between:

| Menu item | Shows | Sign-in |
|---|---|---|
| **Rider login** | Rider point of view only (tasks, cargo, heartbeat) | `rider@lastmile.demo` / `Rider@123` |
| **Shelter login** | Shelter point of view only (demand, facilities, incoming cargo) | `shelter@lastmile.demo` / `Shelter@123` |
| **Operations lead** | Everything else: overview, deliveries, food & supplies, vendor portal, rider fleet, shelters, AI copilot, activity log | none (default) |

Credentials are checked in the browser. This is a prototype gate, not real authentication.

## Where things live

```
src/
  main.jsx, App.jsx          entry point and page switching
  sim/                       ALL business logic, no UI
    initialState.js            starting data (edit to change the scenario)
    store.js                   state container + useSim() hook
    rules.js                   safety / compatibility rules (cold chain, water, fuel...)
    selectors.js               read-only helpers
    toast.js                   toast notifications
    actions/                   one file per area: clock, deliveries, dispatch,
                               riders, shelters, batches
  state/                     roles, session (who is signed in), theme hook
  services/copilot.js        AI copilot: backend call + offline fallback
  components/
    layout/                    Header, Sidebar, AccountMenu, ToastArea
    ui/                        Dialog, Kpi, PageHead, StatusBadge, ...
    map/NetworkMap.jsx         the SVG map
    modals/                    BatchModal, PortalLoginModal
  pages/
    ops/                       operations-lead pages
    rider/RiderPortal.jsx      rider view
    shelter/ShelterPortal.jsx  shelter view
  styles/                    CSS, imported in the original cascade order
test/smoke.test.jsx          walks through all three views (npm test)
```

## Debugging tips

- **A rule behaves wrongly** (a delivery matched to the wrong shelter, handover blocked): look in `sim/rules.js` first, then the matching file in `sim/actions/`.
- **Data changes but the screen doesn't**: every action must call `commit()` at the end (see `sim/store.js`).
- **A screen looks wrong**: find the page in `pages/`, then the class in `styles/`. `polish.css` intentionally overrides earlier files, so check it when a style seems to be ignored.
- **Copilot**: with no `/api/copilot` backend it falls back to local rule-based answers. To use a backend in dev, uncomment the proxy in `vite.config.js`.
