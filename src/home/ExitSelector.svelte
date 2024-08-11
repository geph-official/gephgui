<script lang="ts">
  import DataTable, { Cell, Head, Row } from "@smui/data-table";
  import { curr_lang, l10n } from "../lib/l10n";
  import Checkbox from "@smui/checkbox";
  import type { ExitDescriptor } from "src/native-gate";
  import Body from "@smui/data-table/src/Body.svelte";
  import Flag from "../lib/Flag.svelte";
  import FormField from "@smui/form-field";
  import ServerNetwork from "svelte-material-icons/ServerNetwork.svelte";
  import CurrencyUsd from "svelte-material-icons/CurrencyUsd.svelte";
  import CurrencyUsdOff from "svelte-material-icons/CurrencyUsdOff.svelte";
  import ChartBoxOutline from "svelte-material-icons/ChartBoxOutline.svelte";
  import GButton from "../lib/GButton.svelte";
  export let exit_list: ExitDescriptor[];
  export let block_plus: boolean;
  export let onSelect = (e: ExitDescriptor) => {};

  $: short_exit_list = (() => {
    let new_exits: ExitDescriptor[] = [];
    let seen = {};
    exit_list.forEach((exit) => {
      if (!seen[exit.country_code + "." + exit.city_code]) {
        seen[exit.country_code + "." + exit.city_code] = true;
        new_exits.push(exit);
      }
    });
    return new_exits;
  })();

  let show_all = false;

  $: list = !show_all ? short_exit_list : exit_list;

  const numerify = (s: string) => s.match("[0-9]+");
</script>

<div class="container">
  {#each list as exit}
    <div
      class="server"
      class:disabled={block_plus && !exit.allowed_levels.includes("free")}
      on:click={() => {
        if (block_plus && !exit.allowed_levels.includes("free")) {
          console.log("cannot select plus here");
        } else {
          onSelect(exit);
        }
      }}
    >
      <div class="server-row">
        <div class="server-location">
          <Flag country={exit.country_code} />
          &nbsp;
          <span class="country-code">{exit.country_code.toUpperCase()}</span>
          &nbsp;/&nbsp;{exit.city_code}{#if show_all}-{numerify(
              exit.hostname
            )}{/if}
        </div>
        <div class="server-badges">
          <div
            class="badge"
            style={`color: white; background-color: hsl(${
              150 - Math.min(exit.load, 1.3) * 160
            }, 80%, 30%);`}
          >
            <ChartBoxOutline width="1.2rem" height="1rem" />
            {(exit.load * 100).toFixed(0)}%
          </div>
          {#if exit.allowed_levels.includes("free")}
            <div class="badge free">
              <CurrencyUsdOff width="1.2rem" height="1rem" />
              {l10n($curr_lang, "free-server")}
            </div>
          {:else}
            <div class="badge plus">
              <CurrencyUsd width="1.2rem" height="1rem" />
              {l10n($curr_lang, "plus-server")}
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/each}
  <FormField>
    <Checkbox bind:checked={show_all} />
    <span slot="label">{l10n($curr_lang, "show-all-servers")}</span>
  </FormField>
</div>

<style>
  .container {
    width: 100%;
    box-sizing: border-box;
    padding: 1rem;
  }

  .server {
    background-color: #eee;
    margin-top: 0.3rem;
    margin-bottom: 0.3rem;
    padding: 0.1rem;
    padding-inline-start: 0.5rem;
    border-radius: 0.3rem;
    cursor: pointer;
  }

  .server-badges {
    display: flex;
    flex-direction: row;
  }

  .badge {
    border-radius: 5rem;
    background-color: white;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding: 0.2rem;
    padding-inline-end: 0.3rem;
    padding-inline-start: 0.3rem;
    margin: 0.2rem;
    font-weight: 500;
    font-size: 0.7rem;
    width: 2.5rem;
  }

  .plus {
    background-color: rgb(220, 220, 255);
    /* color: white; */
  }

  .free {
    background-color: rgb(226, 255, 226);
  }

  .server-location {
    font-size: 1rem;
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-grow: 1;
  }

  .server-row {
    display: flex;
    width: 100%;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .country-code {
    font-weight: 600;
    opacity: 0.7;
  }

  .disabled {
    opacity: 0.5;
  }
</style>
