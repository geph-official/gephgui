<script lang="ts">
  import { curr_lang, l10n, l10n_date } from "./lib/l10n";
  import Popup from "./lib/Popup.svelte";
  import { paymentsOpen } from "./lib/user";

  export let open = false;
  export let expiryUnix: number | null = null; // seconds
  export let daysRemaining: number | null = null;

  const close = () => (open = false);

  $: expiryDateStr = expiryUnix
    ? l10n_date($curr_lang, new Date(expiryUnix * 1000))
    : "";
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
      <button class="btn variant-ghost" on:click={close}>
        {l10n($curr_lang, "not-now")}
      </button>
      <button
        class="btn variant-filled-primary"
        on:click={() => {
          paymentsOpen.set(true);
          open = false;
        }}
      >
        {l10n($curr_lang, "extend")}
      </button>
    </div>
  </div>
</Popup>
