<script lang="ts">
  import { curr_lang, l10n } from "../lib/l10n";
  import DataTable, { Head, Body, Row, Cell } from "@smui/data-table";
  import Dialog, { Header, Title, Content, Actions } from "@smui/dialog";
  import GButton from "../lib/GButton.svelte";
  import { native_gate, type ExitDescriptor } from "../native-gate";
  import Button, { Label } from "@smui/button";
  import LinearProgress from "@smui/linear-progress";
  import type { SnackbarComponentDev } from "@smui/snackbar";
  import Snackbar from "@smui/snackbar";
  import { pref_userpwd } from "../lib/prefs";
  import shuffle from "knuth-shuffle-seeded";
  import Flag from "../lib/Flag.svelte";
  import ExitSelector from "./ExitSelector.svelte";
  import InformationOutline from "svelte-material-icons/InformationOutline.svelte";
  import { runWithSpinner } from "../lib/modals";

  export let running: boolean;
  export let block_plus: boolean;
  export let onConnect: () => Promise<any>;
  export let onDisconnect: () => Promise<any>;
  export let onSelectExit: (x: ExitDescriptor | null) => any;

  let in_flux = false;

  // dialog stuff
  let exit_selection_open = false;
  let loading = true;
  const sync_exits = async () => {
    let rval: any = null;
    await runWithSpinner(l10n($curr_lang, "loading") + "...", 0, async () => {
      loading = true;
      if ($pref_userpwd) {
        let gate = await native_gate();
        const r = await gate.sync_exits(
          $pref_userpwd.username,
          $pref_userpwd.password
        );
        // shuffle and then deduplicate
        shuffle(r);

        r.sort(
          (a, b) =>
            a.allowed_levels
              .includes("free")
              .toString()
              .localeCompare(b.allowed_levels.includes("free").toString()) *
              1000 +
            a.country_code.localeCompare(b.country_code) * 100 +
            a.city_code.localeCompare(b.city_code) * 10 +
            Math.sign(a.load - b.load) * 5 +
            a.hostname.localeCompare(b.hostname)
        );
        loading = false;
        rval = r;
      } else {
        throw "nothing";
      }
    });
    return rval;
  };

  let blockSnackbar: SnackbarComponentDev;
</script>

<div class="wrap">
  <Snackbar bind:this={blockSnackbar}>
    <Label>{l10n($curr_lang, "plus-only-blurb")}</Label>
  </Snackbar>
  <Dialog bind:open={exit_selection_open} fullscreen>
    <Header>
      <Title id="fullscreen-title">{l10n($curr_lang, "exit-selection")}</Title>
    </Header>
    <div class="plus-explanation">
      {#if block_plus}
        {@html l10n($curr_lang, "free-is-bad")}
      {:else}
        {@html l10n($curr_lang, "plus-is-great")}
      {/if}
    </div>
    {#key exit_selection_open}
      {#await sync_exits()}
        <LinearProgress />
      {:then exit_list}
        <ExitSelector
          {exit_list}
          {block_plus}
          onSelect={(e) => {
            onSelectExit(e);
            exit_selection_open = false;
          }}
        />
      {/await}
    {/key}
  </Dialog>

  <GButton
    large
    disabled={running}
    stretch
    inverted
    color="black"
    onClick={() => (exit_selection_open = true)}
    >{l10n($curr_lang, "change-location")}</GButton
  >
  <div class="spacer" />
  {#if running}
    <GButton
      large
      disabled={in_flux}
      stretch
      color="warning"
      onClick={async () => {
        try {
          in_flux = true;
          await onDisconnect();
        } finally {
          in_flux = false;
        }
      }}
    >
      {l10n($curr_lang, "disconnect")}
    </GButton>
  {:else}
    <GButton
      large
      disabled={in_flux}
      stretch
      color="green"
      onClick={async () => {
        try {
          in_flux = true;
          await onConnect();
        } finally {
          in_flux = false;
        }
      }}
    >
      {l10n($curr_lang, "connect")}
    </GButton>
  {/if}
</div>

<style>
  .wrap {
    width: 50vw;
    margin: 2rem;
  }

  .plus-explanation {
    border: 1px solid black;
    padding: 0.5rem;
    margin-left: 1rem;
    margin-right: 1rem;
    margin-top: 0.5rem;

    align-items: center;

    border-radius: 0.5rem;
    font-size: 0.95rem;
    font-weight: 500;
    opacity: 0.8;
  }

  .spacer {
    height: 0.5rem;
  }

  .flag {
    height: 1.3rem;
    filter: brightness(0.92);
    margin-inline-end: 0.5rem;
  }

  .center {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
</style>
