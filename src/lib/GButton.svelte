<script lang="ts">
  export let color: "primary" | "secondary" | "warning" | "black" | "green" =
    "primary";
  export let inverted = false;
  export let stretch = false;
  export let large = false;
  export let disabled = false;
  import Ripple from "@smui/ripple";

  export let onClick = () => {};
</script>

<button
  use:Ripple={{ surface: true && !disabled }}
  class:secondary={color == "secondary"}
  class:warning={color == "warning"}
  class:green={color == "green"}
  class:black={color == "black"}
  class:inverted
  class:stretch
  class:large
  class:disabled
  {disabled}
  on:click={onClick}
>
  <slot />
</button>

<style>
  button {
    font-size: 1rem;
    background-color: var(--mdc-theme-primary);
    color: white;
    border-radius: 0.4rem;
    padding: 0.5em;
    padding-left: 0.7em;
    padding-right: 0.7em;
    font-weight: 500;
    font-family: inherit;

    border: none;
  }

  .disabled {
    opacity: 0.5;
  }

  .stretch {
    width: 100%;
  }

  .large {
    font-size: 1.1rem;
    font-weight: 400;
  }

  button.inverted {
    background-color: white;
    border: 1px solid var(--mdc-theme-primary);
    color: var(--mdc-theme-primary);
  }

  button.inverted.black {
    background-color: white;
    border: 1px solid black;
    color: black;
  }

  button.warning {
    background-color: var(--mdc-theme-error);
  }

  button.green {
    background-color: rgb(30, 112, 30);
  }

  button.warning.inverted {
    background-color: white;
    border: 1px solid var(--mdc-theme-error);
    color: var(--mdc-theme-error);
  }
</style>
