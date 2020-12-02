import { AccountInfo } from "./redux/connState";
import { ExitInfo } from "./redux/exitState";

export async function startDaemon(
  exitName: string,
  username: string,
  password: string,
  listenAll: boolean,
  forceBridges: boolean,
  autoProxy: boolean,
  bypassChinese: boolean,
  vpn: boolean,
);

export async function stopDaemon();

export function getPlatform(): string;

export async function syncStatus(
  uname: string,
  pwd: string
): Promise<[AccountInfo, ExitInfo[]]>; 

export function startBinderProxy(): number;

export function stopBinderProxy(pid: number);

export function startUpdateChecks(l10n: any);

export function getVersion(): string;
