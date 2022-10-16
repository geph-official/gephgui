<script lang="ts">
  import { native_gate } from "../native-gate";

  import { onInterval } from "../lib/utils";
  import Graph from "./Graph.svelte";
  import ArrowDown from "svelte-material-icons/ArrowDown.svelte";
  import ArrowUp from "svelte-material-icons/ArrowUp.svelte";
  import SwapVertical from "svelte-material-icons/SwapVertical.svelte";
  import { curr_lang, l10n } from "../lib/l10n";
  let recv_data: [number, number][] = [];
  let send_data: [number, number][] = [];
  $: send_speed =
    send_data.length > 0 ? send_data[send_data.length - 1][1] : 0.0;
  $: recv_speed =
    recv_data.length > 0 ? recv_data[recv_data.length - 1][1] : 0.0;
  let ping = 0.0;
  onInterval(async () => {
    const r = (
      await native_gate().daemon_rpc("timeseries_stats", ["RecvSpeed"])
    ).map((a) => [a[0], (a[1] / 1_000_000) * 8]);
    const s = (
      await native_gate().daemon_rpc("timeseries_stats", ["SendSpeed"])
    ).map((a) => [a[0], (a[1] / 1_000_000) * 8]);
    const p = (await native_gate().daemon_rpc("basic_stats", ["SendSpeed"]))
      .last_ping;
    recv_data = r;
    send_data = s;
    ping = p;
  }, 1000);
</script>

<div class="outer">
  <div class="widgets">
    <div class="widget" style="color: navy">
      <ArrowDown />
      {recv_speed.toFixed(2)} Mbps
    </div>
    <div class="widget" style="color: maroon">
      <ArrowUp />
      {send_speed.toFixed(2)} Mbps
    </div>
    <div class="widget"><SwapVertical />234 ms</div>
  </div>
  {#key recv_data}
    <Graph
      unit="Mbps"
      height="20vh"
      series={[
        {
          data: recv_data,
          stroke: "navy",
          fill: "white",
          label: l10n($curr_lang, "download"),
        },
        {
          data: send_data,
          stroke: "maroon",
          fill: "white",
          label: l10n($curr_lang, "upload"),
        },
      ]}
    />
  {/key}
</div>

<style>
  .outer {
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  .widgets {
    display: flex;
    flex-direction: row;
    width: 100%;
    align-items: center;
    justify-content: space-around;
    margin-bottom: 1rem;
    font-size: 0.9rem;
    font-weight: 500;
    opacity: 0.8;
  }

  .widget {
    display: flex;
  }
</style>
