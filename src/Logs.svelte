<script lang="ts">
  import type { Writable } from "svelte/store";

  import Stats from "./home/Stats.svelte";
  import { persistentWritable } from "./lib/prefs";
  import { onInterval } from "./lib/utils";
  import { native_gate } from "./native-gate";
  const logs: Writable<[number, string][]> = persistentWritable("logs", []);
  let logs_container: HTMLElement;
  let running = false;
  onInterval(async () => {
    if (!running) {
      running = true;
      try {
        let gate = await native_gate();
        let last_no = $logs
          .map((s) => s[0])
          .reduce((acc, value) => Math.max(acc, value), 0);
        try {
          $logs = $logs.concat(
            (await gate.daemon_rpc("get_logs", [last_no])) as any
          );
          if ($logs.length > 1000) {
            $logs = $logs.slice($logs.length / 2); // set $logs to latter half of $logs
          }
          setTimeout(() => {
            logs_container.scroll({
              top: logs_container.scrollHeight,
              behavior: "smooth",
            });
          }, 100);
        } catch (e) {}
      } finally {
        running = false;
      }
    }
  }, 1000);
</script>

<div class="wrap">
  <Stats />
  <div class="logs" bind:this={logs_container}>
    {#each $logs as [tstamp, line]}
      {line.replace(/\[.*?\s/g, "[").trim()}<br />
    {/each}
  </div>
</div>

<style>
  .wrap {
    padding: 1rem;
    height: 100%;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
  }

  .logs {
    background-color: #333;
    color: #eee;
    font-size: 0.6rem;
    padding: 0.5rem;
    margin-top: 1rem;
    border: 1px solid black;
    font-family: "Roboto Mono", "Iosevka", "Menlo", "Consolas", "DejaVu Mono",
      monospace;
    flex-grow: 1;
    overflow-y: scroll;
    overflow-x: scroll;
  }
</style>
