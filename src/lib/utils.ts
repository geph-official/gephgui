import { getContext, onDestroy, setContext } from "svelte";
import { cubicOut } from "svelte/easing";
import twemoji from "twemoji";
import { Keyring } from "@polkadot/keyring";
import { stringToU8a } from "@polkadot/util";
import type { Authentication, NativeGate } from "../native-gate";
import { AuthKind } from "../native-gate";
import * as blake3 from "blake3-js";

export function onInterval(callback: () => any, milliseconds: number) {
  callback();
  const interval = setInterval(callback, milliseconds);

  onDestroy(() => {
    clearInterval(interval);
  });
}

export function horizSlide(
  node,
  { delay = 0, duration = 400, easing = cubicOut, axis = "x" }
) {
  const style = getComputedStyle(node);
  const opacity = +style.opacity;
  const primary_dimension = axis === "y" ? "height" : "width";
  const primary_dimension_value = parseFloat(style[primary_dimension]);
  const secondary_dimensions =
    axis === "y" ? ["Top", "Bottom"] : ["Left", "Right"];
  const padding_start_value = parseFloat(
    style.padding + secondary_dimensions[0]
  );
  const padding_end_value = parseFloat(style.padding + secondary_dimensions[1]);
  const margin_start_value = parseFloat(style.margin + secondary_dimensions[0]);
  const margin_end_value = parseFloat(style.margin + secondary_dimensions[1]);
  const border_width_start_value = parseFloat(
    style[`border${secondary_dimensions[0]}Width`]
  );
  const border_width_end_value = parseFloat(
    style[`border${secondary_dimensions[1]}Width`]
  );
  return {
    delay,
    duration,
    easing,
    css: (t) =>
      "overflow: hidden;" +
      `opacity: ${Math.min(t * 20, 1) * opacity};` +
      `${primary_dimension}: ${t * primary_dimension_value}px;` +
      `padding-${secondary_dimensions[0].toLowerCase()}: ${t * padding_start_value
      }px;` +
      `padding-${secondary_dimensions[1].toLowerCase()}: ${t * padding_end_value
      }px;` +
      `margin-${secondary_dimensions[0].toLowerCase()}: ${t * margin_start_value
      }px;` +
      `margin-${secondary_dimensions[1].toLowerCase()}: ${t * margin_end_value
      }px;` +
      `border-${secondary_dimensions[0].toLowerCase()}-width: ${t * border_width_start_value
      }px;` +
      `border-${secondary_dimensions[1].toLowerCase()}-width: ${t * border_width_end_value
      }px;`,
  };
}

/**
 * Display emojis properly
 */
export function emojify(node: HTMLElement) {
  // setup work goes here...
  twemoji.parse(node, {
    base: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/",
  });
  return {
    destroy() {
      // ...cleanup goes here
    },
  };
}

export type Credentials = { Password: { password: string; username: string; } } | { Keypair: Keypair };

export interface Keypair {
  pubkey: Uint8Array,
  unix_secs: number,
  signature: Uint8Array,
};

export function get_credentials(auth: Authentication): Credentials {
  switch (auth.kind) {
    case AuthKind.Password: {
      return {
        Password: {
          username: auth.username,
          password: auth.password,
        }
      }
    }
    case AuthKind.Keypair: {
      return sk_to_credentials(auth.sk);
    }
  }
}

function sk_to_credentials(sk: string) {
  let keyring = new Keyring();
  let keyringPair = keyring.addFromSeed(
    stringToU8a(sk),
    { name: "geph-sk" },
    "ed25519"
  );
  let now = Date.now();
  let message = blake3
    .newKeyed("gephauth001---------------------")
    .update(now.toString())
    .finalize();
  let signature = keyringPair.sign(message);
  let pk = keyringPair.publicKey;

  return {
    Keypair: {
      pubkey: pk,
      unix_secs: now,
      signature,
    }
  };
}

export async function get_subscription_url(auth: Authentication, gate: NativeGate): Promise<string> {
  let creds = get_credentials(auth);
  return await gate.binder_rpc("get_login_url", [creds]);
}
