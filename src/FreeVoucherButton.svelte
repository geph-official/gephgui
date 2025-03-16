<script lang="ts">
  import Popup from "./lib/Popup.svelte";
  import { curr_lang } from "./lib/l10n";
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
</script>

{#await fetchVoucher() then voucher}
  <button class="btn btn-sm variant-ghost-success -my-2 attention-button">
    Free Plus!
  </button>

  <Popup open={true} fullScreen={false} title="Free Geph Plus!">
    <div class="flex flex-col gap-2">
      <div>{voucher?.explanation[$curr_lang]}</div>
      <button class="btn variant-ghost-primary">Apply voucher</button>
      <button class="btn variant-ghost">Use later</button>
    </div>
  </Popup>
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
