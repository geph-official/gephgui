import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { GlobalState } from "../redux";
import {
  Button,
  Dialog,
  IconButton,
  AppBar,
  Toolbar,
  Typography,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Chip,
} from "@material-ui/core";
import { l10nSelector } from "../redux/l10n";
import * as icons from "@material-ui/icons";
import Flag from "react-world-flags";
import { prefSelector } from "../redux/prefs";
import { ConnectionStatus } from "../redux/connState";
import { ExitInfo } from "../redux/exitState";

export const exitPrefKey = "exit-V2";

const ExitSelectorFrag = (props: {}) => {
  const l10n = useSelector(l10nSelector);
  const connState = useSelector((state: GlobalState) => state.connState);
  const exitState = useSelector((state: GlobalState) => state.exitState);
  const dispatch = useDispatch();
  const setExit = (info: ExitInfo) => {
    dispatch({ type: "EXIT_SELECT", selectedExit: info });
  };
  const [pickerOpened, setPickerOpened] = useState(false);
  return (
    <>
      <Button
        style={{
          fontSize: "120%",
          textTransform: "initial",
          fontWeight: "normal",
          letterSpacing: "-0.5px",
        }}
        disabled={
          !connState.fresh ||
          connState.connected !== ConnectionStatus.Disconnected
        }
        onClick={(_) => setPickerOpened(!pickerOpened)}
      >
        <Flag
          code={exitState.selectedExit.country_code}
          style={{
            width: "36px",
            display: "inline-block",
            boxShadow: "0px 0px 3px #333333",
            verticalAlign: "middle",
            marginRight: "10px",
            marginLeft: "10px",
          }}
        />
        <b>{l10n.countries[exitState.selectedExit.country_code]}</b>/
        {l10n.cities[exitState.selectedExit.city_code]} »
      </Button>
      <Dialog
        open={pickerOpened}
        onClose={(_) => setPickerOpened(false)}
        maxWidth="sm"
        fullWidth={true}
      >
        <DialogTitle>{l10n.selectExit}</DialogTitle>
        <List>
          {Object.keys(exitState.exits).map((item) => {
            const info = exitState.exits[item];
            return (
              <ListItem
                dense
                button
                onClick={(_) => {
                  setExit(info);
                  setPickerOpened(false);
                }}
              >
                <Flag
                  code={info.country_code}
                  style={{
                    width: "32px",
                    display: "inline-block",
                    boxShadow: "0px 0px 1px #333333",
                    verticalAlign: "middle",
                    marginRight: "10px",
                    marginLeft: "10px",
                  }}
                />
                <ListItemText
                  secondary={
                    l10n.countries[info.country_code] || info.country_code
                  }
                  primary={l10n.cities[info.city_code] || info.city_code}
                />
              </ListItem>
            );
          })}
        </List>
      </Dialog>
    </>
  );
};

export default ExitSelectorFrag;
