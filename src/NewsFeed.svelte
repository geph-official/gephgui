<script lang="ts">
  import { curr_lang, l10n } from "./lib/l10n";
  import { onMount } from "svelte";
  import { app_status } from "./lib/user";
  import CalendarRangeOutline from "svelte-material-icons/CalendarRangeOutline.svelte";
  import Popup from "./lib/Popup.svelte";

  type NewsItem = {
    title: string;
    date_unix: number;
    contents: string;
    thumbnail: string;
    important: boolean;
  };

  let latestReadDate = 0;
  let popupOpen = false;
  let currentNewsItem: NewsItem | null = null;

  onMount(() => {
    if (typeof localStorage !== "undefined") {
      const stored = localStorage.getItem("latestReadDate");
      if (stored) {
        latestReadDate = parseInt(stored) || 0;
      }
    }
  });

  const launchNews = (item: NewsItem) => {
    if (typeof localStorage !== "undefined") {
      const stored = localStorage.getItem("latestReadDate");
      const currentMax = stored ? parseInt(stored) : 0;
      if (item.date_unix > currentMax) {
        localStorage.setItem("latestReadDate", item.date_unix.toString());
        latestReadDate = item.date_unix;
      }
    }
    currentNewsItem = item;
    popupOpen = true;
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
  <div class="flex flex-col overflow-y-auto">
    {#if $app_status?.news}
      {#each $app_status.news as item}
        <button
          class={"flex rounded-lg flex-row text-left justify-center items-center mb-3 border-surface-400 p-3 py-2 border " +
            (item.date_unix > latestReadDate
              ? "unread-news text-primary-800"
              : "read-news")}
          on:click={() => launchNews(item)}
        >
          <div class="grow news-left news-content text-sm">
            <div class="font-bold">{item.title}</div>
            <div class="text-xs flex flex-row gap-2">
              <div class="flex flex-row items-center gap-[0.1rem]">
                <CalendarRangeOutline width="0.9rem" height="0.9rem" />
                {new Date(item.date_unix * 1000).toLocaleDateString(
                  $curr_lang,
                  {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  }
                )}
              </div>

              {#if item.important}
                <div>
                  <span
                    class="chip variant-ghost-warning p-[0.2rem] px-[0.3rem] text-xs"
                  >
                    {l10n($curr_lang, "important")}
                  </span>
                </div>
              {/if}
            </div>
          </div>
          {#if item.thumbnail}
            <div class="rounded bg-gray-300 ml-2">
              <img
                class="w-11 h-11 block max-w-none"
                src={item.thumbnail}
                alt="thumb"
              />
            </div>
          {/if}
        </button>
      {/each}
    {/if}
  </div>
</div>

<!-- News Popup -->
<Popup
  open={popupOpen}
  title={currentNewsItem?.title || ""}
  fullScreen={false}
  onClose={() => (popupOpen = false)}
>
  {#if currentNewsItem}
    <div class="news-content text-sm overflow-y-auto">
      {@html currentNewsItem.contents}
    </div>
  {/if}
</Popup>

<style>
  .outer {
    overflow-y: auto;
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
