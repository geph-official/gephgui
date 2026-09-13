<script lang="ts">
  import { onMount } from "svelte";
  import {
    Copy,
    Check,
    ShieldCheck,
    ShieldWarning,
    Key,
    Info,
    WarningCircle,
    CheckCircle,
    Devices,
    ArrowCounterClockwise,
    Envelope,
    ArrowSquareOut,
    CaretRight,
    SignOut,
  } from "phosphor-svelte";
  import { ProgressBar } from "@skeletonlabs/skeleton";
  import { curr_lang, l10n } from "./lib/l10n";
  import { formatNumberWithSpaces } from "./lib/utils";
  import { native_gate } from "./native-gate";
  import {
    curr_valid_secret,
    account_code_status,
    pending_account_code,
    account_code_busy,
    account_code_error,
    rotateAccountCode,
    completeAccountCodeUpdate,
    signInWithCode,
  } from "./lib/user";

  const INCIDENT_URL = "https://geph.io/account-code-update";
  const SUPPORT_EMAIL = "support@geph.io";

  let enteringCode = $state(false);
  let input = $state("");
  let copied = $state(false);
  let savedConfirmed = $state(false);
  let loggingOut = $state(false);
  const retired = $derived(
    $account_code_status?.secret === $curr_valid_secret &&
      $account_code_status.status === "retired",
  );
  const invalid = $derived(
    $account_code_status?.secret === $curr_valid_secret &&
      $account_code_status.status === "invalid",
  );

  // explain → save is the normal two-step path; the rest are recovery branches.
  // An unrecognized secret is a dead end: the only way out is logging out.
  const screen = $derived(
    $pending_account_code
      ? $pending_account_code.showCode
        ? "save"
        : "saving"
      : invalid
        ? "invalid"
        : enteringCode
          ? "enter"
          : retired
            ? "retired"
            : "explain",
  );

  const titles = {
    explain: "account-code-update-title",
    save: "account-code-new-title",
    saving: "account-code-saving-title",
    enter: "account-code-enter-title",
    retired: "account-code-retired-title",
    invalid: "account-code-invalid-title",
  };

  const points = [
    {
      icon: Info,
      tone: "text-primary-500",
      title: "account-code-what-happened-title",
      body: "account-code-what-happened",
    },
    {
      icon: WarningCircle,
      tone: "text-warning-500",
      title: "account-code-what-it-means-title",
      body: "account-code-what-it-means",
    },
    {
      icon: CheckCircle,
      tone: "text-success-500",
      title: "account-code-stays-same-title",
      body: "account-code-stays-same",
    },
  ];

  onMount(() => {
    if ($pending_account_code) void completeAccountCodeUpdate(false);
  });

  function setEntering(value: boolean) {
    enteringCode = value;
    account_code_error.set(null);
  }

  async function useCode() {
    try {
      await signInWithCode(input);
      enteringCode = false;
    } catch {
      /* The shared controller supplies a localized error. */
    }
  }

  async function copyCode() {
    const code = $pending_account_code?.secret;
    if (!code) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        const area = document.createElement("textarea");
        area.value = code;
        document.body.appendChild(area);
        try {
          area.select();
          if (!document.execCommand("copy")) throw new Error("Copy failed");
        } finally {
          area.remove();
        }
      }
      copied = true;
    } catch {
      account_code_error.set("account-code-copy-error");
    }
  }

  // Same as logging out from the account popup. Never offered while a new
  // secret is pending, since clearing storage would lose it.
  async function logOut() {
    loggingOut = true;
    try {
      await (await native_gate()).stop_daemon();
    } catch {
      /* Log out anyway. */
    }
    localStorage.clear();
    window.location.reload();
  }
</script>

<section
  class="update-screen"
  aria-labelledby="account-update-title"
  aria-busy={$account_code_busy || loggingOut}
>
  <div class="update-content">
    {#if screen === "explain" || screen === "save"}
      <div class="step-indicator">
        <span class="text-xs font-semibold uppercase tracking-wide opacity-70">
          {l10n(
            $curr_lang,
            screen === "explain"
              ? "account-code-step-1"
              : "account-code-step-2",
          )}
        </span>
        <div class="step-bars" aria-hidden="true">
          <span class="bg-primary-500"></span>
          <span
            class={screen === "save" ? "bg-primary-500" : "bg-surface-500/30"}
          ></span>
        </div>
      </div>
    {/if}

    <header class="header">
      <span
        class="badge-icon {screen === 'retired' || screen === 'invalid'
          ? 'variant-soft-warning'
          : screen === 'save'
            ? 'variant-soft-success'
            : 'variant-soft-primary'}"
        aria-hidden="true"
      >
        {#if screen === "retired"}
          <ShieldWarning size="2.25rem" weight="duotone" />
        {:else if screen === "invalid"}
          <WarningCircle size="2.25rem" weight="duotone" />
        {:else if screen === "save" || screen === "enter"}
          <Key size="2.25rem" weight="duotone" />
        {:else}
          <ShieldCheck size="2.25rem" weight="duotone" />
        {/if}
      </span>
      <h1 id="account-update-title" class="text-2xl font-semibold">
        {l10n($curr_lang, titles[screen])}
      </h1>
    </header>

    {#if screen === "explain"}
      <ul class="points">
        {#each points as point}
          {@const Icon = point.icon}
          <li>
            <span class="point-icon {point.tone}" aria-hidden="true">
              <Icon size="1.5rem" weight="duotone" />
            </span>
            <div>
              <h2 class="font-semibold">{l10n($curr_lang, point.title)}</h2>
              <p class="text-sm opacity-80">{l10n($curr_lang, point.body)}</p>
            </div>
          </li>
        {/each}
      </ul>
      <p class="text-sm italic opacity-80">
        {l10n($curr_lang, "account-code-apology")}
      </p>

      <div class="actions">
        <button
          class="btn variant-filled-primary w-full"
          disabled={$account_code_busy}
          onclick={rotateAccountCode}
        >
          {l10n($curr_lang, "account-code-update-action")}
        </button>
        <button
          class="btn variant-ghost w-full"
          disabled={$account_code_busy}
          onclick={() => setEntering(true)}
        >
          {l10n($curr_lang, "account-code-use-another")}
        </button>
        <a
          class="anchor inline-link"
          href={INCIDENT_URL}
          target="_blank"
          rel="noreferrer"
        >
          {l10n($curr_lang, "account-code-learn-more")}
          <ArrowSquareOut size="1rem" />
        </a>
      </div>
    {:else if screen === "save" && $pending_account_code}
      <p>{l10n($curr_lang, "account-code-save-instructions")}</p>
      <div class="card variant-soft p-4 text-center">
        <bdi dir="ltr" class="tnum text-2xl sm:text-3xl select-all">
          {formatNumberWithSpaces($pending_account_code.secret)}
        </bdi>
      </div>
      <button class="btn variant-ghost-primary w-full" onclick={copyCode}>
        {#if copied}<Check size="1.2rem" />{:else}<Copy size="1.2rem" />{/if}
        {l10n($curr_lang, copied ? "account-code-copied" : "account-code-copy")}
      </button>
      <ul class="notes text-sm">
        <li>{l10n($curr_lang, "account-code-old-stops")}</li>
        <li>{l10n($curr_lang, "account-code-other-devices")}</li>
      </ul>
      <label class="confirm">
        <input class="checkbox" type="checkbox" bind:checked={savedConfirmed} />
        <span>{l10n($curr_lang, "account-code-saved")}</span>
      </label>
      <button
        class="btn variant-filled-primary w-full"
        disabled={$account_code_busy || !savedConfirmed}
        onclick={() => completeAccountCodeUpdate(true)}
      >
        {l10n($curr_lang, "account-code-continue")}
      </button>
    {:else if screen === "saving"}
      <p>{l10n($curr_lang, "account-code-saving")}</p>
      <button
        class="btn variant-filled-primary w-full"
        disabled={$account_code_busy}
        onclick={() => completeAccountCodeUpdate(true)}
      >
        {l10n($curr_lang, "account-code-continue")}
      </button>
    {:else if screen === "enter"}
      <p>{l10n($curr_lang, "account-code-enter-new")}</p>
      <form
        onsubmit={(event) => {
          event.preventDefault();
          void useCode();
        }}
      >
        <input
          class="input tnum"
          aria-label={l10n($curr_lang, "enter-account-secret")}
          placeholder={l10n($curr_lang, "enter-account-secret")}
          type="text"
          inputmode="numeric"
          autocomplete="off"
          dir="ltr"
          value={input}
          disabled={$account_code_busy}
          oninput={(event) => {
            input = formatNumberWithSpaces(event.currentTarget.value);
          }}
        />
        <button
          class="btn variant-filled-primary w-full"
          disabled={$account_code_busy || !input.trim()}
        >
          {l10n($curr_lang, "login")}
        </button>
      </form>
      <button
        class="btn variant-ghost w-full"
        disabled={$account_code_busy}
        onclick={() => setEntering(false)}
      >
        {l10n($curr_lang, "back")}
      </button>
    {:else if screen === "invalid"}
      <p>{l10n($curr_lang, "account-code-invalid")}</p>
      <button
        class="btn variant-filled-primary w-full"
        disabled={loggingOut}
        onclick={logOut}
      >
        <SignOut size="1.2rem" />
        {l10n($curr_lang, "logout")}
      </button>
    {:else if screen === "retired"}
      <p>{l10n($curr_lang, "account-code-retired-intro")}</p>
      <div class="choices">
        <button
          class="choice-btn variant-soft-primary"
          disabled={$account_code_busy}
          onclick={() => setEntering(true)}
        >
          <span class="icon-slot"
            ><Devices size="1.75rem" weight="duotone" /></span
          >
          <div class="grow">
            <div class="font-semibold">
              {l10n($curr_lang, "account-code-retired-other-device")}
            </div>
            <div class="text-sm opacity-80 mt-1">
              {l10n($curr_lang, "account-code-retired-other-device-desc")}
            </div>
          </div>
          <CaretRight class="flip-rtl" size="1.25rem" weight="bold" />
        </button>
        <button
          class="choice-btn variant-soft"
          disabled={$account_code_busy}
          onclick={rotateAccountCode}
        >
          <span class="icon-slot"
            ><ArrowCounterClockwise size="1.75rem" weight="duotone" /></span
          >
          <div class="grow">
            <div class="font-semibold">
              {l10n($curr_lang, "account-code-recover")}
            </div>
            <div class="text-sm opacity-80 mt-1">
              {l10n($curr_lang, "account-code-recover-desc")}
            </div>
          </div>
          <CaretRight class="flip-rtl" size="1.25rem" weight="bold" />
        </button>
        <a class="choice-btn variant-soft-error" href="mailto:{SUPPORT_EMAIL}">
          <span class="icon-slot"
            ><Envelope size="1.75rem" weight="duotone" /></span
          >
          <div class="grow">
            <div class="font-semibold">
              {l10n($curr_lang, "account-code-not-me")}
            </div>
            <div class="text-sm opacity-80 mt-1">
              {l10n($curr_lang, "account-code-not-me-desc")}
            </div>
          </div>
          <CaretRight class="flip-rtl" size="1.25rem" weight="bold" />
        </a>
      </div>
    {/if}

    {#if $account_code_error}
      <p role="alert" class="text-error-700">
        {l10n($curr_lang, $account_code_error)}
      </p>
    {/if}
    {#if $account_code_busy || loggingOut}<ProgressBar
        meter="bg-primary-600"
      />{/if}

    {#if !$pending_account_code && screen !== "invalid"}
      <button
        class="logout-link"
        disabled={$account_code_busy || loggingOut}
        onclick={logOut}
      >
        <SignOut size="1rem" />
        {l10n($curr_lang, "logout")}
      </button>
    {/if}
  </div>
</section>

<style>
  .update-screen {
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding: 1.5rem;
  }
  .update-content {
    max-width: 30rem;
    margin: 1rem auto 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }
  form,
  .actions,
  .choices {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .step-indicator {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }
  .step-bars {
    display: flex;
    gap: 0.35rem;
  }
  .step-bars span {
    flex: 1;
    height: 0.25rem;
    border-radius: 999px;
  }

  .header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    text-align: center;
  }
  .badge-icon {
    width: 4rem;
    height: 4rem;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .points {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .points li {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
  }
  .point-icon {
    flex: 0 0 1.5rem;
    margin-top: 0.1rem;
  }

  .notes {
    list-style: disc;
    padding-inline-start: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }
  .confirm {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
  }

  .inline-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
  }

  .choice-btn {
    border-radius: 0.5rem;
    padding: 0.875rem 1rem;
    text-align: start;
    width: 100%;
    color: inherit;
    font: inherit;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.75rem;
    transition:
      filter 120ms,
      transform 80ms;
  }
  .choice-btn:hover {
    filter: brightness(0.95);
  }
  .choice-btn:active {
    transform: scale(0.99);
  }
  .choice-btn:disabled {
    opacity: 0.6;
    cursor: default;
  }
  .icon-slot {
    flex: 0 0 1.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  :global([dir="rtl"] .flip-rtl) {
    transform: scaleX(-1);
  }

  .logout-link {
    align-self: center;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.875rem;
    opacity: 0.7;
    text-decoration: underline;
  }
  .logout-link:hover {
    opacity: 1;
  }
</style>
