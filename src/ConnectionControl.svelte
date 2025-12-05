<script lang="ts">
  import { curr_lang, l10n } from "./lib/l10n";
  import { app_status, conn_status, startDaemonArgs } from "./lib/user";
  import { pref_exit_constraint_derived } from "./lib/prefs";
  import { native_gate } from "./native-gate";
  import { ProgressBar, getModalStore } from "@skeletonlabs/skeleton";
  import ChevronRight from "svelte-material-icons/ChevronRight.svelte";
  import Flag from "./lib/Flag.svelte";
  import StatusCircle from "./lib/StatusCircle.svelte";
  import { showErrorModal } from "./lib/utils";

  export let serversOpen: boolean;

  let connectButtonDisabled = false;
  const modalStore = getModalStore();

  const handleStartDaemon = async () => {
    connectButtonDisabled = true;
    try {
      const args = await startDaemonArgs();
      if (args) {
        const gate = await native_gate();
        await gate.start_daemon(args);
      }
    } catch (e) {
      showErrorModal(modalStore, l10n($curr_lang, "error") + ": " + e);
    } finally {
      connectButtonDisabled = false;
    }
  };

  const handleStopDaemon = async () => {
    connectButtonDisabled = true;
    try {
      const gate = await native_gate();
      await gate.stop_daemon();
    } catch (e) {
      showErrorModal(modalStore, l10n($curr_lang, "error") + ": " + e);
    } finally {
      connectButtonDisabled = false;
    }
  };

  const switchServers = async () => {
    serversOpen = true;
  };

  $: connectionStatus =
    $conn_status === "disconnected"
      ? "disconnected"
      : $conn_status === "connecting"
        ? "connecting"
        : "connected";
</script>

{#if $app_status}
  <div class="bottom card flex flex-col">
    <button
      class="flex flex-row mb-4 text-left"
      on:click={() => switchServers()}
    >
      <div class="server-name grow">
        <div class="flex items-center">
          <StatusCircle status={connectionStatus} />
          {#if $pref_exit_constraint_derived === "auto"}
            {l10n($curr_lang, "automatic")}
          {:else}
            {$pref_exit_constraint_derived.country} / {$pref_exit_constraint_derived.city}
          {/if}
        </div>
        <div class="flex flex-row mt-1">
          {#if $conn_status !== "disconnected" && $conn_status !== "connecting"}
            <small><Flag country={$conn_status.country} /></small>
            <small>
              {$conn_status.exit}

              <span class="font-normal">
                [{#if $conn_status.bridge}{$conn_status.bridge}{:else}{l10n(
                    $curr_lang,
                    "direct",
                  )}{/if}]
              </span>
            </small>
          {:else}
            <small>
              {#if $pref_exit_constraint_derived !== "auto"}
                <Flag country={$pref_exit_constraint_derived.country} />
              {/if}
            </small>
            <small> {l10n($curr_lang, "auto-select")}</small>
          {/if}
        </div>
      </div>
      <div class="icon">
        <ChevronRight size="1.5rem" />
      </div>
    </button>

    {#if $conn_status === "disconnected"}
      <button
        class="btn variant-filled mb-1"
        on:click={() => handleStartDaemon()}
        disabled={connectButtonDisabled}
      >
        {l10n($curr_lang, "connect")}
      </button>
      {#if connectButtonDisabled}
        <ProgressBar />
      {/if}
    {:else if $conn_status === "connecting"}
      <button
        class="btn variant-ghost mb-1"
        on:click={() => handleStopDaemon()}
        disabled={connectButtonDisabled}
      >
        {l10n($curr_lang, "cancel")}
      </button>

      <ProgressBar />
    {:else}
      <button
        class="btn variant-ghost mb-1"
        on:click={() => handleStopDaemon()}
        disabled={connectButtonDisabled}
      >
        {l10n($curr_lang, "disconnect")}
      </button>
      {#if connectButtonDisabled}
        <ProgressBar />
      {/if}
    {/if}
  </div>
{/if}

<style>
  .bottom {
    padding: 1rem;
  }

  .server-name {
    font-weight: 600;
    line-height: 1;
  }

  .server-name small {
    font-weight: 500;
  }
</style>
