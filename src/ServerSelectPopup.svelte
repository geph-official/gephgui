<script lang="ts">
  import { AppBar, ProgressBar, ProgressRadial } from "@skeletonlabs/skeleton";
  import { fly } from "svelte/transition";
  import Close from "svelte-material-icons/Close.svelte";
  import { curr_lang, l10n } from "./lib/l10n";
  import { Accordion, AccordionItem } from "@skeletonlabs/skeleton";
  import { native_gate, type ExitDescriptor } from "./native-gate";
  import { pref_exit_constraint } from "./lib/prefs";
  import Flag from "./lib/Flag.svelte";
  export let open = false;

  const loadServers = async () => {
    const gate = await native_gate();
    const exitList: ExitDescriptor[] = (await gate.daemon_rpc(
      "exit_list",
      []
    )) as any;
    return exitList;
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

    {#await loadServers()}
      <ProgressBar />
    {:then servers}
      {#each getCountries(servers) as country}
        {#each getCitiesByCountry(servers, country) as city}
          <div
            class="flex flex-row gap-3 bg-surface-200 p-2 text-sm rounded-md m-2 cursor-pointer items-center"
            on:click={() => {
              $pref_exit_constraint = {
                city: city,
                country: country,
              };
              open = false;
            }}
          >
            <div><Flag {country} /></div>
            <div class="grow -ml-2">
              <b class="font-bold">{country}</b> / {city}
            </div>
            <div>50%</div>
          </div>
        {/each}
      {/each}
    {/await}
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
