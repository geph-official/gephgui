<script lang="ts">
  import { slide } from "svelte/transition";
  import { curr_lang, l10n } from "./lib/l10n";
  import { native_gate, type InvoiceInfo } from "./native-gate";
  import {
    clearAccountCache,
    curr_valid_secret,
    paymentsOpen,
  } from "./lib/user";
  import {
    ProgressBar,
    getModalStore,
    type ModalSettings,
  } from "@skeletonlabs/skeleton";
  import { showErrorModal } from "./lib/utils";
  import Popup from "./lib/Popup.svelte";

  // Tracks the currently selected index; starts at 0 to force an option.
  let selectedIndex = 0;

  // Track which screen to show
  type Screen = "main" | "payment" | "voucher" | "completion";
  let currentScreen: Screen = "main";

  function handleSelect(index: number) {
    selectedIndex = index;
  }

  let secondPageInvoice: InvoiceInfo | null = null;
  let createInvoiceInProgress = false;
  let payInProgress = false;
  let redeemInProgress = false;
  let voucherCode = "";
  const modalStore = getModalStore();

  async function handlePayNow(days: number) {
    createInvoiceInProgress = true;
    try {
      const gate = await native_gate();
      const invoice = await gate.create_invoice($curr_valid_secret || "", days);
      secondPageInvoice = invoice;
      currentScreen = "payment";
    } catch (e) {
      showErrorModal(
        modalStore,
        l10n($curr_lang, "err_create_invoice") + ": " + e
      );
    } finally {
      createInvoiceInProgress = false;
    }
  }

  function handleClose() {
    clearAccountCache();
    $paymentsOpen = false;
    secondPageInvoice = null;
    currentScreen = "main";
    voucherCode = "";
  }

  let refreshInProgress = false;

  function handleRefreshWithDelay() {
    refreshInProgress = true;
    setTimeout(() => {
      handleClose();
      refreshInProgress = false;
    }, 10000);
  }

  // Function for redeeming voucher
  async function redeemVoucher() {
    if (!voucherCode.trim()) {
      showErrorModal(modalStore, l10n($curr_lang, "please_enter_voucher_code"));
      return;
    }

    redeemInProgress = true;
    try {
      const gate = await native_gate();
      const daysAdded = await gate.daemon_rpc("redeem_voucher", [
        $curr_valid_secret || "",
        voucherCode,
      ]);

      if (daysAdded === 0) {
        // Voucher is invalid
        showErrorModal(modalStore, l10n($curr_lang, "voucher-invalid"));
      } else {
        showErrorModal(
          modalStore,
          `${l10n($curr_lang, "voucher-success")} (+${daysAdded} ${l10n($curr_lang, "days")})`
        );
        currentScreen = "completion";
      }
    } catch (e) {
      showErrorModal(
        modalStore,
        l10n($curr_lang, "err_redeem_voucher") + ": " + e
      );
    } finally {
      redeemInProgress = false;
    }
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
      handleClose();
      throw e;
    }
  };
</script>

<Popup
  open={$paymentsOpen}
  title={l10n($curr_lang, "add-plus-time")}
  onClose={handleClose}
>
  {#if currentScreen === "main"}
    <div class="flex flex-col">
      {#await getPricePoints()}
        <ProgressBar />
      {:then pricePoints}
        {#each pricePoints as [days, price], i}
          <button
            class={`btn variant-outline rounded-lg border p-3 flex-row flex gap-2 items-center mb-2 cursor-pointer ${
              i === selectedIndex ? "variant-ghost-primary" : ""
            }`}
            on:click={() => handleSelect(i)}
          >
            <div>{days} {l10n($curr_lang, "days")}</div>
            <div class="grow text-right">
              <span class="font-semibold">€{price.toFixed(2)}</span>
              <span class="font-semibold opacity-[0.6] ml-2"
                >€{(price / days).toFixed(2)}/d</span
              >
            </div>
          </button>
        {/each}

        <!-- Trigger the transition to the second page -->
        {#if createInvoiceInProgress}
          <ProgressBar />
        {:else}
          <div class="flex flex-col gap-2 mt-3">
            <button
              class="btn variant-filled"
              on:click={() => handlePayNow(pricePoints[selectedIndex][0])}
              disabled={createInvoiceInProgress}
            >
              {l10n($curr_lang, "pay-now")}
            </button>
            <!-- <button
              class="btn variant-ghost-primary"
              on:click={() => {
                currentScreen = "voucher";
                voucherCode = "";
              }}
            >
              {l10n($curr_lang, "redeem-voucher")}
            </button> -->

            <div class="opacity-50 text-center">&mdash;&mdash;&mdash;</div>

            <!-- <button
              class="btn btn-sm variant-ghost"
              on:click={() => {
                window.open(
                  `https://geph.io/billing/login_secret?secret=${$curr_valid_secret}`
                );
                currentScreen = "completion";
              }}
            >
              {l10n($curr_lang, "other-payment-methods")}
            </button> -->
          </div>
        {/if}
      {:catch e}
        {e}
      {/await}
    </div>
  {:else if currentScreen === "payment" && secondPageInvoice}
    <div class="flex-col flex gap-2">
      {#if payInProgress}
        <ProgressBar />
      {:else}
        {#each secondPageInvoice.methods as method}
          <button
            class="btn variant-filled border p-2 rounded-lg"
            on:click={async () => {
              if (secondPageInvoice) {
                payInProgress = true;
                try {
                  const gate = await native_gate();
                  await gate.pay_invoice(secondPageInvoice.id, method);
                  currentScreen = "completion";
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
    </div>
  {:else if currentScreen === "voucher"}
    <div class="flex-col flex gap-2">
      <div class="my-2">
        <label for="voucher-code" class="label mb-1">
          <span>{l10n($curr_lang, "voucher-code")}</span>
        </label>
        <input
          id="voucher-code"
          type="text"
          autocapitalize="characters"
          bind:value={voucherCode}
          class="input p-2 border border-black w-full"
          placeholder={l10n($curr_lang, "enter-voucher-code")}
        />
      </div>

      {#if redeemInProgress}
        <ProgressBar />
      {:else}
        <button
          class="btn variant-filled"
          on:click={redeemVoucher}
          disabled={!voucherCode.trim()}
        >
          {l10n($curr_lang, "redeem")}
        </button>
        <button
          class="btn variant-ghost"
          on:click={() => {
            currentScreen = "main";
            voucherCode = "";
          }}
        >
          {l10n($curr_lang, "back")}
        </button>
      {/if}
    </div>
  {:else if currentScreen === "completion"}
    <div class="flex-col flex gap-4 items-center text-center text-lg">
      <p>
        {@html l10n($curr_lang, "payment-processed-refresh")}
      </p>

      {#if refreshInProgress}
        <ProgressBar />
      {:else}
        <button
          class="btn variant-filled w-full"
          on:click={handleRefreshWithDelay}
        >
          {l10n($curr_lang, "refresh-account-info")}
        </button>
      {/if}
    </div>
  {/if}
</Popup>
