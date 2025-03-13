<script lang="ts">
  export let secret: string;
  import { curr_lang, l10n } from "./lib/l10n";
  import { app_status, traffic_history } from "./lib/user";

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
  import { ProgressBar } from "@skeletonlabs/skeleton";
  import ServerSelectPopup from "./ServerSelectPopup.svelte";
  import AccountExtender from "./AccountExtender.svelte";
  import NewsFeed from "./NewsFeed.svelte";
  import Wizard from "./Wizard.svelte";
  import CommunityButtons from "./CommunityButtons.svelte";
  import ConnectionControl from "./ConnectionControl.svelte";
  import Graph from "./Graph.svelte";

  let serversOpen = false;
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
    </div>

    <NewsFeed />

    <CommunityButtons />

    <div class="card">
      <Graph
        data={$traffic_history.map((s) => s / 1000 / 1000)}
        title={l10n($curr_lang, "total-traffic")}
      />
    </div>

    <ConnectionControl bind:serversOpen />
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
</style>
