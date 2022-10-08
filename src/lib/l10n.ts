import { writable, type Writable } from "svelte/store";
import l10n_csv from "./l10n.csv";

// Languages
export type Natlang = "en" | "zh-CN" | "zh-TW";

// The current language.
export const curr_lang: Writable<Natlang> = writable("en");

interface CsvRow {
  label: string;
}

const l10n_map = (l10n_csv as CsvRow[]).reduce((prev, elem) => {
  prev[elem.label] = elem;
  return prev;
}, {});

console.log(l10n_map, l10n_map);

export const l10n = (lang: Natlang, label: string) => {
  try {
    return l10n_map[label][lang] as string;
  } catch {
    "!" + label + "!";
  }
};

export const l10n_date = (lang: Natlang, date: Date) => {
  if (lang == "en") {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } else {
    return date.toLocaleDateString(lang, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
};
