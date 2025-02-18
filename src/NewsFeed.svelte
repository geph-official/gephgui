<script lang="ts">
  import {
    AppBar,
    getModalStore,
    type ModalSettings,
  } from "@skeletonlabs/skeleton";
  import { curr_lang } from "./lib/l10n";
  import { native_gate } from "./native-gate";
  import Close from "svelte-material-icons/Close.svelte";
  import { fly } from "svelte/transition";

  type NewsItem = {
    title: string;
    date: number;
    contents: string;
    thumbnail: string;
  };

  const fetchNews = async () => {
    const gate = await native_gate();
    const resp: any = await gate.daemon_rpc("latest_news", [$curr_lang]);
    return resp as NewsItem[];
  };

  let newsPromise = fetchNews();
  const modalStore = getModalStore();

  const launchNews = (item: NewsItem) => {
    const modal: ModalSettings = {
      type: "alert",
      title: item.title,
      body: item.contents,
    };
    modalStore.trigger(modal);
  };
</script>

<div class="my-4 outer grow flex flex-col card p-3">
  <h2 class="text-primary-700 uppercase font-semibold text-sm mb-2">News</h2>
  {#await newsPromise}
    <p>Loading news...</p>
  {:then newsItems}
    {#each newsItems as item}
      <div
        class="flex flex-row justify-center items-center my-1"
        on:click={() => launchNews(item)}
      >
        <div class="grow text-sm h-9 news-left">
          <span class="font-medium">{item.title}</span>:
          <span>{@html item.contents}</span>
        </div>
        <div class="rounded bg-gray-300 ml-2">
          <img
            class="w-10 h-10 block max-w-none"
            src={item.thumbnail}
            alt="thumb"
          />
        </div>
      </div>
    {/each}
  {:catch error}
    <p>Error loading news: {error.message}</p>
  {/await}
</div>

<!-- News Modal -->
<!-- {#if selectedNews}
  <div
    class="fixed inset-0 bg-black bg-opacity-50 z-50"
    transition:fly={{ y: 20, duration: 300 }}
  >
    <div class="bg-surface-50 h-full flex flex-col">
      <AppBar padding="p-2">
        <svelte:fragment slot="lead">
          <button class="p-2" on:click={() => (selectedNews = null)}>
            <Close size="1.5rem" />
          </button>
        </svelte:fragment>
        <b>{selectedNews.title}</b>
      </AppBar>

      <div class="w-full p-6">
        <img
          class="w-full h-full object-cover"
          src={selectedNews.thumbnail}
          alt="thumb"
        />
      </div>
      <div class="m-3">
        <h1 class="font-bold text-2xl my-3">{selectedNews.title}</h1>
        {@html selectedNews.contents}
      </div>
    </div>
  </div>
{/if} -->

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
