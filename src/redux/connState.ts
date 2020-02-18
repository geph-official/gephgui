export enum Tier {
  Free,
  Paid
}

export enum ConnectionStatus {
  Disconnected,
  Connecting,
  Connected
}

export interface ConnState {
  fresh: boolean;
  connected: ConnectionStatus;
  upBytes: number;
  downBytes: number;
  ping: number;
  tier: Tier;
  expiry: Date;
}

export interface ConnAction {
  type: "CONN";
  rawJson: object;
}

const initState = {
  fresh: false,
  connected: ConnectionStatus.Disconnected,
  upBytes: 0,
  downBytes: 0,
  ping: 0,
  tier: Tier.Free,
  expiry: new Date()
};

export const connReducer = (
  state: ConnState = initState,
  action: ConnAction
) => {
  return state;
};
