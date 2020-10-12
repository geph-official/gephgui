import React, { useState } from "react";
import { sha256 } from "js-sha256";
import {
  List,
  ListSubheader,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  Divider,
} from "@material-ui/core";
import { useSelector, useDispatch } from "react-redux";
import { l10nSelector, langSelector } from "../redux/l10n";
import {
  AccountCircle,
  Lock,
  CreditCard,
  Favorite,
  DateRange,
} from "@material-ui/icons";
import { prefSelector } from "../redux/prefs";
import { GlobalState } from "../redux";
import { ConnectionStatus, Tier, SpecialConnStates } from "../redux/connState";
import Alert from "@material-ui/lab/Alert";
import { getPlatform, stopDaemon } from "../nativeGate";

const AccountFrag: React.FC = (props) => {
  const l10n = useSelector(l10nSelector);
  const lang = useSelector(langSelector);
  const username = useSelector(prefSelector("username", ""));
  const password = useSelector(prefSelector("password", ""));
  const dispatch = useDispatch();
  const connstate = useSelector((state: GlobalState) => state.connState);
  const [showPwd, setShowPwd] = useState(false);
  const isRunning =
    connstate.fresh && connstate.connected === ConnectionStatus.Connected;
  const extendURL = `https://geph.io/billing/login?next=%2Fbilling%2Fdashboard&uname=${username}&pwd=${password}`;
  const openBilling = () => {
    if (getPlatform() === "android") {
      window.location.href = extendURL;
    } else {
      window.open(extendURL, "_blank");
    }
  };
  const isFree =
    connstate.syncState && connstate.syncState.subscription === null;
  return (
    <>
      <List
        subheader={
          <ListSubheader component="div">{l10n.accinfo}</ListSubheader>
        }
      >
        <ListItem>
          <ListItemIcon>
            <AccountCircle />
          </ListItemIcon>
          <ListItemText
            style={{
              overflow: "hidden",
              maxWidth: "calc(100vw - 200px)",
              textOverflow: "ellipsis",
            }}
          >
            <b>{username}</b>
          </ListItemText>
          <ListItemSecondaryAction>
            <Button
              color="secondary"
              variant="outlined"
              disableElevation
              onClick={() => {
                localStorage.clear();
                dispatch({ type: "CONN", rawJson: SpecialConnStates.Dead });
                stopDaemon();
                dispatch({ type: "PREF", key: "username", value: "" });
                dispatch({ type: "PREF", key: "password", value: "" });
              }}
            >
              {l10n.logout}
            </Button>
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <Lock />
          </ListItemIcon>
          <ListItemText primary={showPwd ? password : "* * * * * * *"} />
          <ListItemSecondaryAction>
            <Button
              onClick={(e) => {
                setShowPwd(!showPwd);
              }}
            >
              {showPwd ? l10n.hide : l10n.show}
            </Button>
          </ListItemSecondaryAction>
        </ListItem>
      </List>
      <Divider />
      <List
        subheader={
          <ListSubheader component="div">{l10n.subscription}</ListSubheader>
        }
      >
        {!isRunning ? (
          <ListItem>
            <Alert severity="info">{l10n.subinfoblurb}</Alert>
          </ListItem>
        ) : (
          <>
            <ListItem>
              <ListItemIcon>
                <CreditCard />
              </ListItemIcon>
              <ListItemText
                primary={(() => {
                  // easter egg
                  const uhash = sha256(username + "pepper");
                  if (
                    uhash ===
                      "b2aa2bfe1aed310ab52593a4c816a945cd26ae08f343b66da8a799c644026907" ||
                    uhash ===
                      "4b55ab8a1a4676dbc188d95ff6ee274ccb898fc5aa986746d41dde5b4412b5f7"
                  )
                    return "D" + "OR" + "THIS" + "BE";
                  return isFree ? l10n.free : l10n.plus;
                })()}
              />
            </ListItem>
            {isFree ? (
              <ListItem>
                <ListItemIcon>
                  <Favorite color="secondary" />
                </ListItemIcon>
                <ListItemText>{l10n.unlockUnlimitedSpeed}</ListItemText>
                <ListItemSecondaryAction>
                  <Button
                    color="primary"
                    variant="outlined"
                    onClick={openBilling}
                    disableElevation
                  >
                    {l10n.upgrade}
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
            ) : (
              <ListItem>
                <ListItemIcon>
                  <DateRange color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={new Date(
                    ((connstate.syncState &&
                      connstate.syncState.subscription &&
                      connstate.syncState.subscription.expires_unix) ||
                      0) * 1000
                  ).toLocaleDateString(lang, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                  secondary={formatRemaining(
                    l10n,
                    new Date(
                      ((connstate.syncState &&
                        connstate.syncState.subscription &&
                        connstate.syncState.subscription.expires_unix) ||
                        0) * 1000
                    )
                  )}
                ></ListItemText>
                <ListItemSecondaryAction>
                  <Button
                    color="primary"
                    variant="outlined"
                    onClick={openBilling}
                    disableElevation
                  >
                    {l10n.extend}
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
            )}
          </>
        )}
      </List>
    </>
  );
};

const formatRemaining = (l10n: Record<string, any>, date: Date) => {
  const msPerDay = 24 * 60 * 60 * 1000;
  const timeLeft = date.getTime() - new Date().getTime();
  const daysLeft = timeLeft / msPerDay;
  const nana = l10n.fmtDaysLeftShort as (x: string) => string;
  return nana(daysLeft.toFixed(0));
};

export default AccountFrag;
