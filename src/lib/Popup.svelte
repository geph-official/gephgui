<script lang="ts">
  import { fly, fade } from "svelte/transition";
  import { onDestroy } from "svelte";
  import { AppBar } from "@skeletonlabs/skeleton";
  import { X } from "phosphor-svelte";
  import {
    popupHistory,
    type PopupCloseReason,
    type PopupToken,
  } from "./popup-history";

  interface Props {
    open?: boolean;
    title?: string;
    fullScreen?: boolean;
    historyBackDismiss?: boolean;
    onClose?: () => any;
    children?: import('svelte').Snippet;
  }

  let {
    open = $bindable(false),
    title = "",
    fullScreen = true,
    historyBackDismiss = true,
    onClose = () => (open = false),
    children,
  }: Props = $props();

  let popupToken: PopupToken | null = $state(null);
  let closeReason: PopupCloseReason = $state("programmatic");

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

  const handleBackdropKeydown = (event: KeyboardEvent) => {
    if (event.key === "Escape" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleCloseRequest();
    }
  };

  $effect(() => {
    if (historyBackDismiss && open && popupToken === null) {
      closeReason = "programmatic";
      popupToken = popupHistory.registerPopup(dismissFromHistory);
    }
  });

  $effect(() => {
    if (popupToken !== null && (!historyBackDismiss || !open)) {
      popupHistory.unregisterPopup(popupToken, closeReason);
      popupToken = null;
      closeReason = "programmatic";
    }
  });

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
    role="button"
    tabindex="0"
    aria-label={title ? `${title} dialog backdrop` : "Close dialog"}
    onclick={(event) => {
      if (event.target === event.currentTarget) {
        handleCloseRequest();
      }
    }}
    onkeydown={handleBackdropKeydown}
  >
    <div
      class="bg-surface-50 overflow-hidden shadow-lg {fullScreen
        ? 'w-full h-full'
        : 'rounded-lg max-w-2xl w-full'}"
      transition:fly|global={{ y: 50, duration: 200 }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <AppBar>
        {#snippet lead()}
              
            <button onclick={handleCloseRequest}>
              <X size="1.5rem" />
            </button>
          
              {/snippet}
        <b id="logo-text">{title}</b>
      </AppBar>

      <div
        id="popup-content"
        class="p-4 h-[calc(100%-3.5rem)] overflow-auto {!fullScreen
          ? 'max-h-[70vh]'
          : ''}"
      >
        {@render children?.()}
      </div>
    </div>
  </div>
{/if}
