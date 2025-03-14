<script lang="ts">
  import { getToastStore } from "@skeletonlabs/skeleton";
  import ContentCopy from "svelte-material-icons/ContentCopy.svelte";
  import { curr_lang, l10n } from "./lib/l10n";
  import { native_gate } from "./native-gate";
  import { showToast } from "./lib/utils";
  import Popup from "./lib/Popup.svelte";

  export let open = false;
  export const toastStore = getToastStore();
  
  async function fetchLogs() {
    const gate = await native_gate();
    return await gate.get_debug_pack();
  }
</script>

<Popup 
  {open} 
  title={l10n($curr_lang, "debug-logs")}
  onClose={() => (open = false)}
>
  <div class="h-full flex flex-col">
    {#await fetchLogs()}
      <div class="flex justify-center items-center h-full">
        <div class="spinner-border" />
      </div>
    {:then logs}
      <div class="flex flex-col gap-2 h-full">
        <div class="flex flex-row items-center justify-between">
          <span>{logs.split("\n").length} lines</span>
          <button
            class="btn variant-ghost-primary btn-sm flex gap-1"
            on:click={() => {
              navigator.clipboard.writeText(logs);
              showToast(toastStore, l10n($curr_lang, "logs-copied"));
            }}
          >
            <ContentCopy />
            {l10n($curr_lang, "copy")}
          </button>
        </div>
        <pre
          class="bg-surface-200 p-3 rounded-md overflow-auto h-full text-xs font-mono">{logs}</pre>
      </div>
    {:catch error}
      <div class="flex flex-col gap-2 h-full">
        <pre
          class="bg-surface-200 p-3 rounded-md overflow-auto h-full text-xs font-mono text-error">Error loading logs: {error}</pre>
      </div>
    {/await}
  </div>
</Popup>

<style>
  .spinner-border {
    display: inline-block;
    width: 2rem;
    height: 2rem;
    vertical-align: text-bottom;
    border: 0.25em solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: spinner-border 0.75s linear infinite;
  }

  @keyframes spinner-border {
    to {
      transform: rotate(360deg);
    }
  }

  pre {
    white-space: pre-wrap;
    word-break: break-all;
  }
</style>