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

export const ExitDisplay = (props) => {
  const l10n = useSelector(l10nSelector);
  const exitState = useSelector((state: GlobalState) => state.exitState);
  return (
    <div style={{ padding: "20px", fontSize: "20px", textAlign: "center" }}>
      <Flag
        code={exitState.selectedExit.country_code}
        style={{
          width: "40px",
          display: "inline-block",
          borderWidth: "1px",
          borderStyle: "solid",
          verticalAlign: "middle",
          marginRight: "10px",
          marginLeft: "10px",
        }}
      />
      <b>{l10n.countries[exitState.selectedExit.country_code]}</b>/
      {l10n.cities[exitState.selectedExit.city_code]} <br />
      <small style={{ opacity: 0.6, fontSize: "14px" }}>
        {exitState.selectedExit.hostname}
      </small>
    </div>
  );
};

export const ExitSelector = (props: {}) => {
  const l10n = useSelector(l10nSelector);
  const connState = useSelector((state: GlobalState) => state.connState);
  const acctState = useSelector((state: GlobalState) => state.acctState);
  const exitState = useSelector((state: GlobalState) => state.exitState);
  const dispatch = useDispatch();
  const setExit = (info: ExitInfo) => {
    dispatch({ type: "EXIT_SELECT", selectedExit: info });
  };
  const [pickerOpened, setPickerOpened] = useState(false);
  const isFree: boolean = acctState !== null && acctState.subscription === null;
  return (
    <>
      <Button
        style={{
          fontSize: "110%",
          textTransform: "initial",
          fontWeight: "normal",
          borderStyle: "solid",
          borderWidth: "1px",
          margin: "10px",
          width: "50vw",
        }}
        disabled={
          !connState.fresh ||
          connState.connected !== ConnectionStatus.Disconnected
        }
        onClick={(_) => setPickerOpened(!pickerOpened)}
      >
        {l10n.selectExit}
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
            const info: ExitInfo = exitState.exits[item];
            return (
              <ListItem
                dense
                button
                disabled={isFree && info.plus_only}
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
                {info.plus_only && (
                  <Chip variant="outlined" label={l10n.plusonly} />
                )}
              </ListItem>
            );
          })}
        </List>
      </Dialog>
    </>
  );
};
