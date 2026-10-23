// The three ways to view the app. "ops" is the default and needs no sign-in.
export const ROLES = {
  rider: {
    id: 'rider',
    label: 'Rider login',
    short: 'Rider',
    viewName: 'Rider view',
    initials: 'R',
    icon: '➤',
    hint: 'Rider view: tasks and heartbeat',
    loginTitle: 'Rider portal',
    loginDescription: 'Sign in to view assigned deliveries, report issues, and send rider heartbeats.',
    email: 'rider@lastmile.demo',
    password: 'Rider@123',
  },
  shelter: {
    id: 'shelter',
    label: 'Shelter login',
    short: 'Shelter',
    viewName: 'Shelter view',
    initials: 'S',
    icon: '⌂',
    hint: 'Shelter view: demand and incoming cargo',
    loginTitle: 'Shelter portal',
    loginDescription: 'Sign in to update shelter demand, utilities, opening status, and incoming deliveries.',
    email: 'shelter@lastmile.demo',
    password: 'Shelter@123',
  },
  ops: {
    id: 'ops',
    label: 'Operations lead',
    short: 'Operations',
    viewName: 'Operations lead',
    initials: 'OL',
    icon: '▦',
    hint: 'Full network: dispatch, fleet, vendors, copilot',
  },
};

// Order shown in the account menu.
export const MENU_ORDER = ['rider', 'shelter', 'ops'];
