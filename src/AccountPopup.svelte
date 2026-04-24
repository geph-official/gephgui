<script lang="ts">
  import {
    ProgressBar,
    getModalStore,
    type ModalSettings,
  } from "@skeletonlabs/skeleton";
  import { Copy, Eye, EyeSlash } from "phosphor-svelte";
  let loggingOut = $state(false);

  import { curr_lang, l10n } from "./lib/l10n";
  import { app_status, curr_valid_secret, clearAllCaches } from "./lib/user";
  import { native_gate, broker_rpc } from "./native-gate";
  import CryptoJS from "crypto-js";
  import Popup from "./lib/Popup.svelte";
  interface Props {
    open?: boolean;
  }

  let { open = $bindable(false) }: Props = $props();

  const modalStore = getModalStore();
  let deleteClicks = 0;
  let deleteTimer: any = null;

  let secretShown = $state(false);

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

  /**
   * Convert CryptoJS WordArray to Uint8Array
   */
  function wordArrayToUint8Array(
    wordArray: CryptoJS.lib.WordArray,
  ): Uint8Array {
    const words = wordArray.words;
    const sigBytes = wordArray.sigBytes;
    const u8 = new Uint8Array(sigBytes);
    for (let i = 0; i < sigBytes; i++) {
      /* eslint-disable no-bitwise */
      u8[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
      /* eslint-enable no-bitwise */
    }
    return u8;
  }

  /**
   * Base32 encode a byte array (RFC 4648, no padding)
   */
  function base32Encode(bytes: Uint8Array): string {
    // Crockford’s Base32 alphabet: 0–9 then A–Z without I, L, O, U
    const alphabet = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
    let bits = 0;
    let value = 0;
    let output = "";

    for (let i = 0; i < bytes.length; ) {
      if (bits < 5) {
        value = (value << 8) | bytes[i++];
        bits += 8;
      }
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
    return output;
  }

  /**
   * Compute invite code: first 10 chars of Base32(SHA256("invite-code" + secret))
   */
  function computeInviteCode(secret: string): string {
    const hash = CryptoJS.SHA256(`invite-code${secret}`);
    const bytes = wordArrayToUint8Array(hash);
    return base32Encode(bytes).slice(0, 16);
  }

  let inviteCode = $derived($curr_valid_secret
    ? computeInviteCode($curr_valid_secret)
    : "");

  async function handleDeleteClick() {
    if (deleteTimer) {
      clearTimeout(deleteTimer);
    }
    deleteClicks += 1;
    deleteTimer = setTimeout(() => {
      deleteClicks = 0;
    }, 1000);

    if (deleteClicks >= 10) {
      deleteClicks = 0;
      const confirm = await new Promise<boolean>((resolve) => {
        const modal: ModalSettings = {
          type: "confirm",
          title: l10n($curr_lang, "delete-account"),
          body: l10n($curr_lang, "delete-account-are-you-sure"),
          response: (r: boolean) => resolve(r),
        };
        modalStore.trigger(modal);
      });
      if (confirm) {
        loggingOut = true;
        const gate = await native_gate();
        try {
          await gate.stop_daemon();
        } catch {}
        try {
          await broker_rpc("delete_account", [$curr_valid_secret]);
        } catch {}
        try {
          if ((gate as any).purge_caches) {
            (gate as any).purge_caches();
          }
        } catch {}
        clearAllCaches();
        localStorage.clear();
        window.location.reload();
      }
    }
  }
</script>

<Popup
  {open}
  title={l10n($curr_lang, "account")}
  onClose={() => (open = false)}
>
  <div class="popup-layout">
    {#if loggingOut}
      <div class="my-5">
        <ProgressBar />
      </div>
    {:else}
      <div class="popup-main">
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
              <button onclick={() => (secretShown = !secretShown)} class="mr-2">
                {#if secretShown}
                  <EyeSlash size="1.5rem" />
                {:else}
                  <Eye size="1.5rem" />
                {/if}
              </button>
              <button onclick={() => copyToClipboard($curr_valid_secret || "")}>
                <Copy size="1.5rem" />
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
                        $app_status?.account.expiry * 1000,
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
                <tr>
                  <td>{l10n($curr_lang, "invite-code")}</td>
                  <td class="tnum flex flex-row gap-1 items-center"
                    >{inviteCode}
                    <button onclick={() => copyToClipboard(inviteCode || "")}
                      ><Copy size="1rem" /></button
                    ></td
                  >
                </tr>
              </tbody>
            </table>
          </section>

          <section class="policy-link">
            <a href="https://github.com/geph-official/geph5/blob/master/PRIVACY.md"
              >{l10n($curr_lang, "privacy-eula")}</a
            >
          </section>

        {/if}
      </div>

      <div class="popup-actions">
        <section class="action-block">
          <button
            class="btn variant-ghost-primary action-button"
            onclick={async () => {
              window.open(
                `https://geph.io/billing/login_secret?secret=${$curr_valid_secret}`,
              );
            }}
          >
            {l10n($curr_lang, "manage-account")}
          </button>
        </section>

        <section class="logout-action">
          <button
            class="btn variant-outline action-button"
            onclick={async () => {
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


        <div class="divider"></div>

  

        <section class="delete-action">
          <button
            class="underline text-error-700"
            onclick={handleDeleteClick}
          >
            {l10n($curr_lang, "delete-account")}
          </button>
        </section>
      </div>
    {/if}
  </div>
</Popup>

<style>
  .popup-layout {
    min-height: 100%;
    display: flex;
    flex-direction: column;
  }

  .popup-main {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .popup-actions {
    margin-top: auto;
    padding-top: 1rem;
  }

  section {
    margin-bottom: 1rem;
  }

  .action-block {
    margin-bottom: 0.75rem;
  }

  .action-button {
    width: 100%;
    justify-content: center;
  }

  .policy-link {
    margin-bottom: 0.75rem;
    text-align: center;
    font-size: 0.9rem;
    opacity: 0.8;
  }

  .policy-link a {
    text-decoration: underline;
  }

  .logout-action {
    margin-bottom: 1rem;
  }

  .delete-action {
    margin-bottom: 0;
    text-align: center;
    padding-top: 0.5rem;
  }

  .delete-button {
    display: inline-flex;
    width: auto;
    min-width: 0;
    justify-content: center;
    opacity: 0.8;
  }

  .delete-button:hover,
  .delete-button:focus-visible {
    opacity: 1;
  }

  h2 {
    text-transform: uppercase;
    font-weight: 600;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }

  .divider {
    border-top: 1px solid #ccc;
    margin-top: 0.3rem;
    margin-bottom: 1rem;
  }
</style>
