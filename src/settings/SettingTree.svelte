<script lang="ts">
  import SettingTree from "./SettingTree.svelte";
  import { ProgressRadial, SlideToggle } from "@skeletonlabs/skeleton";
  import { writable } from "svelte/store";
  import type { Writable } from "svelte/store";
  import SingleSetting from "./SingleSetting.svelte";
  import { curr_lang, l10n } from "../lib/l10n";
  import { fade } from "svelte/transition";
  import type { Setting } from "./types";

  let { setting }: { setting: Setting } = $props();
  const store: Writable<boolean> =
    setting.type === "checkbox" ? setting.store : writable(false);
  const numStore: Writable<number> =
    setting.type === "number" ? setting.store : writable(0);
  let open = $state(false);
  // Checkbox sub-settings show whenever the checkbox is on.
  const showDetails = $derived(
    open || (setting.type === "checkbox" && !!setting.inner && $store)
  );

  function clampNumber(event: Event) {
    if (setting.type !== "number") return;
    const input = event.currentTarget as HTMLInputElement;
    const min = setting.min ?? 1;
    const max = setting.max ?? 65535;
    const parsed = parseInt(input.value, 10);
    const clamped = isNaN(parsed) ? $numStore : Math.min(max, Math.max(min, parsed));
    numStore.set(clamped);
    input.value = clamped.toString();
  }

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
    open={showDetails}
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
        <span dir="ltr" class="inline-flex">
          <SlideToggle
            name={setting.description}
            size="sm"
            active="bg-primary-500"
            bind:checked={$store}
            disabled={setting.disabled}
            onchange={handleToggle}
          />
        </span>
      {:else if setting.type === "number"}
        <input
          class="input w-24 text-end tnum"
          type="number"
          min={setting.min ?? 1}
          max={setting.max ?? 65535}
          value={$numStore}
          disabled={setting.disabled}
          onchange={clampNumber}
        />
      {:else if setting.type === "info"}
        <div class="info-value text-sm tnum">
          {#await setting.values()}
            <ProgressRadial width="w-4" stroke={100} />
          {:then values}
            {#if values.length}
              <b>{values.join(", ")}</b>
            {:else}
              <span class="opacity-50">—</span>
            {/if}
          {:catch}
            <span class="opacity-50">—</span>
          {/await}
        </div>
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
        {:else if setting.type === "checkbox" && setting.inner && $store}
          {#each setting.inner as innerSetting}
            <SettingTree setting={innerSetting} />
          {/each}
        {/if}
      </div>
    {/snippet}
  </SingleSetting>
{/if}

<style>
  small {
    display: block;
    margin-top: -0.2rem;
    font-weight: 500;
    line-height: 1.35;
    opacity: 0.8;
  }

  /* Constant height whether the spinner or the value is showing, so the row
     doesn't jump when loading finishes. */
  .info-value {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    min-height: 1.5rem;
    white-space: nowrap;
  }
</style>
