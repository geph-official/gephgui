import type { Writable } from "svelte/store";
import l10n_csv from "./l10n.csv";
import { persistentWritable } from "./prefs";
import detectNearestBrowserLocale from "detect-nearest-browser-locale";

// Languages
export type Natlang = "en" | "zh-CN" | "zh-TW" | "fa" | "x-slv-la" | "x-slv-cy";

// The current language.
export const curr_lang: Writable<Natlang> = persistentWritable(
  "language",
  detectNearestBrowserLocale(["en", "zh-CN", "zh-TW"])
);

interface CsvRow {
  label: string;
}

const l10n_map = (l10n_csv as CsvRow[]).reduce((prev, elem) => {
  prev[elem.label] = elem;
  return prev;
}, {});

console.log(l10n_map, l10n_map);

export const l10n = (lang: Natlang, label: string) => {
  console.log("l10n", lang, label);
  let v = l10n_map[label][lang] as string;
  return v || "!" + label + "!";
};

export const l10n_date = (lang: Natlang, d: Date) => {
  if (lang == "en") {
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } else {
    return d.toLocaleDateString(lang, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
};
