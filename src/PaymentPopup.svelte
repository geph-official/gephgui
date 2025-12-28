<script lang="ts">
  import { slide } from "svelte/transition";
  import { curr_lang, l10n } from "./lib/l10n";
  import { onMount } from "svelte";
  import { get } from "svelte/store";
  import { native_gate, broker_rpc } from "./native-gate";
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
  } from "@skeletonlabs/skeleton";
  import { showErrorModal, showErrorToast, showToast } from "./lib/utils";
  import Popup from "./lib/Popup.svelte";
  // Icons
  import AllInclusive from "svelte-material-icons/AllInclusive.svelte";
  import Gauge from "svelte-material-icons/Gauge.svelte";
  import Speedometer from "svelte-material-icons/Speedometer.svelte";
  import StarCircleOutline from "svelte-material-icons/StarCircleOutline.svelte";
  import ShieldCheck from "svelte-material-icons/ShieldCheck.svelte";
  import { SlideToggle } from "@skeletonlabs/skeleton";

  const modalStore = getModalStore();
  const toastStore = getToastStore();

  let selectedIndex = 0;

  let planTab: "unlimited" | "basic" = "unlimited";
  let hasBasicPlan = true;
  let effectivePlanTab: "unlimited" | "basic" = "unlimited";
  let nativePaymentAttempted = false;

  $: effectivePlanTab = hasBasicPlan ? planTab : "unlimited";

  const loadAllInfo = async () => {
    for (;;) {
      try {
        const gate = await native_gate();
        const secret = $curr_valid_secret || "";
        if (
          !nativePaymentAttempted &&
          typeof gate.start_native_payment === "function"
        ) {
          nativePaymentAttempted = true;
          console.log("gate.START_NATIVE_PAYMENT()");
          try {
            await gate.start_native_payment($curr_valid_secret || "");
            currentScreen = "completion";
          } catch (nativeErr) {
            console.warn("Native payment unavailable, falling back", nativeErr);
          }
        }
        const [
          rawPricePoints,
          rawBasicPricePoints,
          basicLimit,
          basicAbTest,
          fxResp,
        ] = await Promise.all([
          broker_rpc("raw_price_points", []),
          broker_rpc("basic_price_points", []),
          broker_rpc("basic_mb_limit", []),
          gate.daemon_rpc("ab_test", ["basic", secret]),
          broker_rpc("call_geph_payments", [
            {
              jsonrpc: "2.0",
              method: "eur_cny_fx_rate",
              params: [],
              id: 1,
            },
          ]),
        ]);
        const pricePoints = (rawPricePoints as [number, number][]).map(
          ([d, c]) => [d, c / 100],
        ) as [number, number][];
        const basicPricePoints = (
          rawBasicPricePoints as [number, number][]
        ).map(([d, c]) => [d, c / 100]) as [number, number][];

        const result = {
          basicInfo: basicAbTest ? { bw_limit: basicLimit as number } : null,
          pricePoints,
          basicPricePoints,
          cnyFxRate: (fxResp as any).result as number,
        };
        return result;
      } catch (e) {
        showErrorToast(toastStore, "" + e);
        // Prevent tight retry loops that can freeze the UI
        await new Promise((r) => setTimeout(r, 500));
      }
    }
  };

  type Screen = "planSelect" | "main" | "payment" | "voucher" | "completion";
  let currentScreen: Screen = "planSelect";

  function handleSelect(index: number) {
    selectedIndex = index;
  }

  type PaymentIntent = {
    level: "unlimited" | "basic";
    days: number;
    methods: string[];
  };

  let secondPagePayment: PaymentIntent | null = null;
  let createInvoiceInProgress = false;
  let payInProgress = false;
  let redeemInProgress = false;
  let voucherCode = "";
  let promoCode = "";
  let initialized = false;
  let showCNYPrices = false;

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

  $: isUnlimited =
    $app_status &&
    $app_status.account.level === "Plus" &&
    $app_status.account.bw_consumption === null;

  // Helper to choose a reasonable "monthly" price point
  function getMonthlyPrice(allInfo: any, plan: string) {
    const points: [number, number][] =
      plan === "unlimited" ? allInfo.pricePoints : allInfo.basicPricePoints;
    const choice =
      points.find(([d]) => d === 30) ||
      points.find(([d]) => d === 31) ||
      points[0];
    return { days: choice[0], price: choice[1] };
  }

  $: if ($paymentsOpen && !initialized) {
    if (isUnlimited) {
      planTab = "unlimited";
      currentScreen = "main";
    } else {
      currentScreen = "planSelect";
    }
    selectedIndex = 0;
    showCNYPrices = $curr_lang === "zh-CN";
    initialized = true;
  }
  $: if (!$paymentsOpen) {
    nativePaymentAttempted = false;
  }

  function displayLabel(days: number, plan: "unlimited" | "basic") {
    if (plan === "unlimited" && isBasic) {
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

  async function handlePayNow(days: number, plan: "unlimited" | "basic") {
    createInvoiceInProgress = true;
    secondPagePayment = null;
    try {
      const methods = (await broker_rpc("payment_methods", [])) as string[];
      secondPagePayment = {
        level: plan,
        days,
        methods,
      };
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
    secondPagePayment = null;
    currentScreen = "planSelect";
    voucherCode = "";
    initialized = false;
    nativePaymentAttempted = false;
  }

  let refreshInProgress = false;

  function handleRefreshWithDelay() {
    refreshInProgress = true;
    setTimeout(() => {
      handleClose();
      refreshInProgress = false;
    }, 10000);
  }

  async function redeemVoucher() {
    redeemInProgress = true;
    try {
      const daysAdded = await broker_rpc("redeem_voucher", [
        $curr_valid_secret || "",
        voucherCode,
      ]);

      if (daysAdded === 0) {
        // Voucher is invalid
        showErrorToast(toastStore, l10n($curr_lang, "voucher-invalid"));
      } else {
        showToast(
          toastStore,
          `${l10n($curr_lang, "voucher-success")} (+${daysAdded} ${l10n(
            $curr_lang,
            "days",
          )})`,
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
      {@const planChoices = allInfo.basicPricePoints.length
        ? ["unlimited", "basic"]
        : ["unlimited"]}
      {#if $curr_lang === "zh-CN"}
        <div class="flex items-center justify-end gap-3 mb-2">
          <span class="text-sm opacity-80">
            {l10n($curr_lang, "show-cny-prices")}
          </span>
          <SlideToggle
            name="cny"
            size="sm"
            active="bg-primary-500"
            bind:checked={showCNYPrices}
          />
        </div>
      {/if}
      {#if currentScreen === "planSelect"}
        <div class="flex flex-col gap-3">
          <div class="grid grid-cols-1 gap-3">
            {#each planChoices as plan}
              <button
                class={`${
                  plan === "unlimited"
                    ? "btn variant-ringed-primary bg-primary-50/40 dark:bg-primary-900/20 hover:bg-primary-100/70 dark:hover:bg-primary-900/30"
                    : "btn variant-ringed bg-surface-50/70 dark:bg-surface-900/10 hover:bg-surface-100/70 dark:hover:bg-surface-900/20"
                } w-full text-left transition flex flex-col items-start gap-3 relative p-4`}
                on:click={() => {
                  planTab = plan === "unlimited" ? "unlimited" : "basic";
                  selectedIndex = 0;
                  currentScreen = "main";
                }}
              >
                <!-- Badges -->
                {#if plan === "unlimited"}
                  <span
                    class="badge variant-filled-primary absolute top-2 right-2"
                    >{l10n($curr_lang, "popular")}</span
                  >
                  {#if isBasic}
                    <span
                      class="badge variant-ghost-primary absolute top-10 right-2"
                      >{l10n($curr_lang, "upgrade")}</span
                    >
                  {/if}
                {:else}
                  <span class="absolute top-2 right-2" />
                {/if}
                <div class="flex items-center gap-3">
                  <div
                    class={`w-8 h-8 rounded-full flex items-center justify-center ${
                      plan === "unlimited"
                        ? "bg-primary-500/15 text-primary-700 opacity-90"
                        : "bg-surface-500/10 opacity-80"
                    }`}
                  >
                    <svelte:component
                      this={plan === "unlimited" ? AllInclusive : Gauge}
                      size="1.25rem"
                    />
                  </div>
                  <div
                    class={`${
                      plan === "unlimited"
                        ? "text-primary-900 dark:text-primary-300"
                        : "opacity-80"
                    } font-semibold text-lg`}
                  >
                    {l10n(
                      $curr_lang,
                      plan === "unlimited" ? "unlimited-tab" : "basic-tab",
                    )}
                  </div>
                </div>
                <div class="text-sm opacity-70 mt-[-0.25rem] mb-1">
                  {l10n(
                    $curr_lang,
                    plan === "unlimited"
                      ? "best-for-everyday-usage"
                      : "best-for-occasional-usage",
                  )}
                </div>
                <div class="grid grid-cols-[auto,1fr] items-start w-full">
                  <!-- Price column -->
                  {#key plan}
                    {#await Promise.resolve(getMonthlyPrice(allInfo, plan)) then mp}
                      <div
                        class={`min-w-[5rem] flex flex-col items-start justify-center ${
                          plan === "unlimited"
                            ? "text-primary-900 dark:text-primary-300"
                            : "opacity-90"
                        }`}
                      >
                        <div class="text-2xl font-semibold tnum">
                          {#if showCNYPrices}
                            ¥{Math.ceil(mp.price * allInfo.cnyFxRate)}
                          {:else}
                            €{mp.price.toFixed(2)}
                          {/if}
                        </div>
                        <div class="text-xs opacity-70">
                          {l10n($curr_lang, "per-month")}
                        </div>
                      </div>
                    {/await}
                  {/key}

                  <!-- Bullets column -->
                  <div class="flex flex-col gap-2 text-sm">
                    <!-- Differentiator bullet -->
                    {#if plan === "unlimited"}
                      <div
                        class="grid grid-cols-[1.5rem,1fr] items-center gap-2"
                      >
                        <div
                          class="w-6 flex justify-center opacity-80 text-primary-800 dark:text-primary-300"
                        >
                          <AllInclusive size="1.1rem" />
                        </div>
                        <span
                          class="px-2 py-1 rounded bg-primary-500/10 text-primary-800 dark:text-primary-300 font-medium"
                        >
                          {l10n($curr_lang, "unlimited-bandwidth")}
                        </span>
                      </div>
                    {:else}
                      <div
                        class="grid grid-cols-[1.5rem,1fr] items-center gap-2 text-error-800 dark:text-error-300"
                      >
                        <div class="w-6 flex justify-center opacity-70">
                          <Gauge size="1.1rem" />
                        </div>
                        <span
                          class="px-2 py-1 rounded bg-error-500/10 font-medium"
                        >
                          {#if allInfo.basicInfo}
                            {l10n($curr_lang, "bandwidth-limit-prefix")}
                            {allInfo.basicInfo.bw_limit / 1000}
                            {" "}{l10n($curr_lang, "gb-per-month")}
                          {:else}
                            {l10n($curr_lang, "bandwidth-limit-prefix")} … {l10n(
                              $curr_lang,
                              "gb-per-month",
                            )}
                          {/if}
                        </span>
                      </div>
                    {/if}
                    <!-- Common bullets -->
                    <div
                      class="grid grid-cols-[1.5rem,1fr] items-center gap-2 opacity-90"
                    >
                      <div class="w-6 flex justify-center opacity-60">
                        <Speedometer size="1.1rem" />
                      </div>
                      <span class="px-2"
                        >{l10n($curr_lang, "remove-speed-limit")}</span
                      >
                    </div>
                    <div
                      class="grid grid-cols-[1.5rem,1fr] items-center gap-2 opacity-90"
                    >
                      <div class="w-6 flex justify-center opacity-60">
                        <StarCircleOutline size="1.1rem" />
                      </div>
                      <span class="px-2"
                        >{l10n($curr_lang, "access-premium-locations")}</span
                      >
                    </div>
                    <div
                      class="grid grid-cols-[1.5rem,1fr] items-center gap-2 opacity-90"
                    >
                      <div class="w-6 flex justify-center opacity-60">
                        <ShieldCheck size="1.1rem" />
                      </div>
                      <span class="px-2"
                        >{l10n($curr_lang, "more-resilient-connections")}</span
                      >
                    </div>
                  </div>
                </div>
              </button>
            {/each}
          </div>
        </div>
      {:else if currentScreen === "main"}
        {@const activePricePoints =
          effectivePlanTab === "unlimited"
            ? allInfo.pricePoints
            : allInfo.basicPricePoints}
        <div class="flex flex-col">
          {#if allInfo.basicInfo}
            <p
              class={effectivePlanTab === "unlimited" ||
              $app_status?.account.level === "Free"
                ? "text-center mb-2 font-bold text-success-600"
                : "text-center mb-2 font-bold text-red-600"}
            >
              {effectivePlanTab === "unlimited"
                ? l10n($curr_lang, "unlimited-bandwidth")
                : l10n($curr_lang, "bandwidth-limit-prefix") +
                  allInfo.basicInfo.bw_limit / 1000 +
                  " " +
                  l10n($curr_lang, "gb-per-month")}
            </p>
            {#if effectivePlanTab === "basic"}
              <p class="text-center text-sm mb-2">
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
            {/if}
            {#if effectivePlanTab === "unlimited" && remainingBasicDays !== null}
              <p class="text-center text-xs mb-2 font-bold">
                {l10n($curr_lang, "basic-upgrade-blurb").replace(
                  "DAYS",
                  Math.min(
                    remainingBasicDays,
                    (effectivePlanTab === "unlimited"
                      ? allInfo.pricePoints
                      : allInfo.basicPricePoints)[selectedIndex][0],
                  ).toString(),
                )}
              </p>
            {/if}
          {/if}

          {#each activePricePoints as [days, price], i}
            <button
              class={`btn variant-outline rounded-lg border p-3 flex-row flex gap-2 items-center mb-2 cursor-pointer ${
                i === selectedIndex ? "variant-ghost-primary" : ""
              }`}
              on:click={() => handleSelect(i)}
            >
              <div>{displayLabel(days, effectivePlanTab)}</div>
              <div class="grow text-right tnum">
                <span class="font-semibold">
                  {#if showCNYPrices}
                    ¥{Math.ceil(price * allInfo.cnyFxRate)}
                  {:else}
                    €{price.toFixed(2)}
                  {/if}
                </span>
              </div>
            </button>
          {/each}

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
                    planTab,
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
      {:else if currentScreen === "payment" && secondPagePayment}
        <div class="flex-col flex gap-2">
          {#if payInProgress}
            <ProgressBar />
          {:else}
            <div class="my-2">
              <label for="promo-code" class="label mb-1">
                <span>{l10n($curr_lang, "promo-code")}</span>
              </label>
              <input
                id="promo-code"
                type="text"
                bind:value={promoCode}
                on:input={(event) => {
                  promoCode = event.currentTarget.value.toUpperCase();
                }}
                class="input p-2 border border-black w-full"
                placeholder={l10n($curr_lang, "enter-promo-code")}
              />
              <p class="text-xs opacity-70 mt-1">
                {l10n($curr_lang, "promo-code-blurb")}
              </p>
            </div>
            {#each secondPagePayment.methods as method}
              <button
                class="btn variant-filled border p-2 rounded-lg"
                on:click={async () => {
                  if (secondPagePayment) {
                    payInProgress = true;
                    try {
                      const gate = await native_gate();
                      const rpcMethod =
                        secondPagePayment.level === "basic"
                          ? "create_basic_payment"
                          : "create_payment";
                      const url = await broker_rpc(rpcMethod, [
                        $curr_valid_secret || "",
                        secondPagePayment.days,
                        promoCode.trim()
                          ? `${method}+++${promoCode.trim()}`
                          : method,
                      ]);
                      await gate.open_browser(url);
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
