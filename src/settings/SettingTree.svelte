<script lang="ts">
  import SettingTree from "./SettingTree.svelte";
  import { SlideToggle } from "@skeletonlabs/skeleton";
  import { writable } from "svelte/store";
  import type { Writable } from "svelte/store";
  import SingleSetting from "./SingleSetting.svelte";
  import { curr_lang, l10n } from "../lib/l10n";
  import { fade } from "svelte/transition";
  import type { Setting } from "./types";

  let { setting }: { setting: Setting } = $props();
  const store: Writable<boolean> =
    setting.type === "checkbox" ? setting.store : writable(false);
  let open = $state(false);

  function handleClick() {
    if (setting.disabled && setting.onClickDisabled) {
      setting.onClickDisabled();
    } else if (setting.type === "collapse") {
      open = !open;
    }
  }

  function handleToggle(event: Event) {
    const checked =
      (event.currentTarget as HTMLInputElement | null)?.checked ??
      (event.target as HTMLInputElement | null)?.checked;

    if (setting.type === "checkbox" && setting.onToggle) {
      setting.onToggle(Boolean(checked));
    }
  }
</script>

{#if setting.type === "collapse" && setting.inner.length === 0}{:else}
  <SingleSetting
    collapse={setting.type === "collapse"}
    disabled={setting.disabled}
    onclick={setting.type === "collapse" ? handleClick : undefined}
    {open}
  >
    {#snippet icon()}
      
        {#if setting.icon}
          <setting.icon size="1.4rem" />
        {/if}
      
      {/snippet}

    {#snippet description()}
      
        <div class="main flex flex-row items-center gap-1">
          {l10n($curr_lang, setting.description)}
          {#if setting.disabled}
            <span class="badge variant-ghost-warning">PLUS</span>
          {/if}
          {#if setting.tag}
            <span class="badge variant-ghost-warning">{setting.tag}</span>
          {/if}
        </div>
        {#if setting.blurb}
          <small>
            {l10n($curr_lang, setting.blurb)}
          </small>
        {/if}
      
      {/snippet}
    {#snippet control()}
      {#if setting.type === "checkbox"}
        <SlideToggle
          name={setting.description}
          size="sm"
          active="bg-primary-500"
          bind:checked={$store}
          disabled={setting.disabled}
          onchange={handleToggle}
        />
      {/if}
    {/snippet}
    {#snippet details()}
      <div transition:fade>
        {#if setting.type === "collapse"}
          {#each setting.inner as innerSetting}
            <SettingTree
              setting={{
                ...innerSetting,
                // disabled: setting.disabled || innerSetting.disabled,
              }}
            />
          {/each}
        {/if}
      </div>
    {/snippet}
  </SingleSetting>
{/if}

<style>
  small {
    display: block;
    margin-top: -0.4rem;
    font-weight: 500;
    opacity: 0.8;
  }
</style>
