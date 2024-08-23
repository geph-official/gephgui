<script lang="ts">
  import AccountCircle from "svelte-material-icons/AccountCircle.svelte";
  import CalendarRange from "svelte-material-icons/CalendarRange.svelte";
  import TimerSandComplete from "svelte-material-icons/TimerSandComplete.svelte";
  import Heart from "svelte-material-icons/Heart.svelte";
  import Refresh from "svelte-material-icons/Refresh.svelte";
  import { curr_lang, l10n, l10n_date } from "../lib/l10n";
  import type { SubscriptionInfo } from "../native-gate";
  import { pref_userpwd, user_info_store } from "../lib/prefs";
  import GButton from "../lib/GButton.svelte";
  import Button from "@smui/button";
  import { runWithSpinner } from "../lib/modals";
  import BuyPlus from "./BuyPlus.svelte";
  export let username: string;
  export let user_info: SubscriptionInfo | null = null;

  let loading = false;
  let buy_plus_open = false;
  function handleBuyPlus() {
    buy_plus_open = true;
  }
</script>

{#if buy_plus_open}
  <BuyPlus {username} bind:open={buy_plus_open} />
{/if}

<div class="userinfo">
  {#if user_info}
    {#if user_info.level == "free"}
      <div class="urow">
        <div class="freebad">{@html l10n($curr_lang, "free-is-bad")}</div>

        <GButton onClick={handleBuyPlus} inverted
          >{l10n($curr_lang, "buy-plus")}</GButton
        >
      </div>
    {:else if user_info.level == "plus" && user_info.expires}
      {@const remainingDays = Math.max(
        0,
        (user_info.expires.getTime() - new Date().getTime()) /
          (24 * 60 * 60 * 1000)
      ).toFixed(0)}
      <div class="urow">
        <CalendarRange
          width="1.5rem"
          height="1.5rem"
          color="var(--mdc-theme-primary)"
        />
        <div class="stretch">
          <div class="date">
            {l10n_date($curr_lang, user_info.expires)}
          </div>
          <small class="days-inline-start" class:red={+remainingDays < 10}>
            {l10n($curr_lang, "remaining-days")}:
            <b>
              {remainingDays}
            </b>
          </small>
        </div>

        <GButton onClick={handleBuyPlus}>
          {l10n($curr_lang, "extend")}
        </GButton>
      </div>
    {/if}
  {:else}
    <div class="urow">
      <TimerSandComplete width="1.5rem" height="1.5rem" color="#666" />
      <div class="stretch">{l10n($curr_lang, "loading")}...</div>
    </div>
  {/if}
</div>

<style>
  .userinfo {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .freebad {
    background-color: lightpink;
    padding: 0.6rem;
    border-radius: 0.5rem;
    margin-right: 1rem;
    flex-grow: 1;
    text-align: center;
  }

  .red {
    color: white;
    background-color: rgb(144, 15, 15);
  }

  .urow {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    width: 100%;

    height: 3rem;
  }

  .stretch {
    flex-grow: 1;
    padding-inline-start: 1rem;
  }

  .days-inline-start {
    border-radius: 0.3rem;
    padding: 0.1rem;
    padding-left: 0.2rem;
    padding-right: 0.2rem;

    background-color: #ddd;
  }

  :global(.red-button) {
    color: var(--mdc-theme-error) !important;
    border-color: var(--mdc-theme-error) !important;
  }

  :global(.blue-button) {
    color: var(--mdc-theme-primary) !important;
    border-color: var(--mdc-theme-primary) !important;
  }
</style>
