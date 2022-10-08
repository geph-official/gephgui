import { onDestroy } from "svelte";

export function onInterval(callback: () => any, milliseconds: number) {
  callback();
  const interval = setInterval(callback, milliseconds);

  onDestroy(() => {
    clearInterval(interval);
  });
}
