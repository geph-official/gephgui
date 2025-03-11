<script lang="ts">
  import { slide, fade } from "svelte/transition";
  import { curr_lang, l10n } from "./lib/l10n";
  import { native_gate, type InvoiceInfo } from "./native-gate";
  import { curr_valid_secret, paymentsOpen } from "./lib/user";
  import { ProgressBar, getModalStore } from "@skeletonlabs/skeleton";
  import { showErrorModal } from "./lib/utils";

  // Tracks the currently selected index; starts at 0 to force an option.
  let selectedIndex = 0;

  function handleSelect(index: number) {
    selectedIndex = index;
  }

  let secondPageInvoice: InvoiceInfo | null = null;
  let createInvoiceInProgress = false;
  let payInProgress = false;
  const modalStore = getModalStore();

  async function handlePayNow(days: number) {
    createInvoiceInProgress = true;
    try {
      const gate = await native_gate();
      const invoice = await gate.create_invoice($curr_valid_secret || "", days);
      secondPageInvoice = invoice;
    } catch (e) {
      showErrorModal(
        modalStore,
        l10n($curr_lang, "err_create_invoice") + ": " + e
      );
    } finally {
      createInvoiceInProgress = false;
    }
  }

  function handleCancel() {
    $paymentsOpen = false;
    secondPageInvoice = null;
  }

  const getPricePoints = async () => {
    try {
      const gate = await native_gate();
      return await gate.price_points();
    } catch (e) {
      showErrorModal(
        modalStore,
        l10n($curr_lang, "err_load_price_points") + ": " + e
      );
      handleCancel();
      throw e;
    }
  };
</script>

{#if $paymentsOpen}
  <div
    class="fixed w-full h-full bg-black bg-opacity-50 backdrop-blur-sm p-4 flex-col"
    transition:fade
  >
    <div class="bg-surface-50 p-4 shadow-lg relative overflow-hidden">
      {#if !secondPageInvoice}
        <div transition:slide class="flex flex-col">
          <h1 class="font-bold text-gray-700 text-xs mb-2">
            {l10n($curr_lang, "add-plus-time")}
          </h1>

          {#await getPricePoints()}
            Loading...
          {:then pricePoints}
            {#each pricePoints as [days, price], i}
              <button
                class={`border-black border p-2 px-2 text-sm flex-row flex gap-2 items-center mb-2 cursor-pointer ${
                  i === selectedIndex ? "bg-primary-200" : ""
                }`}
                on:click={() => handleSelect(i)}
              >
                <div>{days} {l10n($curr_lang, "days")}</div>
                <div class="grow text-right">
                  <span class="font-semibold">€{price.toFixed(2)}</span>
                  <span>/ {days} days</span>
                </div>
              </button>
            {/each}

            <!-- Trigger the transition to the second page -->
            {#if createInvoiceInProgress}
              <ProgressBar />
            {:else}
              <button
                class="btn variant-filled my-2"
                on:click={() => handlePayNow(pricePoints[selectedIndex][0])}
                disabled={createInvoiceInProgress}
              >
                {l10n($curr_lang, "pay-now")}
              </button>
              <button class="btn variant-ghost" on:click={handleCancel}>
                {l10n($curr_lang, "cancel")}
              </button>
            {/if}
          {:catch e}
            {e}
          {/await}
        </div>
      {:else}
        <div transition:slide class="flex-col flex gap-2">
          {#if payInProgress}
            <ProgressBar />
          {:else}
            {#each secondPageInvoice.methods as method}
              <button
                class="border-black border p-2"
                on:click={async () => {
                  if (secondPageInvoice) {
                    payInProgress = true;
                    try {
                      const gate = await native_gate();
                      await gate.pay_invoice(secondPageInvoice.id, method);
                      handleCancel();
                    } catch (e) {
                      showErrorModal(modalStore, "" + e);
                    } finally {
                      payInProgress = false;
                    }
                  }
                }}
              >
                {l10n($curr_lang, method)}
              </button>
            {/each}
          {/if}

          <button class="btn variant-ghost" on:click={handleCancel}>
            {l10n($curr_lang, "cancel")}
          </button>
        </div>
      {/if}
    </div>
  </div>
{/if}
