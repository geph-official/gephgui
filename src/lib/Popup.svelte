<script lang="ts">
  import { fly, fade } from "svelte/transition";
  import { onDestroy } from "svelte";
  import { AppBar } from "@skeletonlabs/skeleton";
  import Close from "svelte-material-icons/Close.svelte";
  import {
    popupHistory,
    type PopupCloseReason,
    type PopupToken,
  } from "./popup-history";

  export let open = false;
  export let title = "";
  export let fullScreen = true;
  export let historyBackDismiss = true;
  export let onClose: () => any = () => (open = false);

  let popupToken: PopupToken | null = null;
  let closeReason: PopupCloseReason = "programmatic";

  const dismissFromHistory = () => {
    closeReason = "history";
    onClose();
  };

  const handleCloseRequest = () => {
    if (historyBackDismiss && popupToken) {
      popupHistory.requestCloseFromUI(popupToken);
      return;
    }
    onClose();
  };

  $: if (historyBackDismiss && open && popupToken === null) {
    closeReason = "programmatic";
    popupToken = popupHistory.registerPopup(dismissFromHistory);
  }

  $: if (popupToken !== null && (!historyBackDismiss || !open)) {
    popupHistory.unregisterPopup(popupToken, closeReason);
    popupToken = null;
    closeReason = "programmatic";
  }

  onDestroy(() => {
    if (popupToken === null) return;
    popupHistory.unregisterPopup(popupToken, "programmatic");
    popupToken = null;
    closeReason = "programmatic";
  });
</script>

{#if open}
  <div
    class="fixed top-0 left-0 !m-0 w-full h-full {!fullScreen
      ? 'bg-surface-500 bg-opacity-50 backdrop-blur-sm p-4'
      : ''} flex items-center justify-center z-50"
    transition:fade|global={{ duration: 200 }}
    on:click={handleCloseRequest}
  >
    <div
      class="bg-surface-50 overflow-hidden shadow-lg {fullScreen
        ? 'w-full h-full'
        : 'rounded-lg max-w-2xl w-full'}"
      transition:fly|global={{ y: 50, duration: 200 }}
      on:click|stopPropagation={() => {}}
    >
      <AppBar>
        <svelte:fragment slot="lead">
          <button on:click={handleCloseRequest}>
            <Close size="1.5rem" />
          </button>
        </svelte:fragment>
        <b id="logo-text">{title}</b>
      </AppBar>

      <div
        class="p-4 h-[calc(100%-3.5rem)] overflow-auto {!fullScreen
          ? 'max-h-[70vh]'
          : ''}"
      >
        <slot />
      </div>
    </div>
  </div>
{/if}
