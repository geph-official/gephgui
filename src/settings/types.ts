import type { Component } from "svelte";
import type { Writable } from "svelte/store";

export type SettingIcon = Component<{ size?: string | number }>;

export type CheckboxSetting = {
  type: "checkbox";
  description: string;
  icon?: SettingIcon;
  store: Writable<boolean>;
  // Sub-settings, shown only while the checkbox is on.
  inner?: Setting[];
  blurb?: string;
  disabled?: boolean;
  tag?: string;
  onToggle?: (value: boolean) => void;
  onClickDisabled?: () => void;
};

export type NumberSetting = {
  type: "number";
  description: string;
  icon?: SettingIcon;
  store: Writable<number>;
  min?: number;
  max?: number;
  blurb?: string;
  disabled?: boolean;
  tag?: string;
  onChange?: (value: number) => void;
  onClickDisabled?: () => void;
};

export type CollapseSetting = {
  type: "collapse";
  description: string;
  icon?: SettingIcon;
  inner: Setting[];
  blurb?: string;
  disabled?: boolean;
  tag?: string;
  onClickDisabled?: () => void;
};

// A read-only row displaying asynchronously fetched values.
export type InfoSetting = {
  type: "info";
  description: string;
  icon?: SettingIcon;
  values: () => Promise<string[]>;
  blurb?: string;
  disabled?: boolean;
  tag?: string;
  onClickDisabled?: () => void;
};

export type Setting =
  | CheckboxSetting
  | CollapseSetting
  | NumberSetting
  | InfoSetting;
