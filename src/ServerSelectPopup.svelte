<script lang="ts">
  import { ProgressBar, getModalStore } from "@skeletonlabs/skeleton";
  import { ArrowsClockwise } from "phosphor-svelte";
  import { curr_lang, l10n } from "./lib/l10n";
  import {
    native_gate,
    type ExitDescriptor,
    type ExitMetadata,
  } from "./native-gate";
  import { pref_exit_constraint } from "./lib/prefs";
  import Flag from "./lib/Flag.svelte";
  import { showErrorModal } from "./lib/utils";
  import {
    app_status,
    conn_status,
    openPayments,
    startDaemonArgs,
  } from "./lib/user";
  import Popup from "./lib/Popup.svelte";
  interface Props {
    open?: boolean;
  }

  let { open = $bindable(false) }: Props = $props();

  const modalStore = getModalStore();
  let closing = $state(false);

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
  type CategoryKey = "core" | "streaming";
  type CategoryConfig = {
    key: CategoryKey;
    labelKey: string;
    blurbKey: string;
  };

  const serverCategories: CategoryConfig[] = [
    { key: "core", labelKey: "core-tab", blurbKey: "core-blurb" },
    {
      key: "streaming",
      labelKey: "streaming-tab",
      blurbKey: "streaming-blurb",
    },
  ];

  let exitInfos =
    $derived($app_status &&
    Object.values($app_status.net_status.exits).map((v) => ({
      desc: v[1],
      meta: v[2],
    })));

  let coreExitInfos = $derived(exitInfos?.filter((e) => e.meta.category === "core") ?? []);
  let streamingExitInfos =
    $derived(exitInfos?.filter((e) => e.meta.category === "streaming") ?? []);

  let exitInfosByCategory = $derived({
    core: coreExitInfos,
    streaming: streamingExitInfos,
  } satisfies Record<CategoryKey, ExitInfo[]>);

  let exitListsByCategory = $derived({
    core: coreExitInfos.map((e) => e.desc),
    streaming: streamingExitInfos.map((e) => e.desc),
  } satisfies Record<CategoryKey, ExitDescriptor[]>);

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
        onclick={() => {
          $pref_exit_constraint = "auto";
          reconnectDaemon();
        }}
      >
        <div class="w-8">
          <ArrowsClockwise width="1.3rem" height="1.3rem" />
        </div>
        <div class="grow">
          <b class="font-bold">{l10n($curr_lang, "automatic")}</b>
        </div>
      </button>

      <!-- Category sections -->
      <div class="flex flex-col gap-7 mt-3">
        {#each serverCategories as category (category.key)}
          <section
            class="rounded-lg border border-white/10 bg-white/5 flex flex-col gap-2"
          >
            <div class="flex flex-col flex-wrap">
              <h3 class="font-semibold uppercase tracking-wide">
                {l10n($curr_lang, category.labelKey)}
              </h3>
              <span class="text-xs opacity-70 leading-relaxed">
                {l10n($curr_lang, category.blurbKey)}
              </span>
            </div>

            {#if exitListsByCategory[category.key].length === 0}
              <p class="text-xs italic opacity-60">
                {l10n($curr_lang, "loading-server-list")}
              </p>
            {:else}
              {#each getCountries(exitListsByCategory[category.key]) as country}
                {#each getCitiesByCountry(exitListsByCategory[category.key], country) as city}
                  {#if city}
                    <button
                      class={rowClass}
                      class:opacity-50={$app_status?.account.level === "Free" &&
                        !cityAllowedForFree(
                          exitInfosByCategory[category.key],
                          country,
                          city,
                        )}
                      onclick={async () => {
                        if (
                          $app_status?.account.level === "Free" &&
                          !cityAllowedForFree(
                            exitInfosByCategory[category.key],
                            country,
                            city,
                          )
                        ) {
                          openPayments();
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
                        {#if $app_status?.account.level === "Free" && !cityAllowedForFree(exitInfosByCategory[category.key], country, city)}
                          <span class="badge variant-ghost-warning">PLUS</span>
                        {/if}
                      </div>
                      <!-- Display least loaded server's load as a percentage -->
                      <div
                        class="px-[0.4rem] py-[0.1rem] rounded font-medium tnum text-xs"
                        class:variant-ghost-success={getMinLoad(
                          exitListsByCategory[category.key],
                          country,
                          city,
                        ) <= 0.5}
                        class:variant-ghost-warning={getMinLoad(
                          exitListsByCategory[category.key],
                          country,
                          city,
                        ) > 0.5}
                        class:variant-ghost-error={getMinLoad(
                          exitListsByCategory[category.key],
                          country,
                          city,
                        ) > 0.8}
                      >
                        {(
                          getMinLoad(
                            exitListsByCategory[category.key],
                            country,
                            city,
                          ) * 100
                        ).toFixed(0)}%
                      </div>
                    </button>
                  {/if}
                {/each}
              {/each}
            {/if}
          </section>
        {/each}
      </div>
    {/if}
  </div>
</Popup>
