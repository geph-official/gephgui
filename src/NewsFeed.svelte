<div class="my-4 outer grow flex flex-col card p-3">
  <h2 class="text-primary-700 uppercase font-semibold text-sm mb-2">News</h2>
  {#each [1, 2, 3, 4, 5] as _}
    <div class="flex flex-row justify-center items-center my-1">
      <div class="grow text-sm h-9 news-left font-medium">
        Hello worldHello worldHello worldHello worldHello worldHello worldHello
        worldHello worldHello worldHello worldHello worldHello worldHello
        worldHello worldHello worldHello worldHello worldHello worldHello
        worldHello worldHello worldHello worldHello worldHello worldHello world
      </div>
      <div class="rounded bg-primary-50 ml-2">
        <div class="lol w-10 h-10"></div>
      </div>
    </div>
  {/each}
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
