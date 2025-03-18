<script lang="ts">
  import { ProgressBar, getModalStore } from "@skeletonlabs/skeleton";
  import { curr_lang, l10n } from "./lib/l10n";
  import { curr_valid_secret } from "./lib/user";
  import { native_gate } from "./native-gate";
  import RegisterPopup from "./RegisterPopup.svelte";
  import MigrationPopup from "./MigrationPopup.svelte";
  import { formatNumberWithSpaces, showErrorModal } from "./lib/utils";
  import { onMount } from "svelte";

  let inputValue = "";

  let loggingIn = false;

  const handleInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    let formattedValue = formatNumberWithSpaces(target.value);
    console.log(target.value, formattedValue);
    inputValue = formattedValue; // Update the store with the formatted value
  };

  const modalStore = getModalStore();

  const onLogin = async () => {
    loggingIn = true;
    try {
      const secret = inputValue.replaceAll(" ", "");
      const gate = await native_gate();
      const isValidSecret = (await gate.daemon_rpc("check_secret", [
        secret,
      ])) as boolean;
      if (isValidSecret) {
        $curr_valid_secret = secret;
      } else {
        await showErrorModal(
          modalStore,
          l10n($curr_lang, "incorrect-user-secret")
        );
      }
    } catch (e: any) {
      await showErrorModal(modalStore, e.toString());
    } finally {
      loggingIn = false;
    }
  };

  const onRegister = async () => {
    registerOpen = true;
  };

  let registerOpen = false;

  let migrateOpen = false;

  // Legacy user credentials for migration
  let legacyUsername = "";
  let legacyPassword = "";

  // Check for legacy credentials on component mount
  onMount(() => {
    // Check if the legacy userpwd key exists in localStorage
    const legacyCredentials = localStorage.getItem("userpwd");
    if (legacyCredentials) {
      try {
        // Parse the JSON object containing username and password
        const credentials = JSON.parse(legacyCredentials);
        if (credentials.username && credentials.password) {
          // Store the legacy credentials to pass to MigrationPopup
          legacyUsername = credentials.username;
          legacyPassword = credentials.password;
          // Open the migration popup automatically
          migrateOpen = true;
        }
      } catch (e) {
        console.error("Failed to parse legacy credentials:", e);
      }
    }
  });
</script>

<div id="login">
  <RegisterPopup bind:open={registerOpen} />
  {#if migrateOpen}
    <MigrationPopup
      bind:open={migrateOpen}
      initialUsername={legacyUsername}
      initialPassword={legacyPassword}
    />
  {/if}
  <div class="middle">
    <h1 class="text-3xl">{l10n($curr_lang, "login")}</h1>
    <input
      id="accnumber"
      class="input my-4"
      bind:value={inputValue}
      type="text"
      inputmode="numeric"
      on:input={handleInput}
      on:keydown={(e) => {
        if (e.key === "Enter") {
          onLogin();
        }
      }}
      placeholder={l10n($curr_lang, "enter-account-secret")}
    />
    <button
      type="button"
      class="btn variant-ghost-primary"
      disabled={loggingIn}
      on:click={() => onLogin()}
    >
      {l10n($curr_lang, "login")}
    </button>
    {#if loggingIn}
      <ProgressBar meter="bg-primary-600" />
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
    <button
      type="button"
      class="btn variant-ringed mt-2 btn-sm"
      disabled={loggingIn}
      on:click={() => (migrateOpen = true)}
    >
      {l10n($curr_lang, "migrate-from-older-versions")}
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
  }

  .middle {
    width: 100%;
    padding: 1rem;

    box-sizing: border-box;
    margin-top: calc((100vh - 25rem) / 3);
    display: flex;
    flex-direction: column;
  }
</style>
