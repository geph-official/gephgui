<script>
  export let data = Array.from({ length: 100 }, () =>
    Math.floor(Math.random() * 100)
  );
  export let unit = "Mbps";
  export let color = "green";
  export let title = "Total traffic";

  import sparkline from "@fnando/sparkline";
  let container;

  let svgData = null;

  const draw = () => {
    console.log("gonna draw");
    sparkline(container, data);
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(container);
    const base64 = btoa(svgString);

    svgData = `data:image/svg+xml;base64,${base64}`;
    console.log(svgData);
  };

  $: container && draw();
</script>

<div>
  <div class="text-sm -mb-1">{title}</div>
  <div class="font-medium" style="color: {color}">
    <span class="text-2xl">{data[data.length - 1] || 0}</span>
    {unit}
  </div>
  <svg
    bind:this={container}
    class="hidden"
    width="100"
    height="70"
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
