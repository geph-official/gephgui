<script lang="ts">
  import { ProgressBar } from "@skeletonlabs/skeleton";
  import { curr_lang, l10n } from "./lib/l10n";
  import { curr_valid_secret } from "./lib/user";
  import { native_gate } from "./native-gate";
  import RegisterPopup from "./RegisterPopup.svelte";

  let inputValue = "";

  let loggingIn = false;

  const formatNumberWithSpaces = (value: string): string =>
    value
      .replace(/\D+/g, "") // Remove all non-numbers
      .replace(/(\d{4})/g, "$1 ") // Add a space every 4 digits
      .trim(); // Remove trailing space

  const handleInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    let formattedValue = formatNumberWithSpaces(target.value);
    console.log(target.value, formattedValue);
    inputValue = formattedValue; // Update the store with the formatted value
  };

  const onLogin = async () => {
    loggingIn = true;
    try {
      const secret = inputValue.replace(" ", "");
      const gate = await native_gate();
      const isValidSecret = (await gate.daemon_rpc("check_secret", [
        secret,
      ])) as boolean;
      if (isValidSecret) {
        $curr_valid_secret = secret;
      } else {
        alert("Invalid secret");
      }
    } finally {
      loggingIn = false;
    }
  };

  const onRegister = async () => {
    registerOpen = true;
  };

  let registerOpen = false;
</script>

<div id="login">
  <RegisterPopup bind:open={registerOpen} />
  <div class="middle">
    <h1 class="h1">{l10n($curr_lang, "login")}</h1>
    <input
      id="accnumber"
      class="input my-4"
      bind:value={inputValue}
      type="text"
      on:input={handleInput}
      placeholder={l10n($curr_lang, "enter-account-secret")}
    />
    <button
      type="button"
      class="btn variant-filled"
      disabled={loggingIn}
      on:click={() => onLogin()}
    >
      {l10n($curr_lang, "login")}
    </button>
    {#if loggingIn}
      <ProgressBar />
    {/if}
  </div>
  <div
    class="absolute bottom-0 left-0 flex flex-col w-screen bg-surface-100 px-8 pt-3 pb-4"
  >
    <small>{l10n($curr_lang, "dont-have-account-secret")}</small>
    <button
      type="button"
      class="btn variant-ghost mt-2 btn-sm"
      disabled={loggingIn}
      on:click={() => onRegister()}
    >
      {l10n($curr_lang, "register")}
    </button>
  </div>
</div>

<style>
  #login {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 1rem;
  }

  #accnumber {
    height: 2.5rem;
    padding: 0.3rem;
    border-radius: 0;
  }

  .middle {
    width: 100%;
    padding: 1rem;

    box-sizing: border-box;
    margin-top: 20vh;
    display: flex;
    flex-direction: column;
  }
</style>
