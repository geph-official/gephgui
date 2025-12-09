declare module "*.csv" {
  const value: Record<string, string>[];
  export default value;
}

declare module "detect-nearest-browser-locale" {
  export default function detectNearestBrowserLocale(
    supported: string[],
    defaultLocale?: string
  ): string;
}
