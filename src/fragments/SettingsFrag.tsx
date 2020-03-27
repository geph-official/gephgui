import React, { useState } from "react";
import {
  List,
  ListSubheader,
  ListItemText,
  ListItem,
  Switch,
  ListItemSecondaryAction,
  Divider,
  Select,
  MenuItem,
  Button,
  Dialog,
  AppBar,
  DialogTitle
} from "@material-ui/core";
import { useSelector, useDispatch } from "react-redux";
import { l10nSelector, langSelector } from "../redux/l10n";
import { prefSelector } from "../redux/prefs";
import { getPlatform } from "../nativeGate";

const BooleanSetting = (props: {
  propKey: string;
  defValue: boolean;
  primary: string;
  secondary?: string;
}) => {
  const currValue = useSelector(
    prefSelector(props.propKey, props.defValue ? "true" : "false")
  );
  const dispatch = useDispatch();
  return (
    <ListItem>
      <ListItemText primary={props.primary} secondary={props.secondary} />
      <ListItemSecondaryAction>
        <Switch
          checked={currValue === "true"}
          color="primary"
          onClick={() => {
            console.log(currValue);
            dispatch({
              type: "PREF",
              key: props.propKey,
              value: currValue === "true" ? "false" : "true"
            });
          }}
        />
      </ListItemSecondaryAction>
    </ListItem>
  );
};

// const ExclusionDialog = (props: { open: boolean }) => {
//   const l10n = useSelector(l10nSelector);
//   const dispatch = useDispatch();
//   const currList = useSelector(prefSelector("excludedApps", []));
//   const appList = {
//     weixin: "WeChat"
//   };

//   return (
//     <Dialog open={props.open} scroll="paper" fullWidth>
//       <DialogTitle>{l10n.excludeapps}</DialogTitle>
//     </Dialog>
//   );
// };

const SettingsFrag: React.FC = props => {
  const l10n = useSelector(l10nSelector);
  const lang = useSelector(langSelector);
  const dispatch = useDispatch();
  return (
    <>
      <List
        subheader={
          <ListSubheader component="div">{l10n.general}</ListSubheader>
        }
      >
        <ListItem>
          <ListItemText primary={l10n.language} />
          <ListItemSecondaryAction>
            <Select
              value={lang}
              disableUnderline
              onChange={event => {
                dispatch({
                  type: "PREF",
                  key: "lang",
                  value: event.target.value
                });
              }}
            >
              <MenuItem value="en-US">English</MenuItem>
              <MenuItem value="zh-TW">繁體中文</MenuItem>
              <MenuItem value="zh-CN">简体中文</MenuItem>
            </Select>
          </ListItemSecondaryAction>
        </ListItem>
        <BooleanSetting
          propKey="bypassChinese"
          defValue={false}
          primary={l10n.excludecn}
          secondary={l10n.excludecnblurb}
        />
        {getPlatform() === "android" ? (
          ""
        ) : (
            <BooleanSetting
              propKey="autoProxy"
              defValue={true}
              primary={l10n.autoproxy}
              secondary={l10n.autoproxyblurb}
            />
          )}
      </List>
      <Divider />
      <List
        subheader={
          <ListSubheader component="div">{l10n.network}</ListSubheader>
        }
      >
        <BooleanSetting
          propKey="forceBridges"
          defValue={false}
          primary={l10n.forcebridges}
          secondary={l10n.tcpblurb}
        />
        <ListItem>
          <ListItemText primary={l10n.socks5} />
          <span style={{ color: "#666" }}>localhost:9909</span>
        </ListItem>
        <ListItem>
          <ListItemText primary={l10n.http} />
          <span style={{ color: "#666" }}>localhost:9910</span>
        </ListItem>
      </List>
    </>
  );
};

export default SettingsFrag;
