<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import uPlot from "uplot";

  export let series: {
    data: [number, number][];
    stroke: string;
    label: string;
    fill: string;
  }[];

  export let card = false;

  export let height = "10rem";
  export let title: string;

  let container: HTMLElement;
  export let unit: string;

  $: columnData = [
    series[0].data.map((p) => p[0]),
    ...series.map((s) => s.data.map((p) => p[1])),
  ];

  $: lastTime = new Date().valueOf() / 1000.0;
  let plotter: any = null;

  $: {
    if (plotter) {
      plotter.setData(columnData);
      plotter.setScale("x", {
        auto: false,
        min: lastTime - 200,
        max: lastTime,
      });
    }
  }
  onDestroy(() => {
    console.log("destroy plotter", plotter);
    plotter && plotter.destroy();
  });
  onMount(() => {
    function getSize() {
      let { width, height } = container.getBoundingClientRect();
      console.log("width", width);
      console.log("height", height);
      return {
        width: width,
        height: height,
      };
    }
    let size = getSize();

    console.log("size", size);

    let padd: [top: number, right: number, bottom: number, left: number] = [
      5, 5, 10, 5,
    ];

    let opts = {
      scales: {
        x: {
          auto: false,
          min: lastTime - 400,
          max: lastTime,
        },
      },
      id: "chart1",
      width: size.width,
      height: size.height,
      padding: padd,

      legend: {
        show: false,
      },

      title,

      axes: [
        {},
        {
          label: unit,
          size: 0,
          labelFont: "12px system-ui",
        },
      ],

      series: [
        {},
        ...series.map((s) => {
          return {
            show: true,
            spanGaps: false,
            label: s.label,

            value: (self, rawValue) => rawValue + " " + unit,

            stroke: s.stroke,
            width: 1,
            fill: s.fill,
            dash: [10, 0],
          };
        }),
      ],
      cursor: {
        drag: {
          setScale: false,
          x: false,
          y: false,
        },
      },
    };
    console.log("about to render in", container);
    plotter = new uPlot(opts, columnData, container);
  });
</script>

<div class="zzzzzz" class:card style="height: {height}" bind:this={container} />

<style>
  .card {
    border: 1px solid #ccc;
    margin-bottom: 3rem;

    border-radius: 1rem;

    padding-top: 0.5rem;
  }

  .zzzzzz {
    width: 100%;
    /* border: 1px solid gray; */
  }

  :global(.uplot) {
    position: relative;
  }

  :global(.u-legend) {
    position: absolute !important;
    top: 10px !important;
    right: 10%;
    font-size: 0.6rem;
  }
</style>
