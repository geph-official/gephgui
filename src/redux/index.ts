import { createStore, combineReducers } from "redux";
import { PrefState, prefReducer } from "./prefs";
import { ConnState, connReducer } from "./connState";
import { ExitState, exitReducer } from "./exitState";

export interface GlobalState {
  prefState: PrefState;
  connState: ConnState;
  exitState: ExitState;
}

export const rootReducer = combineReducers({
  prefState: prefReducer,
  connState: connReducer,
  exitState: exitReducer,
});
