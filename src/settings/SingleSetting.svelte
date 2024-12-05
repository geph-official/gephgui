<script lang="ts">
  export let collapse = false;
  import ChevronDown from "svelte-material-icons/ChevronDown.svelte";
  import ChevronUp from "svelte-material-icons/ChevronUp.svelte";

  let open = false;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  class="setting"
  class:clicky={collapse}
  on:click={() => {
    if (collapse) {
      open = !open;
    }
  }}
>
  <div class="icon"><slot name="icon" /></div>
  <div class="desc"><slot name="description" /></div>
  {#if !collapse}
    <div class="switch">
      <slot name="switch" />
    </div>
  {:else}
    <div class="switch">
      {#if open}
        <ChevronUp size="1.4rem" />
      {:else}
        <ChevronDown size="1.4rem" />
      {/if}
    </div>
  {/if}
</div>

{#if open}
  <div class="inner">
    <slot name="collapse" />
  </div>
{/if}

<style>
  .clicky {
    cursor: pointer;
  }
  .setting {
    display: flex;
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    margin-bottom: 1rem;
    width: 100%;
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
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
