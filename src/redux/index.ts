import { createStore, combineReducers } from "redux";
import Login from "../pages/Login";
import { PrefState, prefReducer } from "./prefs";
import { ConnState, connReducer } from "./connState";

export interface GlobalState {
  prefState: PrefState;
  connState: ConnState;
}

export const rootReducer = combineReducers({
  prefState: prefReducer,
  connState: connReducer
});
