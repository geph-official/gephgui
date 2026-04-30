<script lang="ts">
  import { onMount } from "svelte";
  import {
    AppBar,
    Modal,
    Toast,
    initializeStores,
  } from "@skeletonlabs/skeleton";
  import { Gear, UserCircle } from "phosphor-svelte";
  import SettingsPopup from "./SettingsPopup.svelte";

  import { curr_lang, l10n } from "./lib/l10n";
  import Login from "./Login.svelte";
  import { app_status, curr_valid_secret } from "./lib/user";
  import Main from "./Main.svelte";
  import AccountPopup from "./AccountPopup.svelte";
  import PaymentPopup from "./PaymentPopup.svelte";
  import IosPlusSubscription from "./IosPlusSubscription.svelte";
  import DataCollectionPopup from "./DataCollectionPopup.svelte";
  import { pref_lightdark, pref_wizard, pref_seen_data_collection } from "./lib/prefs";
  import { native_gate } from "./native-gate";

  import FreeVoucherButton from "./FreeVoucherButton.svelte";
  import ExpiryWarningPopup from "./ExpiryWarningPopup.svelte";

  let settingsOpen = $state(false);
  let accountOpen = $state(false);
  let expiryOpen = $state(false);
  let dataNoticeOpen = $state(false);
  let isIOS = $state(false);

  // Show-once-per-session flag
  let warnedThisSession = $state(false);

  // Track days remaining and expiry for popup
  let daysRemaining: number | null = $state(null);
  let expiryUnix: number | null = $state(null);

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

  $effect(() => {
    document.body.setAttribute(
      "data-theme",
      $pref_lightdark === "light" ? "light-theme" : "dark-theme",
    );
  });

  $effect(() => {
    document.body.setAttribute("lang", $curr_lang);
  });

  // Compute when to show expiry warning: last 3 days, Plus, non-recurring
  $effect(() => {
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
  });

  $effect(() => {
    if (
      isIOS &&
      $curr_valid_secret !== null &&
      !$pref_seen_data_collection &&
      !dataNoticeOpen
    ) {
      dataNoticeOpen = true;
    }
  });
</script>

<svelte:head>
  <title>{l10n($curr_lang, "geph")}</title>
</svelte:head>

<main lang={$curr_lang} dir="auto">
  <Modal />
  <Toast />
  <AppBar>
    {#snippet lead()}
      
      <img src="gephlogo.png" id="logo" alt="Geph logo" />
    {/snippet}
    <!-- <b id="logo-text">{l10n($curr_lang, "geph")}</b> -->
    {#snippet trail()}
      {#if $curr_valid_secret !== null && (!$pref_wizard || $app_status?.account.level !== "Free")}
        <FreeVoucherButton />
      {/if}
      {#if $curr_valid_secret !== null}
        <button
          onclick={() => {
            accountOpen = true;
          }}
        >
          <UserCircle size="1.5rem" />
        </button>
      {/if}
      <button
        onclick={() => {
          settingsOpen = true;
        }}
      >
        <Gear size="1.5rem" />
      </button>
    {/snippet}
  </AppBar>

  {#if $curr_valid_secret === null}
    <Login />
  {:else}
    <Main />
  {/if}

  <SettingsPopup bind:open={settingsOpen} />
  <AccountPopup bind:open={accountOpen} />
  {#if !isIOS}
    <PaymentPopup />
  {/if}
  <IosPlusSubscription />
  <ExpiryWarningPopup bind:open={expiryOpen} {daysRemaining} {expiryUnix} />
  {#if isIOS}
    <DataCollectionPopup bind:open={dataNoticeOpen} />
  {/if}
</main>

<style>
  main {
    height: 100vh;
    min-height: 100vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  #logo {
    height: 1.7rem;
  }
</style>
