<script lang="ts">
  import Earth from "svelte-material-icons/Earth.svelte";
  import EarthOff from "svelte-material-icons/EarthOff.svelte";
  import type { ExitDescriptor } from "src/native-gate";

  import { curr_lang, l10n } from "../lib/l10n";
  import { emojify } from "../lib/utils";
  import CircularProgress from "@smui/circular-progress";
  export let connection: "connected" | "disconnected" | "connecting";
  export let exit_descriptor: ExitDescriptor | null;
  import { slide } from "svelte/transition";
  import Flag from "../lib/Flag.svelte";

  $: p2p_allowed =
    exit_descriptor &&
    exit_descriptor.country_code != "us" &&
    exit_descriptor.country_code != "jp" &&
    exit_descriptor.country_code != "de";
</script>

<div class="wrapper">
  {#if connection == "disconnected"}
    <div class="connect-status disconnected" transition:slide|local>
      <div class="connect-icon">
        <EarthOff width="1.4rem" height="1.4rem" />
      </div>
      {l10n($curr_lang, connection)}
    </div>
  {/if}
  {#if connection == "connecting"}
    <div class="connect-status connecting" transition:slide|local>
      <div class="connect-icon">
        <CircularProgress
          style="height: 1.4rem; width: 1.4rem;"
          indeterminate
        />
      </div>
      {l10n($curr_lang, connection)}
    </div>
  {/if}
  {#if connection == "connected"}
    <div class="connect-status connected" transition:slide|local>
      <div class="connect-icon"><Earth width="1.4rem" height="1.4rem" /></div>
      {l10n($curr_lang, connection)}
    </div>
  {/if}

  <div class="description">
    <div class="location">
      {#if exit_descriptor}
        <span class="country-code">
          {exit_descriptor.country_code.toUpperCase()}
        </span>
        /
        {l10n($curr_lang, exit_descriptor.city_code)}
      {:else}
        {l10n($curr_lang, "automatic")}
      {/if}
    </div>
    {#key exit_descriptor}
      <div class="hostname">
        {#if exit_descriptor}
          <Flag country={exit_descriptor.country_code} />
          {exit_descriptor.hostname}
        {:else}
          🤔
          {l10n($curr_lang, "automatic-blurb")}{/if}
      </div>
    {/key}
    <div class="badges">
      {#if exit_descriptor}
        {#if exit_descriptor.allowed_levels.includes("free")}
          <div class="badge green">{l10n($curr_lang, "free-server")}</div>
        {:else}
          <div class="badge purple">{l10n($curr_lang, "plus-server")}</div>
        {/if}
        {#if p2p_allowed}
          <div class="badge green">{l10n($curr_lang, "p2p-yes")}</div>
        {:else}
          <div class="badge red">{l10n($curr_lang, "p2p-no")}</div>
        {/if}
      {:else}&nbsp;{/if}
    </div>
  </div>
</div>

<style>
  .wrapper {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .flag-container {
    /* background-color: black; */
    width: 1.2rem;
    display: inline-block;
  }
  .country-code {
    opacity: 0.6;
    font-weight: 500;
  }

  .connect-status {
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 0.1rem;
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .connect-icon {
    display: flex;
    margin-right: 0.3rem;
  }

  .description div {
    margin-bottom: 0.2rem;
  }
  .location {
    font-size: 2rem;
    /* font-weight: 300; */
    letter-spacing: -0.03em;
  }

  .disconnected {
    color: rgb(144, 15, 15);
  }

  .connecting {
    color: rgb(74, 74, 74);
  }

  .connected {
    color: rgb(30, 112, 30);
  }

  .hostname {
    font-family: "Iosevka", "Consolas", monospace;
    display: flex;
    align-items: center;
  }

  .badge {
    border: 1px solid black;
    padding: 0.2rem;
    border-radius: 10rem;
    padding-left: 0.4rem;
    padding-right: 0.4rem;
    margin-right: 0.4rem;
    font-size: 0.9rem;
  }

  .badge.green {
    color: rgb(30, 112, 30);
    border-color: rgb(30, 112, 30);
  }

  .badge.red {
    color: rgb(144, 15, 15);
    border-color: rgb(144, 15, 15);
  }

  .badge.purple {
    color: rgb(120, 15, 144);
    border-color: rgb(120, 15, 144);
  }

  .badges {
    display: flex;
    flex-direction: row;
  }
</style>
