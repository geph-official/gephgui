<script lang="ts">
  import { native_gate } from "./native-gate";
  import { extractFromXml } from "@extractus/feed-extractor";
  import { detect, detectAll } from "tinyld/heavy";
  import { curr_lang, l10n_date } from "./lib/l10n";

  export let announces: any[];

  const isCurrentLanguage = (line: string) => {
    if ($curr_lang === "en") {
      return detect(line) == "en";
    } else if ($curr_lang.includes("zh")) {
      return detect(line) == "zh" || detect(line) == "ja";
    } else if ($curr_lang.includes("fa")) {
      return detect(line) == "fa";
    } else {
      return true;
    }
  };

  const cleanItem = (item: any) => {
    let lala = item.description
      .replaceAll("<p>", '<p dir="auto">')
      .split("<br>")
      .filter((line) => {
        console.log("detect", line, detect(line));
        return line.length == 0 || isCurrentLanguage(line);
      })
      .map((line) => line.trim())
      .join("<br>")
      .replaceAll(/(<br>)(<br>)+/g, "<br><br>")
      .replaceAll(/^(<br>)*|(<br>)*$/g, "");
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
