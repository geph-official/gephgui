<script>
  import Button from "@smui/button/src/Button.svelte";
  import GButton from "./lib/GButton.svelte";
  import { l10n, curr_lang } from "./lib/l10n";
  import { emojify } from "./lib/utils";
  import { pref_userpwd, pref_wizard } from "./lib/prefs";
  import { fade } from "svelte/transition";

  $: extend_url = `https://geph.io/billing/login?next=%2Fbilling%2Fdashboard&uname=${encodeURIComponent(
    $pref_userpwd ? $pref_userpwd.username : ""
  )}&pwd=${encodeURIComponent($pref_userpwd ? $pref_userpwd.password : "")}`;
</script>

<div class="outer" transition:fade>
  <div class="stretch">
    <img
      class="big-logo"
      src="gephlogo-rocket.png"
      alt="geph logo with rocket ship"
    />
    <h1>{l10n($curr_lang, "get-full-geph-experience")}</h1>

    <div class="card mdc-card">
      <span class="card-heading" use:emojify
        >{l10n($curr_lang, "much-faster-speed")}</span
      >
      <p>
        {@html l10n($curr_lang, "200x-faster-speed")}
      </p>
    </div>
    <div class="card mdc-card">
      <span class="card-heading" use:emojify
        >{l10n($curr_lang, "unlock-all-locations")}</span
      >
      <p>
        {@html l10n($curr_lang, "access-global-servers")}
      </p>
    </div>
    <div class="card mdc-card">
      <span class="card-heading" use:emojify
        >{l10n($curr_lang, "calls-p2p-gaming")}</span
      >
      <p>
        {@html l10n($curr_lang, "unrestricted-access")}
      </p>
    </div>
  </div>
  <div class="bottom">
    <a href={extend_url} target="_blank" rel="noopener">
      <GButton stretch onClick={() => ($pref_wizard = false)}
        >{l10n($curr_lang, "buy-plus-price")}</GButton
      >
    </a>
    <div class="spacer"></div>
    <GButton inverted onClick={() => ($pref_wizard = false)}
      >{l10n($curr_lang, "not-now")}</GButton
    >
  </div>
</div>

<style>
  .outer {
    position: fixed;
    top: 0;
    left: 0;
    background-color: white;
    z-index: 1000;
    width: 100vw;
    height: 100vh;
  }
  h1 {
    font-size: 1.5rem;
    text-align: center;
  }

  .card-heading {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 0.9rem;
    margin: 0;
  }

  .card {
    margin-left: 2rem;
    margin-right: 2rem;
    margin-bottom: 1rem;
    padding: 0.8rem;
    width: calc(100% - 4rem);
  }

  .big-logo {
    width: 50vmin;
    margin-top: 3rem;
    margin-bottom: 1rem;
    margin-left: auto;
    margin-right: auto;
  }

  .bottom {
    display: flex;
    flex-direction: column;
    padding: 2rem;
    position: fixed;
    width: calc(100% - 4rem);
    bottom: 0;
    left: 0;
    background-color: white;
  }

  .stretch {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 9rem;
  }

  .spacer {
    margin-top: 0.5rem;
  }
</style>
