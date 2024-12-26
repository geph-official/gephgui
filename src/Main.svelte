<script lang="ts">
  export let secret: string;
  import { curr_lang, l10n } from "./lib/l10n";
  import { curr_conn_status } from "./lib/user";

  import {
    pref_app_whitelist,
    pref_block_ads,
    pref_block_adult,
    pref_exit_constraint,
    pref_global_vpn,
    pref_listen_all,
    pref_proxy_autoconf,
    pref_use_prc_whitelist,
  } from "./lib/prefs";
  import { native_gate } from "./native-gate";
  import { ProgressBar } from "@skeletonlabs/skeleton";
  import ChevronRight from "svelte-material-icons/ChevronRight.svelte";
  import ServerSelectPopup from "./ServerSelectPopup.svelte";
  import Flag from "./lib/Flag.svelte";
  import AccountExtender from "./AccountExtender.svelte";
  import NewsFeed from "./NewsFeed.svelte";
  import Graph from "./Graph.svelte";

  let serversOpen = false;

  let connectButtonDisabled = false;
  const startDaemon = async () => {
    connectButtonDisabled = true;
    try {
      const gate = await native_gate();
      const whitelistApps = Object.keys($pref_app_whitelist).filter(
        (key) => $pref_app_whitelist[key]
      );

      await gate.start_daemon({
        secret,
        metadata: {
          filter: {
            nsfw: $pref_block_adult,
            ads: $pref_block_ads,
          },
        },
        exit: "auto",
        app_whitelist: whitelistApps,
        prc_whitelist: $pref_use_prc_whitelist,
        listen_all: $pref_listen_all,
        proxy_autoconf: $pref_proxy_autoconf,
        global_vpn: $pref_global_vpn,
      });
    } finally {
      connectButtonDisabled = false;
    }
  };
  const stopDaemon = async () => {
    connectButtonDisabled = true;
    try {
      const gate = await native_gate();
      await gate.stop_daemon();
    } finally {
      connectButtonDisabled = false;
    }
  };

  const switchServers = async () => {
    if ($curr_conn_status === "disconnected") serversOpen = true;
  };
</script>

<div id="main">
  <ServerSelectPopup bind:open={serversOpen} />
  <div class="flex flex-col gap-5">
    <AccountExtender />
    <div class="flex flex-row gap-4">
      <div class="flex-1 card p-2"><Graph /></div>
      <div class="flex-1 card p-3"><Graph /></div>
    </div>
  </div>

  <NewsFeed />

  <div class="bottom card flex flex-col gap-3">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      class="flex flex-row"
      class:cursor-pointer={$curr_conn_status === "disconnected"}
      on:click={() => switchServers()}
    >
      <div class="server-name grow">
        {#if $pref_exit_constraint === "auto"}
          {l10n($curr_lang, "best-free-server")}<br />
        {:else}
          {$pref_exit_constraint.country} / {$pref_exit_constraint.city}<br />
        {/if}
        <div class="flex flex-row mt-1">
          {#if $curr_conn_status !== null && $curr_conn_status !== "disconnected" && $curr_conn_status !== "connecting"}
            <small><Flag country={$curr_conn_status.country} /></small>
            <small>
              {$curr_conn_status.exit}

              <span class="font-normal">
                [{#if $curr_conn_status.bridge}{$curr_conn_status.bridge}{:else}{l10n(
                    $curr_lang,
                    "direct"
                  )}{/if}]
              </span>
            </small>
          {:else}
            <small>{l10n($curr_lang, "auto-select")}</small>
          {/if}
        </div>
      </div>
      <div class="icon">
        {#if $curr_conn_status === "disconnected"}
          <ChevronRight size="1.5rem" />
        {/if}
      </div>
    </div>

    {#if $curr_conn_status === "disconnected"}
      <button
        class="btn variant-filled"
        on:click={() => startDaemon()}
        disabled={connectButtonDisabled}
      >
        {l10n($curr_lang, "connect")}
      </button>
    {:else if $curr_conn_status === "connecting"}
      <button
        class="btn variant-ghost"
        on:click={() => stopDaemon()}
        disabled={connectButtonDisabled}
      >
        {l10n($curr_lang, "cancel")}
      </button>

      <ProgressBar />
    {:else}
      <button
        class="btn variant-ghost"
        on:click={() => stopDaemon()}
        disabled={connectButtonDisabled}
      >
        {l10n($curr_lang, "disconnect")}
      </button>
    {/if}
  </div>
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
