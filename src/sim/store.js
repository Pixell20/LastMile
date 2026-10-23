import { useSyncExternalStore } from 'react';
import { createInitialState } from './initialState';

/**
 * The simulation lives in one mutable object (`state`) that only the action
 * modules touch. After an action finishes it calls `commit()`, which publishes
 * an immutable copy to React. Components read it with `useSim()`.
 *
 *   action  ->  mutate getState()  ->  commit()  ->  components re-render
 */
let state = createInitialState();
let snapshot = structuredClone(state);
const listeners = new Set();

export const getState = () => state;
export const getSnapshot = () => snapshot;

export function commit() {
  snapshot = structuredClone(state);
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const useSim = () => useSyncExternalStore(subscribe, getSnapshot);

export function logEvent(actor, entity, event, desc) {
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  state.logs.unshift({ time, actor, entity, event, desc });
}
