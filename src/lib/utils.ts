import { getContext, onDestroy, setContext } from "svelte";
import { cubicOut } from "svelte/easing";
import twemoji from "twemoji";

export function onInterval(callback: () => Promise<any>, milliseconds: number) {
  callback();

  // we use a "lock" to prevent two overlapping instances from running.
  let running = false;
  const interval = setInterval(async () => {
    if (running) {
      return;
    }

    running = true;
    try {
      await callback();
    } finally {
      running = false;
    }
  }, milliseconds);

  onDestroy(() => {
    clearInterval(interval);
  });
}

export const formatNumberWithSpaces = (value: string): string =>
  value
    .replace(/\D+/g, "") // Remove all non-numbers
    .replace(/(\d{4})/g, "$1 ") // Add a space every 4 digits
    .trim(); // Remove trailing space
