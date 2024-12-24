<script lang="ts">
  import { AppBar, ProgressBar } from "@skeletonlabs/skeleton";
  import Close from "svelte-material-icons/Close.svelte";
  import EyeOutline from "svelte-material-icons/EyeOutline.svelte";
  import EyeOffOutline from "svelte-material-icons/EyeOffOutline.svelte";
  import ContentCopy from "svelte-material-icons/ContentCopy.svelte";
  export let open = false;
  let loggingOut = false;

  import { fly } from "svelte/transition";
  import { curr_lang, l10n } from "./lib/l10n";
  import { curr_account_status, curr_valid_secret } from "./lib/user";
  import { native_gate } from "./native-gate";

  let secretShown = false;

  function copyToClipboard(text: string) {
    // Create a hidden textarea
    const textArea = document.createElement("textarea");
    textArea.value = text; // Set the text to copy
    document.body.appendChild(textArea); // Add textarea to the document

    // Select the text and execute the copy command
    textArea.select();
    document.execCommand("copy");

    // Remove the textarea
    document.body.removeChild(textArea);
    console.log("Text copied to clipboard!");
  }
</script>

{#if open}
  <div
    id="popup"
    class="bg-surface-50"
    transition:fly={{ x: 0, y: 200, duration: 300 }}
  >
    {#if loggingOut}
      <div class="m-5">
        <ProgressBar />
      </div>
    {:else}
      <AppBar>
        <svelte:fragment slot="lead">
          <button on:click={() => (open = false)}>
            <Close size="1.5rem" />
          </button>
        </svelte:fragment>
        <b id="logo-text">{l10n($curr_lang, "account")}</b>
      </AppBar>

      {#if $curr_valid_secret}
        <section>
          <h2 class="text-primary-700">{l10n($curr_lang, "account-secret")}</h2>
          <div class="flex flex-row">
            <div class="grow">
              {#if secretShown}
                {$curr_valid_secret.match(/.{1,4}/g)?.join(" ")}
              {:else}
                {$curr_valid_secret
                  .replace(/\d/g, "•")
                  .match(/.{1,4}/g)
                  ?.join(" ")}
              {/if}
            </div>
            <button on:click={() => (secretShown = !secretShown)} class="mr-2">
              {#if secretShown}
                <EyeOffOutline size="1.5rem" />
              {:else}
                <EyeOutline size="1.5rem" />
              {/if}
            </button>
            <button on:click={() => copyToClipboard($curr_valid_secret || "")}>
              <ContentCopy size="1.5rem" />
            </button>
          </div>
        </section>

        <section>
          <h2 class="text-primary-700">{l10n($curr_lang, "account-info")}</h2>
          <table class="table table-hover">
            <tbody>
              {#if $curr_account_status?.level === "plus"}
                <tr>
                  <td>{l10n($curr_lang, "account-level")}</td>
                  <td>{l10n($curr_lang, "plus-account")}</td>
                </tr>
                <tr>
                  <td>{l10n($curr_lang, "plus-expiry")}</td>
                  <td
                    >{new Date(
                      $curr_account_status.expiry * 1000
                    ).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}</td
                  >
                </tr>
              {:else if $curr_account_status?.level === "free"}
                <tr>
                  <td>{l10n($curr_lang, "account-level")}</td>
                  <td>{l10n($curr_lang, "free-account")}</td>
                </tr>
              {/if}
            </tbody>
          </table>
        </section>
      {/if}
      <section>
        <button
          class="btn variant-ghost-error"
          on:click={async () => {
            loggingOut = true;
            const gate = await native_gate();
            await gate.stop_daemon();
            localStorage.clear();
            window.location.reload();
          }}
        >
          {l10n($curr_lang, "logout")}
        </button>
      </section>
    {/if}
  </div>
{/if}

<style>
  #popup {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  section {
    margin: 1rem;
  }

  h2 {
    text-transform: uppercase;
    font-weight: 600;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }
</style>
