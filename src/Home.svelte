<script lang="ts">
  import UserInfo from "./home/UserInfo.svelte";
  import { pref_userpwd } from "./lib/prefs";
</script>

<div class="home">
  <UserInfo
    username={$pref_userpwd.username}
    password={$pref_userpwd.password}
  />
</div>

<style>
  .home {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 1rem;
  }
</style>
