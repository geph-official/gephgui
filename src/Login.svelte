<script lang="ts">
  import { ProgressBar, getModalStore } from "@skeletonlabs/skeleton";
  import { curr_lang, l10n } from "./lib/l10n";
  import { signInWithCode, account_code_error, pending_account_code } from "./lib/user";
  import RegisterPopup from "./RegisterPopup.svelte";
  import { formatNumberWithSpaces, showErrorModal } from "./lib/utils";

  let inputValue = $state("");

  let loggingIn = $state(false);

  const handleInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    let formattedValue = formatNumberWithSpaces(target.value);
    inputValue = formattedValue; // Update the store with the formatted value
  };

  const modalStore = getModalStore();

  const onLogin = async () => {
    if (loggingIn) return;
    loggingIn = true;
    try {
      await signInWithCode(inputValue);
    } catch {
      // A returned replacement stays on the update screen if saving/restarting fails.
      if ($pending_account_code) return;
      await showErrorModal(modalStore, l10n($curr_lang,
        $account_code_error || "account-code-request-error"));
    } finally {
      loggingIn = false;
    }
  };

  const onRegister = async () => {
    registerOpen = true;
  };

  let registerOpen = $state(false);
</script>

<div id="login">
  <RegisterPopup bind:open={registerOpen} />
  <div class="middle">
    <h1 class="text-3xl">{l10n($curr_lang, "login")}</h1>
    <input
      id="accnumber"
      class="input my-4 tnum"
      bind:value={inputValue}
      type="text"
      inputmode="numeric"
      oninput={handleInput}
      onkeydown={(e) => {
        if (e.key === "Enter") {
          onLogin();
        }
      }}
      placeholder={l10n($curr_lang, "enter-account-secret")}
    />
    <button
      type="button"
      class="btn variant-ghost-primary mb-1"
      disabled={loggingIn}
      onclick={() => onLogin()}
    >
      {l10n($curr_lang, "login")}
    </button>
    {#if loggingIn}
      <ProgressBar meter="bg-primary-600" />
    {/if}
  </div>
  <div
    class="absolute bottom-0 inset-x-0 flex flex-col w-screen bg-surface-100 px-8 pt-3 pb-4"
  >
    <small>{l10n($curr_lang, "dont-have-account-secret")}</small>
    <button
      type="button"
      class="btn variant-ghost mt-2 btn-sm"
      disabled={loggingIn}
      onclick={() => onRegister()}
    >
      {l10n($curr_lang, "register")}
    </button>
  </div>
</div>

<style>
  #login {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-height: 0;
    justify-content: center;
    align-items: center;
    position: relative;
    overflow: auto;
    padding: 1rem;
  }

  #accnumber {
    height: 2.5rem;
    padding: 0.3rem;
  }

  .middle {
    width: 100%;
    padding: 1rem;
    padding-bottom: 10rem;

    box-sizing: border-box;
    display: flex;
    flex-direction: column;
  }
</style>
