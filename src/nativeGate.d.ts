import { ExitInfo } from "./redux/connState";

export async function startDaemon(
  exitName: string,
  exitKey: string,
  username: string,
  password: string,
  listenAll: boolean,
  forceBridges: boolean,
  autoProxy: boolean,
  bypassChinese: boolean
);

export async function stopDaemon();

export function getPlatform(): string;

export async function syncStatus(
  uname: string,
  pwd: string
): [AccountInfo, ExitInfo[]];

export function startBinderProxy(): number;

export function stopBinderProxy(pid: number);

export function startUpdateChecks(l10n: any);

export function getVersion(): string;
