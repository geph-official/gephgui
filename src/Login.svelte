<script lang="ts">
  import Snackbar, { Actions, Label } from "@smui/snackbar";
  import type { SnackbarComponentDev } from "@smui/snackbar";

  import Textfield from "@smui/textfield";
  import GButton from "./lib/GButton.svelte";
  import { curr_lang, l10n } from "./lib/l10n";
  import { pref_userpwd } from "./lib/prefs";
  import { native_gate } from "./native-gate";

  let username = "";
  let password = "";

  let errorSnack: SnackbarComponentDev;
  let snack_msg = "";

  let loading = false;
</script>

<div class="wrap">
  <Snackbar bind:this={errorSnack}>
    <Label>{snack_msg}</Label>
  </Snackbar>
  <img class="big-logo" />
  <div class="form">
    <Textfield
      variant="outlined"
      label={l10n($curr_lang, "username")}
      bind:value={username}
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
        loading = true;
        try {
          await native_gate().sync_user_info(username, password);
          $pref_userpwd = {
            username: username,
            password: password,
          };
        } catch (err) {
          snack_msg = err.toString();
          errorSnack.open();
        } finally {
          loading = false;
        }
      }}>{l10n($curr_lang, "log-in-blurb")}</GButton
    >
    <br />
    <GButton inverted disabled={loading}
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
    width: 50vw;
    height: 50vw;
    background-color: gray;
  }

  .form {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 2rem;
  }

  /* HACK */
  :global(:focus-visible) {
    outline: none;
  }
</style>
