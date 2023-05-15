<script lang="ts">
  import { Label } from "@smui/button";
  import Dialog, { Actions, Content, Header, Title } from "@smui/dialog";
  import Textfield from "@smui/textfield";
  import { AuthKind, native_gate, type AuthKeypair } from "../native-gate";
  import { curr_lang, l10n } from "../lib/l10n";
  import GButton from "../lib/GButton.svelte";
  import { onMount } from "svelte";
  import { get_credentials } from "../lib/utils";
  import { u8aToHex } from "@polkadot/util";
  import { ed25519PairFromSeed, mnemonicGenerate, mnemonicToMiniSecret } from "@polkadot/util-crypto";

  export let open: boolean;

  let captcha_soln = "";

  let captcha_data: string | null = null;
  let captcha_id: string = "";

  const load_captcha = async () => {
    let gate = await native_gate();
    const captcha = await gate.binder_rpc("get_captcha", []);
    captcha_id = captcha.captcha_id;
    captcha_data = captcha.png_data;
  };

  let error_string = "";

  const show_error = (e: string) => {
    error_string = e;
    setTimeout(() => (error_string = ""), 5000);
  };

  const generate_keys = () => {
    const phrase = mnemonicGenerate();
    const secret = mnemonicToMiniSecret(phrase);
    const { publicKey, secretKey } = ed25519PairFromSeed(secret);

    return { publicKey, secretKey };
  }

  const build_auth = (sk: Uint8Array, pk: Uint8Array): AuthKeypair => {
    return {
      kind: AuthKind.Keypair,
      sk,
      pk
    }
  }

  export let onRegisterSuccess: (sk: string) => void;

  onMount(load_captcha);
</script>

<Dialog bind:open scrimClickAction="" escapeKeyAction="">
  <Header>
    <Title id="fullscreen-title">{l10n($curr_lang, "register")}</Title>
  </Header>

  <Content>
    <div class="form">
      {#if captcha_data}
        <img
          class="captcha"
          src={"data:image/png;base64," + captcha_data}
          alt="captcha"
        />
      {:else}
        <img class="captcha" alt="empty captcha"/>
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
          let gate = await native_gate();
          let { secretKey, publicKey } = generate_keys();
          let auth = build_auth(secretKey, publicKey);
          let creds = get_credentials(auth);

          await gate.binder_rpc("register_user_v2", [
            creds,
            captcha_id,
            captcha_soln,
          ]);

          onRegisterSuccess(u8aToHex(secretKey).replace("0x", ""));
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
