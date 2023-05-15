<script lang="ts">
  import Textfield from "@smui/textfield";
  import GButton from "./lib/GButton.svelte";
  import { curr_lang, l10n } from "./lib/l10n";
  import { pref_auth } from "./lib/prefs";
  import { AuthKind, native_gate, type Authentication } from "./native-gate";
  import Register from "./login/Register.svelte";
  import { runWithSpinner, showErrorModal } from "./lib/modals";
  import { get_rpc_authkind } from "./lib/utils";
  import { hexToU8a } from "@polkadot/util";

  let pubkey_login = true;

  let secret = "";

  let username = "";
  let password = "";

  let loading = false;

  let register_open = false;

  const translateError = (err: string) => {
    if (err.includes("invalid")) {
      return l10n($curr_lang, "invalid-username-or-password");
    } else if (err.includes("too many")) {
      return l10n($curr_lang, "login-server-overloaded");
    } else {
      return err;
    }
  };

  const handleLoginClick = async () => {
    await runWithSpinner(
      l10n($curr_lang, "logging-in") + "...",
      0,
      async () => {
        loading = true;
        try {
          let auth: Authentication;
          
          if (pubkey_login) {
            auth = {
              kind: AuthKind.Keypair,
              sk: hexToU8a(secret),
              pk: hexToU8a(secret.slice(32))
            }
          } else {
            auth = {
              kind: AuthKind.Password,
              username: username,
              password: password,
            };
          }

          let rpc_authkind = get_rpc_authkind(auth);
          let gate = await native_gate();
          await gate.sync_user_info(rpc_authkind);

          $pref_auth = {
            auth: auth,
          };
        } catch (err) {
          await showErrorModal(translateError(err.toString()));
        } finally {
          loading = false;
        }
      }
    );
  };
</script>

<div class="wrap">
  {#if register_open}
    <Register
      bind:open={register_open}
      onRegisterSuccess={(s) => {
        console.log(s);
        secret = s;
      }}
    />
  {/if}
  <img class="big-logo" src="gephlogo.png" alt="big logo" />
  <div class="form">
    {#if pubkey_login}
      <Textfield
        variant="outlined"
        label={l10n($curr_lang, "secret")}
        bind:value={secret}
        input$autocorrect="off"
        input$autocapitalize="none"
      />
      <br />

      <GButton disabled={loading} onClick={handleLoginClick}>
        {l10n($curr_lang, "log-in-blurb")}
      </GButton>
      <br />

      <GButton inverted disabled={loading} onClick={() => (pubkey_login = false)}>
        {l10n($curr_lang, "password-login")}
      </GButton>
      <br />

      <GButton inverted disabled={loading} onClick={() => (register_open = true)}>
        {l10n($curr_lang, "register-blurb")}
      </GButton>
    {:else}
      <Textfield
        variant="outlined"
        label={l10n($curr_lang, "username")}
        bind:value={username}
        input$autocorrect="off"
        input$autocapitalize="none"
      />
      <br />

      <Textfield
        variant="outlined"
        type="password"
        label={l10n($curr_lang, "password")}
        bind:value={password}
      />
      <br />

      <GButton disabled={loading} onClick={handleLoginClick}>
        {l10n($curr_lang, "log-in-blurb")}
      </GButton>
      <br />

      <GButton inverted disabled={loading} onClick={() => (pubkey_login = true)}>
        {l10n($curr_lang, "keypair-login")}
      </GButton>
      <br />

      <GButton inverted disabled={loading} onClick={() => (register_open = true)}>
        {l10n($curr_lang, "register-blurb")}
      </GButton>
    {/if}
  </div>
</div>

<style>
  .wrap {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
  }

  .big-logo {
    width: 50vmin;
  }

  .form {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 2rem;
  }
</style>
