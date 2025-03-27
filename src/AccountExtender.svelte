<script lang="ts">
  import { fade } from "svelte/transition";
  import { curr_lang, l10n } from "./lib/l10n";
  import CalendarRangeOutline from "svelte-material-icons/CalendarRangeOutline.svelte";
  import Heart from "svelte-material-icons/Heart.svelte";
  import Repeat from "svelte-material-icons/Repeat.svelte";
  import {
    app_status,
    paymentsOpen,
    account_refreshing,
    clearAccountCache,
  } from "./lib/user";
</script>

{#if $app_status?.account}
  <div
    class="card p-3 flex flex-row items-center variant-ghost-primary sheen-container tnum"
  >
    {#if $account_refreshing}
      <div class="sheen-effect" transition:fade></div>
    {/if}

    <div>
      {#if $app_status.account.level === "Plus"}
        {#if $app_status.account.recurring}
          <span class="text-primary-700">
            <Repeat size="1.4rem" />
          </span>
        {:else}
          <span class="text-primary-700">
            <CalendarRangeOutline size="1.4rem" />
          </span>
        {/if}
      {:else}
        <span class="text-error-700"><Heart size="1.4rem" /></span>
      {/if}
    </div>
    <div class="grow mx-3 flex flex-col">
      {#if $app_status.account.level === "Plus"}
        {#if $app_status.account.recurring}
          <div class="font-bold">
            {l10n($curr_lang, "recurring-subscription")}
          </div>
        {:else}
          <div>
            {new Date($app_status.account.expiry * 1000).toLocaleDateString(
              $curr_lang,
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
                ($app_status.account.expiry - Math.floor(Date.now() / 1000)) /
                  86400
              )}
            </b>
          </div>
        {/if}
      {:else}
        <b>{l10n($curr_lang, "free-account")}</b>
      {/if}
    </div>
    <div>
      {#if $app_status.account.level === "Plus"}
        {#if $app_status.account.recurring}
          <button
            class="btn variant-filled-primary"
            on:click={() => window.open("https://geph.io/en/portal/login")}
          >
            {l10n($curr_lang, "manage")}
          </button>
        {:else}
          <button
            class="btn variant-filled-primary"
            on:click={() => ($paymentsOpen = true)}
          >
            {l10n($curr_lang, "extend")}
          </button>
        {/if}
      {:else}
        <button
          class="btn variant-ghost-primary"
          on:click={() => ($paymentsOpen = true)}
        >
          {l10n($curr_lang, "buy-plus")}
        </button>
      {/if}
    </div>
  </div>

  {#if $app_status.account.level === "Free"}
    <div class="card p-3 items-center bg-error-50 text-sm">
      {@html l10n($curr_lang, "free-is-bad")}
    </div>
  {/if}
{/if}

<style>
  /* Sheen loading effect styles */
  .sheen-container {
    position: relative;
    overflow: hidden;
  }

  .sheen-effect {
    position: absolute;
    top: 0;
    left: -100%;
    width: 50%;
    height: 100%;
    background: linear-gradient(
      to right,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.3) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    animation: sheen 1s infinite;
    pointer-events: none;
    z-index: 10;
  }

  @keyframes sheen {
    0% {
      left: -100%;
    }
    100% {
      left: 100%;
    }
  }
</style>
