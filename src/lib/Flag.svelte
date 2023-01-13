<script lang="ts">
  import * as Flags from "country-flag-icons/string/3x2";
  export let country: string;
</script>

<img
  src={"data:image/svg+xml;base64," + window.btoa(Flags[country.toUpperCase()])}
  class="flag"
/>

<style>
  .flag {
    height: 1em;
    filter: contrast(0.8);
    margin-right: 0.2rem;
    border-radius: 0.2em;
  }
</style>
