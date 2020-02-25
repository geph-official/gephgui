export enum Tier {
  Free,
  Paid
}

export enum ConnectionStatus {
  Disconnected,
  Connecting,
  Connected
}

export enum SpecialConnStates {
  Dead = "DEAD",
  Connecting = "IND"
}

export interface ConnState {
  fresh: boolean;
  connected: ConnectionStatus;
  publicIP: string;
  upBytes: number;
  oldUpBytes: number;
  downBytes: number;
  oldDownBytes: number;
  ping: number;
  tier: Tier;
  expiry: Date;
  bridgeData: null;
}

export interface RawStats {
  Connected: boolean;
  PublicIP: string;
  UpBytes: number;
  DownBytes: number;
  MinPing: number;
  Tier: string;
  Expiry: string;
  Bridges: object;
}

export interface ConnAction {
  type: "CONN";
  rawJson: RawStats | SpecialConnStates;
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
  bridgeData: null
};

export const connReducer = (
  state: ConnState = initState,
  action: ConnAction
) => {
  if (!action.rawJson) {
    return state;
  }
  console.log(action);
  if (action.rawJson === SpecialConnStates.Connecting) {
    return { ...state, fresh: false, connected: ConnectionStatus.Connecting };
  }
  if (action.rawJson === SpecialConnStates.Dead) {
    return { ...state, fresh: true, connected: ConnectionStatus.Disconnected };
  }
  const j = action.rawJson;
  return {
    ...state,
    fresh: true,
    connected: j.Connected
      ? ConnectionStatus.Connected
      : ConnectionStatus.Connecting,
    ping: j.MinPing,
    tier: j.Tier === "free" ? Tier.Free : Tier.Paid,
    expiry: new Date(j.Expiry),
    upBytes: j.UpBytes,
    oldUpBytes: state.upBytes,
    publicIP: j.PublicIP,
    downBytes: j.DownBytes,
    oldDownBytes: state.downBytes,
    bridgeData: j.Bridges
  };
};
