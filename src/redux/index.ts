import { createStore, combineReducers } from "redux";
import { PrefState, prefReducer } from "./prefs";
import { ConnState, connReducer } from "./connState";
import { ExitState, exitReducer } from "./exitState";
import { AccountState, acctReducer } from "./accountState";

export interface GlobalState {
  prefState: PrefState;
  connState: ConnState;
  exitState: ExitState;
  acctState: AccountState | null;
}

export const rootReducer = combineReducers({
  prefState: prefReducer,
  connState: connReducer,
  exitState: exitReducer,
  acctState: acctReducer,
});
