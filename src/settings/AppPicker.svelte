<script lang="ts">
  import Dialog, { Header, Title, Content, Actions } from "@smui/dialog";
  import { curr_lang, l10n } from "../lib/l10n";
  import Button, { Label } from "@smui/button";
  import { native_gate, type AppDescriptor } from "../native-gate";
  import { onMount } from "svelte";
  export let open: boolean;
  import Checkbox from "@smui/checkbox";
  import { pref_app_whitelist } from "../lib/prefs";
  import LinearProgress from "@smui/linear-progress/src/LinearProgress.svelte";
  import CircularProgress from "@smui/circular-progress";
</script>

<template>
  <Dialog bind:open fullscreen>
    <Header
      ><Title id="fullscreen-title"
        >{l10n($curr_lang, "select-excluded-apps")}</Title
      ></Header
    >

    {#key open}
      <div class="outer">
        {#await native_gate().sync_app_list()}
          <LinearProgress style="width=100%" indeterminate />
        {:then app_list}
          {#each app_list as app}
            <div class="app">
              {#await native_gate().get_app_icon_url(app.id)}
                <div class="icon">
                  <CircularProgress
                    style="height:100%; width: 100%"
                    indeterminate
                  />
                </div>
              {:then icon_url}
                <img class="icon" src={icon_url} alt="" />
              {/await}
              <div class="desc">
                {app.friendly_name} <br />
                <small>{app.id}</small>
              </div>
              <div class="switch">
                <Checkbox
                  checked={Object.keys($pref_app_whitelist).includes(app.id) &&
                    $pref_app_whitelist[app.id]}
                  on:change={(e) => {
                    const current =
                      Object.keys($pref_app_whitelist).includes(app.id) &&
                      $pref_app_whitelist[app.id];
                    $pref_app_whitelist[app.id] = !current;
                  }}
                />
              </div>
            </div>
          {/each}
        {/await}
      </div>
    {/key}
    <Actions>
      <Button
        on:click={() => {
          // HACK force $pref_app_whitelist to save
          const c = JSON.parse(JSON.stringify($pref_app_whitelist));
          $pref_app_whitelist = c;
          open = false;
        }}
      >
        <Label>OK</Label>
      </Button>
    </Actions>
  </Dialog>
</template>

<style>
  .app {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  small {
    opacity: 0.7;
  }

  .desc {
    flex-grow: 1;
    padding-left: 1rem;
  }

  .icon {
    width: 2rem;
    height: 2rem;
  }

  .outer {
    padding: 1rem;
  }
</style>
