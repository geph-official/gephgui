<script lang="ts">
  import Tab, { Icon, Label } from "@smui/tab";
  import TabBar from "@smui/tab-bar";
  let active_tab = "Home";
  let tabs = ["Home", "Announcements", "Logs", "Settings"];
  import CodeBracesBox from "svelte-material-icons/CodeBracesBox.svelte";
  import ViewDashBoard from "svelte-material-icons/ViewDashboard.svelte";
  import Bullhorn from "svelte-material-icons/Bullhorn.svelte";
  import CogBox from "svelte-material-icons/CogBox.svelte";

  import { curr_lang, l10n } from "./lib/l10n";
  import Home from "./Home.svelte";
  import { persistentWritable, pref_userpwd } from "./lib/prefs";
  import Settings from "./Settings.svelte";
  import Login from "./Login.svelte";

  import Dialog from "@smui/dialog";
  import { Content, Header, Title, Actions } from "@smui/dialog";
  import GButton from "./lib/GButton.svelte";
  import { onMount } from "svelte";
  import { native_gate } from "./native-gate";
  // import Graphs from "./Graphs.svelte";
  import type { Writable } from "svelte/store";
  import Announcements from "./Announcements.svelte";
  import Spinner from "./lib/Spinner.svelte";

  const autoupdate_warning_shown: Writable<boolean> = persistentWritable(
    "autoupdate_warning_shown_1",
    false
  );

  const privacy_notice_shown: Writable<boolean> = persistentWritable(
    "privacy_notice_shown",
    false
  );

  import { extractFromXml } from "@extractus/feed-extractor";
  import { errorContent, loadingContent } from "./lib/modals";
  import Logs from "./Logs.svelte";

  interface Announcement {
    description: string;

    pubDate: string;
    link: string;
  }

  const getAnnouncements = async () => {
    const gate = await native_gate();
    const resp: string = await gate.binder_rpc("get_announcements", []);
    console.log("get_announcements returned " + resp);
    const feed: any = extractFromXml(resp, {
      descriptionMaxLen: 100000,
      normalization: false,
    });
    console.log(feed);
    return feed.item as any as Announcement[];
  };

  const announcements: Writable<Announcement[]> = persistentWritable(
    "announcements1",
    []
  );
  const announceHighlight = persistentWritable("annhigh", false);

  onMount(async () => {
    try {
      const new_announce = await getAnnouncements();
      console.log("new announce", new_announce);
      if (
        new_announce.length > 0 &&
        ($announcements.length == 0 ||
          new_announce[0].link != $announcements[0].link)
      ) {
        console.log(
          "announce changed: " +
            JSON.stringify(new_announce) +
            " vs " +
            JSON.stringify($announcements)
        );
        $announcements = new_announce;
        $announceHighlight = true;
      }
    } catch (e: any) {
      console.error("error loading announcements: " + e.toString());
    }
  });

  $: {
    if ($announceHighlight && active_tab == "Announcements")
      $announceHighlight = false;
  }
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

  <Dialog
    open={$loadingContent !== null}
    scrimClickAction=""
    escapeKeyAction=""
  >
    <div class="modal-inner">
      <Spinner />
      <div class="modal-label">
        {@html $loadingContent}
      </div>
    </div>
  </Dialog>

  <Dialog open={$errorContent !== null} scrimClickAction="" escapeKeyAction="">
    <Header><Title>{l10n($curr_lang, "error")}</Title></Header>
    <div class="modal-label" style="margin-left: 1.5rem">
      {@html $errorContent}
    </div>
    <Actions>
      <GButton onClick={() => ($errorContent = null)}>OK</GButton>
    </Actions>
  </Dialog>

  {#if !$pref_userpwd}
    <Login />
  {:else}
    <div class="big-container">
      {#if active_tab == "Home"}
        <Home />
      {/if}
      {#if active_tab == "Announcements"}
        <Announcements announces={$announcements} />
      {/if}
      {#if active_tab == "Logs"}
        <Logs />
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
          {:else if tab == "Announcements"}
            <Bullhorn color={$announceHighlight && "red"} />
          {:else if tab == "Logs"}
            <CodeBracesBox />
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
    padding: 0;
    margin: 0;
  }

  .modal-inner {
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 2rem;
    padding: 1rem;
  }

  .modal-label {
    margin-left: 1rem;
  }
</style>
