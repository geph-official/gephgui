import type { CustomThemeConfig } from "@skeletonlabs/tw-plugin";

export const darkTheme: CustomThemeConfig = {
  name: "dark-theme",
  properties: {
    // =~= Theme Properties =~=
    "--theme-font-family-base": `system-ui`,
    "--theme-font-family-heading": `system-ui`,

    /*
		  Solarized Dark typically uses base0 or base1 for normal text on base03.
		  base0 = #839496  => (131,148,150)
		  base1 = #93a1a1 => (147,161,161)

		  Below, we’ll choose base0 for normal text, and keep the old “dark” color
		  as a fallback where you need a darker text on a light background.
		*/
    "--theme-font-color-base": "238 232 213", // #839496
    "--theme-font-color-dark": "7 54 66", // #073642

    "--theme-rounded-base": "8px",
    "--theme-rounded-container": "8px",
    "--theme-border-base": "1px",

    // =~= Theme On-X Colors =~=
    /*
		  “on-primary”, etc. = the text color that appears *on top of* that color.
		  For a dark theme, if your accent color is light or medium, pick something dark (#073642);
		  if your accent color is dark, pick something light (#fdf6e3). Below is a reasonable
		  inversion of your light theme’s on-colors.
		*/
    /*
      It should be a lighter color.
      Currently, the news section in new update (version 5) in dark mode, the text color isn't good and recognizable.
    */
    "--on-primary": "7 54 66", // #073642
    "--on-secondary": "238 232 213", // #fdf6e3
    "--on-tertiary": "7 54 66",
    "--on-success": "238 232 213",
    "--on-warning": "7 54 66",
    "--on-error": "7 54 66",
    "--on-surface": "238 232 213", // text on top of a dark surface

    // =~= Theme Colors  =~=253 246
    // Keeping the same brand palettes for primary / secondary / tertiary / success / etc.
    // so that your “branding” doesn’t unexpectedly change in dark mode.

    // primary | #6bc8c8
    "--color-primary-50": "217 243 243",
    "--color-primary-100": "204 239 239",
    "--color-primary-200": "191 235 235",
    "--color-primary-300": "153 222 222",
    "--color-primary-400": "77 198 198",
    "--color-primary-500": "0 173 173",
    "--color-primary-600": "0 156 156",
    "--color-primary-700": "0 130 130",
    "--color-primary-800": "0 104 104",
    "--color-primary-900": "0 85 85",

    // secondary | #4F46E5
    "--color-secondary-50": "229 227 251",
    "--color-secondary-100": "220 218 250",
    "--color-secondary-200": "211 209 249",
    "--color-secondary-300": "185 181 245",
    "--color-secondary-400": "132 126 237",
    "--color-secondary-500": "79 70 229",
    "--color-secondary-600": "71 63 206",
    "--color-secondary-700": "59 53 172",
    "--color-secondary-800": "47 42 137",
    "--color-secondary-900": "39 34 112",

    // tertiary | #0EA5E9
    "--color-tertiary-50": "219 242 252",
    "--color-tertiary-100": "207 237 251",
    "--color-tertiary-200": "195 233 250",
    "--color-tertiary-300": "159 219 246",
    "--color-tertiary-400": "86 192 240",
    "--color-tertiary-500": "14 165 233",
    "--color-tertiary-600": "13 149 210",
    "--color-tertiary-700": "11 124 175",
    "--color-tertiary-800": "8 99 140",
    "--color-tertiary-900": "7 81 114",

    // success | #007b43
    "--color-success-50": "217 235 227",
    "--color-success-100": "204 229 217",
    "--color-success-200": "191 222 208",
    "--color-success-300": "153 202 180",
    "--color-success-400": "77 163 123",
    "--color-success-500": "0 123 67",
    "--color-success-600": "0 111 60",
    "--color-success-700": "0 92 50",
    "--color-success-800": "0 74 40",
    "--color-success-900": "0 60 33",

    // warning | #EAB308
    "--color-warning-50": "252 244 218",
    "--color-warning-100": "251 240 206",
    "--color-warning-200": "250 236 193",
    "--color-warning-300": "247 225 156",
    "--color-warning-400": "240 202 82",
    "--color-warning-500": "234 179 8",
    "--color-warning-600": "211 161 7",
    "--color-warning-700": "176 134 6",
    "--color-warning-800": "140 107 5",
    "--color-warning-900": "115 88 4",

    // error | #D41976
    "--color-error-50": "249 221 234",
    "--color-error-100": "246 209 228",
    "--color-error-200": "244 198 221",
    "--color-error-300": "238 163 200",
    "--color-error-400": "225 94 159",
    "--color-error-500": "212 25 118",
    "--color-error-600": "191 23 106",
    "--color-error-700": "159 19 89",
    "--color-error-800": "127 15 71",
    "--color-error-900": "104 12 58",

    // surface (replaced by Solarized Dark ramp)
    /*
		  Typically for a dark theme, you want surface to start at base03 (#002b36)
		  as the darkest (50) and climb toward base3 (#fdf6e3) as the lightest (900).
		*/
    "--color-surface-50": "0 43 54", // #002b36 (base03)
    "--color-surface-100": "7 54 66", // #073642 (base02)
    "--color-surface-200": "88 110 117", // #586e75 (base01)
    "--color-surface-300": "101 123 131", // #657b83 (base00)
    "--color-surface-400": "131 148 150", // #839496 (base0)
    "--color-surface-500": "147 161 161", // #93a1a1 (base1)
    "--color-surface-600": "238 232 213", // #eee8d5 (base2)
    "--color-surface-700": "238 232 213", // #fdf6e3 (base3)
    // two extra “lighter” steps if needed:
    "--color-surface-800": "238 232 213",
    "--color-surface-900": "238 232 213",
  },
};
