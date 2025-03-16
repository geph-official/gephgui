import type { CustomThemeConfig } from "@skeletonlabs/tw-plugin";

export const customTheme: CustomThemeConfig = {
  name: "custom-theme",
  properties: {
    // =~= Theme Properties =~=
    "--theme-font-family-base": `system-ui`,
    "--theme-font-family-heading": `system-ui`,
    "--theme-font-color-base": "7 54 66",
    "--theme-font-color-dark": "253 246 227",
    "--theme-rounded-base": "8px",
    "--theme-rounded-container": "8px",
    "--theme-border-base": "1px",
    // =~= Theme On-X Colors =~=
    "--on-primary": "253 246 227",
    "--on-secondary": "253 246 227",
    "--on-tertiary": "7 54 66",
    "--on-success": "253 246 227",
    "--on-warning": "7 54 66",
    "--on-error": "253 246 227",
    "--on-surface": "253 246 227",
    // =~= Theme Colors  =~=
    // primary | #6bc8c8
    "--color-primary-50": "217 243 243", // #d9f3f3
    "--color-primary-100": "204 239 239", // #ccefef
    "--color-primary-200": "191 235 235", // #bfebeb
    "--color-primary-300": "153 222 222", // #99dede
    "--color-primary-400": "77 198 198", // #4dc6c6
    "--color-primary-500": "0 173 173", // #00adad
    "--color-primary-600": "0 156 156", // #009c9c
    "--color-primary-700": "0 130 130", // #008282
    "--color-primary-800": "0 104 104", // #006868
    "--color-primary-900": "0 85 85", // #005555
    // secondary | #4F46E5
    "--color-secondary-50": "229 227 251", // #e5e3fb
    "--color-secondary-100": "220 218 250", // #dcdafa
    "--color-secondary-200": "211 209 249", // #d3d1f9
    "--color-secondary-300": "185 181 245", // #b9b5f5
    "--color-secondary-400": "132 126 237", // #847eed
    "--color-secondary-500": "79 70 229", // #4F46E5
    "--color-secondary-600": "71 63 206", // #473fce
    "--color-secondary-700": "59 53 172", // #3b35ac
    "--color-secondary-800": "47 42 137", // #2f2a89
    "--color-secondary-900": "39 34 112", // #272270
    // tertiary | #0EA5E9
    "--color-tertiary-50": "219 242 252", // #dbf2fc
    "--color-tertiary-100": "207 237 251", // #cfedfb
    "--color-tertiary-200": "195 233 250", // #c3e9fa
    "--color-tertiary-300": "159 219 246", // #9fdbf6
    "--color-tertiary-400": "86 192 240", // #56c0f0
    "--color-tertiary-500": "14 165 233", // #0EA5E9
    "--color-tertiary-600": "13 149 210", // #0d95d2
    "--color-tertiary-700": "11 124 175", // #0b7caf
    "--color-tertiary-800": "8 99 140", // #08638c
    "--color-tertiary-900": "7 81 114", // #075172
    // success | #007b43
    "--color-success-50": "217 235 227", // #d9ebe3
    "--color-success-100": "204 229 217", // #cce5d9
    "--color-success-200": "191 222 208", // #bfded0
    "--color-success-300": "153 202 180", // #99cab4
    "--color-success-400": "77 163 123", // #4da37b
    "--color-success-500": "0 123 67", // #007b43
    "--color-success-600": "0 111 60", // #006f3c
    "--color-success-700": "0 92 50", // #005c32
    "--color-success-800": "0 74 40", // #004a28
    "--color-success-900": "0 60 33", // #003c21
    // warning | #EAB308
    "--color-warning-50": "252 244 218", // #fcf4da
    "--color-warning-100": "251 240 206", // #fbf0ce
    "--color-warning-200": "250 236 193", // #faecc1
    "--color-warning-300": "247 225 156", // #f7e19c
    "--color-warning-400": "240 202 82", // #f0ca52
    "--color-warning-500": "234 179 8", // #EAB308
    "--color-warning-600": "211 161 7", // #d3a107
    "--color-warning-700": "176 134 6", // #b08606
    "--color-warning-800": "140 107 5", // #8c6b05
    "--color-warning-900": "115 88 4", // #735804
    // error | #D41976
    "--color-error-50": "249 221 234", // #f9ddea
    "--color-error-100": "246 209 228", // #f6d1e4
    "--color-error-200": "244 198 221", // #f4c6dd
    "--color-error-300": "238 163 200", // #eea3c8
    "--color-error-400": "225 94 159", // #e15e9f
    "--color-error-500": "212 25 118", // #D41976
    "--color-error-600": "191 23 106", // #bf176a
    "--color-error-700": "159 19 89", // #9f1359
    "--color-error-800": "127 15 71", // #7f0f47
    "--color-error-900": "104 12 58", // #680c3a
    // surface | #af9b64
    "--color-surface-50": "243 240 232", // #f3f0e8
    "--color-surface-100": "239 235 224", // #efebe0
    "--color-surface-200": "235 230 216", // #ebe6d8
    "--color-surface-300": "223 215 193", // #dfd7c1
    "--color-surface-400": "199 185 147", // #c7b993
    "--color-surface-500": "175 155 100", // #af9b64
    "--color-surface-600": "158 140 90", // #9e8c5a
    "--color-surface-700": "131 116 75", // #83744b
    "--color-surface-800": "105 93 60", // #695d3c
    "--color-surface-900": "86 76 49", // #564c31
  },
};
