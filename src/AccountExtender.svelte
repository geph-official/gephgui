<script lang="ts">
  import { curr_lang, l10n } from "./lib/l10n";
  import CalendarRangeOutline from "svelte-material-icons/CalendarRangeOutline.svelte";
  import Heart from "svelte-material-icons/Heart.svelte";
  import { curr_account_status, paymentsOpen } from "./lib/user";
</script>

{#if $curr_account_status}
  <div class="card p-3 flex flex-row items-center variant-ghost-primary">
    <div>
      {#if $curr_account_status.level === "plus"}
        <span class="text-primary-700">
          <CalendarRangeOutline size="1.3rem" />
        </span>
      {:else}
        <span class="text-error-700"><Heart size="1.3rem" /></span>
      {/if}
    </div>
    <div class="grow mx-3 flex flex-col">
      {#if $curr_account_status.level === "plus"}
        <div class="-mb-1">
          {new Date($curr_account_status.expiry * 1000).toLocaleDateString(
            undefined,
            {
              year: "numeric",
              month: "short",
              day: "numeric",
            }
          )}
        </div>
        <div class="text-sm">
          {l10n($curr_lang, "remaining-days")}:
          <b>
            {Math.floor(
              ($curr_account_status.expiry - Math.floor(Date.now() / 1000)) /
                86400
            )}
          </b>
        </div>
      {:else}
        <b>{l10n($curr_lang, "free-account")}</b>
      {/if}
    </div>
    <div>
      {#if $curr_account_status.level === "plus"}
        <button
          class="btn variant-filled-primary btn-sm"
          on:click={() => ($paymentsOpen = true)}
        >
          {l10n($curr_lang, "extend")}
        </button>
      {:else}
        <button class="btn variant-ghost-primary btn-sm">
          {l10n($curr_lang, "buy-plus")}
        </button>
      {/if}
    </div>
  </div>

  {#if $curr_account_status.level === "free"}
    <div class="card p-3 items-center bg-error-50 text-sm">
      {@html l10n($curr_lang, "free-is-bad")}
    </div>
  {/if}
{/if}
