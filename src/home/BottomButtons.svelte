<script lang="ts">
  import Close from "svelte-material-icons/Close.svelte";
  import { curr_lang, l10n } from "../lib/l10n";
  import DataTable, { Head, Body, Row, Cell } from "@smui/data-table";
  import Dialog, { Header, Title, Content, Actions } from "@smui/dialog";
  import GButton from "../lib/GButton.svelte";
  import flag from "country-code-emoji";
  import { native_gate, type ExitDescriptor } from "../native-gate";
  import Button, { Label } from "@smui/button";
  import LinearProgress from "@smui/linear-progress";
  import type { SnackbarComponentDev } from "@smui/snackbar";
  import Snackbar from "@smui/snackbar";
  import { pref_userpwd } from "../lib/prefs";
  import { emojify } from "../lib/utils";
  import shuffle from "knuth-shuffle-seeded";

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
    loading = true;
    if ($pref_userpwd) {
      let gate = await native_gate();
      const r = await gate.sync_exits(
        $pref_userpwd.username,
        $pref_userpwd.password
      );
      // shuffle and then deduplicate
      shuffle(r);
      let seen = {};
      let new_exits: ExitDescriptor[] = [];
      r.forEach((exit) => {
        if (!seen[exit.country_code + "." + exit.city_code]) {
          seen[exit.country_code + "." + exit.city_code] = true;
          new_exits.push(exit);
        }
      });
      new_exits.sort(
        (a, b) =>
          a.country_code.localeCompare(b.country_code) * 100 +
          a.city_code.localeCompare(b.city_code) * 10 +
          a.hostname.localeCompare(b.hostname)
      );
      loading = false;
      return new_exits;
    } else {
      throw "nothing";
    }
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
    <DataTable style="width: 100%">
      <Head>
        <Row>
          <Cell>{l10n($curr_lang, "country")}</Cell>
          <Cell>{l10n($curr_lang, "city")}</Cell>
          <!-- <Cell>{l10n($curr_lang, "server-id")}</Cell> -->
          <Cell>{l10n($curr_lang, "allowed")}</Cell>
        </Row>
      </Head>
      {#await sync_exits()}
        <Body />
      {:then exit_list}
        <Body>
          {#each exit_list as exit}
            <Row
              style={block_plus && !exit.allowed_levels.includes("free")
                ? "background-color: #ccc"
                : ""}
              on:click={() => {
                if (block_plus && !exit.allowed_levels.includes("free")) {
                  blockSnackbar.open();
                } else {
                  onSelectExit(exit);
                  exit_selection_open = false;
                }
              }}
            >
              <Cell
                ><span use:emojify
                  >{flag(exit.country_code)}
                  {exit.country_code.toUpperCase()}</span
                ></Cell
              >
              <Cell>{l10n($curr_lang, exit.city_code)}</Cell>
              <!-- <Cell>{exit.signing_key.substring(0, 10)}</Cell> -->
              <Cell
                >{#if exit.allowed_levels.includes("free")}{l10n(
                    $curr_lang,
                    "free-server"
                  )}{:else}{l10n($curr_lang, "plus-server")}{/if}</Cell
              >
            </Row>
          {/each}
        </Body>
      {/await}

      <LinearProgress
        indeterminate
        aria-label="Data is being loaded..."
        slot="progress"
        closed={!loading}
      />
    </DataTable>

    <!-- <Actions>
      <Button
        on:click={() => {
          onSelectExit(null);
        }}
        color="secondary"
        variant="unelevated"
      >
        <Label>{l10n($curr_lang, "use-automatic")}</Label>
      </Button>
    </Actions> -->
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

  .spacer {
    height: 0.5rem;
  }
</style>
