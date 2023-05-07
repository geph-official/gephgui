<script lang="ts">
  import { writable, type Writable } from "svelte/store";

  import ActiveExit from "./home/ActiveExit.svelte";
  import BottomButtons from "./home/BottomButtons.svelte";

  import Stats from "./home/Stats.svelte";

  import UserInfo from "./home/UserInfo.svelte";
  import { curr_lang, l10n } from "./lib/l10n";
  import { runWithSpinner, showErrorModal } from "./lib/modals";
  import {
    persistentWritable,
    pref_app_whitelist,
    pref_use_prc_whitelist,
    pref_global_vpn,
    pref_proxy_autoconf,
    pref_routing_mode,
    pref_selected_exit,
    pref_auth,
    pref_listen_all,
    pref_use_app_whitelist,
    pref_protocol,
  } from "./lib/prefs";
  import { get_rpc_authkind, onInterval } from "./lib/utils";
  import { native_gate, type SubscriptionInfo } from "./native-gate";

  // Connections status things. We use a persistent store because on iOS and Android the webview can stop at any time.
  const connection_status: Writable<
    "connected" | "connecting" | "disconnected"
  > = persistentWritable("connection_status", "disconnected");

  const user_info: Writable<SubscriptionInfo | null> = writable(null);

  onInterval(async () => {
    let gate = await native_gate();
    try {
      await runWithSpinner(
        l10n($curr_lang, "refreshing-user-info") + "...",
        1000,
        async () => {
          if ($pref_auth) {
            let rpc_authkind = get_rpc_authkind($pref_auth.auth);
            $user_info = await gate.sync_user_info(rpc_authkind);
          }
        }
      );
    } catch (e) {
      await showErrorModal("error syncing info: " + JSON.stringify(e));
    }
  }, 1000);

  // the main monitor loop
  onInterval(async () => {
    let gate = await native_gate();
    const is_running = await gate.is_running();

    const is_connected = is_running && (await gate.is_connected());
    if ($pref_selected_exit === null && $pref_auth) {
      let rpc_authkind = get_rpc_authkind($pref_auth.auth);
      const exits = await gate.sync_exits(rpc_authkind);
      if (exits.length > 0) {
        while (true) {
          let ridx = Math.floor(Math.random() * exits.length);
          let exit = exits[ridx];
          if (exit.allowed_levels.includes("free")) {
            $pref_selected_exit = exit;
            break;
          }
        }
      }
    }
    if (is_connected) {
      $connection_status = "connected";
    } else if (is_running) {
      $connection_status = "connecting";
    } else {
      $connection_status = "disconnected";
    }
  }, 500);
</script>

<div class="home">
  {#if $pref_auth}
    <UserInfo user_info={$user_info} />
  {:else}
    <h1>Authentication info is not available</h1>
  {/if}

  <ActiveExit
    connection={$connection_status}
    exit_descriptor={$pref_selected_exit}
  />

  <Stats />

  {#key $pref_auth}
    <BottomButtons
      running={$connection_status !== "disconnected"}
      onConnect={async () => {
        let gate = await native_gate();
        try {
          if ($pref_auth && $pref_selected_exit) {
            await gate.start_daemon({
              auth: get_rpc_authkind($pref_auth.auth),
              exit_hostname: $pref_selected_exit.hostname,
              app_whitelist: $pref_use_app_whitelist
                ? Object.keys($pref_app_whitelist).filter(
                    (s) => $pref_app_whitelist[s]
                  )
                : [],
              prc_whitelist: $pref_use_prc_whitelist,
              proxy_autoconf: $pref_proxy_autoconf,
              vpn_mode: $pref_global_vpn,
              listen_all: $pref_listen_all,
              force_bridges: $pref_routing_mode === "bridges",
              force_protocol: $pref_protocol === "auto" ? null : $pref_protocol,
            });
            $connection_status = "connecting";
          } else {
            throw "no userpwd";
          }
        } catch (err) {
          await showErrorModal(err.toString());
        }
      }}
      onDisconnect={async () => {
        let gate = await native_gate();
        try {
          await gate.stop_daemon();
        } catch (err) {
          await showErrorModal(err.toString());
        }
      }}
      onSelectExit={(exit) => {
        $pref_selected_exit = exit;
      }}
      block_plus={$user_info ? $user_info.level === "free" : true}
    />
  {/key}
</div>

<style>
  .home {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    padding: 1rem;
    box-sizing: border-box;
  }
</style>
