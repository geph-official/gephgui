<script lang="ts">
  import Button, { Label } from "@smui/button";
  import Dialog, { Actions, Content, Header, Title } from "@smui/dialog";
  import { curr_lang, l10n } from "../lib/l10n";
  import GButton from "../lib/GButton.svelte";
  import { pref_userpwd } from "../lib/prefs";

  export let username: string;
  export let open: boolean;

  $: extend_url = `https://geph.io/billing/login?next=%2Fbilling%2Fdashboard&uname=${encodeURIComponent(
    username
  )}&pwd=${encodeURIComponent($pref_userpwd ? $pref_userpwd.password : "")}`;
</script>

<Dialog bind:open scrimClickAction="" escapeKeyAction="">
  <Header>
    <Title id="buyplus-title">{l10n($curr_lang, "buy-plus")}</Title>
  </Header>
  <Content>
    <p>{@html l10n($curr_lang, "buy-plus-description")}</p>
  </Content>
  <Actions>
    <GButton
      onClick={() => {
        open = false;
      }}
      inverted
    >
      <Label>{l10n($curr_lang, "cancel")}</Label>
    </GButton>
    &nbsp;
    <a href={extend_url} target="_blank" rel="noopener noreferrer">
      <GButton>
        <Label>{l10n($curr_lang, "proceed")}</Label>
      </GButton>
    </a>
  </Actions>
</Dialog>

<style>
  p {
    font-size: 1rem;
    padding: 1rem;
  }
</style>
