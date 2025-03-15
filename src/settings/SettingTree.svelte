<script>
  import { SlideToggle } from "@skeletonlabs/skeleton";
  import SingleSetting from "./SingleSetting.svelte";
  import { curr_lang, l10n } from "../lib/l10n";
  import { get } from "svelte/store";
  export let setting;
  const store = setting.store;
  
  function handleClick() {
    if (setting.disabled && setting.onClickDisabled) {
      setting.onClickDisabled();
    }
  }
</script>

<SingleSetting 
  collapse={setting.type === "collapse"} 
  disabled={setting.disabled}
  on:click={handleClick}
>
  <svelte:fragment slot="icon">
    {#if setting.icon}
      <svelte:component this={setting.icon} size="1.4rem" />
    {/if}
  </svelte:fragment>

  <svelte:fragment slot="description">
    <div class="main">
      {l10n($curr_lang, setting.description)}
      {#if setting.disabled}
        <span class="plus-badge">PLUS</span>
      {/if}
    </div>
    {#if setting.blurb}
      <small>
        {l10n($curr_lang, setting.blurb)}
      </small>
    {/if}
  </svelte:fragment>
  <svelte:fragment slot="switch">
    {#if setting.type === "checkbox"}
      <SlideToggle
        name={setting.description}
        size="sm"
        active="bg-primary-500"
        bind:checked={$store}
        disabled={setting.disabled}
      />
    {/if}
  </svelte:fragment>
  <svelte:fragment slot="collapse">
    {#if setting.type === "collapse"}
      {#each setting.inner as innerSetting}
        <svelte:self setting={{...innerSetting, disabled: setting.disabled || innerSetting.disabled}} />
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
  
  .plus-badge {
    font-size: 0.7rem;
    font-weight: bold;
    background-color: var(--color-primary-500);
    color: white;
    padding: 0.1rem 0.3rem;
    border-radius: 0.2rem;
    margin-left: 0.5rem;
    vertical-align: middle;
  }
</style>