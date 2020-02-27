import { CallToActionRounded } from "@material-ui/icons";
import { GlobalState } from ".";

export interface PrefState {
  [key: string]: string;
}

export interface PrefAction {
  type: "PREF";
  key: string;
  value: any;
}

export function prefReducer(state: PrefState = {}, action: PrefAction) {
  if (!action.key || (!action.value && action.value !== "")) {
    return state;
  }
  const newState = Object.assign({}, state);
  newState[action.key] = action.value;
  console.log(newState);
  return newState;
}

// returns a selector for given key that returns the given default value
export const prefSelector = (prefKey: string, defaultValue: any) => (
  state: GlobalState
) => {
  const x = state.prefState[prefKey];
  return x ? x : defaultValue;
};
