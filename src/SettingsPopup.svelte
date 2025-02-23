<script>
  import { AppBar } from "@skeletonlabs/skeleton";
  import { getModalStore } from "@skeletonlabs/skeleton";
  import { curr_lang, l10n } from "./lib/l10n";
  import { fly } from "svelte/transition";
  import Close from "svelte-material-icons/Close.svelte";
  import Vpn from "svelte-material-icons/Vpn.svelte";
  import AirFilter from "svelte-material-icons/AirFilter.svelte";
  import Translate from "svelte-material-icons/Translate.svelte";
  import Creation from "svelte-material-icons/Creation.svelte";
  import CallSplit from "svelte-material-icons/CallSplit.svelte";
  import ThemeLightDark from "svelte-material-icons/ThemeLightDark.svelte";

  import SettingTree from "./settings/SettingTree.svelte";
  import {
    pref_block_ads,
    pref_block_adult,
    pref_block_gambling,
    pref_global_vpn,
    pref_routing_mode,
    pref_lightdark,
    pref_use_prc_whitelist,
    pref_proxy_autoconf,
  } from "./lib/prefs";
  import { native_gate } from "./native-gate";
  import SingleSetting from "./settings/SingleSetting.svelte";

  export let open = false;

  const modalStore = getModalStore();

  const settings = async () => {
    const gate = await native_gate();
    return {
      features: [
        {
          icon: AirFilter,
          description: "content-filtering",
          type: "collapse",
          inner: [
            {
              description: "ads-and-trackers",
              type: "checkbox",
              store: pref_block_ads,
            },
            {
              description: "adult-content",
              type: "checkbox",
              store: pref_block_adult,
            },
          ],
        },
        {
          icon: CallSplit,
          type: "collapse",
          description: "split-tunneling",
          inner: [
            {
              description: "exclude-prc",
              type: "checkbox",
              store: pref_use_prc_whitelist,
              blurb: "exclude-prc-blurb",
            },
          ],
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

{#if open}
  {#await settings() then settings}
    <div
      id="settings"
      class="bg-surface-50"
      transition:fly={{ x: 0, y: 200, duration: 300 }}
    >
      <AppBar>
        <svelte:fragment slot="lead">
          <button on:click={() => (open = false)}>
            <Close size="1.5rem" />
          </button>
        </svelte:fragment>
        <b id="logo-text">{l10n($curr_lang, "settings")}</b>
      </AppBar>

      <section class="m-4">
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
              <option value="auto">{l10n($curr_lang, "automatic")}</option>
              <option value="light">{l10n($curr_lang, "light")}</option>
              <option value="dark">{l10n($curr_lang, "dark")}</option>
            </select>
          </svelte:fragment>"
        </SingleSetting>
      </section>

      {#each Object.entries(settings) as [section, contents]}
        <section class="m-4">
          <h2 class="text-primary-700 uppercase font-semibold text-sm mb-2">
            {l10n($curr_lang, section)}
          </h2>
          {#each contents as setting}
            <SettingTree {setting} />
          {/each}
        </section>
      {/each}

      <section class="m-4">
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
          <!-- <button class="btn variant-filled btn-sm">Show logs</button> -->
        </div>
      </section>
    </div>
  {/await}
{/if}

<style>
  #settings {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  section {
    margin: 1rem;
  }
</style>
