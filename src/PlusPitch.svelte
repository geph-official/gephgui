<script lang="ts">
  import { l10n, curr_lang } from "./lib/l10n";

  import { pref_wizard } from "./lib/prefs";
  import { fade } from "svelte/transition";
  import { paymentsOpen } from "./lib/user";
  import { onMount } from "svelte";
  import { broker_rpc } from "./native-gate";

  let bestPrice: string | null = null;
  onMount(async () => {
    const [rawPlus, rawBasic]: [number, number][][] = await Promise.all([
      broker_rpc("raw_price_points", []),
      broker_rpc("basic_price_points", []),
    ]);
    const plusPrices = rawPlus.map((x) => x[1] / 100);
    const basicPrices = rawBasic.map((x) => x[1] / 100);
    bestPrice = Math.min(Math.min(...plusPrices), Math.min(...basicPrices)).toFixed(2);
  });
</script>

<div class="fixed inset-0 h-full z-[1000] bg-surface-50" transition:fade>
  <div class="flex flex-col gap-3 mt-10">
    <img
      class="big-logo"
      src="gephlogo-rocket.png"
      alt="geph logo with rocket ship"
    />
    <h1 class="my-3">{l10n($curr_lang, "get-full-geph-experience")}</h1>

    <div class="card mx-4 p-3">
      <span class="card-heading">{l10n($curr_lang, "much-faster-speed")}</span>
      <p>
        {@html l10n($curr_lang, "200x-faster-speed")}
      </p>
    </div>
    <div class="card mx-4 p-3">
      <span class="card-heading"
        >{l10n($curr_lang, "unlock-all-locations")}</span
      >
      <p>
        {@html l10n($curr_lang, "access-global-servers")}
      </p>
    </div>
    <!-- <div class="card mx-4 p-3">
      <span class="card-heading">{l10n($curr_lang, "calls-p2p-gaming")}</span>
      <p>
        {@html l10n($curr_lang, "unrestricted-access")}
      </p>
    </div> -->

    <div class="bottom">
      <button
        class="btn mx-4 variant-filled"
        on:click={() => {
          $pref_wizard = false;
          $paymentsOpen = true;
        }}
      >
        {l10n($curr_lang, "buy-plus-price").replace("PRICE", bestPrice || "-")}
      </button>

      <button
        class="btn mx-4 mt-2 mb-8 variant-ghost-error"
        on:click={() => ($pref_wizard = false)}
      >
        {l10n($curr_lang, "not-now")}
      </button>
    </div>
  </div>
</div>

<style>
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

  .big-logo {
    width: 50vmin;

    margin-left: auto;
    margin-right: auto;
  }

  .bottom {
    display: flex;
    flex-direction: column;
    position: fixed;
    width: 100%;
    bottom: 0;
    left: 0;
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
