<script lang="ts">
  import { native_gate } from "./native-gate";

  // An array of objects controlling the rows
  let timeOptions = [
    { label: "1 month", discount: "-5%", price: "$5", per: "month" },
    { label: "1 year", discount: "-5%", price: "$5", per: "month" },
  ];

  // Tracks the currently selected index; starts at 0 to force an option.
  let selectedIndex = 0;

  function handleSelect(index: number) {
    selectedIndex = index;
  }

  const getPricePoints = async () => {
    const gate = await native_gate();
    return await gate.price_points();
  };
</script>

<!-- Component Markup -->
<div
  class="fixed w-full h-full bg-black bg-opacity-50 backdrop-blur-sm p-4 flex-col"
>
  <div class="bg-surface-50 p-4 rounded-md shadow-lg">
    <h1 class="font-bold text-gray-700 text-xs mb-2">Add Plus time</h1>

    {#await getPricePoints()}
      Loading...
    {:then pricePoints}
      {#each pricePoints as [days, price], i}
        <div
          class={`border-black border rounded-md p-2 px-2 text-sm flex-row flex gap-2 items-center mb-2 cursor-pointer ${
            i === selectedIndex ? "bg-green-100" : ""
          }`}
          on:click={() => handleSelect(i)}
        >
          <div>{days} days</div>
          <!-- {#if option.discount}
            <div class="bg-green-300 rounded-sm px-1 text-xs">
              {option.discount}
            </div>
          {/if} -->
          <div class="grow text-right">
            <span class="font-semibold">€{price.toFixed(2)}</span>
            <span>/ {days} days</span>
          </div>
        </div>
      {/each}
    {/await}
  </div>
</div>
