<script lang="ts">
  import { ProgressBar } from "@skeletonlabs/skeleton";
  import Popup from "./lib/Popup.svelte";
  import { curr_lang, l10n } from "./lib/l10n";
  import { curr_valid_secret } from "./lib/user";
  import { native_gate } from "./native-gate";

  type VoucherInfo = {
    code: string;
    explanation: Record<string, string>;
  };

  const fetchVoucher = async () => {
    const gate = await native_gate();
    return (await gate.daemon_rpc("get_free_voucher", [
      $curr_valid_secret,
    ])) as VoucherInfo | null;
  };

  let applyingVoucher = false;

  const applyVoucher = async (voucher: string) => {
    applyingVoucher = true;
    try {
      const gate = await native_gate();
      await gate.daemon_rpc("redeem_voucher", [$curr_valid_secret, voucher]);
      popupOpen = false;
      applied = true;
    } finally {
      applyingVoucher = false;
    }
  };

  // Helper function to get explanation text with fallback to "en"
  const getExplanation = (voucher: VoucherInfo | null) => {
    if (!voucher) return "";
    return (
      voucher.explanation[$curr_lang] ||
      voucher.explanation["en"] ||
      Object.values(voucher.explanation)[0] ||
      ""
    );
  };

  let popupOpen = false;
  let applied = false;
</script>

{#await fetchVoucher() then voucher}
  {#if voucher}
    {#if !applied}
      <button
        class="btn btn-sm variant-ghost-warning -my-2 attention-button"
        on:click={() => (popupOpen = true)}
      >
        {l10n($curr_lang, "free-plus")}
      </button>
    {/if}

    <Popup
      bind:open={popupOpen}
      fullScreen={false}
      title={l10n($curr_lang, "free-plus")}
    >
      <div class="flex flex-col gap-2">
        <div>{getExplanation(voucher)}</div>
        {#if applyingVoucher}
          <ProgressBar />
        {:else}
          <button
            class="btn variant-ghost-primary"
            on:click={() => applyVoucher(voucher?.code)}
            >{l10n($curr_lang, "apply-voucher")}</button
          >
          <button class="btn variant-ghost" on:click={() => (popupOpen = false)}
            >{l10n($curr_lang, "use-later")}</button
          >
        {/if}
      </div>
    </Popup>
  {/if}
{/await}

<style>
  .attention-button {
    animation:
      pulsate 1.5s ease-in-out infinite,
      vibrate 1s linear infinite;
  }

  @keyframes pulsate {
    0% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(72, 187, 120, 0.7);
    }
    70% {
      transform: scale(1.05);
      box-shadow: 0 0 0 10px rgba(72, 187, 120, 0);
    }
    100% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(72, 187, 120, 0);
    }
  }

  @keyframes vibrate {
    0% {
      transform: translate(0);
    }
    20% {
      transform: translate(-1px, 1px);
    }
    40% {
      transform: translate(1px, -1px);
    }
    60% {
      transform: translate(-1px, -1px);
    }
    80% {
      transform: translate(1px, 1px);
    }
    100% {
      transform: translate(0);
    }
  }
</style>
