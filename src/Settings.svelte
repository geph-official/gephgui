<script lang="ts">
  import Earth from "svelte-material-icons/Earth.svelte";
  import Apps from "svelte-material-icons/Apps.svelte";
  import Translate from "svelte-material-icons/Translate.svelte";
  import Creation from "svelte-material-icons/Creation.svelte";
  import DirectionsFork from "svelte-material-icons/DirectionsFork.svelte";
  import ThemeLightDark from "svelte-material-icons/ThemeLightDark.svelte";
  import Protocol from "svelte-material-icons/Protocol.svelte";
  import ServerNetwork from "svelte-material-icons/ServerNetwork.svelte";
  import AccountCircle from "svelte-material-icons/AccountCircle.svelte";
  import DeleteForever from "svelte-material-icons/DeleteForever.svelte";
  import Connection from "svelte-material-icons/Connection.svelte";
  import Lan from "svelte-material-icons/Lan.svelte";
  import Bridge from "svelte-material-icons/Translate.svelte";
  import Vpn from "svelte-material-icons/Vpn.svelte";
  import Switch from "@smui/switch";
  import Bug from "svelte-material-icons/Bug.svelte";
  import { curr_lang, l10n } from "./lib/l10n";
  import { fade } from "svelte/transition";
  import Select, { Option } from "@smui/select";
  import {
    pref_eastereggs,
    pref_global_vpn,
    pref_lightdark,
    pref_listen_all,
    pref_protocol,
    pref_proxy_autoconf,
    pref_routing_mode,
    pref_userpwd,
    pref_use_app_whitelist,
    pref_use_prc_whitelist,
  } from "./lib/prefs";
  import { native_gate } from "./native-gate";
  import GButton from "./lib/GButton.svelte";
  import AppPicker from "./settings/AppPicker.svelte";

  import { emojify } from "./lib/utils";
  import Dialog from "@smui/dialog/src/Dialog.svelte";
  import { Actions, Content, Title } from "@smui/dialog";
  import Button from "@smui/button/src/Button.svelte";
  import { showErrorModal } from "./lib/modals";

  let app_picker_open = false;

  const on_logout = async () => {
    let gate = await native_gate();
    try {
      await gate.stop_daemon();
    } catch {}
    $pref_userpwd = null;
    localStorage.clear();
    window.location.reload();
  };
  let account_delete_shown = false;
  const start_delete_account = () => {
    account_delete_shown = true;
  };
  const finish_delete_account = async () => {
    let gate = await native_gate();
    if ($pref_userpwd) {
      const copy = $pref_userpwd;
      try {
        await gate.binder_rpc("delete_user", [copy.username, copy.password]);
        gate.purge_caches(copy.username, copy.password);
      } catch (e) {
        await showErrorModal(e.toString());
      }
      $pref_userpwd = null;
    }
  };

  const version_info = async () => {
    const gate = await native_gate();
    return gate.get_native_info();
  };

  let eggcount = 0;

  const onEasterEgg = () => {
    eggcount += 1;
    if (eggcount > 5) {
      alert("eastereggs activated");
      $pref_eastereggs = true;
    }
  };
</script>

<div class="wrap">
  {#key $curr_lang}
    <div class="subtitle">{l10n($curr_lang, "general")}</div>
    <div class="setting">
      <div class="icon">
        <Translate height="1.5rem" width="1.5rem" />
      </div>
      <div class="description">{l10n($curr_lang, "language")}</div>
      <div class="switch">
        <Select variant="outlined" style="width: 9rem" bind:value={$curr_lang}>
          <Option value="en">English</Option>
          {#if $pref_eastereggs}
            <Option value="x-slv-la">Svitannski</Option>
          {/if}
          <Option value="zh-TW">繁體中文</Option>
          <Option value="zh-CN">简体中文</Option>
          <Option value="fa-IR">فارسی</Option>
        </Select>
      </div>
    </div>

    <div class="setting">
      <div class="icon">
        <ThemeLightDark height="1.5rem" width="1.5rem" />
      </div>
      <div class="description">{l10n($curr_lang, "theme")}</div>
      <Select
        variant="outlined"
        style="width: 9rem"
        bind:value={$pref_lightdark}
      >
        <Option value="light">{l10n($curr_lang, "light")}</Option>
        <Option value="dark">{l10n($curr_lang, "dark")}</Option>
        <Option value="auto">{l10n($curr_lang, "automatic")}</Option>
      </Select>
    </div>

    <div class="divider" />
    <div class="subtitle">{l10n($curr_lang, "account")}</div>

    <div class="setting">
      <div class="icon">
        <AccountCircle height="1.5rem" width="1.5rem" />
      </div>
      <div class="description">
        <b>{$pref_userpwd ? $pref_userpwd.username : ""}</b>
      </div>
      <div class="switch">
        <GButton color="warning" inverted onClick={on_logout}
          >{l10n($curr_lang, "logout")}</GButton
        >
      </div>
    </div>

    <div class="setting">
      <div class="icon">
        <DeleteForever height="1.5rem" width="1.5rem" />
      </div>
      <div class="description">
        {l10n($curr_lang, "delete-account")}<br />
        <small>{l10n($curr_lang, "delete-account-blurb")}</small>
      </div>
      <div class="switch">
        <GButton color="warning" onClick={start_delete_account}
          >{l10n($curr_lang, "delete")}</GButton
        >
      </div>
    </div>

    <Dialog bind:open={account_delete_shown}>
      <Title>{l10n($curr_lang, "delete-account")}</Title>
      <Content>{l10n($curr_lang, "delete-account-are-you-sure")}</Content>
      <Actions>
        <Button>{l10n($curr_lang, "cancel")}</Button>
        <Button on:click={finish_delete_account}
          >{l10n($curr_lang, "delete")}</Button
        >
      </Actions>
    </Dialog>

    <div class="divider" />

    <div class="subtitle">{l10n($curr_lang, "network")}</div>
    {#await native_gate() then gate}
      {#if gate.supports_vpn_conf}
        <div class="setting">
          <div class="icon">
            <Vpn height="1.5rem" width="1.5rem" />
          </div>
          <div class="description">
            {l10n($curr_lang, "global-vpn")}<br />
            <small>{l10n($curr_lang, "global-vpn-blurb")}</small>
          </div>
          <div class="switch">
            <Switch bind:checked={$pref_global_vpn} />
          </div>
        </div>
      {/if}

      {#if gate.supports_prc_whitelist && !$pref_global_vpn}
        <div class="setting" transition:fade|local>
          <div class="icon">
            <DirectionsFork height="1.5rem" width="1.5rem" />
          </div>
          <div class="description">
            {l10n($curr_lang, "exclude-prc")}<br />
            <small>{l10n($curr_lang, "exclude-prc-blurb")}</small>
          </div>
          <div class="switch">
            <Switch bind:checked={$pref_use_prc_whitelist} />
          </div>
        </div>
      {/if}

      {#if gate.supports_app_whitelist && !$pref_global_vpn}
        <div class="setting" transition:fade|local>
          <div class="icon">
            <DirectionsFork height="1.5rem" width="1.5rem" />
          </div>
          <div class="description">
            {l10n($curr_lang, "exclude-apps")}<br />
            <small>{l10n($curr_lang, "exclude-apps-blurb")}</small>
          </div>
          <div class="switch">
            <Switch bind:checked={$pref_use_app_whitelist} />
          </div>
        </div>

        {#if $pref_use_app_whitelist}
          <AppPicker bind:open={app_picker_open} />
          <div class="setting" transition:fade|local>
            <div class="icon" style="padding-inline-start: 1rem" />
            <div class="switch">
              <GButton inverted onClick={() => (app_picker_open = true)}
                >{l10n($curr_lang, "select-excluded-apps")}</GButton
              >
            </div>
          </div>
        {/if}
      {/if}

      {#if gate.supports_proxy_conf && !$pref_global_vpn}
        <div class="setting" transition:fade|local>
          <div class="icon">
            <Creation height="1.5rem" width="1.5rem" />
          </div>
          <div class="description">
            {l10n($curr_lang, "auto-proxy")}<br />
            <small>{l10n($curr_lang, "auto-proxy-blurb")}</small>
          </div>
          <div class="switch">
            <Switch bind:checked={$pref_proxy_autoconf} />
          </div>
        </div>
      {/if}

      <div class="divider" />

      <div class="subtitle">{l10n($curr_lang, "advanced")}</div>

      <div class="warning note">
        {l10n($curr_lang, "advanced-warning")}
      </div>

      {#if gate.supports_listen_all}
        <div class="setting" transition:fade|local>
          <div class="icon">
            <Lan height="1.5rem" width="1.5rem" />
          </div>
          <div class="description">
            {l10n($curr_lang, "listen-all")}<br />
            <small>{l10n($curr_lang, "listen-all-blurb")}</small>
          </div>
          <div class="switch">
            <Switch bind:checked={$pref_listen_all} />
          </div>
        </div>
      {/if}
    {/await}

    <div class="setting">
      <div class="icon">
        <Connection height="1.5rem" width="1.5rem" />
      </div>
      <div class="description">{l10n($curr_lang, "listening-ports")}</div>
      <div class="switch">
        <div>
          9909
          <div class="chip">SOCKS5</div>
        </div>
        <div>
          9910
          <div class="chip">HTTP</div>
        </div>
      </div>
    </div>

    <div class="setting">
      <div class="icon">
        <ServerNetwork height="1.5rem" width="1.5rem" />
      </div>
      <div class="description">{l10n($curr_lang, "routing-mode")}</div>
      <div class="switch">
        <Select
          variant="outlined"
          style="width: 9rem"
          bind:value={$pref_routing_mode}
        >
          <Option value="auto">{l10n($curr_lang, "automatic")}</Option>
          <Option value="bridges">{l10n($curr_lang, "force-bridges")}</Option>
        </Select>
      </div>
    </div>

    <div class="setting">
      <div class="icon">
        <Protocol height="1.5rem" width="1.5rem" />
      </div>
      <div class="description">{l10n($curr_lang, "protocol")}</div>
      <div class="switch">
        <Select
          variant="outlined"
          style="width: 9rem"
          bind:value={$pref_protocol}
        >
          <Option value="auto">{l10n($curr_lang, "automatic")}</Option>
          <Option value="udp">UDP</Option>
          <Option value="tls">TLS</Option>
        </Select>
      </div>
    </div>

    <div class="divider" />

    <div class="subtitle">{l10n($curr_lang, "debug")}</div>
    <div class="setting">
      <div class="icon" on:click={onEasterEgg}>
        <Bug height="1.5rem" width="1.5rem" />
      </div>
      <div class="description">
        {l10n($curr_lang, "debug-pack")}<br />
        <small>{l10n($curr_lang, "debug-pack-blurb")}</small>
      </div>
      <div class="switch">
        <GButton onClick={async () => (await native_gate()).export_debug_pack()}
          >{l10n($curr_lang, "export")}</GButton
        >
      </div>
    </div>

    <div class="divider" />
    <div class="subtitle">{l10n($curr_lang, "about")}</div>

    <div class="social-buttons">
      <a
        class="social-button"
        href="https://t.me/s/gephannounce"
        target="_blank"
        rel="noopener"
      >
        <img src="telegram.svg" alt="tg-logo" />
        {l10n($curr_lang, "news")}
      </a>
      <a
        class="social-button"
        href="https://community.geph.io"
        target="_blank"
        rel="noopener"
      >
        <img src="forum.png" alt="forum-logo" />
        {l10n($curr_lang, "forum")}
      </a>
      <a
        class="social-button"
        href="https://github.com/geph-official"
        target="_blank"
        rel="noopener"
      >
        <img src="github.svg" alt="tg-logo" />
        {l10n($curr_lang, "github")}
      </a>
    </div>

    {#await version_info() then nfo}
      <div class="version">v{nfo.version} / {nfo.platform_details}</div>
    {/await}

    <div class="madeby" use:emojify dir="ltr">
      made with ❤️ by <br />
      <a
        href="https://github.com/nullchinchilla"
        target="_blank"
        rel="noopener"
      >
        @nullchinchilla
      </a> / Gephyra OÜ
    </div>
  {/key}
</div>

<style>
  .version {
    font-size: 80%;
    font-weight: 500;
    width: 100%;
    text-align: center;
    padding-bottom: 1rem;
    opacity: 0.8;
  }

  .social-buttons {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding-bottom: 1rem;
  }

  .social-button img {
    height: 1.5rem;
    width: 1.5rem;
    margin-inline-end: 0.5rem;
  }

  .social-button {
    width: 33.333%;
    height: 2.5rem;
    margin: 0.3rem;
    padding: 0.4rem;
    border: 1px solid gray;
    display: flex;
    flex-direction: row;
    align-items: center;
    box-sizing: border-box;
    border-radius: 0.3rem;
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 500;
    color: #111;
  }

  .note {
    padding: 0.8rem;
    margin: 0.2rem;
    border: 1px solid gray;
    border-radius: 0.5rem;
    font-size: 0.9rem;
    opacity: 0.7;
    font-weight: 600;
  }

  /* HACK */
  :global(.mdc-select--outlined .mdc-select__anchor) {
    height: 2.2rem;
  }

  .wrap {
    padding: 1rem;
    display: flex;
    flex-direction: column;
  }

  small {
    opacity: 0.7;
  }

  .subtitle {
    font-size: 0.8rem;
    font-weight: 500;
    opacity: 0.6;
    margin-bottom: 0.5rem;
  }

  .divider {
    border-top: 1px solid #ccc;
    margin-top: 0.3rem;
    margin-bottom: 1rem;
  }

  .setting {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    min-height: 4rem;
  }

  .description {
    flex-grow: 1;
    padding-inline-start: 1rem;
  }

  .icon {
    display: flex;
    opacity: 0.7;
  }

  .madeby {
    text-align: center;
    font-size: 0.8rem;
  }

  .madeby a {
    font-weight: 500;
    color: black;
    text-decoration: none;
  }

  .chip {
    display: inline-block;
    background-color: #ddd;
    font-size: 0.9rem;
    padding-inline-start: 0.5rem;
    padding-inline-end: 0.5rem;
    padding-top: 0.2rem;
    padding-bottom: 0.2rem;
    margin-top: 0.2rem;
    border-radius: 3rem;
    opacity: 0.7;
  }

  .switch {
    direction: ltr;
  }
</style>
