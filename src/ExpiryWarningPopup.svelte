<script lang="ts">
  import { curr_lang, l10n, l10n_date } from "./lib/l10n";
  import Popup from "./lib/Popup.svelte";
  import { openPayments } from "./lib/user";

  interface Props {
    open?: boolean;
    expiryUnix?: number | null; // seconds
    daysRemaining?: number | null;
  }

  let { open = $bindable(false), expiryUnix = null, daysRemaining = null }: Props = $props();

  const close = () => (open = false);

  let expiryDateStr = $derived(expiryUnix
    ? l10n_date($curr_lang, new Date(expiryUnix * 1000))
    : "");
</script>

<Popup
  {open}
  title={l10n($curr_lang, "subscription-expiring")}
  onClose={close}
  fullScreen={false}
>
  <div class="flex flex-col gap-4">
    <div>
      {#if expiryUnix !== null && daysRemaining !== null}
        {l10n($curr_lang, "subscription-expiring-body")}:<br />

        <span class="text-lg">
          <b> {expiryDateStr} </b>
          ({l10n($curr_lang, "remaining-days")}:
          <b class="text-error-700">{daysRemaining}</b>)
        </span>
      {:else}
        {l10n($curr_lang, "subscription-expiring-body-generic")}
      {/if}
    </div>

    <!-- Red rounded box explaining limitations of Free -->
    <div class="card p-3 variant-ghost-error rounded-lg">
      <div class="font-semibold mb-1">
        {l10n($curr_lang, "free-limits-title")}
      </div>
      <div>{l10n($curr_lang, "free-limits-one")}</div>
    </div>

    <div class="flex flex-row gap-2 justify-end">
      <button class="btn variant-ghost" onclick={close}>
        {l10n($curr_lang, "not-now")}
      </button>
      <button
        class="btn variant-filled-primary"
        onclick={() => {
          openPayments();
          open = false;
        }}
      >
        {l10n($curr_lang, "extend")}
      </button>
    </div>
  </div>
</Popup>
