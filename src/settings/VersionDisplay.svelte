<script lang="ts">
  import { writable } from "svelte/store";
  import { native_gate } from "../native-gate";
  import { l10n, curr_lang } from "../lib/l10n";
  import { onMount } from "svelte";

  const versionInfo = writable<string | null>(null);
  const platformInfo = writable<string | null>(null);

  async function fetchVersion() {
    try {
      const gate = await native_gate();
      const info = await gate.get_native_info();
      versionInfo.set(info.version);
      platformInfo.set(`${info.platform_type} / ${info.platform_details}`);
    } catch (error) {
      console.error("Failed to fetch version info:", error);
      versionInfo.set("Unknown");
      platformInfo.set("Unknown");
    }
  }

  // Immediately fetch version info when component is created
  onMount(fetchVersion);
</script>

<div class="version-info">
  <p class="text-center text-sm opacity-70">
    {$versionInfo || "..."}
    {#if $platformInfo}
      <span class="platform-info">({$platformInfo})</span>
    {/if}
  </p>
</div>

<style>
  .version-info {
    margin-top: 2rem;
    padding-top: 0.5rem;
    border-top: 1px solid rgba(128, 128, 128, 0.2);
  }

  .platform-info {
    display: none;
  }

  .version-info:hover .platform-info {
    display: inline;
  }
</style>
