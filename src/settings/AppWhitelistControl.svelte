<script lang="ts">
  import {
    native_gate,
    type AppDescriptor,
    type NativeGate,
  } from "../native-gate";
  import { curr_lang, l10n } from "../lib/l10n";
  import { pref_app_whitelist } from "../lib/prefs";
  import { CheckCircle, Circle, MagnifyingGlass } from "phosphor-svelte";
  import Popup from "../lib/Popup.svelte";
  import { ProgressBar } from "@skeletonlabs/skeleton";

  interface Props {
    open?: boolean;
  }

  let { open = $bindable(false) }: Props = $props();

  let searchQuery = $state("");
  let appIcons = $state<Record<string, string | null>>({});
  let gate: NativeGate | null = null;

  function toggleApp(appId: string) {
    pref_app_whitelist.update((whitelist) => {
      const newWhitelist = { ...whitelist };
      newWhitelist[appId] = !newWhitelist[appId];
      return newWhitelist;
    });
  }

  async function loadApps(): Promise<AppDescriptor[]> {
    gate = await native_gate();
    if (gate.supports_app_whitelist) {
      const appList = await gate.sync_app_list();
      void loadAppIcons(appList);
      return appList;
    }

    throw new Error("app-whitelist-not-supported");
  }

  async function loadAppIcons(appList: AppDescriptor[]): Promise<void> {
    if (!gate) return;

    for (const app of appList) {
      try {
        appIcons[app.id] = await gate.get_app_icon_url(app.id);
      } catch (error) {
        console.error(`Failed to load icon for ${app.id}:`, error);
        // Use a fallback or placeholder for failed icon loads
        appIcons[app.id] = null;
      }
    }
  }

  function getFilteredApps(apps: AppDescriptor[], query: string): AppDescriptor[] {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return apps;

    return apps.filter(
      (app) =>
        app.friendly_name.toLowerCase().includes(normalizedQuery) ||
        app.id.toLowerCase().includes(normalizedQuery)
    );
  }

  function getSelectedCount(whitelist: Record<string, boolean>): number {
    return Object.values(whitelist).filter(Boolean).length;
  }
</script>

<Popup
  bind:open
  title={l10n($curr_lang, "select-excluded-apps")}
  fullScreen={false}
>
  <div class="flex flex-col w-full overflow-hidden">
    <div
      class="bg-surface-200 p-3 rounded-lg border-l-4 border-primary-500 mb-4"
    >
      <p class="text-sm">
        {l10n($curr_lang, "select-excluded-apps-description")}
      </p>
    </div>

    {#if open}
      {#await loadApps()}
        <div
          class="flex justify-center items-center text-center text-surface-700"
        >
          <ProgressBar />
        </div>
      {:then loadedApps}
        <div class="relative flex items-center mb-4">
          <div class="absolute left-3 opacity-70">
            <MagnifyingGlass size="1.2rem" />
          </div>
          <input
            type="text"
            bind:value={searchQuery}
            placeholder={l10n($curr_lang, "search-apps")}
            class="w-full input pl-10"
          />
        </div>

        <div class="flex items-center mb-2 text-sm opacity-80">
          <span
            >{l10n($curr_lang, "excluded-apps")}
            {getSelectedCount($pref_app_whitelist)}</span
          >
        </div>

        <ul
          class="list-none p-0 m-0 overflow-y-auto max-h-[300px] rounded-lg border border-surface-400"
        >
          {#each getFilteredApps(loadedApps, searchQuery) as app}
            <li class="border-b border-surface-300 last:border-b-0">
              <button
                type="button"
                class="flex w-full items-center p-3 text-left transition-colors duration-200 hover:bg-surface-200"
                onclick={() => toggleApp(app.id)}
              >
                <div class="mr-3 flex items-center">
                  {#if $pref_app_whitelist[app.id]}
                    <CheckCircle
                      size="1.4rem"
                      class="text-primary-500"
                    />
                  {:else}
                    <Circle size="1.4rem" />
                  {/if}
                </div>
                <div
                  class="w-8 h-8 mr-3 flex-shrink-0 flex items-center justify-center"
                >
                  {#if appIcons[app.id]}
                    <img
                      src={appIcons[app.id]}
                      alt=""
                      class="w-8 h-8 rounded-md object-contain"
                    />
                  {:else}
                    <div
                      class="w-8 h-8 bg-surface-300 rounded-md flex items-center justify-center text-xs text-surface-700"
                    >
                      {app.friendly_name.charAt(0)}
                    </div>
                  {/if}
                </div>
                <div class="flex flex-col">
                  <div class="font-medium">{app.friendly_name}</div>
                  <div class="text-xs opacity-70">{app.id}</div>
                </div>
              </button>
            </li>
          {/each}

          {#if getFilteredApps(loadedApps, searchQuery).length === 0}
            <li
              class="flex justify-center items-center p-4 text-center text-surface-700"
            >
              <p>{l10n($curr_lang, "no-apps-found")}</p>
            </li>
          {/if}
        </ul>
      {:catch error}
        <div
          class="flex justify-center items-center p-4 text-center text-error-500"
        >
          <p>{error.toString()}</p>
        </div>
      {/await}
    {/if}
  </div>
</Popup>
