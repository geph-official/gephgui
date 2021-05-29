import { ExitInfo } from "./exitState";

export enum Tier {
  Free,
  Paid,
}

export enum ConnectionStatus {
  Disconnected,
  Connecting,
  Connected,
}

export enum SpecialConnStates {
  Dead = "DEAD",
  Connecting = "IND",
}

export interface ConnState {
  fresh: boolean;
  connected: ConnectionStatus;
  upBytes: number;
  oldUpBytes: number;
  downBytes: number;
  oldDownBytes: number;
  ping: number;
  syncState: AccountInfo | null;
  loss: number;
}

export interface RawStats {
  total_tx: number;
  total_rx: number;
  latency: number;
  exit_info: ExitInfo | null;
  loss: number;
}

export interface AccountInfo {
  userid: number;
  username: string;
  subscription: Subscription | null;
}

export interface Subscription {
  expires_unix: number;
}

export interface ConnAction {
  type: "CONN";
  rawJson: RawStats | SpecialConnStates;
}

export interface SyncAction {
  type: "SYNC";
  account: AccountInfo;
}

const initState = {
  fresh: false,
  connected: ConnectionStatus.Disconnected,
  upBytes: 0,
  oldUpBytes: -1,
  downBytes: 0,
  oldDownBytes: -1,
  ping: 0,
  publicIP: "",
  tier: Tier.Free,
  expiry: new Date(),
  syncState: null,
  loss: 0.0,
};

export const connReducer = (
  state: ConnState = initState,
  action: ConnAction | SyncAction
) => {
  console.log(action);
  if (action.type === "CONN") {
    if (!action.rawJson) {
      return state;
    }
    if (action.rawJson === SpecialConnStates.Connecting) {
      return { ...state, fresh: true, connected: ConnectionStatus.Connecting };
    }
    if (action.rawJson === SpecialConnStates.Dead) {
      return {
        ...state,
        fresh: true,
        connected: ConnectionStatus.Disconnected,
      };
    }
    const j = action.rawJson;
    const toret = {
      ...state,
      fresh: true,
      connected:
        j.latency !== null
          ? ConnectionStatus.Connected
          : ConnectionStatus.Connecting,
      ping: Math.round(j.latency*1000.0),
      upBytes: j.total_tx,
      oldUpBytes: state.upBytes,
      downBytes: j.total_rx,
      oldDownBytes: state.downBytes,
      loss: j.loss * 100.0,
    };
    return toret;
  } else if (action.type === "SYNC") {
    return {
      ...state,
      syncState: action.account,
    };
  }
  return state;
};
