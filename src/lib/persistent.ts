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
  let w = writable(initValue);
  w.subscribe((value: T) => {
    // console.log("storing", value);
    localStorage.setItem(storage_name, JSON.stringify(value));
  });
  return w;
}
