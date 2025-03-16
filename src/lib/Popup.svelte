<script lang="ts">
  import { fly, fade } from "svelte/transition";
  import { AppBar } from "@skeletonlabs/skeleton";
  import Close from "svelte-material-icons/Close.svelte";

  export let open = false;
  export let title = "";
  export let fullScreen = true;
  export let onClose: () => any = () => (open = false);
</script>

{#if open}
  <div
    class="fixed top-0 left-0 !m-0 w-full h-full {!fullScreen
      ? 'bg-black bg-opacity-50 backdrop-blur-sm p-4'
      : ''} flex items-center justify-center z-50"
    transition:fade|global
    on:click={onClose}
  >
    <div
      class="bg-surface-50 overflow-hidden shadow-lg {fullScreen
        ? 'w-full h-full'
        : 'rounded-lg max-w-2xl w-full'}"
      transition:fly|global={{ y: 50, duration: 300 }}
      on:click|stopPropagation={() => {}}
    >
      <AppBar>
        <svelte:fragment slot="lead">
          <button on:click={onClose}>
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
