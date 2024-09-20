<script lang="ts">
  import { native_gate } from "../native-gate";

  import { onInterval } from "../lib/utils";

  import ProgressDownload from "svelte-material-icons/ProgressDownload.svelte";
  import ProgressUpload from "svelte-material-icons/ProgressUpload.svelte";
  import SwapVertical from "svelte-material-icons/SwapVertical.svelte";

  import IpNetworkOutline from "svelte-material-icons/IpNetworkOutline.svelte";
  import Protocol from "svelte-material-icons/Protocol.svelte";
  import { curr_lang, l10n } from "../lib/l10n";
  let recv_data = 0;
  let send_data = 0;

  let has_data = false;
  let ping = 0.0;

  let address = "";
  let protocol = "";

  onInterval(async () => {
    const gate = await native_gate();
    try {
      const basic = (await gate.daemon_rpc("basic_stats", [])) as any;
      if (basic) {
        has_data = true;
        recv_data = basic.total_recv_bytes;
        send_data = basic.total_sent_bytes;
        ping = basic.last_ping;
        address = basic.address;
        protocol = basic.protocol;
      }
    } catch {
      recv_data = 0;
      send_data = 0;
      ping = 0.0;
      address = "";
      protocol = "";
      has_data = false;
    }
  }, 500);
</script>

<div class="outer">
  <div class="brow">
    <div class="bleft">
      <ProgressDownload size="1.3rem" />
      <div class="bcaption">{l10n($curr_lang, "download")}</div>
    </div>
    <div class="bright" style="color:navy">
      {has_data ? (recv_data / 1_000_000).toFixed(2) : "-"} MB
    </div>
  </div>
  <div class="brow">
    <div class="bleft">
      <ProgressUpload size="1.3rem" />
      <div class="bcaption">{l10n($curr_lang, "upload")}</div>
    </div>
    <div class="bright" style="color:maroon">
      {has_data ? (send_data / 1_000_000).toFixed(2) : "-"} MB
    </div>
  </div>
  <div class="brow" />
  <div class="brow">
    <div class="bleft">
      <IpNetworkOutline size="1.3rem" />
      <div class="bcaption">{l10n($curr_lang, "via")}</div>
    </div>
    <div class="bright mono">{has_data ? address : "-"}</div>
  </div>

  <div class="brow">
    <div class="bleft">
      <Protocol size="1.3rem" />
      <div class="bcaption">{l10n($curr_lang, "protocol")}</div>
    </div>
    <div class="bright mono">{has_data ? protocol : "-"}</div>
  </div>

  <div class="brow">
    <div class="bleft">
      <Protocol size="1.3rem" />
      <div class="bcaption">{l10n($curr_lang, "latency")}</div>
    </div>
    <div class="bright mono">
      {#if has_data}
        {Math.round(ping)} ms
      {:else}
        -
      {/if}
    </div>
  </div>
</div>

<style>
  .mono {
    opacity: 0.7;
    font-weight: 500;
  }
  .brow {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding-bottom: 0.4rem;
    padding-top: 0.4rem;
  }

  .bcaption {
    margin-inline-start: 0.3rem;
  }

  .bleft {
    font-weight: 600;

    display: flex;
    flex-direction: row;
    align-items: center;

    opacity: 0.7;
  }

  .outer {
    width: 100%;
    display: flex;
    flex-direction: column;
    /* background-color: gray; */
    padding: 1rem;
    padding-top: 0.6rem;
    padding-bottom: 0.6rem;
    border-radius: 1rem;
    border: 1px #ccc solid;
    box-sizing: border-box;
    font-size: 0.9rem;
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
