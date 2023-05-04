<script lang="ts">
  import { detect, detectAll } from "tinyld";
  import { curr_lang, l10n_date } from "./lib/l10n";
  import memoize from "memoizee";
  export let announces: any[];

  const detectMemoized = memoize(detect);

  const isCurrentLanguage = (line: string) => {
    if ($curr_lang === "en") {
      return detectMemoized(line) == "en";
    } else if ($curr_lang.includes("zh")) {
      return (
        detectMemoized(line) == "zh" ||
        detectMemoized(line) == "ja" ||
        detectMemoized(line) == "sr"
      );
    } else if ($curr_lang.includes("fa")) {
      return detectMemoized(line) == "fa";
    } else {
      return true;
    }
  };

  const cleanItem = (item: any) => {
    let lala = item.description
      .replace("<p>", '<p dir="auto">')
      .split("<br>")
      .filter((line) => {
        console.log("detect", line, detectMemoized(line));
        return line.length == 0 || isCurrentLanguage(line);
      })
      .map((line) => line.trim())
      .join("<br>")
      .replace(/(<br>)(<br>)+/g, "<br><br>")
      .replace(/^(<br>)*|(<br>)*$/g, "")
      .replace(/onclick=.*\"/g, "");
    console.log(lala);
    return lala;
  };
</script>

<div class="outer">
  {#each announces as item}
    {#if cleanItem(item).length > 0}
      <div class="announce-card">
        <div class="content">
          {@html cleanItem(item)}
        </div>
        <div class="dateline">
          {l10n_date($curr_lang, new Date(item.pubDate))}
        </div>
      </div>
    {/if}
  {/each}
</div>

<style>
  .outer {
    background-color: #eee;
    display: flex;
    flex-direction: column;
    padding-top: 1rem;
  }
  .announce-card {
    border: 1px solid #ccc;
    border-radius: 1rem;
    padding: 1rem;
    margin: 1rem;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
    font-size: 90%;
    background-color: white;
  }

  .dateline {
    font-size: 90%;
    font-weight: 500;
    opacity: 0.67;
    margin-top: 1rem;
    float: right;
  }

  .announce-card :global(p) {
    padding: 0;
    margin: 0;
  }

  .announce-card :global(video) {
    display: none;
  }

  .announce-card :global(img) {
    display: none;
  }

  .announce-card :global(blockquote) {
    display: none;
  }
</style>
