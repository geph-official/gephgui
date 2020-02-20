import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { GlobalState } from "../redux";
import { exitList } from "./exitList";
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
  Chip
} from "@material-ui/core";
import { l10nSelector } from "../redux/l10n";
import * as icons from "@material-ui/icons";
import Flag from "react-world-flags";
import { prefSelector } from "../redux/prefs";
import { ConnectionStatus } from "../redux/connState";

const ExitSelectorFrag = (props: {}) => {
  const exitName = useSelector(prefSelector("exit", "us-sfo-01.exits.geph.io"));
  const l10n = useSelector(l10nSelector);
  const connstate = useSelector((state: GlobalState) => state.connState);
  const dispatch = useDispatch();
  const setExit = (ename: string) => {
    dispatch({ type: "PREF", key: "exit", value: ename });
  };
  const exitInfo = exitList[exitName];
  const [pickerOpened, setPickerOpened] = useState(false);
  return (
    <>
      <Button
        style={{
          fontSize: "120%",
          textTransform: "initial",
          fontWeight: "normal",
          letterSpacing: "-0.5px"
        }}
        disabled={
          !connstate.fresh ||
          connstate.connected !== ConnectionStatus.Disconnected
        }
        onClick={_ => setPickerOpened(!pickerOpened)}
      >
        <Flag
          code={exitInfo.country}
          style={{
            width: "36px",
            display: "inline-block",
            boxShadow: "0px 0px 3px #333333",
            verticalAlign: "middle",
            marginRight: "10px",
            marginLeft: "10px"
          }}
        />
        <b>{l10n.countries[exitInfo.country]}</b>/{l10n.cities[exitInfo.city]} »
      </Button>
      <Dialog
        open={pickerOpened}
        onClose={_ => setPickerOpened(false)}
        maxWidth="sm"
        fullWidth={true}
      >
        <DialogTitle>{l10n.selectExit}</DialogTitle>
        <List>
          {Object.keys(exitList).map(item => {
            const info = exitList[item];
            return (
              <ListItem
                dense
                button
                onClick={_ => {
                  setExit(item);
                  setPickerOpened(false);
                }}
              >
                <Flag
                  code={info.country}
                  style={{
                    width: "32px",
                    display: "inline-block",
                    boxShadow: "0px 0px 1px #333333",
                    verticalAlign: "middle",
                    marginRight: "10px",
                    marginLeft: "10px"
                  }}
                />
                <ListItemText
                  secondary={l10n.countries[info.country]}
                  primary={l10n.cities[info.city]}
                />
                {info.plus && <Chip variant="outlined" label={l10n.plusonly} />}
              </ListItem>
            );
          })}
        </List>
      </Dialog>
    </>
  );
};

export default ExitSelectorFrag;
