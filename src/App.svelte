<script lang="ts">
  import { AppBar } from "@skeletonlabs/skeleton";
  import CogOutline from "svelte-material-icons/CogOutline.svelte";
  import SettingsPopup from "./SettingsPopup.svelte";
  import { fly } from "svelte/transition";

  import { curr_lang, l10n } from "./lib/l10n";
  import Login from "./Login.svelte";
  import { curr_valid_secret } from "./lib/user";
  import Main from "./Main.svelte";

  let settingsOpen = false;
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
        <a on:click={() => ($curr_valid_secret = null)}>logout</a>
      {/if}
      <button
        on:click={() => {
          console.log("clicked");
          return (settingsOpen = !settingsOpen);
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

  <div id="settings-popup" transition:fly={{ x: 0, y: 200, duration: 300 }}>
    <SettingsPopup bind:open={settingsOpen} />
  </div>
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
