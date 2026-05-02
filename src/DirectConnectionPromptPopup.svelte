<script lang="ts">
  import Popup from "./lib/Popup.svelte";
  import { curr_lang, l10n } from "./lib/l10n";
  import {
    pref_allow_direct,
    pref_seen_direct_prompt,
  } from "./lib/prefs";
  import { CaretRight, ShieldCheck, Lightning } from "phosphor-svelte";

  interface Props {
    open?: boolean;
    onContinue?: () => void;
  }

  let { open = $bindable(false), onContinue }: Props = $props();

  const choose = (allowDirect: boolean) => {
    pref_allow_direct.set(allowDirect);
    pref_seen_direct_prompt.set(true);
    open = false;
    onContinue?.();
  };
</script>

<Popup
  {open}
  fullScreen={false}
  title={l10n($curr_lang, "direct-prompt-title")}
  onClose={() => (open = false)}
>
  <div class="flex flex-col gap-4">
    <div>
      <p class="font-medium">
        {l10n($curr_lang, "direct-prompt-question")}
      </p>
      <p class="text-sm opacity-70 mt-1">
        {l10n($curr_lang, "direct-prompt-examples")}
      </p>
    </div>

    <div class="flex flex-col gap-2">
      <button
        class="choice-btn variant-soft-warning"
        onclick={() => choose(false)}
      >
        <span class="icon-slot"
          ><ShieldCheck size="1.75rem" weight="duotone" /></span
        >
        <div class="grow">
          <div class="font-semibold">
            {l10n($curr_lang, "direct-prompt-yes")}
          </div>
          <div class="text-sm opacity-80 mt-1">
            {l10n($curr_lang, "direct-prompt-yes-sub")}
          </div>
        </div>
        <CaretRight size="1.25rem" weight="bold" />
      </button>
      <button
        class="choice-btn variant-soft-primary"
        onclick={() => choose(true)}
      >
        <span class="icon-slot"
          ><Lightning size="1.75rem" weight="duotone" /></span
        >
        <div class="grow">
          <div class="font-semibold">
            {l10n($curr_lang, "direct-prompt-no")}
          </div>
          <div class="text-sm opacity-80 mt-1">
            {l10n($curr_lang, "direct-prompt-no-sub")}
          </div>
        </div>
        <CaretRight size="1.25rem" weight="bold" />
      </button>
    </div>

    <p class="text-xs opacity-60 text-center mt-1">
      {l10n($curr_lang, "direct-prompt-footer")}
    </p>
  </div>
</Popup>

<style>
  .choice-btn {
    border-radius: 0.5rem;
    padding: 0.875rem 1rem;
    text-align: left;
    width: 100%;
    color: inherit;
    font: inherit;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.75rem;
    transition: filter 120ms, transform 80ms;
  }
  .choice-btn:hover {
    filter: brightness(0.95);
  }
  .choice-btn:active {
    transform: scale(0.99);
  }
  .icon-slot {
    flex: 0 0 1.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
