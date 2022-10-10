<script lang="ts">
  import AccountCircle from "svelte-material-icons/AccountCircle.svelte";
  import CalendarRange from "svelte-material-icons/CalendarRange.svelte";
  import TimerSandComplete from "svelte-material-icons/TimerSandComplete.svelte";
  import Heart from "svelte-material-icons/Heart.svelte";
  import Button, { Label } from "@smui/button";
  import { curr_lang, l10n, l10n_date } from "../lib/l10n";
  import { native_gate, type SubscriptionInfo } from "../native-gate";
  import { onInterval } from "../lib/utils";
  import { pref_userpwd } from "../lib/prefs";
  import GButton from "../lib/GButton.svelte";
  export let username: string;
  export let password: string;

  let user_info: SubscriptionInfo | null = null;

  onInterval(async () => {
    try {
      user_info = await native_gate().sync_user_info(username, password);
    } catch (e) {
      alert("error syncing info: " + user_info);
    }
  }, 1000);
</script>

<div class="userinfo">
  <div class="urow">
    <AccountCircle width="1.5rem" height="1.5rem" color="#666" />
    <div class="stretch"><b>{username}</b></div>
    <GButton color={"warning"} inverted onClick={() => ($pref_userpwd = null)}>
      {l10n($curr_lang, "logout")}
    </GButton>
  </div>
  {#if user_info}
    {#if user_info.level == "free"}
      <div class="urow">
        <Heart width="1.5rem" height="1.5rem" color="#b71c1c" />
        <div class="stretch">{l10n($curr_lang, "get-unlimited-speed")}</div>
        <GButton inverted>{l10n($curr_lang, "buy-plus")}</GButton>
      </div>
    {:else if user_info.level == "plus" && user_info.expires}
      <div class="urow">
        <CalendarRange
          width="1.5rem"
          height="1.5rem"
          color="var(--mdc-theme-primary)"
        />
        <div class="stretch">
          <div class="date">{l10n_date($curr_lang, user_info.expires)}</div>
          <small class="days-left"
            >{l10n($curr_lang, "remaining-days")}:
            <b
              >{Math.max(
                0,
                (user_info.expires.getTime() - new Date().getTime()) /
                  (24 * 60 * 60 * 60 * 1000)
              ).toFixed(0)}</b
            ></small
          >
        </div>
        <GButton>
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
    padding-left: 1rem;
  }

  .days-left {
    opacity: 0.7;
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
