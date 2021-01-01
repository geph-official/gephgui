export interface ExitState {
  selectedExit: ExitInfo;
  exits: ExitInfo[];
}

export interface ExitInfo {
  hostname: string;
  country_code: string;
  city_code: string;
  plus_only: boolean,
}

export interface ExitSelectAction {
  type: "EXIT_SELECT";
  selectedExit: ExitInfo;
}

export interface ExitListAction {
  type: "EXIT_LIST";
  list: ExitInfo[];
}

export const exitReducer = (
  state: ExitState = {
    selectedExit: {
      hostname: "us-hio-01.exits.geph.io",
      country_code: "us",
      city_code: "pdx",
      plus_only: false,
    },
    exits: [],
  },
  action: ExitSelectAction | ExitListAction
) => {
  console.log(action);
  if (action.type === "EXIT_SELECT") {
    return {
      ...state,
      selectedExit: action.selectedExit,
    };
  } else if (action.type === "EXIT_LIST") {
    return {
      ...state,
      exits: action.list,
    };
  }
  return state;
};
