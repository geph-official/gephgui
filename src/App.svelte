<script lang="ts">
  import {
    AppBar,
    Modal,
    Toast,
    initializeStores,
  } from "@skeletonlabs/skeleton";
  import AccountCircleOutline from "svelte-material-icons/AccountCircleOutline.svelte";
  import CogOutline from "svelte-material-icons/CogOutline.svelte";
  import SettingsPopup from "./SettingsPopup.svelte";

  import { curr_lang, l10n } from "./lib/l10n";
  import Login from "./Login.svelte";
  import { app_status, curr_valid_secret } from "./lib/user";
  import Main from "./Main.svelte";
  import AccountPopup from "./AccountPopup.svelte";
  import PaymentPopup from "./PaymentPopup.svelte";
  import { pref_lightdark, pref_wizard } from "./lib/prefs";

  import FreeVoucherButton from "./FreeVoucherButton.svelte";

  let settingsOpen = false;
  let accountOpen = false;

  initializeStores();

  $: document.body.setAttribute(
    "data-theme",
    $pref_lightdark === "light" ? "light-theme" : "dark-theme",
  );

  $: document.body.setAttribute("lang", $curr_lang);
</script>

<svelte:head>
  <title>{l10n($curr_lang, "geph")}</title>
</svelte:head>

<main lang={$curr_lang} dir="auto">
  <Modal />
  <Toast />
  <AppBar>
    <svelte:fragment slot="lead">
      <img src="gephlogo.png" id="logo" alt="Geph logo" />
    </svelte:fragment>
    <!-- <b id="logo-text">{l10n($curr_lang, "geph")}</b> -->
    <svelte:fragment slot="trail">
      {#if $curr_valid_secret !== null && (!$pref_wizard || $app_status?.account.level !== "Free")}
        <FreeVoucherButton />
      {/if}
      <button
        on:click={() => {
          accountOpen = true;
        }}
      >
        <AccountCircleOutline size="1.5rem" />
      </button>
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
    <Main />
  {/if}

  <SettingsPopup bind:open={settingsOpen} />
  <AccountPopup bind:open={accountOpen} />
  <PaymentPopup />
</main>

<style>
  main {
    max-height: 100vh;
    height: 100vh;
    display: flex;
    flex-direction: column;
  }
  #logo {
    height: 1.7rem;
  }
</style>
