<script lang="ts">
  import {
    ProgressBar,
    getModalStore,
    getToastStore,
  } from "@skeletonlabs/skeleton";
  import { slide } from "svelte/transition";
  import { curr_lang, l10n } from "./lib/l10n";
  import { native_gate } from "./native-gate";
  import { curr_valid_secret } from "./lib/user";
  import {
    formatNumberWithSpaces,
    showErrorModal,
    showErrorToast,
  } from "./lib/utils";
  import Popup from "./lib/Popup.svelte";

  export let open = false;
  // Accept initial values for username and password
  export let initialUsername = "";
  export let initialPassword = "";

  let username = initialUsername;
  let password = initialPassword;

  let accountSecret: string | null = null;

  let isConverting = false;

  const toastStore = getToastStore();
  const onConvert = async () => {
    isConverting = true;
    accountSecret = null;
    try {
      const gate = await native_gate();
      accountSecret = (await gate.daemon_rpc("convert_legacy_account", [
        username,
        password,
      ])) as string;
    } catch (e) {
      showErrorToast(toastStore, `${e}`);
    } finally {
      isConverting = false;
    }
  };

  const onLogin = () => {
    $curr_valid_secret = accountSecret;
    open = false;

    // After successful migration, we can remove the legacy credentials
    if (localStorage.getItem("userpwd")) {
      localStorage.removeItem("userpwd");
    }
  };
</script>

<Popup
  {open}
  title={l10n($curr_lang, "migrate-from-older-versions")}
  onClose={() => (open = false)}
>
  <p class="my-3">
    {@html l10n($curr_lang, "enter-old-username-password-blurb")}
  </p>

  <p class="my-3">
    {@html l10n($curr_lang, "user-secret-info")}
  </p>

  {#if accountSecret}
    <div>
      <div class="w-full flex items-center justify-center tnum my-6">
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
    </div>
  {:else if isConverting}
    <ProgressBar />
  {:else}
    <div class="flex flex-col gap-3" transition:slide>
      <input
        class="input"
        type="text"
        placeholder={l10n($curr_lang, "username")}
        autocapitalize="none"
        bind:value={username}
      />
      <input
        class="input"
        type="password"
        placeholder={l10n($curr_lang, "password")}
        bind:value={password}
        on:keydown={(e) => {
          if (e.key === "Enter") {
            onConvert();
          }
        }}
      />
      <button class="btn variant-filled" on:click={onConvert}>
        {l10n($curr_lang, "convert-account")}
      </button>
    </div>
  {/if}
</Popup>
