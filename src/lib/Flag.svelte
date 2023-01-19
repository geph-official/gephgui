<script lang="ts">
  import * as Flags from "country-flag-icons/string/3x2";
  export let country: string;
  export let large = false;
</script>

<img
  src={"data:image/svg+xml;base64," + window.btoa(Flags[country.toUpperCase()])}
  class="flag"
  class:large
/>

<style>
  .flag {
    height: 1em;
    filter: contrast(0.8);
    margin-inline-end: 0.2rem;
    border-radius: 0.2em;
  }

  .large {
    height: 1.5rem;
  }
</style>
