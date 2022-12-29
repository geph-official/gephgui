<script lang="ts">
  import Tab, { Icon, Label } from "@smui/tab";
  import TabBar from "@smui/tab-bar";
  let active_tab = "Home";
  let tabs = ["Home", "Settings"];
  import ViewDashBoard from "svelte-material-icons/ViewDashboard.svelte";
  import Bell from "svelte-material-icons/Bell.svelte";
  import ChartMultiline from "svelte-material-icons/ChartMultiline.svelte";
  import CogBox from "svelte-material-icons/CogBox.svelte";

  import { curr_lang, l10n } from "./lib/l10n";
  import Home from "./Home.svelte";
  import { persistentWritable, pref_userpwd } from "./lib/prefs";
  import Settings from "./Settings.svelte";
  import Login from "./Login.svelte";
  import { setErrorContext } from "./lib/utils";
  import Dialog from "@smui/dialog";
  import { Content, Header, Title, Actions } from "@smui/dialog";
  import GButton from "./lib/GButton.svelte";
  import { onMount } from "svelte";
  import { native_gate } from "./native-gate";
  // import Graphs from "./Graphs.svelte";
  import type { Writable } from "svelte/store";

  let error_string = "";
  setErrorContext((err) => {
    error_string = err;
  });

  const autoupdate_warning_shown: Writable<boolean> = persistentWritable(
    "autoupdate_warning_shown_1",
    false
  );

  const privacy_notice_shown: Writable<boolean> = persistentWritable(
    "privacy_notice_shown",
    false
  );
</script>

<svelte:head>
  <title>{l10n($curr_lang, "geph")}</title>
</svelte:head>

<main lang={$curr_lang} dir="auto">
  {#await native_gate() then gate}
    <Dialog
      open={!$autoupdate_warning_shown && !gate.supports_autoupdate}
      scrimClickAction=""
      escapeKeyAction=""
    >
      <Header><Title>{l10n($curr_lang, "note")}</Title></Header>
      <Content>
        {l10n($curr_lang, "no-update-blurb")} <br />
        <a href="https://t.me/s/gephannounce" target="_blank" rel="noopener"
          >@gephannounce</a
        >
      </Content>
      <Actions>
        <GButton onClick={() => ($autoupdate_warning_shown = true)}>OK</GButton>
      </Actions>
    </Dialog>

    <Dialog
      open={!$privacy_notice_shown}
      scrimClickAction=""
      escapeKeyAction=""
    >
      <Header><Title>{l10n($curr_lang, "note")}</Title></Header>
      <Content>
        <p>
          We never modify, redirect, or inject data into users&#39; traffic. We
          do not keep user activity details of any kind, and maintain the
          minimum amount of data required to authenticate users, route traffic
          through Geph servers, and process payments:
        </p>
        <p>
          <strong>Username &amp; password</strong>: For every user, we store a
          username, an Argon2 hardened password hash, and the time at which the
          user was created. We also keep track of all Plus users using opaque
          subscription IDs. We use this information for user authentication.
        </p>
        <p>
          <strong>Transaction history</strong>: We store a list of all payment
          activity per user, which does not contain any information about the
          user&#39;s payment method.
        </p>
        <p>
          <strong>Ephemeral session data</strong>: We temporarily store, in
          memory, information required to encrypt your traffic and route it
          through Geph&#39;s servers. This information is deleted after you
          disconnect, and is never stored persistently.
        </p>
        <p>
          For more information, see our <a
            href="https://github.com/geph-official/geph4/wiki/Policies-and-terms"
            target="_blank"
            rel="nooopener">policies &amp; terms of service</a
          >.
        </p>
      </Content>
      <Actions>
        <GButton onClick={() => ($privacy_notice_shown = true)}>OK</GButton>
      </Actions>
    </Dialog>
  {/await}

  <Dialog open={error_string !== ""} scrimClickAction="" escapeKeyAction="">
    <Header><Title>{l10n($curr_lang, "error")}</Title></Header>
    <Content><pre>{error_string}</pre></Content>
    <Actions>
      <GButton onClick={() => (error_string = "")}>OK</GButton>
    </Actions>
  </Dialog>

  <Dialog open={error_string !== ""} scrimClickAction="" escapeKeyAction="">
    <Header><Title>{l10n($curr_lang, "error")}</Title></Header>
    <Content><pre>{error_string}</pre></Content>
    <Actions>
      <GButton onClick={() => (error_string = "")}>OK</GButton>
    </Actions>
  </Dialog>
  {#if !$pref_userpwd}
    <Login />
  {:else}
    <div class="big-container">
      {#if active_tab == "Home"}
        <Home />
      {/if}
      <!-- {#if active_tab == "Graphs"}
        <Graphs />
      {/if} -->
      {#if active_tab == "Settings"}
        <Settings />
      {/if}
    </div>
    <TabBar {tabs} let:tab bind:active={active_tab}>
      <!-- Note: the `tab` property is required! -->
      <Tab {tab}>
        <Icon>
          {#if tab == "Home"}
            <ViewDashBoard />
            <!-- {:else if tab == "Graphs"}
            <ChartMultiline /> -->
          {:else if tab == "Settings"}
            <CogBox />
          {:else}
            <CogBox />
          {/if}
        </Icon>
      </Tab>
    </TabBar>
  {/if}
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100vh;
    max-height: 100vh;
    padding: 0;
    margin: 0;
  }
  .big-container {
    flex-grow: 1;

    overflow-y: scroll;
  }
</style>
