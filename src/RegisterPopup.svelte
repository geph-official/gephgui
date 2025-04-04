<script lang="ts">
  import { ProgressBar } from "@skeletonlabs/skeleton";
  import { curr_lang, l10n } from "./lib/l10n";
  import { native_gate } from "./native-gate";
  import { onDestroy, onMount } from "svelte";
  import { curr_valid_secret } from "./lib/user";
  import { formatNumberWithSpaces } from "./lib/utils";
  import Popup from "./lib/Popup.svelte";

  export let open = false;

  let registerNum: number | null = null;
  let registerProgress: number | null = null;
  let registerSpeed: number | null;
  let startTime = new Date();
  let accountSecret: string | null = null;

  const handleOpen = async (open: boolean) => {
    if (open) {
      console.log("OPENED");
      const gate = await native_gate();
      registerNum = (await gate.daemon_rpc(
        "start_registration",
        []
      )) as any as number;
      startTime = new Date();
    } else {
      console.log("CLOSED");
      registerNum = null;
      registerProgress = null;
    }
  };

  let checkRegisterInterval: any;

  onMount(() => {
    checkRegisterInterval = setInterval(async () => {
      const gate = await native_gate();
      if (registerNum !== null) {
        const val = await gate.daemon_rpc("poll_registration", [registerNum]);
        console.log(val);
        accountSecret = (val as any).secret;
        registerProgress = Math.min((val as any).progress as number, 1.0);
        const diff = (new Date().getTime() - startTime.getTime()) / 1000.0;
        registerSpeed = registerProgress / diff;
      } else {
        registerProgress = null;
        registerSpeed = null;
      }
    }, 500);
  });

  onDestroy(() => {
    if (checkRegisterInterval) {
      clearInterval(checkRegisterInterval);
    }
  });

  $: handleOpen(open);

  const onLogin = () => {
    $curr_valid_secret = accountSecret;
    open = false;
  };
</script>

<Popup
  {open}
  title={l10n($curr_lang, "register")}
  onClose={() => (open = false)}
>
  <p class="my-3">
    {l10n($curr_lang, "register-warning")}
  </p>

  <p class="my-3 text-error-700">
    <b>{l10n($curr_lang, "keep-window-open")}</b>
  </p>

  {#if accountSecret}
    <div class="w-full flex items-center justify-center tnum my-8">
      <div class="text-center text-3xl w-[20rem]">
        {formatNumberWithSpaces(accountSecret)}
      </div>
    </div>
    <div class="text-center mt-2">
      <button
        class="btn variant-ghost-primary w-full"
        on:click={() => onLogin()}
      >
        {l10n($curr_lang, "login")}
      </button>
    </div>
  {:else}
    <ProgressBar
      value={registerProgress ? registerProgress : undefined}
      max={1}
      meter="bg-primary-600"
    />
    <div class="flex flex-row text-sm">
      {#if registerProgress}
        <div class="grow">{(registerProgress * 100).toFixed(1)}%</div>
        {#if registerSpeed}
          <div>
            {((1.0 - registerProgress) / registerSpeed).toFixed(1)}s
          </div>
        {/if}
      {/if}
    </div>

    <p class="my-3">
      {l10n($curr_lang, "skip-wait-login-secret")}
    </p>

    <button class="btn w-full variant-ghost" on:click={() => (open = false)}>
      {l10n($curr_lang, "back")}
    </button>
  {/if}
</Popup>
