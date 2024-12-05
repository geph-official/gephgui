<script>
  import { SlideToggle } from "@skeletonlabs/skeleton";
  import SingleSetting from "./SingleSetting.svelte";
  import { curr_lang, l10n } from "../lib/l10n";
  import { get } from "svelte/store";
  export let setting;
  const store = setting.store;
</script>

<SingleSetting collapse={setting.type === "collapse"}>
  <svelte:fragment slot="icon">
    {#if setting.icon}
      <svelte:component this={setting.icon} size="1.4rem" />
    {/if}
  </svelte:fragment>

  <svelte:fragment slot="description">
    <div class="main">{l10n($curr_lang, setting.description)}</div>
    {#if setting.blurb}
      <small>
        {l10n($curr_lang, setting.blurb)}
      </small>
    {/if}
  </svelte:fragment>
  <svelte:fragment slot="switch">
    {#if setting.type === "checkbox"}
      <SlideToggle name={setting.description} size="sm" bind:checked={$store} />
    {/if}
  </svelte:fragment>
  <svelte:fragment slot="collapse">
    {#if setting.type === "collapse"}
      {#each setting.inner as setting}
        <svelte:self {setting} />
      {/each}
    {/if}
  </svelte:fragment>
</SingleSetting>

<style>
  small {
    display: block;
    margin-top: -0.4rem;
    font-weight: 500;
    opacity: 0.8;
  }
</style>
