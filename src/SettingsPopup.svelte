<script lang="ts">
  import {
    getModalStore,
    getToastStore,
    type ModalSettings,
  } from "@skeletonlabs/skeleton";
  import type { Setting } from "./settings/types";
  import { curr_lang, l10n } from "./lib/l10n";
  import {
    CircleHalfTilt,
    Funnel,
    GlobeSimple,
    LockKey,
    Network,
    SquaresFour,
    Sparkle,
    Translate,
    TreeStructure,
  } from "phosphor-svelte";

  import SettingTree from "./settings/SettingTree.svelte";
  import {
    pref_block_ads,
    pref_block_adult,
    pref_block_gambling,
    pref_allow_direct,
    pref_global_vpn,
    pref_routing_mode,
    pref_lightdark,
    pref_use_prc_whitelist,
    pref_use_app_whitelist,
    pref_proxy_autoconf,
    pref_listen_all,
  } from "./lib/prefs";
  import { native_gate, broker_rpc } from "./native-gate";
  import SingleSetting from "./settings/SingleSetting.svelte";
  import ShowLogsPopup from "./ShowLogsPopup.svelte";
  import Popup from "./lib/Popup.svelte";
  import {
    app_status,
    curr_valid_secret,
    paymentsOpen,
  } from "./lib/user";
  import { pref_wizard } from "./lib/prefs";
  import AppWhitelistControl from "./settings/AppWhitelistControl.svelte";
  import VersionDisplay from "./settings/VersionDisplay.svelte";

  import { showToast, showErrorToast } from "./lib/utils";

  interface Props {
    open?: boolean;
  }

  let { open = $bindable(false) }: Props = $props();
  let showLogsOpen = $state(false);
  let showAppWhitelist = $state(false);

  const modalStore = getModalStore();
  const toastStore = getToastStore();
  const restrictedSettingsSections = new Set(["features", "network"]);

  const handleFreeTierFeature = () => {
    open = false;
    $pref_wizard = true;
  };

  type SettingsSections = Record<string, Setting[]>;

  function filterSettings(
    settings: Array<Setting | false | null | undefined>,
  ): Setting[] {
    return settings.filter((setting): setting is Setting => Boolean(setting));
  }

  function handleAppWhitelistToggle(value: boolean) {
    pref_use_app_whitelist.set(value);
  }

  const settings = async (): Promise<SettingsSections> => {
    const gate = await native_gate();
    const isPlusUser = $app_status?.account.level === "Plus";

    return {
      features: filterSettings([
        {
          icon: Funnel,
          description: "content-filtering",
          type: "collapse",

          onClickDisabled: handleFreeTierFeature,
          inner: [
            {
              description: "ads-and-trackers",
              type: "checkbox",
              store: pref_block_ads,
              disabled: !isPlusUser,
              onClickDisabled: handleFreeTierFeature,
            },
            {
              description: "adult-content",
              type: "checkbox",
              store: pref_block_adult,
              disabled: !isPlusUser,
              onClickDisabled: handleFreeTierFeature,
            },
          ],
        },
        {
          icon: TreeStructure,
          type: "collapse",
          description: "split-tunneling",

          inner: filterSettings([
            {
              description: "exclude-prc",
              type: "checkbox",
              store: pref_use_prc_whitelist,
              blurb: "exclude-prc-blurb",
            },
            gate.supports_app_whitelist && {
              description: "app-whitelist",
              type: "checkbox",
              store: pref_use_app_whitelist,
              blurb: "app-whitelist-blurb",

              onToggle: handleAppWhitelistToggle,
            },
          ]),
        },
      ]),
      network: filterSettings([
        gate.supports_vpn_conf && {
          icon: LockKey,
          description: "global-vpn",
          type: "checkbox",
          store: pref_global_vpn,
          tag: l10n($curr_lang, "beta"),
          onToggle: (value: boolean) => {
            if (value) {
              showToast(
                toastStore,
                l10n($curr_lang, "global-vpn") +
                  ": " +
                  l10n($curr_lang, "experimental-feature-warning"),
              );
            }
          },
        },
        gate.supports_proxy_conf && {
          icon: Sparkle,
          description: "auto-proxy",
          type: "checkbox",
          store: pref_proxy_autoconf,
        },
        {
          icon: GlobeSimple,
          description: "listen-all",
          type: "checkbox",
          store: pref_listen_all,
        },
        {
          icon: Network,
          description: "allow-direct",
          type: "checkbox",
          store: pref_allow_direct,
        },
      ]),
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
        {#snippet icon()}
              
            <Translate size="1.4rem" />
          
              {/snippet}
        {#snippet description()}
              
            {l10n($curr_lang, "language")}
          
              {/snippet}
        {#snippet control()}
          <select class="select" bind:value={$curr_lang}>
            <option value="en">English</option>
            <option value="zh-CN">简体中文</option>
            <option value="zh-TW">繁體中文</option>
            <option value="fa">فارسی</option>
            <option value="ru">Русский</option>
            <option value="es">Español</option>
            <option value="uk">Українська</option>
          </select>
        {/snippet}
      </SingleSetting>

      <SingleSetting>
        {#snippet icon()}
              
            <CircleHalfTilt size="1.4rem" />
          
              {/snippet}
        {#snippet description()}
              
            {l10n($curr_lang, "theme")}
          
              {/snippet}
        {#snippet control()}
          <select class="select" bind:value={$pref_lightdark}>
            <!-- <option value="auto">{l10n($curr_lang, "automatic")}</option> -->
            <option value="light">{l10n($curr_lang, "light")}</option>
            <option value="dark">{l10n($curr_lang, "dark")}</option>
          </select>
        {/snippet}
      </SingleSetting>
    </section>

    {#each Object.entries(settings).filter(([section]) => $curr_valid_secret !== null || !restrictedSettingsSections.has(section)) as [section, contents]}
      {#await native_gate() then gate}
        <section>
          <h2 class="text-primary-700 uppercase font-semibold text-sm mb-2">
            {l10n($curr_lang, section)}
          </h2>
          {#each contents as setting}
            <SettingTree {setting} />
          {/each}

          {#if section === "features" && $pref_use_app_whitelist}
            <div class="app-whitelist-section">
              <SingleSetting>
                {#snippet icon()}
                              
                    <SquaresFour size="1.4rem" />
                  
                              {/snippet}
                {#snippet description()}
                              
                    <div class="main flex flex-row items-center gap-1">
                      {l10n($curr_lang, "select-excluded-apps")}
                    </div>
                    <small>
                      {l10n($curr_lang, "select-excluded-apps-blurb")}
                    </small>
                  
                              {/snippet}
                {#snippet control()}
                  <button
                    class="btn btn-sm variant-filled-primary"
                    onclick={() => (showAppWhitelist = true)}
                  >
                    {l10n($curr_lang, "select")}
                  </button>
                {/snippet}
              </SingleSetting>
            </div>
          {/if}
        </section>
      {/await}
    {/each}

    {#if $curr_valid_secret !== null}
      <section>
        <h2 class="text-primary-700 uppercase font-semibold text-sm mb-2">
          {l10n($curr_lang, "debug")}
        </h2>

        <SingleSetting>
          {#snippet icon()}
                  
              <Network size="1.4rem" />
            
                  {/snippet}
          {#snippet description()}
                  
              <div class="flex flex-col text-sm">
                <div>SOCKS5 proxy</div>
                <div>HTTP proxy</div>
              </div>
            
                  {/snippet}
          {#snippet control()}
            <div class="flex flex-col text-sm tnum">
              <b
                ><span class="opacity-50"
                  >{#if $pref_listen_all}0.0.0.0{:else}localhost{/if}:</span
                >9909</b
              >
              <b
                ><span class="opacity-50"
                  >{#if $pref_listen_all}0.0.0.0{:else}localhost{/if}:</span
                >9910</b
              >
            </div>
          {/snippet}
        </SingleSetting>

        <div class="flex flex-row gap-2">
          <button
            class="btn variant-filled btn-sm"
            onclick={() => {
              const modal: ModalSettings = {
                type: "prompt",
                title: l10n($curr_lang, "report-problem"),
                body: l10n($curr_lang, "attach-log-blurb"),
                valueAttr: {
                  type: "text",
                  minlength: 3,
                  maxlength: 200,
                  required: false,
                  placeholder: l10n($curr_lang, "your-email-optional"),
                  rows: 10,
                },
                response: (email: string) => {
                  void (async () => {
                    const gate = await native_gate();
                    try {
                      const pack = await gate.get_debug_pack();
                      await broker_rpc("upload_debug_pack", [email || "", pack]);
                      showToast(
                        toastStore,
                        l10n($curr_lang, "successfully-submitted"),
                      );
                    } catch (e) {
                      showErrorToast(toastStore, "Error: " + e);
                    }
                  })();
                },
              };
              modalStore.trigger(modal);
            }}
          >
            {l10n($curr_lang, "report-problem")}
          </button>
          <button
            class="btn variant-ghost btn-sm"
            onclick={() => {
              showLogsOpen = true;
            }}>{l10n($curr_lang, "debug-logs")}</button
          >
        </div>
      </section>
    {/if}

    <VersionDisplay />
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
