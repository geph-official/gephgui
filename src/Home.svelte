<script lang="ts">
  import type { Writable } from "svelte/store";

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
    pref_userpwd,
    pref_listen_all,
    pref_use_app_whitelist,
    pref_protocol,
    user_info_store,
  } from "./lib/prefs";
  import { onInterval } from "./lib/utils";
  import {
    native_gate,
    subinfo_deserialize,
    subinfo_serialize,
    type SubscriptionInfo,
  } from "./native-gate";

  // Connections status things. We use a persistent store because on iOS and Android the webview can stop at any time.
  const connection_status: Writable<
    "connected" | "connecting" | "disconnected"
  > = persistentWritable("connection_status", "disconnected");

  onInterval(async () => {
    let gate = await native_gate();
    try {
      if ($pref_userpwd) {
        $user_info_store = subinfo_serialize(
          await gate.sync_user_info(
            $pref_userpwd.username,
            $pref_userpwd.password
          )
        );
      }
    } catch (e) {
      // non-fatal error; display nothing!
    }
  }, 60000);

  // the main monitor loop
  onInterval(async () => {
    let gate = await native_gate();
    const is_running = await gate.is_running();

    console.time("main_monitor_connected");
    const is_connected = is_running && (await gate.is_connected());
    console.timeEnd("main_monitor_connected");
    if ($pref_selected_exit === null) {
      await runWithSpinner(
        l10n($curr_lang, "loading-server-list"),
        0,
        async () => {
          if ($pref_userpwd) {
            const exits = await gate.sync_exits(
              $pref_userpwd.username,
              $pref_userpwd.password
            );
            if (exits.length > 0) {
              let least_loaded = exits
                .filter((e) => e.allowed_levels.includes("free"))
                .sort((a, b) => a.load - b.load)[0];
              $pref_selected_exit = least_loaded;
            }
          }
        }
      );
    }

    console.log("main monitor loop IS CONNECTED: ", is_connected);
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
  {#if $pref_selected_exit}
    {#if $pref_userpwd}
      <UserInfo
        username={$pref_userpwd.username}
        user_info={$user_info_store && subinfo_deserialize($user_info_store)}
      />
    {:else}
      <h1>NO USERPWD</h1>
    {/if}

    <ActiveExit
      connection={$connection_status}
      exit_descriptor={$pref_selected_exit}
    />

    {#key $pref_userpwd}
      <BottomButtons
        running={$connection_status !== "disconnected"}
        onConnect={async () => {
          let gate = await native_gate();
          try {
            if ($pref_userpwd && $pref_selected_exit) {
              await gate.start_daemon({
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
                force_protocol:
                  $pref_protocol === "auto" ? null : $pref_protocol,
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
        block_plus={$user_info_store ? $user_info_store.level === "free" : true}
      />
    {/key}
  {:else}
    initializing...
  {/if}
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
