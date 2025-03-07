<script lang="ts">
  export let secret: string;
  import { curr_lang, l10n } from "./lib/l10n";
  import { app_status, startDaemonArgs } from "./lib/user";

  import {
    pref_app_whitelist,
    pref_block_ads,
    pref_block_adult,
    pref_exit_constraint_derived,
    pref_global_vpn,
    pref_listen_all,
    pref_proxy_autoconf,
    pref_use_prc_whitelist,
    pref_wizard,
  } from "./lib/prefs";
  import { native_gate } from "./native-gate";
  import { ProgressBar, getModalStore } from "@skeletonlabs/skeleton";
  import ChevronRight from "svelte-material-icons/ChevronRight.svelte";
  import ServerSelectPopup from "./ServerSelectPopup.svelte";
  import Flag from "./lib/Flag.svelte";
  import AccountExtender from "./AccountExtender.svelte";
  import NewsFeed from "./NewsFeed.svelte";
  import Graph from "./Graph.svelte";
  import { showErrorModal } from "./lib/utils";
  import Wizard from "./Wizard.svelte";
  import CommunityButtons from "./CommunityButtons.svelte";

  let serversOpen = false;

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
      if ($app_status?.connection === "disconnected") serversOpen = true;
    }
  };
</script>

<div id="main">
  {#if $app_status}
    {#if $app_status.account.level === "Free"}
      {#if $pref_wizard}
        <Wizard />
      {/if}
    {/if}
    <ServerSelectPopup bind:open={serversOpen} />
    <div class="flex flex-col gap-5">
      <AccountExtender />
      <!-- <div class="flex flex-row gap-4">
        <div class="flex-1 card p-2">
          <Graph
            data={$app_status.stats.total_mbps.map((s) => s / 1000.0)}
            unit="Gbps"
            title={l10n($curr_lang, "total-traffic")}
          />
        </div>
        <div class="flex-1 card p-2">
          <Graph
            data={$app_status.stats.total_users}
            unit="users"
            title={l10n($curr_lang, "total-users")}
          />
        </div> 
      </div>-->
    </div>

    <NewsFeed />

    <CommunityButtons />

    <div class="bottom card flex flex-col">
      <div
        class="flex flex-row mb-3 cursor-pointer"
        on:click={() => switchServers()}
      >
        <div class="server-name grow">
          {#if $pref_exit_constraint_derived === "auto"}
            {l10n($curr_lang, "automatic")}<br />
          {:else}
            {$pref_exit_constraint_derived.country} / {$pref_exit_constraint_derived.city}<br
            />
          {/if}
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
      </div>

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
  {:else}
    <ProgressBar />
  {/if}
</div>

<style>
  #main {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    padding: 1rem;
    max-height: calc(100vh - 60px);
  }

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
