<script lang="ts">
  import Textfield from "@smui/textfield";
  import GButton from "./lib/GButton.svelte";
  import { curr_lang, l10n } from "./lib/l10n";
  import { pref_userpwd } from "./lib/prefs";
  import { native_gate } from "./native-gate";
  import Register from "./login/Register.svelte";

  import { runWithSpinner, showErrorModal } from "./lib/modals";

  let username = "";
  let password = "";

  let loading = false;

  let register_open = false;

  const translateError = (err: string) => {
    if (err.includes("invalid")) {
      return l10n($curr_lang, "invalid-username-or-password");
    } else if (err.includes("429")) {
      return l10n($curr_lang, "login-server-overloaded");
    } else {
      return err;
    }
  };
</script>

<div class="wrap">
  {#if register_open}
    <Register
      bind:open={register_open}
      onRegisterSuccess={(u, p) => {
        console.log(u, p);
        username = u;
        password = p;
      }}
    />
  {/if}
  <img class="big-logo" src="gephlogo.png" />
  <div class="form">
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
    <GButton
      disabled={loading}
      onClick={async () => {
        await runWithSpinner(
          l10n($curr_lang, "logging-in") + "...",
          0,
          async () => {
            loading = true;
            try {
              await (await native_gate()).sync_user_info(username, password);
              $pref_userpwd = {
                username: username,
                password: password,
              };
            } catch (err) {
              await showErrorModal(translateError(err.toString()));
            } finally {
              loading = false;
            }
          }
        );
      }}>{l10n($curr_lang, "log-in-blurb")}</GButton
    >
    <br />
    <GButton inverted disabled={loading} onClick={() => (register_open = true)}
      >{l10n($curr_lang, "register-blurb")}</GButton
    >
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
