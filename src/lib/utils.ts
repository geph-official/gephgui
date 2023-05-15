import { getContext, onDestroy, setContext } from "svelte";
import { cubicOut } from "svelte/easing";
import twemoji from "twemoji";
import { Keyring } from "@polkadot/keyring";
import type { Keypair } from '@polkadot/util-crypto/types';
import { hexToU8a, u8aToHex } from "@polkadot/util";
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

export type RpcAuthKind = { Password: { password: string; username: string; } } | { Signature: { sk: string; } };

export type Credentials = { Password: { password: string; username: string; } } | { Signature: SignatureCreds };

export interface SignatureCreds {
  pubkey: string,
  unix_secs: number,
  signature: number[],
};

export function get_rpc_authkind(auth: Authentication): RpcAuthKind {
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
      return { 
        Signature: {
          sk: u8aToHex(auth.sk).replace("0x", ""),
        } 
      }
    }
  }
}

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
      return keypair_to_credentials(auth.sk, auth.pk);
    }
  }
}

function keypair_to_credentials(secretKey: Uint8Array, publicKey: Uint8Array): Credentials {
  const keypair: Keypair = {
    secretKey,
    publicKey,
  };
  const keyring = new Keyring({ type: "ed25519" });
  const signer = keyring.createFromPair(keypair);

  const unix_secs = Math.floor(Date.now() / 1000);
  let unix_secs_bytes = hexToU8a(unix_secs.toString(16));
  // have to turn Uint8Array into an Array in order to use unshift
  let normal_array = Array.from(unix_secs_bytes);
  while (normal_array.length < 8) {
    normal_array.unshift(0);
  }
  const unix_secs_bytes_padded = new Uint8Array(normal_array);

  const message = blake3
    .newKeyed("gephauth001---------------------")
    .update(unix_secs_bytes_padded)
    .finalize();

  const pubkey = u8aToHex(keypair.publicKey).replace("0x", "");
  // Uint8Array -> hex string -> number[] byte array
  let signature = u8aToHex(signer.sign(message)).replace("0x", "").match(/.{1,2}/g)?.map(pair => parseInt(pair, 16))!;

  return {
    Signature: {
      pubkey,
      unix_secs,
      signature,
    }
  };
}

export async function get_subscription_url(auth: Authentication, gate: NativeGate): Promise<unknown> {
  let creds = get_credentials(auth);
  return await gate.binder_rpc("get_login_url", [creds]);
}
