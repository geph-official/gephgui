import type { Writable } from "svelte/store";
import l10n_csv from "./l10n.csv";
import { persistentWritable } from "./prefs";
import detectNearestBrowserLocale from "detect-nearest-browser-locale";

// Languages
export type Natlang = "en" | "zh-CN" | "zh-TW" | "fa" | "ru" | "es" | "uk";

// The current language.
export const curr_lang: Writable<Natlang> = persistentWritable<Natlang>(
  "language-new-6",
  detectNearestBrowserLocale(["en", "zh-CN", "zh-TW", "fa", "ru", "es", "uk"]) as Natlang
);

type CsvRow = { label: string } & Partial<Record<Natlang, string>>;

const l10n_map: Record<string, CsvRow> = (l10n_csv as CsvRow[]).reduce(
  (prev, elem) => {
    prev[elem.label] = elem;
    return prev;
  },
  {} as Record<string, CsvRow>
);

export const l10n = (lang: Natlang, label: string) => {
  const row = l10n_map[label];
  if (!row) {
    return "!" + label + "!";
  }
  const v = row[lang] as string;
  if (v) {
    return v;
  }
  // Fallback to English if translation is missing
  return (row.en as string) || "!" + label + "!";
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
