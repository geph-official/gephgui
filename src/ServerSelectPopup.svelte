<script lang="ts">
  import {
    AppBar,
    ProgressBar,
    ProgressRadial,
    getModalStore,
  } from "@skeletonlabs/skeleton";
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
    const countries = servers.map((server) => server.country); // Extract the country field
    const uniqueCountries = countries.filter(
      (country, index, self) => self.indexOf(country) === index // Keep only the first occurrence of each country
    );
    return uniqueCountries.sort(); // Sort the array alphabetically
  };

  const getCitiesByCountry = (
    servers: ExitDescriptor[],
    country: string
  ): string[] => {
    const cities = servers
      .filter((server) => server.country === country) // Filter servers by the given country
      .map((server) => server.city); // Extract the city field

    const uniqueCities = cities.filter(
      (city, index, self) => self.indexOf(city) === index // Keep only the first occurrence of each city
    );

    return uniqueCities.sort(); // Sort the cities alphabetically
  };

  const rowClass =
    "flex flex-row bg-surface-200 p-2 text-sm rounded-md mx-2 cursor-pointer items-center text-left block";
</script>

{#if open}
  <div
    id="popup"
    class="bg-surface-50"
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
        <button
          class={rowClass}
          on:click={() => {
            $pref_exit_constraint = "auto";
            open = false;
          }}
        >
          <div class="w-7"><RefreshAuto width="1.3rem" height="1.3rem" /></div>
          <div class="grow">
            <b class="font-bold">Auto</b>
          </div>
        </button>
        {#each getCountries(servers) as country}
          {#each getCitiesByCountry(servers, country) as city}
            <button
              class={rowClass}
              on:click={() => {
                $pref_exit_constraint = {
                  city: city,
                  country: country,
                };
                open = false;
              }}
            >
              <div class="w-7"><Flag {country} /></div>
              <div class="grow">
                <b class="font-bold">{country}</b> / {city}
              </div>
              <div>50%</div>
            </button>
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
