<script lang="ts">
  import { slide } from "svelte/transition";
  import { curr_lang, l10n } from "./lib/l10n";
  import { onMount } from "svelte";
  import { get } from "svelte/store";
  import { native_gate, type InvoiceInfo } from "./native-gate";
  import {
    clearAccountCache,
    curr_valid_secret,
    paymentsOpen,
    app_status,
  } from "./lib/user";
  import {
    ProgressBar,
    getModalStore,
    getToastStore,
    type ModalSettings,
  } from "@skeletonlabs/skeleton";
  import { showErrorModal, showErrorToast, showToast } from "./lib/utils";
  import Popup from "./lib/Popup.svelte";

  const modalStore = getModalStore();
  const toastStore = getToastStore();

  // Tracks the currently selected index; starts at 0 to force an option.
  let selectedIndex = 0;

  let planTab: "unlimited" | "basic" = "unlimited";

  onMount(() => {
    if (get(app_status)?.account.level === "Free") {
      planTab = "basic";
    }
  });

  const loadAllInfo = async () => {
    for (;;) {
      try {
        const gate = await native_gate();
        const basicInfo = await gate.get_basic_info($curr_valid_secret || "");
        return {
          basicInfo,
          pricePoints: await gate.price_points(),
          basicPricePoints: await gate.basic_price_points(),
        };
      } catch (e) {
        showErrorToast(toastStore, "" + e);
      }
    }
  };

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
  $: remainingBasicDays =
    $app_status &&
    $app_status.account.level === "Plus" &&
    $app_status.account.bw_consumption
      ? Math.ceil(
          ($app_status.account.expiry - Math.floor(Date.now() / 1000)) / 86400,
        )
      : null;
  $: isBasic =
    $app_status &&
    $app_status.account.level === "Plus" &&
    $app_status.account.bw_consumption;

  function displayLabel(days: number) {
    if (planTab === "unlimited" && isBasic) {
      if (remainingBasicDays !== null && days > remainingBasicDays) {
        return (
          l10n($curr_lang, "upgrade") +
          " " +
          remainingBasicDays +
          " + " +
          (days - remainingBasicDays) +
          " " +
          l10n($curr_lang, "days")
        );
      } else {
        return (
          l10n($curr_lang, "upgrade") +
          " " +
          days +
          " " +
          l10n($curr_lang, "days")
        );
      }
    }
    return days + " " + l10n($curr_lang, "days");
  }

  async function handlePayNow(days: number) {
    createInvoiceInProgress = true;
    try {
      const gate = await native_gate();
      const invoice =
        planTab === "unlimited"
          ? await gate.create_invoice($curr_valid_secret || "", days)
          : await gate.create_basic_invoice($curr_valid_secret || "", days);
      secondPageInvoice = invoice;
      currentScreen = "payment";
    } catch (e) {
      showErrorModal(
        modalStore,
        l10n($curr_lang, "err_create_invoice") + ": " + e,
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
    redeemInProgress = true;
    try {
      const gate = await native_gate();
      const daysAdded = await gate.daemon_rpc("redeem_voucher", [
        $curr_valid_secret || "",
        voucherCode,
      ]);

      if (daysAdded === 0) {
        // Voucher is invalid
        showErrorToast(toastStore, l10n($curr_lang, "voucher-invalid"));
      } else {
        showToast(
          toastStore,
          `${l10n($curr_lang, "voucher-success")} (+${daysAdded} ${l10n($curr_lang, "days")})`,
        );
        handleClose();
      }
    } catch (e) {
      showErrorToast(toastStore, "" + e);
    } finally {
      redeemInProgress = false;
    }
  }
</script>

<Popup
  open={$paymentsOpen}
  title={l10n($curr_lang, "add-plus-time")}
  onClose={handleClose}
>
  {#key $paymentsOpen}
    {#await loadAllInfo()}
      <ProgressBar />
    {:then allInfo}
      {#if currentScreen === "main"}
        <div class="flex flex-col">
          {#if allInfo.basicInfo}
            <div class="flex justify-center gap-2 mb-2">
              <button
                class="btn px-2 py-1 text-sm"
                class:variant-filled-primary={planTab === "unlimited"}
                on:click={() => {
                  planTab = "unlimited";
                  selectedIndex = 0;
                }}
              >
                {l10n($curr_lang, "unlimited-tab")}
              </button>

              <button
                class="btn px-2 py-1 text-sm"
                class:variant-filled-primary={planTab === "basic"}
                on:click={() => {
                  planTab = "basic";
                  selectedIndex = 0;
                }}
              >
                {l10n($curr_lang, "basic-tab")}
                <span class="badge variant-ghost-warning ml-2">BETA</span>
              </button>
            </div>

            <p
              class={planTab === "unlimited"
                ? "text-center text-xs mb-2 font-bold text-success-600"
                : "text-center text-xs mb-2 font-bold text-red-600"}
            >
              {planTab === "unlimited"
                ? l10n($curr_lang, "unlimited-bandwidth")
                : allInfo.basicInfo
                  ? l10n($curr_lang, "bandwidth-limit-prefix") +
                    allInfo.basicInfo.bw_limit / 1000 +
                    " " +
                    l10n($curr_lang, "gb-per-month")
                  : ""}
            </p>
            {#if planTab === "basic"}
              <p class="text-center text-xs mb-2">
                {#if $app_status?.account.level === "Free"}
                  {l10n($curr_lang, "basic-free-blurb").replace(
                    "GB",
                    (allInfo.basicInfo.bw_limit / 1000).toString(),
                  )}
                {:else}
                  {l10n($curr_lang, "basic-plus-blurb").replace(
                    "GB",
                    (allInfo.basicInfo.bw_limit / 1000).toString(),
                  )}
                {/if}
              </p>
              <p class="text-center text-xs mb-2 opacity-70">
                {l10n($curr_lang, "basic-beta-warning")}
              </p>
            {/if}
              {#if planTab === "unlimited" && remainingBasicDays !== null}
                <p class="text-center text-xs mb-2 font-bold">
                  {l10n($curr_lang, "basic-upgrade-blurb").replace(
                    "DAYS",
                    Math.min(
                      remainingBasicDays,
                      (planTab === "unlimited"
                        ? allInfo.pricePoints
                        : allInfo.basicPricePoints)[selectedIndex][0],
                    ).toString(),
                  )}
                </p>
              {/if}
          {/if}

          {#each planTab === "unlimited" ? allInfo.pricePoints : allInfo.basicPricePoints as [days, price], i}
            <button
              class={`btn variant-outline rounded-lg border p-3 flex-row flex gap-2 items-center mb-2 cursor-pointer ${
                i === selectedIndex ? "variant-ghost-primary" : ""
              }`}
              on:click={() => handleSelect(i)}
            >
              <div>{displayLabel(days)}</div>
              <div class="grow text-right tnum">
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
                on:click={() =>
                  handlePayNow(
                    (planTab === "unlimited"
                      ? allInfo.pricePoints
                      : allInfo.basicPricePoints)[selectedIndex][0],
                  )}
                disabled={createInvoiceInProgress}
              >
                {l10n($curr_lang, "pay-now")}
              </button>
              <button
                class="btn variant-ghost-primary"
                on:click={() => {
                  currentScreen = "voucher";
                  voucherCode = "";
                }}
              >
                {l10n($curr_lang, "redeem-voucher")}
              </button>

              <div class="opacity-50 text-center">&mdash;&mdash;&mdash;</div>

              <button
                class="btn btn-sm variant-ghost"
                on:click={() => {
                  window.open(
                    `https://geph.io/billing/login_secret?secret=${$curr_valid_secret}`,
                  );
                  currentScreen = "completion";
                }}
              >
                {l10n($curr_lang, "other-payment-methods")}
              </button>
            </div>
          {/if}
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
    {/await}
  {/key}
</Popup>
