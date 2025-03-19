<script>
  import { SlideToggle } from "@skeletonlabs/skeleton";
  import SingleSetting from "./SingleSetting.svelte";
  import { curr_lang, l10n } from "../lib/l10n";
  import { get } from "svelte/store";
  export let setting;
  const store = setting.store;

  let open = false;

  function handleClick() {
    if (setting.disabled && setting.onClickDisabled) {
      setting.onClickDisabled();
    } else if (setting.type === "collapse") {
      open = !open;
    }
  }

  function handleToggle(event) {
    if (setting.onToggle) {
      setting.onToggle(event.target.checked);
    }
  }
</script>

<SingleSetting
  collapse={setting.type === "collapse"}
  disabled={setting.disabled}
  on:click={handleClick}
  {open}
>
  <svelte:fragment slot="icon">
    {#if setting.icon}
      <svelte:component this={setting.icon} size="1.4rem" />
    {/if}
  </svelte:fragment>

  <svelte:fragment slot="description">
    <div class="main flex flex-row items-center gap-1">
      {l10n($curr_lang, setting.description)}
      {#if setting.disabled}
        <span class="badge variant-ghost-warning">PLUS</span>
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
        on:change={handleToggle}
      />
    {/if}
  </svelte:fragment>
  <svelte:fragment slot="collapse">
    {#if setting.type === "collapse"}
      {#each setting.inner as innerSetting}
        <svelte:self
          setting={{
            ...innerSetting,
            // disabled: setting.disabled || innerSetting.disabled,
          }}
        />
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
