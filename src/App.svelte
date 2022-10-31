<script lang="ts">
  import Tab, { Icon, Label } from "@smui/tab";
  import TabBar from "@smui/tab-bar";
  let active_tab = "Home";
  let tabs = ["Home", "Graphs", "Settings"];
  import ViewDashBoard from "svelte-material-icons/ViewDashboard.svelte";
  import Bell from "svelte-material-icons/Bell.svelte";
  import ChartMultiline from "svelte-material-icons/ChartMultiline.svelte";
  import CogBox from "svelte-material-icons/CogBox.svelte";

  import { curr_lang, l10n } from "./lib/l10n";
  import Home from "./Home.svelte";
  import { pref_userpwd } from "./lib/prefs";
  import Settings from "./Settings.svelte";
  import Login from "./Login.svelte";
  import { setErrorContext } from "./lib/utils";
  import Dialog from "@smui/dialog";
  import { Content, Header, Title, Actions } from "@smui/dialog";
  import GButton from "./lib/GButton.svelte";
  import { onMount } from "svelte";
  import { native_gate } from "./native-gate";
  import Graphs from "./Graphs.svelte";

  let error_string = "";
  setErrorContext((err) => {
    error_string = err;
  });
</script>

<svelte:head>
  <title>{l10n($curr_lang, "geph")}</title>
</svelte:head>

<main lang={$curr_lang}>
  <Dialog open={error_string !== ""} scrimClickAction="" escapeKeyAction="">
    <Header><Title>{l10n($curr_lang, "error")}</Title></Header>
    <Content>{error_string}</Content>
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
      {#if active_tab == "Graphs"}
        <Graphs />
      {/if}
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
          {:else if tab == "Graphs"}
            <ChartMultiline />
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
