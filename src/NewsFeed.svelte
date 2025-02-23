<script lang="ts">
  import {
    AppBar,
    ProgressBar,
    getModalStore,
    getToastStore,
    type ModalSettings,
  } from "@skeletonlabs/skeleton";
  import { curr_lang, l10n } from "./lib/l10n";
  import { native_gate } from "./native-gate";
  import Close from "svelte-material-icons/Close.svelte";
  import { fly } from "svelte/transition";
  import { onMount } from "svelte";
  import { showToast } from "./lib/utils";

  type NewsItem = {
    title: string;
    date: number;
    contents: string;
    thumbnail: string;
    important: boolean;
  };

  let latestReadDate = 0;

  onMount(() => {
    if (typeof localStorage !== "undefined") {
      const stored = localStorage.getItem("latestReadDate");
      if (stored) {
        latestReadDate = parseInt(stored) || 0;
      }
    }
  });

  const toastStore = getToastStore();

  const fetchNews = async () => {
    for (;;) {
      try {
        const gate = await native_gate();
        const resp: NewsItem[] = (await gate.daemon_rpc("latest_news", [
          $curr_lang,
        ])) as any as NewsItem[];
        resp.forEach((news) => {
          if (news.date > latestReadDate && news.important) {
            launchNews(news);
          }
        });
        return resp;
      } catch (e: any) {
        showToast(toastStore, e.toString());
      }
    }
  };

  const modalStore = getModalStore();

  const launchNews = (item: NewsItem) => {
    if (typeof localStorage !== "undefined") {
      const stored = localStorage.getItem("latestReadDate");
      const currentMax = stored ? parseInt(stored) : 0;
      if (item.date > currentMax) {
        localStorage.setItem("latestReadDate", item.date.toString());
        latestReadDate = item.date;
      }
    }
    const modal: ModalSettings = {
      type: "alert",
      title: item.title,
      body:
        "<div class='overflow-y-auto max-h-[200px] text-sm news-content'>" +
        item.contents +
        "</div>",
    };
    modalStore.trigger(modal);
  };

  const stripParagraphs = (s: string) => {
    return s
      .replaceAll("<p>", "")
      .replaceAll("</p>", " ")
      .replaceAll("<br>", " ")
      .replaceAll("<br/>", " ");
  };
</script>

<div class="my-4 outer grow flex flex-col card p-3">
  <h2 class="text-primary-700 uppercase font-semibold text-sm mb-2">
    {l10n($curr_lang, "news")}
  </h2>
  {#key $curr_lang}
    {#await fetchNews()}
      <ProgressBar />
    {:then newsItems}
      {#each newsItems as item}
        <div
          class={"flex flex-row justify-center items-center my-1 " +
            (item.date > latestReadDate
              ? "unread-news text-primary-800"
              : "read-news")}
          on:click={() => launchNews(item)}
        >
          <div class="grow text-sm h-10 news-left news-content">
            <span class="font-bold">{item.title}</span>:
            <span>{@html stripParagraphs(item.contents)}</span>
          </div>
          <!-- <div class="rounded bg-gray-300 ml-2">
        <img
          class="w-10 h-10 block max-w-none"
          src={item.thumbnail}
          alt="thumb"
        />
      </div> -->
        </div>
      {/each}
    {/await}
  {/key}
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

  :global(.news-content p) {
    margin-bottom: 1rem;
  }

  :global(.news-content a) {
    color: rgb(var(--color-primary-600));
  }

  /* Pulsate animation for unread items */
  @keyframes pulsate {
    0% {
      opacity: 0.5;
      color: inherit;
    }
    50% {
      opacity: 1;
      /* color: maroon; */
    }
    100% {
      opacity: 0.5;
      color: inherit;
    }
  }

  .unread-news .news-content {
    animation: pulsate 2s infinite ease-in-out;
    font-weight: 500;
  }
</style>
