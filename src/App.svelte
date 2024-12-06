<script lang="ts">
  import { AppBar } from "@skeletonlabs/skeleton";
  import AccountCircleOutline from "svelte-material-icons/AccountCircleOutline.svelte";
  import CogOutline from "svelte-material-icons/CogOutline.svelte";
  import SettingsPopup from "./SettingsPopup.svelte";
  import { fly } from "svelte/transition";

  import { curr_lang, l10n } from "./lib/l10n";
  import Login from "./Login.svelte";
  import { curr_valid_secret } from "./lib/user";
  import Main from "./Main.svelte";
  import AccountPopup from "./AccountPopup.svelte";

  let settingsOpen = false;
  let accountOpen = false;
</script>

<svelte:head>
  <title>{l10n($curr_lang, "geph")}</title>
</svelte:head>

<main lang={$curr_lang} dir="auto" data-theme="skeleton" class="bg-surface-50">
  <AppBar>
    <svelte:fragment slot="lead">
      <img src="/gephlogo.png" id="logo" alt="Geph logo" />
    </svelte:fragment>
    <b id="logo-text">Geph</b>
    <svelte:fragment slot="trail">
      {#if $curr_valid_secret !== null}
        <button
          on:click={() => {
            accountOpen = true;
          }}
        >
          <AccountCircleOutline size="1.5rem" />
        </button>
      {/if}
      <button
        on:click={() => {
          settingsOpen = true;
        }}
      >
        <CogOutline size="1.5rem" />
      </button>
    </svelte:fragment>
  </AppBar>

  {#if $curr_valid_secret === null}
    <Login />
  {:else}
    <Main secret={$curr_valid_secret} />
  {/if}

  <SettingsPopup bind:open={settingsOpen} />
  <AccountPopup bind:open={accountOpen} />
</main>

<style>
  main {
    height: 100vh;
    display: flex;
    flex-direction: column;
  }
  #logo {
    height: 1.7rem;
  }

  #logo-text {
    font-size: 1.1rem;
  }
</style>
