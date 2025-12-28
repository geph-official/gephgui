<script lang="ts">
  import { onMount } from "svelte";
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
  import DataCollectionPopup from "./DataCollectionPopup.svelte";
  import { pref_lightdark, pref_wizard, pref_seen_data_collection } from "./lib/prefs";
  import { native_gate } from "./native-gate";

  import FreeVoucherButton from "./FreeVoucherButton.svelte";
  import ExpiryWarningPopup from "./ExpiryWarningPopup.svelte";

  let settingsOpen = false;
  let accountOpen = false;
  let expiryOpen = false;
  let dataNoticeOpen = false;
  let isIOS = false;

  // Show-once-per-session flag
  let warnedThisSession = false;

  // Track days remaining and expiry for popup
  let daysRemaining: number | null = null;
  let expiryUnix: number | null = null;

  initializeStores();

  onMount(async () => {
    try {
      const gate = await native_gate();
      const info = await gate.get_native_info();
      isIOS = info.platform_type === "ios";
    } catch (error) {
      console.warn("Unable to determine platform type", error);
    }
  });

  $: document.body.setAttribute(
    "data-theme",
    $pref_lightdark === "light" ? "light-theme" : "dark-theme",
  );

  $: document.body.setAttribute("lang", $curr_lang);

  // Compute when to show expiry warning: last 3 days, Plus, non-recurring
  $: {
    const status = $app_status;
    if (
      status &&
      status.account.level === "Plus" &&
      (status.account as any).recurring === false &&
      typeof (status.account as any).expiry === "number"
    ) {
      const nowSec = Math.floor(Date.now() / 1000);
      const diffDays = Math.ceil(
        ((status.account as any).expiry - nowSec) / 86400,
      );
      daysRemaining = diffDays;
      expiryUnix = (status.account as any).expiry;

      if (!warnedThisSession && diffDays >= 0 && diffDays <= 3) {
        expiryOpen = true;
        warnedThisSession = true;
      }
    } else {
      daysRemaining = null;
      expiryUnix = null;
    }
  }

  $: if (
    isIOS &&
    $curr_valid_secret !== null &&
    !$pref_seen_data_collection &&
    !dataNoticeOpen
  ) {
    dataNoticeOpen = true;
  }
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
    <Main />
  {/if}

  <SettingsPopup bind:open={settingsOpen} />
  <AccountPopup bind:open={accountOpen} />
  <PaymentPopup />
  <ExpiryWarningPopup bind:open={expiryOpen} {daysRemaining} {expiryUnix} />
  {#if isIOS}
    <DataCollectionPopup bind:open={dataNoticeOpen} />
  {/if}
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
