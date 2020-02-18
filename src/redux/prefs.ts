import { CallToActionRounded } from "@material-ui/icons";

export interface PrefState {
  [key: string]: string;
}

export interface PrefAction {
  type: "PREF";
  key: string;
  value?: string;
}

export function prefReducer(state: PrefState = {}, action: PrefAction) {
  if (!action.value) {
    return state;
  }
  const newState = Object.assign({}, state);
  newState[action.key] = action.value;
  return newState;
}
