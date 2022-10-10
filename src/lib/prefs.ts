import type { ExitDescriptor } from "../native-gate";
import { writable, type Writable } from "svelte/store";

export function persistentWritable<T>(
  storage_name: string,
  default_value: T
): Writable<T> {
  let initString = localStorage.getItem(storage_name);
  let initValue: any = null;
  initValue = (initString && JSON.parse(initString)) || default_value;
  let w = writable(initValue);
  w.subscribe((value: T) => {
    // console.log("storing", value);
    localStorage.setItem(storage_name, JSON.stringify(value));
  });
  return w;
}

/**
 * The current username and password.
 */
export const pref_userpwd: Writable<{
  username: string;
  password: string;
} | null> = persistentWritable("userpwd", null);

/**
 * Selected exit
 */
export const pref_selected_exit: Writable<ExitDescriptor | null> =
  persistentWritable("selected_exit", null);
