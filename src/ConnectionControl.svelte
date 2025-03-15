<script lang="ts">
  import { curr_lang, l10n } from "./lib/l10n";
  import { app_status, startDaemonArgs } from "./lib/user";
  import { pref_exit_constraint_derived, pref_wizard } from "./lib/prefs";
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
    if ($app_status?.account.level === "Free") {
      $pref_wizard = true;
    } else {
      serversOpen = true;
    }
  };

  $: connectionStatus =
    $app_status?.connection === "disconnected"
      ? "disconnected"
      : $app_status?.connection === "connecting"
        ? "connecting"
        : "connected";
</script>

{#if $app_status}
  <div class="bottom card flex flex-col rounded-t-none">
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
          {#if $app_status.connection !== null && $app_status.connection !== "disconnected" && $app_status?.connection !== "connecting"}
            <small><Flag country={$app_status.connection.country} /></small>
            <small>
              {$app_status?.connection.exit}

              <span class="font-normal">
                [{#if $app_status.connection.bridge}{$app_status.connection
                    .bridge}{:else}{l10n($curr_lang, "direct")}{/if}]
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

    {#if $app_status.connection === "disconnected"}
      <button
        class="btn variant-filled"
        on:click={() => handleStartDaemon()}
        disabled={connectButtonDisabled}
      >
        {l10n($curr_lang, "connect")}
      </button>
      {#if connectButtonDisabled}
        <ProgressBar />
      {/if}
    {:else if $app_status.connection === "connecting"}
      <button
        class="btn variant-ghost"
        on:click={() => handleStopDaemon()}
        disabled={connectButtonDisabled}
      >
        {l10n($curr_lang, "cancel")}
      </button>

      <ProgressBar />
    {:else}
      <button
        class="btn variant-ghost"
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
