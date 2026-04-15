<script lang="ts">
  import sparkline from "@fnando/sparkline";
  import { pref_lightdark } from "./lib/prefs";
  interface Props {
    data?: any;
    unit?: string;
    title?: string;
    decimals?: number;
  }

  let {
    data = Array.from({ length: 100 }, () =>
      Math.floor(Math.random() * 100),
    ),
    unit = "Mbps",
    title = "Total traffic",
    decimals = 2,
  }: Props = $props();
  let container = $state<SVGSVGElement | null>(null);

  let svgData = $state<string | null>(null);

  const draw = () => {
    if (!container) return;

    sparkline(container, data);
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(container);
    const base64 = btoa(svgString);

    svgData = `data:image/svg+xml;base64,${base64}`;
  };

  $effect(() => {
    container && draw();
  });

  let color = $derived((() => {
    if ($pref_lightdark === "dark") {
      return "#fdf6e3";
    }

    return "#073642";
  })());
</script>

{#key data}
  {#key color}
    <div class="tnum">
      <div class="text-xs -mb-1 ml-2 mt-2">{title}</div>
      <div class="ml-2" style="color: {color}">
        <span class="text-xl"
          >{(data[data.length - 1] || 0).toFixed(decimals)}</span
        >
        {unit}
      </div>
      <svg
        bind:this={container}
        class="hidden"
        width="400"
        height="40"
        stroke-width="1"
        stroke-opacity="1"
        stroke={color}
        fill={color}
        fill-opacity="0.1"
      ></svg>
      {#if svgData}
        <img src={svgData} class="w-full h-full" alt="" />
      {/if}
    </div>
  {/key}
{/key}
