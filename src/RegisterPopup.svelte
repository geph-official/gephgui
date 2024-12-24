<script lang="ts">
  import { AppBar, ProgressBar } from "@skeletonlabs/skeleton";
  import Close from "svelte-material-icons/Close.svelte";
  import { fly } from "svelte/transition";
  import { curr_lang, l10n } from "./lib/l10n";
  import { native_gate } from "./native-gate";
  import { onDestroy, onMount } from "svelte";
  import { curr_valid_secret } from "./lib/user";
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
      if (registerNum) {
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

{#if open}
  <div
    class="bg-surface-50 absolute top-0 left-0 w-full h-full z-50"
    transition:fly={{ x: 0, y: 200, duration: 300 }}
  >
    <AppBar>
      <svelte:fragment slot="lead">
        <button on:click={() => (open = false)}>
          <Close size="1.5rem" />
        </button>
      </svelte:fragment>
      <b id="logo-text">{l10n($curr_lang, "register")}</b>
    </AppBar>
    <div class="px-5">
      <p class="my-3">
        {l10n($curr_lang, "register-warning")}
      </p>

      <p class="my-3">
        <b>{l10n($curr_lang, "keep-window-open")}</b>
      </p>

      {#if accountSecret}
        <div class="text-center text-2xl">
          {accountSecret}
        </div>
        <div class="text-center mt-2">
          <button class="btn variant-filled btn-sm" on:click={() => onLogin()}>
            {l10n($curr_lang, "login")}
          </button>
        </div>
      {:else}
        <ProgressBar
          value={registerProgress ? registerProgress : undefined}
          max={1}
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
      {/if}
    </div>
  </div>
{/if}
