<script lang="ts">
  import { AppBar, ProgressBar } from "@skeletonlabs/skeleton";
  import Close from "svelte-material-icons/Close.svelte";
  import { fly, slide } from "svelte/transition";
  import { curr_lang, l10n } from "./lib/l10n";
  import { native_gate } from "./native-gate";
  import { curr_valid_secret } from "./lib/user";
  import { formatNumberWithSpaces } from "./lib/utils";
  export let open = false;

  let username = "";
  let password = "";

  let accountSecret: string | null = null;

  let isConverting = false;
  const onConvert = async () => {
    isConverting = true;
    accountSecret = null;
    try {
      const gate = await native_gate();
      accountSecret = (await gate.daemon_rpc("convert_legacy_account", [
        username,
        password,
      ])) as string;
    } finally {
      isConverting = false;
    }
  };

  const onLogin = () => {
    $curr_valid_secret = accountSecret;
    open = false;
  };
</script>

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
    <b id="logo-text">{l10n($curr_lang, "migrate-from-older-versions")}</b>
  </AppBar>

  <div class="px-5">
    <p class="my-3">
      Enter the username and password you use with previous versions to obtain
      your <b>account secret</b>.
    </p>

    <p class="my-3">
      {l10n($curr_lang, "user-secret-info")}
    </p>

    {#if accountSecret}
      <div transition:slide>
        <div class="text-center text-2xl">
          {formatNumberWithSpaces(accountSecret)}
        </div>
        <div class="text-center mt-2">
          <button class="btn variant-filled btn-sm" on:click={() => onLogin()}>
            {l10n($curr_lang, "login")}
          </button>
        </div>
      </div>
    {:else if isConverting}
      <ProgressBar />
    {:else}
      <div class="flex flex-col gap-3" transition:slide>
        <input
          class="input"
          type="text"
          placeholder={l10n($curr_lang, "username")}
          bind:value={username}
        />
        <input
          class="input"
          type="password"
          placeholder={l10n($curr_lang, "password")}
          bind:value={password}
        />
        <button class="btn variant-filled" on:click={onConvert}>
          {l10n($curr_lang, "convert-account")}
        </button>
      </div>
    {/if}
  </div>
</div>
