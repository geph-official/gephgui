<script lang="ts">
  import { onMount } from "svelte";
  import uPlot from "uplot";

  export let series: {
    data: [number, number][];
    stroke: string;
    label: string;
    fill: string;
  }[];

  export let height = "10rem";

  let container: HTMLElement;
  export let unit: string;

  let columnData: [number[], ...number[][]] = [
    series[0].data.map((p) => p[0]),
    ...series.map((s) => s.data.map((p) => p[1])),
  ];

  let lastTime =
    series[0].data.length > 0
      ? series[0].data[series[0].data.length - 1][0]
      : new Date().getMilliseconds() / 1000.0;
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
      0, 0, 0, 0,
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
    let u = new uPlot(opts, columnData, container);

    window.addEventListener("resize", (e) => {
      u.setSize(getSize());
    });
  });
</script>

<div class="zzzzzz" style="height: {height}" bind:this={container} />

<style>
  .zzzzzz {
    width: 100%;
    border: 1px solid gray;
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
