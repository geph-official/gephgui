export interface AccountAction {
  type: "ACCT";
  account: AccountState;
}

export interface AccountState {
  userid: number;
  username: string;
  subscription: Subscription | null;
}

export interface Subscription {
  expires_unix: number;
}

export const acctReducer = (
  state: AccountState | null = null,
  action: AccountAction
) => {
  if (action.type == "ACCT") {
    console.log("NEEEEEW", state);
    return action.account;
  } else {
    return state;
  }
};
