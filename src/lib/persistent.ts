import { writable, type Writable } from "svelte/store";

// Leaf module: must not import from any other project module, so that stores
// created at module-evaluation time (l10n, prefs, user) can all depend on it
// without forming an import cycle.
export function persistentWritable<T>(
  storage_name: string,
  default_value: T
): Writable<T> {
  let initString = localStorage.getItem(storage_name);
  let initValue: any = null;
  try {
    if (initString === null) {
      initValue = default_value;
    } else {
      initValue = JSON.parse(initString);
    }
  } catch {
    initValue = default_value;
  }
  const store = writable<T>(initValue);
  let current: T = initValue;
  const set = (value: T) => {
    // Persist before notifying subscribers. A failed write leaves the store
    // unchanged and does not throw from inside Svelte's subscriber queue.
    localStorage.setItem(storage_name, JSON.stringify(value));
    current = value;
    store.set(value);
  };
  return {
    subscribe: store.subscribe,
    set,
    update: (updater) => set(updater(current)),
  };
}
