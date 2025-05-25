<script lang="ts">
  import { ProgressBar, getModalStore, type ModalSettings } from "@skeletonlabs/skeleton";
  import EyeOutline from "svelte-material-icons/EyeOutline.svelte";
  import EyeOffOutline from "svelte-material-icons/EyeOffOutline.svelte";
  import ContentCopy from "svelte-material-icons/ContentCopy.svelte";
  export let open = false;
  let loggingOut = false;

  import { curr_lang, l10n } from "./lib/l10n";
  import { app_status, curr_valid_secret, clearAllCaches } from "./lib/user";
  import { native_gate } from "./native-gate";
  import Popup from "./lib/Popup.svelte";
  import { showErrorModal } from "./lib/utils";

  let secretShown = false;
  const modalStore = getModalStore();
  let deleteClickTimes: number[] = [];

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

  async function deleteAccount() {
    loggingOut = true;
    try {
      const gate = await native_gate();
      await gate.stop_daemon();
      await gate.daemon_rpc("delete_account", [$curr_valid_secret]);
      clearAllCaches();
      localStorage.clear();
    } catch (e) {
      await showErrorModal(modalStore, l10n($curr_lang, "error") + ": " + e);
    } finally {
      window.location.reload();
    }
  }

  function handleDeleteClick() {
    const now = Date.now();
    deleteClickTimes = deleteClickTimes.filter((t) => now - t < 1500);
    deleteClickTimes.push(now);
    if (deleteClickTimes.length >= 10) {
      deleteClickTimes = [];
      const modal: ModalSettings = {
        type: "confirm",
        title: l10n($curr_lang, "delete-account"),
        body: l10n($curr_lang, "delete-account-are-you-sure") +
          "<br/>" +
          l10n($curr_lang, "delete-account-blurb"),
        response: (r: boolean) => {
          if (r) {
            deleteAccount();
          }
        },
      };
      modalStore.trigger(modal);
    }
  }
</script>

<Popup
  {open}
  title={l10n($curr_lang, "account")}
  onClose={() => (open = false)}
>
  {#if loggingOut}
    <div class="my-5">
      <ProgressBar />
    </div>
  {:else}
    {#if $curr_valid_secret}
      <section>
        <h2 class="text-primary-700">{l10n($curr_lang, "account-secret")}</h2>
        <div class="flex flex-row tnum">
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
            {#if $app_status?.account.level === "Plus"}
              <tr>
                <td>{l10n($curr_lang, "account-level")}</td>
                <td>{l10n($curr_lang, "plus-account")}</td>
              </tr>
              <tr>
                <td>{l10n($curr_lang, "plus-expiry")}</td>
                <td class="tnum"
                  >{new Date(
                    $app_status?.account.expiry * 1000
                  ).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}</td
                >
              </tr>
            {:else if $app_status?.account.level === "Free"}
              <tr>
                <td>{l10n($curr_lang, "account-level")}</td>
                <td>{l10n($curr_lang, "free-account")}</td>
              </tr>
            {/if}
          </tbody>
        </table>
      </section>
    {/if}
    <section class="flex flex-row gap-2">
      <button
        class="btn variant-ghost-primary btn-sm"
        on:click={async () => {
          window.open(
            `https://geph.io/billing/login_secret?secret=${$curr_valid_secret}`
          );
        }}
      >
        {l10n($curr_lang, "manage-account")}
      </button>
      <button
        class="btn variant-ghost-error btn-sm"
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
    <div class="opacity-50 text-center">&mdash;&mdash;&mdash;</div>
    <section class="flex flex-row">
      <button
        class="btn variant-ghost-error btn-sm"
        on:click={handleDeleteClick}
      >
        {l10n($curr_lang, "delete-account")}
      </button>
    </section>
  {/if}
</Popup>

<style>
  section {
    margin-bottom: 1rem;
  }

  h2 {
    text-transform: uppercase;
    font-weight: 600;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }
</style>
