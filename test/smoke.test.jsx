// @vitest-environment jsdom
import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { render, screen, within, fireEvent, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SessionProvider } from '../src/state/SessionContext';
import App from '../src/App';

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); this.dispatchEvent(new Event('close')); };
  globalThis.fetch = () => Promise.reject(new Error('offline'));
});

const setup = () => { render(<SessionProvider><App /></SessionProvider>); return userEvent.setup(); };
const circle = () => screen.getByRole('button', { name: /^Account:/ });

afterEach(cleanup);

describe('LastMile', () => {
  it('flows through all three views', async () => {
    const user = setup();

    // Ops lead default
    expect(screen.getByRole('heading', { name: 'Operations overview' })).toBeTruthy();
    const nav = screen.getByRole('complementary', { name: 'Main navigation' });
    expect(within(nav).queryByText(/Rider portal/)).toBeNull();
    expect(within(nav).getByText('Deliveries')).toBeTruthy();
    expect(circle().getAttribute('aria-label')).toMatch(/Operations lead/);

    // Account menu
    await user.click(circle());
    const menu = screen.getByRole('menu', { name: 'Switch view' });
    const items = within(menu).getAllByRole('menuitemradio').map((b) => b.textContent);
    expect(items[0]).toMatch(/Rider login/); expect(items[1]).toMatch(/Shelter login/); expect(items[2]).toMatch(/Operations lead/);

    // Rider login: wrong password then demo
    await user.click(within(menu).getByRole('menuitemradio', { name: /Rider login/ }));
    expect(screen.getByText('Rider portal sign in')).toBeTruthy();
    await user.type(screen.getByLabelText('Password'), 'nope');
    await user.click(screen.getByRole('button', { name: /Sign in/ }));
    expect(screen.getByRole('alert').textContent).toMatch(/did not match/);
    await user.click(screen.getByRole('button', { name: 'Use demo login' }));
    await user.click(screen.getByRole('button', { name: /Sign in/ }));
    expect(await screen.findByRole('heading', { name: 'Rider portal' })).toBeTruthy();
    expect(screen.queryByRole('complementary', { name: 'Main navigation' })).toBeNull();
    expect(circle().getAttribute('aria-label')).toMatch(/Rider login/);

    // Rider confirms handover of del-101 (Aarav)
    await user.click(screen.getByRole('button', { name: 'Confirm handover' }));
    expect(await screen.findByText(/Delivery del-101 marked as DELIVERED/)).toBeTruthy();
    expect(screen.getByText(/No active tasks for this rider/)).toBeTruthy();

    // Switch to shelter (needs its own login)
    await user.click(circle());
    await user.click(screen.getByRole('menuitemradio', { name: /Shelter login/ }));
    expect(screen.getByText('Shelter portal sign in')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Use demo login' }));
    await user.click(screen.getByRole('button', { name: /Sign in/ }));
    expect(await screen.findByRole('heading', { name: 'Shelter portal' })).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Unmet demand (units)'), { target: { value: '12' } });
    await user.click(screen.getByRole('button', { name: 'Save shelter status' }));
    expect(await screen.findByText(/Shelter profile saved/)).toBeTruthy();
    expect(screen.getByLabelText('Unmet demand (units)').value).toBe('12');

    // Back to ops via menu: rider session persists, tab restored
    await user.click(circle());
    await user.click(screen.getByRole('menuitemradio', { name: /Operations lead/ }));
    expect(await screen.findByRole('heading', { name: 'Operations overview' })).toBeTruthy();

    // Rider switch now needs no login (session kept)
    await user.click(circle());
    await user.click(screen.getByRole('menuitemradio', { name: /Rider login/ }));
    expect(await screen.findByRole('heading', { name: 'Rider portal' })).toBeTruthy();
    // sign out returns to ops and clears the session
    await user.click(screen.getByRole('button', { name: /Sign out/ }));
    expect(await screen.findByRole('heading', { name: 'Operations overview' })).toBeTruthy();
    await user.click(circle());
    await user.click(screen.getByRole('menuitemradio', { name: /Rider login/ }));
    expect(screen.getByText('Rider portal sign in')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
  });

  it('ops pages work', async () => {
    const user = setup();
    const nav = screen.getByRole('complementary', { name: 'Main navigation' });
    for (const label of ['Deliveries', 'Food & supplies', 'Vendor portal', 'Rider fleet', 'Shelters', 'AI Copilot', 'Activity log', 'Overview']) {
      await user.click(within(nav).getByRole('button', { name: new RegExp(label) }));
    }
    await user.click(within(nav).getByRole('button', { name: /Deliveries/ }));
    await user.click(screen.getByRole('button', { name: /Smart dispatch/ }));
    expect(await screen.findByText(/Created safe match del-/)).toBeTruthy();

    // +5 min, pause guard
    await user.click(screen.getByRole('button', { name: '+ 5 min' }));
    await user.click(screen.getByRole('button', { name: /Pause/ }));
    await user.click(screen.getByRole('button', { name: '+ 5 min' }));
    expect(await screen.findByText(/Resume the simulation clock/)).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /Resume/ }));

    // New batch modal
    await user.click(screen.getByRole('button', { name: /New batch/ }));
    await user.click(screen.getByRole('button', { name: 'Broadcast Batch' }));
    expect(await screen.findByText(/broadcast successfully/)).toBeTruthy();

    // Reroute at-risk del-103 fails or succeeds without crashing
    const reroute = screen.queryAllByRole('button', { name: 'Reroute' });
    if (reroute.length) await user.click(reroute[0]);

    // Copilot offline answer
    await user.click(within(nav).getByRole('button', { name: /AI Copilot/ }));
    await user.type(screen.getByLabelText('Ask the copilot'), 'which riders are available?{Enter}');
    expect(await screen.findByText(/Offline mode/)).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /Generate Shift Brief/ }));
    await waitFor(() => expect(screen.getByText(/SHIFT HANDOVER/)).toBeTruthy());
  });
});
