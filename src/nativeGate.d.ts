export async function startDaemon(
  exitName: string,
  exitKey: string,
  username: string,
  password: string,
  useTCP: boolean,
  forceBridges: boolean,
  autoProxy: boolean
);

export async function stopDaemon();

export function getPlatform(): string;

export async function checkAccount(uname: string, pwd: string);

export function startBinderProxy(): number;

export function stopBinderProxy(pid: number);

export function startUpdateChecks(l10n: any);

export function getVersion(): string;
