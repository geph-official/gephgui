<script>
  import { getModalStore } from "@skeletonlabs/skeleton";
  import { curr_lang, l10n } from "./lib/l10n";
  import Vpn from "svelte-material-icons/Vpn.svelte";
  import AirFilter from "svelte-material-icons/AirFilter.svelte";
  import Translate from "svelte-material-icons/Translate.svelte";
  import Creation from "svelte-material-icons/Creation.svelte";
  import CallSplit from "svelte-material-icons/CallSplit.svelte";
  import ThemeLightDark from "svelte-material-icons/ThemeLightDark.svelte";
  import Apps from "svelte-material-icons/Apps.svelte";

  import SettingTree from "./settings/SettingTree.svelte";
  import {
    pref_block_ads,
    pref_block_adult,
    pref_block_gambling,
    pref_global_vpn,
    pref_routing_mode,
    pref_lightdark,
    pref_use_prc_whitelist,
    pref_use_app_whitelist,
    pref_proxy_autoconf,
  } from "./lib/prefs";
  import { native_gate } from "./native-gate";
  import SingleSetting from "./settings/SingleSetting.svelte";
  import ShowLogsPopup from "./ShowLogsPopup.svelte";
  import Popup from "./lib/Popup.svelte";
  import { app_status, paymentsOpen, startDaemonArgs } from "./lib/user";
  import { pref_wizard } from "./lib/prefs";
  import AppWhitelistControl from "./settings/AppWhitelistControl.svelte";
  import { writable } from "svelte/store";

  export let open = false;
  let showLogsOpen = false;
  let showAppWhitelist = false;
  let isRestartingDaemon = writable(false);

  const modalStore = getModalStore();

  // Function to open the wizard/upgrade popup for Free tier users
  const handleFreeTierFeature = () => {
    open = false;
    $pref_wizard = true;
  };
  
  // Function to restart the daemon when split tunneling settings change
  async function restartDaemonIfRunning() {
    if (!$app_status || $app_status.connection === "disconnected") {
      return; // No need to restart if not connected
    }
    
    $isRestartingDaemon = true;
    try {
      const args = await startDaemonArgs();
      if (args) {
        const gate = await native_gate();
        await gate.restart_daemon(args);
      }
    } catch (e) {
      console.error("Failed to restart daemon:", e);
      // Show error in UI
      const modal = {
        type: "alert",
        title: l10n($curr_lang, "error"),
        body: "Failed to apply changes: " + e.toString(),
      };
      modalStore.trigger(modal);
    } finally {
      $isRestartingDaemon = false;
    }
  }
  
  // Set up watchers for settings that require daemon restart
  function handleAppWhitelistToggle(value) {
    pref_use_app_whitelist.set(value);
    restartDaemonIfRunning();
  }
  
  function handlePrcWhitelistToggle(value) {
    pref_use_prc_whitelist.set(value);
    restartDaemonIfRunning();
  }

  const settings = async () => {
    const gate = await native_gate();
    const isPlusUser = $app_status?.account.level === "Plus";
    
    return {
      features: [
        {
          icon: AirFilter,
          description: "content-filtering",
          type: "collapse",
          disabled: !isPlusUser,
          onClickDisabled: handleFreeTierFeature,
          inner: [
            {
              description: "ads-and-trackers",
              type: "checkbox",
              store: pref_block_ads,
              disabled: !isPlusUser,
            },
            {
              description: "adult-content",
              type: "checkbox",
              store: pref_block_adult,
              disabled: !isPlusUser,
            },
          ],
        },
        {
          icon: CallSplit,
          type: "collapse",
          description: "split-tunneling",
          disabled: !isPlusUser,
          onClickDisabled: handleFreeTierFeature,
          inner: [
            {
              description: "exclude-prc",
              type: "checkbox",
              store: pref_use_prc_whitelist,
              blurb: "exclude-prc-blurb",
              disabled: !isPlusUser,
              onToggle: handlePrcWhitelistToggle,
            },
            gate.supports_app_whitelist && {
              description: "app-whitelist",
              type: "checkbox",
              store: pref_use_app_whitelist,
              blurb: "app-whitelist-blurb",
              disabled: !isPlusUser,
              onToggle: handleAppWhitelistToggle,
            },
          ].filter(Boolean),
        },
      ],
      network: [
        gate.supports_vpn_conf && {
          icon: Vpn,
          description: "global-vpn",
          type: "checkbox",
          store: pref_global_vpn,
        },
        gate.supports_proxy_conf && {
          icon: Creation,
          description: "auto-proxy",
          type: "checkbox",
          store: pref_proxy_autoconf,
        },
      ].filter(Boolean),
    };
  };
</script>

<Popup 
  {open} 
  title={l10n($curr_lang, "settings")}
  onClose={() => (open = false)}
>
  {#await settings() then settings}
    <section>
      <h2 class="text-primary-700 uppercase font-semibold text-sm mb-2">
        {l10n($curr_lang, "general")}
      </h2>

      <SingleSetting>
        <svelte:fragment slot="icon">
          <Translate size="1.4rem" />
        </svelte:fragment>
        <svelte:fragment slot="description">
          {l10n($curr_lang, "language")}
        </svelte:fragment>
        <svelte:fragment slot="switch">
          <select class="select" bind:value={$curr_lang}>
            <option value="en">English</option>
            <option value="zh-CN">简体中文</option>
            <option value="zh-TW">繁體中文</option>
            <option value="fa">فارسی</option>
            <option value="ru">Русский</option>
          </select>
        </svelte:fragment>"
      </SingleSetting>

      <SingleSetting>
        <svelte:fragment slot="icon">
          <ThemeLightDark size="1.4rem" />
        </svelte:fragment>
        <svelte:fragment slot="description">
          {l10n($curr_lang, "theme")}
        </svelte:fragment>
        <svelte:fragment slot="switch">
          <select class="select" bind:value={$pref_lightdark}>
            <option value="auto">Automatic</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </svelte:fragment>"
      </SingleSetting>
    </section>

    {#each Object.entries(settings) as [section, contents]}
      <section>
        <h2 class="text-primary-700 uppercase font-semibold text-sm mb-2">
          {l10n($curr_lang, section)}
        </h2>
        {#each contents as setting}
          <SettingTree {setting} />
        {/each}
        
        {#if section === "features" && $pref_use_app_whitelist && $app_status?.account.level === "Plus"}
          <div class="app-whitelist-section">
            <SingleSetting>
              <svelte:fragment slot="icon">
                <Apps size="1.4rem" />
              </svelte:fragment>
              <svelte:fragment slot="description">
                <div class="main flex flex-row items-center gap-1">
                  {l10n($curr_lang, "select-excluded-apps") || "Select excluded apps"}
                  {#if $isRestartingDaemon}
                    <span class="badge variant-ghost-warning">Applying changes...</span>
                  {/if}
                </div>
                <small>
                  {l10n($curr_lang, "select-excluded-apps-blurb") || "Choose which apps will not use Geph"}
                </small>
              </svelte:fragment>
              <svelte:fragment slot="switch">
                <button 
                  class="btn btn-sm variant-filled-primary"
                  on:click={() => showAppWhitelist = true}
                >
                  {l10n($curr_lang, "select")}
                </button>
              </svelte:fragment>
            </SingleSetting>
          </div>
        {/if}
      </section>
    {/each}

    <section>
      <h2 class="text-primary-700 uppercase font-semibold text-sm mb-2">
        {l10n($curr_lang, "debug")}
      </h2>

      <div class="flex flex-row gap-2">
        <button
          class="btn variant-filled btn-sm"
          on:click={() => {
            const modal = {
              type: "prompt",
              title: l10n($curr_lang, "report-problem"),
              body: l10n($curr_lang, "attach-log-blurb"),
              valueAttr: {
                type: "text",
                minlength: 3,
                maxlength: 20,
                required: true,
                placeholder: l10n($curr_lang, "your-email-optional"),
                rows: 10,
              },
              response: async (email) => {
                if (email) {
                  const gate = await native_gate();
                  gate.export_debug_pack(email);
                }
              },
            };
            modalStore.trigger(modal);
          }}>{l10n($curr_lang, "report-problem")}</button
        >
        <button
          class="btn variant-ghost btn-sm"
          on:click={() => {
            showLogsOpen = true;
          }}>{l10n($curr_lang, "debug-logs")}</button
        >
      </div>
    </section>
  {/await}
</Popup>

<ShowLogsPopup bind:open={showLogsOpen} />
<AppWhitelistControl bind:open={showAppWhitelist} />

<style>
  section {
    margin-bottom: 1rem;
  }
  
  .app-whitelist-section {
    margin-top: 1rem;
  }
  
  small {
    display: block;
    margin-top: -0.4rem;
    font-weight: 500;
    opacity: 0.8;
  }
</style>