<script lang="ts">
  import { onMount } from "svelte";

  import { type Writable } from "svelte/store";

  import Stats from "./home/Stats.svelte";
  import { persistentWritable } from "./lib/prefs";
  import { fade } from "svelte/transition";
  import { onInterval } from "./lib/utils";
  import { native_gate } from "./native-gate";
  const logs: Writable<[number, string][]> = persistentWritable("loggs", []);
  let logs_container: HTMLElement;

  // Function to check if the screen is scrolled to the bottom
  function shouldScrollToBottom(element: HTMLElement): boolean {
    return element.scrollHeight - element.scrollTop - element.clientHeight < 5;
  }

  onMount(() => {
    logs_container.scroll({
      top: logs_container.scrollHeight,
    });
  });

  onInterval(async () => {
    let gate = await native_gate();
    let last_no = $logs
      .map((s) => s[0])
      .reduce((acc, value) => Math.max(acc, value), 0);
    try {
      let new_logs = (await gate.daemon_rpc("get_logs", [last_no])) as [
        number,
        string,
      ][];

      $logs = $logs.concat(new_logs);
      if ($logs.length > 1000) {
        $logs = $logs.slice($logs.length / 2); // set $logs to latter half of $logs
      }
      if (shouldScrollToBottom(logs_container)) {
        setTimeout(() => {
          logs_container.scroll({
            top: logs_container.scrollHeight,
            // behavior: "smooth",
          });
        }, 100);
      }
    } catch (e) {}
  }, 1000);
</script>

<div class="wrap" transition:fade={{ duration: 150 }}>
  <Stats />
  <div class="logs" bind:this={logs_container}>
    {#each $logs as [tstamp, line]}
      <div>
        {new Date(tstamp * 1000.0).toISOString().replace(".000Z", "")}
        {line.replace(/\[.*?\s/s, "[").trim()}
      </div>
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
    flex-grow: 1;
    overflow-y: scroll;
  }

  .logs div {
    font-family: "Iosevka", "Menlo", "Consolas", "DejaVu Mono", monospace;
    width: 100%;
    word-wrap: break-word;
  }
</style>
