<script lang="ts">
  import { AppBar, ProgressBar, getModalStore } from "@skeletonlabs/skeleton";
  import { fly } from "svelte/transition";
  import Close from "svelte-material-icons/Close.svelte";
  import RefreshAuto from "svelte-material-icons/RefreshAuto.svelte";
  import { curr_lang, l10n } from "./lib/l10n";

  import { native_gate, type ExitDescriptor } from "./native-gate";
  import { pref_exit_constraint } from "./lib/prefs";
  import Flag from "./lib/Flag.svelte";
  import { showErrorModal } from "./lib/utils";
  export let open = false;

  const modalStore = getModalStore();

  const loadServers = async () => {
    try {
      const gate = await native_gate();
      const exitList: ExitDescriptor[] = (await gate.daemon_rpc(
        "exit_list",
        []
      )) as any;
      return exitList;
    } catch (e) {
      showErrorModal(modalStore, l10n($curr_lang, "error") + ": " + e);
      throw e;
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
    "flex flex-row bg-surface-200 p-2 text-sm rounded-md mx-2 cursor-pointer items-center text-left block";
</script>

{#if open}
  <div
    id="popup"
    class="bg-surface-50 z-[100]"
    transition:fly={{ x: 0, y: 200, duration: 300 }}
  >
    <AppBar>
      <svelte:fragment slot="lead">
        <button on:click={() => (open = false)}>
          <Close size="1.5rem" />
        </button>
      </svelte:fragment>
      <b id="logo-text">{l10n($curr_lang, "exit-selection")}</b>
    </AppBar>

    <div class="flex flex-col gap-2 p-2 pt-5">
      {#await loadServers()}
        <ProgressBar />
      {:then servers}
        <!-- "Automatic" option -->
        <button
          class={rowClass}
          on:click={() => {
            $pref_exit_constraint = "auto";
            open = false;
          }}
        >
          <div class="w-7">
            <RefreshAuto width="1.3rem" height="1.3rem" />
          </div>
          <div class="grow">
            <b class="font-bold">{l10n($curr_lang, "automatic")}</b>
          </div>
        </button>

        <!-- Per country and city -->
        {#each getCountries(servers) as country}
          {#each getCitiesByCountry(servers, country) as city}
            {#if city}
              <button
                class={rowClass}
                on:click={() => {
                  $pref_exit_constraint = {
                    city,
                    country,
                  };
                  open = false;
                }}
              >
                <!-- Flag icon -->
                <div class="w-7">
                  <Flag {country} />
                </div>
                <!-- Country / City name -->
                <div class="grow">
                  <b class="font-bold">{country}</b> / {city}
                </div>
                <!-- Display least loaded server's load as a percentage -->
                <div
                  class="text-green-700 font-medium"
                  class:text-orange-700={getMinLoad(servers, country, city) >
                    0.5}
                  class:text-red-700={getMinLoad(servers, country, city) > 0.8}
                >
                  {(getMinLoad(servers, country, city) * 100).toFixed(0)}%
                </div>
              </button>
            {/if}
          {/each}
        {/each}
      {/await}
    </div>
  </div>
{/if}

<style>
  #popup {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
</style>
