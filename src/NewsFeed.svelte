<script lang="ts">
  import { curr_lang } from "./lib/l10n";
  import { native_gate } from "./native-gate";

  type NewsItem = {
    title: string;
    date: number;
    contents: string;
  };

  const fetchNews = async () => {
    const gate = await native_gate();
    const resp: any = await gate.daemon_rpc("latest_news", [$curr_lang]);
    return resp as NewsItem[];
  };

  let newsPromise = fetchNews();
</script>

<div class="my-4 outer grow flex flex-col card p-3">
  <h2 class="text-primary-700 uppercase font-semibold text-sm mb-2">News</h2>
  {#await newsPromise}
    <p>Loading news...</p>
  {:then newsItems}
    {#each newsItems as item}
      <div class="flex flex-row justify-center items-center my-1">
        <div class="grow text-sm h-9 news-left font-medium">
          {item.title}
        </div>
        <div class="rounded bg-primary-50 ml-2">
          <div class="lol w-10 h-10"></div>
        </div>
      </div>
    {/each}
  {:catch error}
    <p>Error loading news: {error.message}</p>
  {/await}
</div>

<style>
  .outer {
    overflow-y: auto;
  }

  .news-left {
    display: -webkit-box;

    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
