<script lang="ts">
  import Button, { Label } from "@smui/button";

  import Dialog, { Actions, Content, Header, Title } from "@smui/dialog";
  import Textfield from "@smui/textfield";
  import { native_gate } from "../native-gate";
  import { curr_lang, l10n } from "../lib/l10n";
  import GButton from "../lib/GButton.svelte";
  import { onMount } from "svelte";
  import { prevent_default } from "svelte/internal";

  export let open: boolean;
  let username = "";
  let password = "";
  let captcha_soln = "";

  let captcha_data: string | null = null;
  let captcha_id: string = "";
  const load_captcha = async () => {
    const captcha = await native_gate().binder_rpc("get_captcha", []);
    captcha_id = captcha.captcha_id;
    captcha_data = captcha.png_data;
  };

  let error_string = "";

  const show_error = (e: string) => {
    error_string = e;
    setTimeout(() => (error_string = ""), 5000);
  };

  export let onRegisterSuccess: (username: string, password: string) => void;

  onMount(load_captcha);
</script>

<Dialog bind:open scrimClickAction="" escapeKeyAction="">
  <Header
    ><Title id="fullscreen-title">{l10n($curr_lang, "register")}</Title></Header
  >
  <Content>
    <div class="form">
      <Textfield
        variant="outlined"
        label={l10n($curr_lang, "username")}
        bind:value={username}
      />
      <div class="divider" />
      <Textfield
        variant="outlined"
        type="password"
        label={l10n($curr_lang, "password")}
        bind:value={password}
      />
      <div class="divider" />
      {#if captcha_data}
        <img
          class="captcha"
          src={"data:image/png;base64," + captcha_data}
        />{:else}
        <img class="captcha" />
      {/if}
      <div class="divider" />
      <Textfield
        variant="outlined"
        type="numeric"
        label={l10n($curr_lang, "captcha")}
        bind:value={captcha_soln}
      />
      {#if error_string !== ""}
        <div class="error">{error_string}</div>
      {/if}
    </div>
  </Content>
  <Actions>
    <GButton
      onClick={() => {
        open = false;
      }}
      inverted
    >
      <Label>{l10n($curr_lang, "cancel")}</Label>
    </GButton>
    &nbsp;
    <GButton
      onClick={async () => {
        try {
          await native_gate().binder_rpc("register_user", [
            username,
            password,
            captcha_id,
            captcha_soln,
          ]);
          onRegisterSuccess(username, password);
          open = false;
        } catch (e) {
          show_error(e.toString());
        }
      }}
    >
      <Label>{l10n($curr_lang, "register")}</Label>
    </GButton>
  </Actions>
</Dialog>

<style>
  .form {
    display: flex;
    flex-direction: column;
  }

  .error {
    background-color: var(--mdc-theme-error);
    color: white;
    padding: 1rem;
    margin-top: 1rem;
    border-radius: 0.5rem;
    font-size: 100%;
  }

  .divider {
    height: 1rem;
  }

  .captcha {
    width: 100%;
    height: 5rem;
  }
</style>
