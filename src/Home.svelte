<script lang="ts">
  import { writable, type Writable } from "svelte/store";

  import ActiveExit from "./home/ActiveExit.svelte";
  import BottomButtons from "./home/BottomButtons.svelte";

  import Stats from "./home/Stats.svelte";

  import UserInfo from "./home/UserInfo.svelte";
  import {
    persistentWritable,
    pref_app_whitelist,
    pref_use_prc_whitelist,
    pref_global_vpn,
    pref_proxy_autoconf,
    pref_routing_mode,
    pref_selected_exit,
    pref_userpwd,
    pref_listen_all,
    pref_use_app_whitelist,
  } from "./lib/prefs";
  import { displayError, onInterval } from "./lib/utils";
  import { native_gate, type SubscriptionInfo } from "./native-gate";

  // Connections status things. We use a persistent store because on iOS and Android the webview can stop at any time.
  const connection_status: Writable<
    "connected" | "connecting" | "disconnected"
  > = persistentWritable("connection_status", "disconnected");

  const user_info: Writable<SubscriptionInfo | null> = writable(null);

  onInterval(async () => {
    try {
      if ($pref_userpwd) {
        $user_info = await native_gate().sync_user_info(
          $pref_userpwd.username,
          $pref_userpwd.password
        );
      }
    } catch (e) {
      reportError("error syncing info: " + user_info);
    }
  }, 10000);

  // the main monitor loop
  onInterval(async () => {
    const is_running = await native_gate().is_running();
    const is_connected = is_running && (await native_gate().is_connected());
    if ($pref_selected_exit === null && $pref_userpwd) {
      const exits = await native_gate().sync_exits(
        $pref_userpwd.username,
        $pref_userpwd.password
      );
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
  {#if $pref_userpwd}
    <UserInfo username={$pref_userpwd.username} user_info={$user_info} />
  {:else}
    <h1>NO USERPWD</h1>
  {/if}

  <ActiveExit
    connection={$connection_status}
    exit_descriptor={$pref_selected_exit}
  />

  <Stats />

  {#key $pref_userpwd}
    <BottomButtons
      running={$connection_status !== "disconnected"}
      onConnect={async () => {
        try {
          if ($pref_userpwd && $pref_selected_exit) {
            await native_gate().start_daemon({
              username: $pref_userpwd.username,
              password: $pref_userpwd.password,
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
            });
            $connection_status = "connecting";
          } else {
            throw "no userpwd";
          }
        } catch (err) {
          displayError(err.toString());
        }
      }}
      onDisconnect={async () => {
        try {
          await native_gate().stop_daemon();
        } catch (err) {
          reportError(err.toString());
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
