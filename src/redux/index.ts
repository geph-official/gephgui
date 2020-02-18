import { createStore, combineReducers } from "redux";
import Login from "../pages/Login";
import { PrefState, prefReducer } from "./prefs";
import { ConnState, connReducer } from "./connState";

export interface LoginState {
  loggedin: boolean;
  username: string;
  password: string;
}

export interface GlobalState {
  loginState: LoginState;
  prefState: PrefState;
  connState: ConnState;
}

export const rootReducer = combineReducers({
  prefState: prefReducer,
  connState: connReducer
});
