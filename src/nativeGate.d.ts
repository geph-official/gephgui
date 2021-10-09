import { AccountInfo } from "./redux/connState";
import { ExitInfo } from "./redux/exitState";

export async function startDaemon(
  exitName: string,
  username: string,
  password: string,
  listenAll: boolean,
  forceBridges: boolean,
  useTcp: boolean,
  autoProxy: boolean,
  bypassChinese: boolean,
  vpn: boolean,
  excludeApps: string[]
);

export async function stopDaemon();

export function getPlatform(): string;
export function isWindows(): boolean;

export async function syncStatus(
  uname: string,
  pwd: string,
  force: boolean
): Promise<[AccountInfo, ExitInfo[]]>;

export async function startBinderProxy();

export async function stopBinderProxy();

export function startUpdateChecks(l10n: any);

export function getVersion(): string;

export var isAdmin: boolean;

export function exportLogs();
