<script lang="ts">
  import { slide, fade } from "svelte/transition";
  import { curr_lang, l10n } from "./lib/l10n";
  import { native_gate, type InvoiceInfo } from "./native-gate";
  import { paymentsOpen } from "./lib/user";

  // Tracks the currently selected index; starts at 0 to force an option.
  let selectedIndex = 0;

  function handleSelect(index: number) {
    selectedIndex = index;
  }

  let secondPageInvoice: InvoiceInfo | null = null;
  let createInvoiceInProgress = false;
  let payInProgress = false;

  async function handlePayNow(days: number) {
    createInvoiceInProgress = true;
    try {
      const gate = await native_gate();
      const invoice = await gate.create_invoice(days);
      secondPageInvoice = invoice;
    } finally {
      createInvoiceInProgress = false;
    }
  }

  function handleCancel() {
    $paymentsOpen = false;
    secondPageInvoice = null;
  }

  const getPricePoints = async () => {
    const gate = await native_gate();
    return await gate.price_points();
  };
</script>

{#if $paymentsOpen}
  <div
    class="fixed w-full h-full bg-black bg-opacity-50 backdrop-blur-sm p-4 flex-col"
    transition:fade
  >
    <div
      class="bg-surface-50 p-4 rounded-md shadow-lg relative overflow-hidden"
    >
      {#if !secondPageInvoice}
        <div transition:slide class="flex flex-col">
          <h1 class="font-bold text-gray-700 text-xs mb-2">Add Plus time</h1>

          {#await getPricePoints()}
            Loading...
          {:then pricePoints}
            {#each pricePoints as [days, price], i}
              <button
                class={`border-black border rounded-md p-2 px-2 text-sm flex-row flex gap-2 items-center mb-2 cursor-pointer ${
                  i === selectedIndex ? "bg-green-100" : ""
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
            <button
              class="btn variant-filled my-2"
              on:click={() => handlePayNow(pricePoints[selectedIndex][0])}
            >
              {l10n($curr_lang, "pay-now")}
            </button>
            <button class="btn variant-ghost" on:click={handleCancel}>
              {l10n($curr_lang, "cancel")}
            </button>
          {/await}
        </div>
      {:else}
        <div transition:slide class="flex-col flex gap-2">
          {#each secondPageInvoice.methods as method}
            <button
              class="border-black border rounded-md p-2"
              on:click={async () => {
                if (secondPageInvoice) {
                  payInProgress = true;
                  try {
                    const gate = await native_gate();
                    await gate.pay_invoice(secondPageInvoice.id, method);
                    handleCancel();
                  } finally {
                    payInProgress = false;
                  }
                }
              }}
            >
              {l10n($curr_lang, method)}
            </button>
          {/each}

          <button class="btn variant-ghost" on:click={handleCancel}>
            {l10n($curr_lang, "cancel")}
          </button>
        </div>
      {/if}
    </div>
  </div>
{/if}
