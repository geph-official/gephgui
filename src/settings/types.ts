import type { Component } from "svelte";
import type { Writable } from "svelte/store";

export type SettingIcon = Component<{ size?: string | number }>;

export type CheckboxSetting = {
  type: "checkbox";
  description: string;
  icon?: SettingIcon;
  store: Writable<boolean>;
  blurb?: string;
  disabled?: boolean;
  tag?: string;
  onToggle?: (value: boolean) => void;
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

export type Setting = CheckboxSetting | CollapseSetting;
