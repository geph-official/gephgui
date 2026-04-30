<script lang="ts">
  import { curr_lang, l10n } from "./lib/l10n";
  import {
    clearAccountCache,
    curr_valid_secret,
    iosSubscriptionOpen,
  } from "./lib/user";
  import { native_gate, type IosPlusPrice } from "./native-gate";
  import { onMount } from "svelte";
  import { ProgressBar } from "@skeletonlabs/skeleton";
  import Popup from "./lib/Popup.svelte";

  const policyUrl =
    "https://github.com/geph-official/geph5/blob/master/PRIVACY.md";

  let price: IosPlusPrice | null = $state(null);
  let loadingPrice = $state(false);
  let purchaseInProgress = $state(false);
  let errorMessage: string | null = $state(null);

  onMount(async () => {
    loadingPrice = true;
    try {
      const gate = await native_gate();
      price = await gate.get_ios_plus_price();
    } catch (error) {
      errorMessage = "" + error;
    } finally {
      loadingPrice = false;
    }
  });

  async function startPurchase() {
    purchaseInProgress = true;
    errorMessage = null;
    try {
      const gate = await native_gate();
      await gate.start_native_payment($curr_valid_secret || "");
      clearAccountCache();
      $iosSubscriptionOpen = false;
    } catch (error) {
      errorMessage = "" + error;
    } finally {
      purchaseInProgress = false;
    }
  }
</script>

<Popup
  open={$iosSubscriptionOpen}
  title="Geph Plus"
  fullScreen={false}
  onClose={() => ($iosSubscriptionOpen = false)}
>
  <div class="subscription-popup">
    <div class="intro">
      <img
        class="logo"
        src="gephlogo-rocket.png"
        alt="geph logo with rocket ship"
      />
      <div>
        <h2>{l10n($curr_lang, "get-full-geph-experience")}</h2>
        <p>Full-speed access and all Plus locations.</p>
      </div>
    </div>

    <dl class="terms">
      <div>
        <dt>Service</dt>
        <dd>Geph Plus</dd>
      </div>
      <div>
        <dt>Period</dt>
        <dd>1 month</dd>
      </div>
      <div>
        <dt>Price</dt>
        <dd>
          {#if loadingPrice}
            Loading App Store price...
          {:else if price}
            {price.localized_price} per month
          {:else}
            Unavailable
          {/if}
        </dd>
      </div>
      <div>
        <dt>Renewal</dt>
        <dd>Auto-renews monthly until canceled.</dd>
      </div>
    </dl>

    <p class="renewal">
      Charged to your Apple ID. Cancel at least 24 hours before renewal in App
      Store account settings.
    </p>

    <p class="policy-link">
      <a href={policyUrl} target="_blank" rel="noopener">
        {l10n($curr_lang, "privacy-eula")}
      </a>
    </p>

    {#if errorMessage}
      <div class="error">
        {errorMessage}
      </div>
    {/if}

    <div class="actions">
      {#if purchaseInProgress}
        <ProgressBar />
      {:else}
        <button
          class="btn variant-filled w-full"
          onclick={startPurchase}
          disabled={!price || loadingPrice}
        >
          Continue - {price?.localized_price || "..."} / month
        </button>
      {/if}
    </div>
  </div>
</Popup>

<style>
  .subscription-popup {
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
  }

  .intro {
    display: grid;
    grid-template-columns: 3.5rem 1fr;
    gap: 0.75rem;
    align-items: center;
  }

  .logo {
    width: 3.5rem;
  }

  h2,
  p {
    margin: 0;
  }

  h2 {
    font-size: 1.2rem;
    font-weight: 700;
  }

  p,
  dd,
  dt {
    font-size: 0.9rem;
  }

  .terms {
    border: 1px solid rgb(var(--color-surface-300));
    border-radius: 0.5rem;
    padding: 0.75rem;
  }

  dl {
    margin: 0;
  }

  .terms {
    display: grid;
    gap: 0.45rem;
  }

  .terms div {
    display: grid;
    grid-template-columns: 5rem 1fr;
    gap: 0.5rem;
  }

  dt {
    font-weight: 700;
  }

  dd {
    margin: 0;
  }

  .renewal {
    font-size: 0.8rem;
    opacity: 0.78;
  }

  .policy-link {
    text-align: center;
    font-size: 0.85rem;
  }

  .policy-link a {
    color: rgb(var(--color-primary-700));
    text-decoration: underline;
  }

  .error {
    border-radius: 0.5rem;
    background: rgb(var(--color-error-50));
    color: rgb(var(--color-error-700));
    font-size: 0.85rem;
    padding: 0.75rem;
  }

  .actions {
    padding-top: 0.25rem;
  }
</style>
