import { writable, type Writable } from "svelte/store";

export const loadingContent: Writable<string | null> = writable(null);

export const errorContent: Writable<string | null> = writable(null);

/**
 * Runs the provided async function, showing a loading spinner while the function runs.
 *
 * @param {string} label - The text to display while the spinner is active.
 * @param {() => Promise<any>} f - The async function to be executed.
 * @returns {Promise<void>}
 */
export const runWithSpinner = async (
  label: string,
  ms: number,
  f: () => Promise<any>
): Promise<void> => {
  let stopper = setTimeout(() => loadingContent.set(label), ms);
  try {
    await f();
  } finally {
    clearTimeout(stopper);
    loadingContent.set(null);
  }
};

/**
 * Shows an error modal with the given message and resolves the promise when the modal is closed.
 *
 * @param {string} s - The error message to be displayed in the modal.
 * @returns {Promise<void>}
 */
export const showErrorModal = (s: string) => {
  return new Promise<void>((resolve, reject) => {
    errorContent.set(s);
    let us = errorContent.subscribe((s) => {
      if (s === null) {
        resolve();
        us();
      }
    });
  });
};
