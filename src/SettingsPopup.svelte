<script>
  import { AppBar } from "@skeletonlabs/skeleton";
  import { curr_lang, l10n } from "./lib/l10n";
  import { fly } from "svelte/transition";
  import Close from "svelte-material-icons/Close.svelte";
  import Vpn from "svelte-material-icons/Vpn.svelte";
  import AirFilter from "svelte-material-icons/AirFilter.svelte";
  import CallSplit from "svelte-material-icons/CallSplit.svelte";
  import Router from "svelte-material-icons/Router.svelte";

  import SettingTree from "./settings/SettingTree.svelte";
  import {
    pref_block_ads,
    pref_block_adult,
    pref_block_gambling,
    pref_global_vpn,
    pref_routing_mode,
    pref_use_prc_whitelist,
  } from "./lib/prefs";

  export let open = false;

  const settings = {
    features: [
      {
        icon: AirFilter,
        description: "content-filtering",
        type: "collapse",
        inner: [
          {
            description: "ads-and-trackers",
            type: "checkbox",
            store: pref_block_ads,
          },
          {
            description: "gambling",
            type: "checkbox",
            store: pref_block_gambling,
          },
          {
            description: "adult-content",
            type: "checkbox",
            store: pref_block_adult,
          },
        ],
      },
      {
        icon: CallSplit,
        type: "collapse",
        description: "split-tunneling",
        inner: [
          {
            description: "exclude-prc",
            type: "checkbox",
            store: pref_use_prc_whitelist,
            blurb: "exclude-prc-blurb",
          },
        ],
      },
    ],
    network: [
      {
        icon: Vpn,
        description: "global-vpn",
        type: "checkbox",
        store: pref_global_vpn,
      },
      {
        icon: Router,
        description: "routing-mode",
        type: "options",
        options: [
          {
            description: "automatic",
            value: "auto",
          },
          {
            description: "direct",
            value: "direct",
          },
          {
            description: "bridges",
            value: "bridges",
          },
        ],
        store: pref_routing_mode,
      },
    ],
  };
</script>

{#if open}
  <div
    id="settings"
    class="bg-surface-50"
    transition:fly={{ x: 0, y: 200, duration: 300 }}
  >
    <AppBar>
      <svelte:fragment slot="lead">
        <button on:click={() => (open = false)}>
          <Close size="1.5rem" />
        </button>
      </svelte:fragment>
      <b id="logo-text">{l10n($curr_lang, "settings")}</b>
    </AppBar>

    {#each Object.entries(settings) as [section, contents]}
      <section>
        <h2 class="text-primary-700">{l10n($curr_lang, section)}</h2>
        {#each contents as setting}
          <SettingTree {setting} />
        {/each}
      </section>
    {/each}
  </div>
{/if}

<style>
  #settings {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  section {
    margin: 1rem;
  }

  h2 {
    text-transform: uppercase;
    font-weight: 600;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }
</style>
