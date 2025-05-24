<script lang="ts">
  import { ProgressBar, getModalStore } from "@skeletonlabs/skeleton";
  import RefreshAuto from "svelte-material-icons/RefreshAuto.svelte";
  import { curr_lang, l10n } from "./lib/l10n";
  import {
    native_gate,
    type ExitDescriptor,
    type ExitMetadata,
  } from "./native-gate";
  import { pref_exit_constraint } from "./lib/prefs";
  import Flag from "./lib/Flag.svelte";
  import { showErrorModal } from "./lib/utils";
  import { app_status, conn_status, startDaemonArgs } from "./lib/user";
  import Popup from "./lib/Popup.svelte";
  import { paymentsOpen } from "./lib/user";
  export let open = false;

  const modalStore = getModalStore();
  let closing = false;

  const reconnectDaemon = async () => {
    try {
      closing = true;
      const gate = await native_gate();
      const args = await startDaemonArgs();
      if (args && $conn_status !== "disconnected") {
        await gate.restart_daemon(args);
      }
    } catch (e) {
      showErrorModal(
        modalStore,
        l10n($curr_lang, "cant-reconnect-now") + ":<br>" + e,
      );
    } finally {
      open = false;
      closing = false;
    }
  };

  const getCountries = (servers: ExitDescriptor[]): string[] => {
    const countries = servers.map((server) => server.country);
    return [...new Set(countries)].sort(); // unique & sorted
  };

  const getCitiesByCountry = (
    servers: ExitDescriptor[],
    country: string,
  ): string[] => {
    const cities = servers
      .filter((server) => server.country === country)
      .map((server) => server.city);
    return [...new Set(cities)].sort(); // unique & sorted
  };

  /**
   * Returns the load of the least-loaded server for the given country/city,
   * as a value from 0 to 1.
   */
  const getMinLoad = (
    servers: ExitDescriptor[],
    country: string,
    city: string,
  ): number => {
    const cityServers = servers.filter(
      (server) => server.country === country && server.city === city,
    );
    if (cityServers.length === 0) return 0;
    return Math.min(...cityServers.map((s) => s.load));
  };

  const rowClass =
    "flex flex-row variant-ghost p-2 rounded-md cursor-pointer items-center text-left block text-sm";

  type ExitInfo = { desc: ExitDescriptor; meta: ExitMetadata };

  let tab: "core" | "streaming" = "core";

  $: exitInfos =
    $app_status &&
    Object.values($app_status.net_status.exits).map((v) => ({
      desc: v[1],
      meta: v[2],
    }));

  $: coreExitInfos = exitInfos?.filter((e) => e.meta.category === "core") ?? [];
  $: streamingExitInfos =
    exitInfos?.filter((e) => e.meta.category === "streaming") ?? [];

  $: currentExitInfos = tab === "core" ? coreExitInfos : streamingExitInfos;
  $: exitList = currentExitInfos.map((e) => e.desc);

  const cityAllowedForFree = (
    infos: ExitInfo[],
    country: string,
    city: string,
  ): boolean => {
    return infos.some(
      (i) =>
        i.desc.country === country &&
        i.desc.city === city &&
        i.meta.allowed_levels.includes("Free"),
    );
  };
</script>

<Popup
  {open}
  title={l10n($curr_lang, "exit-selection")}
  onClose={() => (open = false)}
>
  <div class="flex flex-col gap-2 pt-2">
    {#if closing}
      <ProgressBar />
    {:else if exitInfos}
      <!-- "Automatic" option -->
      <button
        class={rowClass}
        on:click={() => {
          $pref_exit_constraint = "auto";
          reconnectDaemon();
        }}
      >
        <div class="w-8">
          <RefreshAuto width="1.3rem" height="1.3rem" />
        </div>
        <div class="grow">
          <b class="font-bold">{l10n($curr_lang, "automatic")}</b>
        </div>
      </button>

      <!-- Tab selector -->
      <div class="flex justify-center gap-2 mt-2">
        <button
          class="btn px-2 py-1 text-sm"
          class:variant-filled-primary={tab === "core"}
          on:click={() => (tab = "core")}
        >
          {l10n($curr_lang, "core-tab")}
        </button>
        <button
          class="btn px-2 py-1 text-sm"
          class:variant-filled-primary={tab === "streaming"}
          on:click={() => (tab = "streaming")}
        >
          {l10n($curr_lang, "streaming-tab") + " (Beta)"}
        </button>
      </div>
      <p class="text-center text-xs opacity-70">
        {tab === "core"
          ? l10n($curr_lang, "core-blurb")
          : l10n($curr_lang, "streaming-blurb")}
      </p>

      <!-- Per country and city -->
      {#each getCountries(exitList) as country}
        {#each getCitiesByCountry(exitList, country) as city}
          {#if city}
            <button
              class={rowClass}
              class:opacity-50={$app_status?.account.level === "Free" &&
                !cityAllowedForFree(currentExitInfos, country, city)}
              on:click={async () => {
                if (
                  $app_status?.account.level === "Free" &&
                  !cityAllowedForFree(currentExitInfos, country, city)
                ) {
                  $paymentsOpen = true;
                  open = false;
                  return;
                }
                $pref_exit_constraint = {
                  city,
                  country,
                };
                await reconnectDaemon();
              }}
            >
              <!-- Flag icon -->
              <div class="w-8">
                <Flag {country} />
              </div>
              <!-- Country / City name -->
              <div class="grow flex flex-row items-center gap-1">
                <span><b class="font-bold">{country}</b> / {city}</span>
                {#if $app_status?.account.level === "Free" && !cityAllowedForFree(currentExitInfos, country, city)}
                  <span class="badge variant-ghost-warning">PLUS</span>
                {/if}
              </div>
              <!-- Display least loaded server's load as a percentage -->
              <div
                class="px-[0.4rem] py-[0.1rem] rounded font-medium tnum text-xs"
                class:variant-ghost-success={getMinLoad(
                  exitList,
                  country,
                  city,
                ) <= 0.5}
                class:variant-ghost-warning={getMinLoad(
                  exitList,
                  country,
                  city,
                ) > 0.5}
                class:variant-ghost-error={getMinLoad(exitList, country, city) >
                  0.8}
              >
                {(getMinLoad(exitList, country, city) * 100).toFixed(0)}%
              </div>
            </button>
          {/if}
        {/each}
      {/each}
    {/if}
  </div>
</Popup>
