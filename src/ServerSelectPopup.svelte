<script lang="ts">
  import { ProgressBar, getModalStore } from "@skeletonlabs/skeleton";
  import RefreshAuto from "svelte-material-icons/RefreshAuto.svelte";
  import { curr_lang, l10n } from "./lib/l10n";
  import { native_gate, type ExitDescriptor } from "./native-gate";
  import { pref_exit_constraint } from "./lib/prefs";
  import Flag from "./lib/Flag.svelte";
  import { showErrorModal } from "./lib/utils";
  import { app_status, conn_status, startDaemonArgs } from "./lib/user";
  import Popup from "./lib/Popup.svelte";

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
        l10n($curr_lang, "cant-reconnect-now") + ":<br>" + e
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
    country: string
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
    city: string
  ): number => {
    const cityServers = servers.filter(
      (server) => server.country === country && server.city === city
    );
    if (cityServers.length === 0) return 0;
    return Math.min(...cityServers.map((s) => s.load));
  };

  const rowClass =
    "flex flex-row bg-surface-200 p-2 rounded-md cursor-pointer items-center text-left block";
</script>

<Popup
  {open}
  title={l10n($curr_lang, "exit-selection")}
  onClose={() => (open = false)}
>
  <div class="flex flex-col gap-2 pt-2">
    {#if closing}
      <ProgressBar />
    {:else if $app_status}
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

      <!-- Per country and city -->
      {#each getCountries($app_status.exits) as country}
        {#each getCitiesByCountry($app_status.exits, country) as city}
          {#if city}
            <button
              class={rowClass}
              on:click={async () => {
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
              <div class="grow">
                <b class="font-bold">{country}</b> / {city}
              </div>
              <!-- Display least loaded server's load as a percentage -->
              <div
                class="variant-ghost-primary px-[0.4rem] py-[0.1rem] rounded font-medium tnum text-sm"
                class:variant-ghost-warning={getMinLoad(
                  $app_status.exits,
                  country,
                  city
                ) > 0.5}
                class:variant-ghost-error={getMinLoad(
                  $app_status.exits,
                  country,
                  city
                ) > 0.8}
              >
                {(getMinLoad($app_status.exits, country, city) * 100).toFixed(
                  0
                )}%
              </div>
            </button>
          {/if}
        {/each}
      {/each}
    {/if}
  </div>
</Popup>
