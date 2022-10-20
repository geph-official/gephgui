<script lang="ts">
  import Graph from "./graphs/Graph.svelte";
  import { l10n, curr_lang } from "./lib/l10n";
  import { onInterval } from "./lib/utils";
  import { native_gate } from "./native-gate";

  let recv_data: [number, number][] = [];
  let send_data: [number, number][] = [];
  let ping_data: [number, number][] = [];
  let loss_data: [number, number][] = [];

  $: has_data = recv_data.length > 0;
  onInterval(async () => {
    try {
      recv_data = (
        await native_gate().daemon_rpc("timeseries_stats", ["RecvSpeed"])
      ).map((a) => [a[0], (a[1] / 1_000_000) * 8]);
      send_data = (
        await native_gate().daemon_rpc("timeseries_stats", ["SendSpeed"])
      ).map((a) => [a[0], (a[1] / 1_000_000) * 8]);
      ping_data = (
        await native_gate().daemon_rpc("timeseries_stats", ["Ping"])
      ).map((a) => [a[0], a[1]]);
      loss_data = (
        await native_gate().daemon_rpc("timeseries_stats", ["Loss"])
      ).map((a) => [a[0], a[1] * 100.0]);
    } catch {
      recv_data = [];
      send_data = [];
    }
  }, 1000);
</script>

<div class="wrap">
  {#key has_data}
    <Graph
      card
      unit="Mbps"
      height="10rem"
      title={l10n($curr_lang, "download")}
      series={[
        {
          data: recv_data,
          stroke: "navy",
          fill: "rgba(0, 0, 255, 0.05)",
          label: l10n($curr_lang, "download"),
        },
      ]}
    />

    <Graph
      card
      unit="Mbps"
      height="10rem"
      title={l10n($curr_lang, "upload")}
      series={[
        {
          data: send_data,
          stroke: "maroon",
          fill: "rgba(128, 0, 0, 0.05)",
          label: l10n($curr_lang, "download"),
        },
      ]}
    />

    <Graph
      card
      unit="ms"
      height="10rem"
      title={l10n($curr_lang, "latency")}
      series={[
        {
          data: ping_data,
          stroke: "darkgreen",
          fill: "rgba(0, 128, 0, 0.05)",
          label: l10n($curr_lang, "download"),
        },
      ]}
    />

    <Graph
      card
      unit="%"
      height="10rem"
      title={l10n($curr_lang, "packet-loss")}
      series={[
        {
          data: loss_data,
          stroke: "indigo",
          fill: "rgba(0, 0, 128, 0.05)",
          label: l10n($curr_lang, "packet-loss"),
        },
      ]}
    />
  {/key}
</div>

<style>
  .wrap {
    padding: 1rem;
  }
</style>
