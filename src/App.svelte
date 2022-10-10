<script lang="ts">
  import svelteLogo from "./assets/svelte.svg";
  import Counter from "./lib/Counter.svelte";
  import Tab, { Icon, Label } from "@smui/tab";
  import TabBar from "@smui/tab-bar";
  let active_tab = "Home";
  let tabs = ["Home", "News", "Settings"];
  import ViewDashBoard from "svelte-material-icons/ViewDashboard.svelte";
  import Bell from "svelte-material-icons/Bell.svelte";
  import CogBox from "svelte-material-icons/CogBox.svelte";

  import { curr_lang, l10n } from "./lib/l10n";
  import Home from "./Home.svelte";
  import { pref_userpwd } from "./lib/prefs";
  import Button from "@smui/button/src/Button.svelte";
  import { native_gate } from "./native-gate";
</script>

<main>
  {#if !$pref_userpwd}
    <Button
      on:click={async () => {
        $pref_userpwd = { username: "bunsim", password: "fc9dfc3d" };
      }}><Label>Test login</Label></Button
    >
  {:else}
    <div class="big-container">
      {#if active_tab == "Home"}
        <Home />
      {/if}
    </div>
    <TabBar {tabs} let:tab bind:active={active_tab}>
      <!-- Note: the `tab` property is required! -->
      <Tab {tab}>
        <Icon>
          {#if tab == "Home"}
            <ViewDashBoard />
          {:else if tab == "News"}
            <Bell />
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
    padding: 0;
    margin: 0;
  }
  .big-container {
    flex-grow: 1;
  }
</style>
