<script lang="ts">
  import type { Snippet } from "svelte";
  import { CaretDown, CaretUp } from "phosphor-svelte";

  interface Props {
    collapse?: boolean;
    disabled?: boolean;
    open?: boolean;
    onclick?: (event: MouseEvent | KeyboardEvent) => void;
    icon?: Snippet;
    description?: Snippet;
    control?: Snippet;
    details?: Snippet;
  }

  let {
    collapse = false,
    disabled = false,
    open = false,
    onclick,
    icon,
    description,
    control,
    details,
  }: Props = $props();
</script>

{#if collapse}
  <button
    type="button"
    class="setting clicky"
    class:disabled
    onclick={onclick}
  >
    <div class="icon">{@render icon?.()}</div>
    <div class="desc">{@render description?.()}</div>
    <div class="switch">
      {#if open}
        <CaretUp size="1.4rem" />
      {:else}
        <CaretDown size="1.4rem" />
      {/if}
    </div>
  </button>
{:else}
  <div class="setting" class:disabled>
    <div class="icon">{@render icon?.()}</div>
    <div class="desc">{@render description?.()}</div>
    <div class="switch">
      {@render control?.()}
    </div>
  </div>
{/if}

{#if open}
  <div class="inner">
    {@render details?.()}
  </div>
{/if}

<style>
  .clicky {
    cursor: pointer;
  }

  .disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .setting {
    background: none;
    border: 0;
    color: inherit;
    display: flex;
    align-items: center;
    flex-direction: row;
    font: inherit;
    justify-content: space-between;
    margin-bottom: 1rem;
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
    padding: 0;
    text-align: left;
    width: 100%;
  }

  .icon {
    width: 2rem;
    opacity: 0.8;
  }

  .switch {
    display: flex;
    align-items: center;
  }

  .desc {
    flex-grow: 1;
  }

  .inner {
    margin-top: -0.8rem;
    margin-bottom: 0.5rem;
  }
</style>
