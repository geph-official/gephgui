<script lang="ts">
  import { curr_lang, l10n } from "./lib/l10n";
  import { app_status, conn_status, startDaemonArgs } from "./lib/user";
  import {
    pref_exit_constraint_derived,
    pref_seen_direct_prompt,
  } from "./lib/prefs";
  import { get } from "svelte/store";
  import { native_gate } from "./native-gate";
  import {
    ProgressBar,
    getModalStore,
    type ModalSettings,
  } from "@skeletonlabs/skeleton";
  import { CaretRight } from "phosphor-svelte";
  import Flag from "./lib/Flag.svelte";
  import StatusCircle from "./lib/StatusCircle.svelte";
  import DirectConnectionPromptPopup from "./DirectConnectionPromptPopup.svelte";
  import { showErrorModal } from "./lib/utils";

  interface Props {
    serversOpen: boolean;
  }

  let { serversOpen = $bindable() }: Props = $props();

  let connectButtonDisabled = $state(false);
  let directPromptOpen = $state(false);
  const modalStore = getModalStore();

  const startDaemonNow = async () => {
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

  const handleStartDaemon = async () => {
    if (!get(pref_seen_direct_prompt)) {
      directPromptOpen = true;
      return;
    }
    await startDaemonNow();
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
    if ($conn_status !== "disconnected") {
      const modal: ModalSettings = {
        type: "alert",
        title: l10n($curr_lang, "disconnect-first-title"),
        body: l10n($curr_lang, "disconnect-first-body"),
      };
      modalStore.trigger(modal);
      return;
    }
    serversOpen = true;
  };

  let connectionStatus =
    $derived($conn_status === "disconnected"
      ? "disconnected"
      : $conn_status === "connecting"
        ? "connecting"
        : "connected");

  let sessionGroups = $derived.by(() => {
    if ($conn_status === "disconnected" || $conn_status === "connecting") {
      return [];
    }
    const groups = new Map<
      string,
      { country: string; exit: string; count: number }
    >();
    for (const s of $conn_status.sessions) {
      const key = `${s.country}|${s.exit}`;
      const g = groups.get(key);
      if (g) {
        g.count += 1;
      } else {
        groups.set(key, { country: s.country, exit: s.exit, count: 1 });
      }
    }
    return [...groups.values()].sort(
      (a, b) => b.count - a.count || a.country.localeCompare(b.country),
    );
  });
</script>

{#if $app_status}
  <div class="bottom flex flex-col mt-2 p-1">
    <button
      class="flex flex-row mb-4 text-left"
      onclick={() => switchServers()}
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
            <small class="flex flex-row flex-wrap gap-x-2 gap-y-1 items-center">
              {#each sessionGroups as g}
                <span class="inline-flex items-center gap-1">
                  <Flag country={g.country} />
                  <span>{g.exit}</span>
                </span>
              {/each}
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
        <CaretRight size="1.5rem" />
      </div>
    </button>

    {#if $conn_status === "disconnected"}
      <button
        class="btn variant-filled mb-1"
        onclick={() => handleStartDaemon()}
        disabled={connectButtonDisabled}
      >
        {l10n($curr_lang, "connect")}
      </button>
    {:else if $conn_status === "connecting"}
      <button
        class="btn variant-ghost mb-1"
        onclick={() => handleStopDaemon()}
        disabled={connectButtonDisabled}
      >
        {l10n($curr_lang, "cancel")}
      </button>
    {:else}
      <button
        class="btn variant-ghost mb-1"
        onclick={() => handleStopDaemon()}
        disabled={connectButtonDisabled}
      >
        {l10n($curr_lang, "disconnect")}
      </button>
    {/if}

    {#if $conn_status === "connecting" || connectButtonDisabled}
      <div class="progress-wrap"><ProgressBar key="pbar" /></div>
    {/if}
  </div>
{/if}

<DirectConnectionPromptPopup
  bind:open={directPromptOpen}
  onContinue={() => void startDaemonNow()}
/>

<style>
  .server-name {
    font-weight: 600;
    line-height: 1;
  }

  .server-name small {
    font-weight: 500;
  }

  .progress-wrap {
    height: 0px;
  }
</style>
