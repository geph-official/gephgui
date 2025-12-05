import {
  getModalStore,
  type ModalSettings,
  type ModalStore,
  type ToastSettings,
  type ToastStore,
} from "@skeletonlabs/skeleton";
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

export const showErrorModal = async (modalStore: ModalStore, error: string) => {
  await new Promise<boolean>((resolve) => {
    const modal: ModalSettings = {
      type: "alert",
      // title: "Error",
      body: error,
      response: (r: boolean) => {
        resolve(r);
      },
    };
    modalStore.trigger(modal);
  });
};

export const showToast = async (toastStore: ToastStore, message: string) => {
  const t: ToastSettings = {
    message,
    background: "variant-filled-primary",
    hideDismiss: true,
  };
  toastStore.trigger(t);
};

export const showErrorToast = async (
  toastStore: ToastStore,
  message: string
) => {
  const t: ToastSettings = {
    message,
    background: "variant-filled-error",
    hideDismiss: true,
  };
  toastStore.trigger(t);
};
