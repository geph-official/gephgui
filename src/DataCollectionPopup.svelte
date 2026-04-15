<script lang="ts">
  import Popup from "./lib/Popup.svelte";
  import { curr_lang, l10n } from "./lib/l10n";
  import { pref_seen_data_collection } from "./lib/prefs";

  interface Props {
    open?: boolean;
  }

  let { open = $bindable(false) }: Props = $props();

  const close = () => {
    open = false;
    pref_seen_data_collection.set(true);
  };
</script>

<Popup {open} title={l10n($curr_lang, "data-collection")} onClose={close}>
  <div class="flex flex-col gap-4 h-full">
    <p>{@html l10n($curr_lang, "data-collection-blurb")}</p>
    <div class="mt-auto">
      <button class="btn variant-filled-primary w-full" onclick={close}>
        {l10n($curr_lang, "data-collection-agree")}
      </button>
    </div>
  </div>
</Popup>
