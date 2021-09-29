import React, { useState, useEffect } from "react";
import axiosRetry, { exponentialDelay } from "axios-retry";
import { Helmet } from "react-helmet";
import axios from "axios";

import { l10nSelector, langSelector } from "./redux/l10n";
import persistState from "redux-localstorage";
import "./theme/typography.css";
import {
  BottomNavigation,
  Grid,
  Paper,
  BottomNavigationAction,
  makeStyles,
  Box,
  createMuiTheme,
  ThemeProvider,
  Badge,
  Dialog,
  CircularProgress,
  DialogTitle,
  DialogContent,
  DialogContentText,
  LinearProgress,
  Button,
} from "@material-ui/core";
import * as icons from "@material-ui/icons";
import { rootReducer, GlobalState } from "./redux";
import { createStore } from "redux";
import { Provider, useSelector, useDispatch } from "react-redux";
import OverviewFrag from "./fragments/OverviewFrag";
import { useInterval } from "./utils";
import { ConnectionStatus, SpecialConnStates } from "./redux/connState";
import { prefSelector } from "./redux/prefs";
import LoginFrag from "./fragments/LoginFrag";
import SettingsFrag from "./fragments/SettingsFrag";
import {
  startUpdateChecks,
  getVersion,
  syncStatus,
  stopDaemon,
} from "./nativeGate";
import Announcements, { getAnnouncementFeed } from "./fragments/Announcements";

const store = createStore(
  rootReducer,
  persistState(["prefState", "exitState", "acctState"], {})
);

//alert(JSON.stringify(localStorage));

const useStyles = makeStyles({
  stickToBottom: {
    width: "100%",
    position: "fixed",
    bottom: 0,
    left: 0,
    padding: 0,
    margin: 0,
  },
});

// custom theme
const theme = createMuiTheme({
  palette: {
    primary: { main: "#007bbb" },
    secondary: { main: "#c9171e" },
  },
});

const promiseWithTimeout = (timeoutMs: number, promise: () => Promise<any>) => {
  return Promise.race([
    promise(),
    new Promise((resolve, reject) =>
      setTimeout(() => reject("timeout"), timeoutMs)
    ),
  ]);
};

const App: React.FC = (props) => {
  const classes = useStyles();
  const l10n = useSelector(l10nSelector);
  const lang = useSelector(langSelector);
  const username = useSelector(prefSelector("username", ""));
  const password = useSelector(prefSelector("password", ""));
  const connState = useSelector((state: GlobalState) => state.connState);
  const dispatch = useDispatch();
  const [activePage, setActivePage] = useState(0);
  const [busy, setBusy] = useState(false);
  const [busyError, setBusyError] = useState("");
  const statsURL = "http://127.0.0.1:9809";
  const announcements = useSelector(prefSelector("announceCache", []));
  const lastReadAnnounce = useSelector(
    prefSelector("lastReadAnnounce", new Date("1900-01-01"))
  );
  const unreadCount = announcements.filter((item) => {
    return new Date(item.date).getTime() > new Date(lastReadAnnounce).getTime();
  }).length;

  const refreshConnData = async () => {
    console.log("refreshConnData");
    if (username === "") {
      console.log("username empty, going off");
      return;
    }
    try {
      const response = await axios.get(statsURL, { responseType: "json" });
      console.log(response);
      dispatch({
        type: "CONN",
        rawJson: response.data ? response.data : SpecialConnStates.Connecting,
      });
    } catch {
      if (!connState.fresh)
        dispatch({ type: "CONN", rawJson: SpecialConnStates.Dead });
    }
  };

  const refreshSync = async (force: boolean) => {
    if (username === "") {
      return;
    }
    setBusyError("");
    let flag = false;
    while (true) {
      try {
        flag = true;
        const boo = (async () => {
          for (;;) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            if (flag) {
              setBusy(true);
            }
          }
        })();
        const [accInfo, exits] = await Promise.race([
          promiseWithTimeout(20000, () =>
            syncStatus(username, password, force)
          ),
          boo,
        ]);
        flag = false;
        console.log(accInfo);
        dispatch({ type: "ACCT", account: accInfo });
        dispatch({ type: "EXIT_LIST", list: exits });
        setBusy(false);
        return;
      } catch (e) {
        setBusyError(e.toString());
        console.log(e.toString());
      } finally {
        flag = false;
      }
    }
  };

  // load announcements
  const refreshAnnouncement = async () => {
    dispatch({
      type: "PREF",
      key: "announceBusy",
      value: true,
    });
    try {
      dispatch({
        type: "PREF",
        key: "announceCache",
        value: await getAnnouncementFeed(),
      });
    } finally {
      dispatch({
        type: "PREF",
        key: "announceBusy",
        value: false,
      });
    }
  };
  useInterval(() => {
    refreshAnnouncement();
  }, 600000);

  useInterval(() => {
    refreshConnData();
  }, 1000);

  useInterval(() => {
    refreshSync(false);
  }, 600000);

  useEffect(() => {
    refreshSync(false);
    refreshConnData();
    refreshAnnouncement();
    startUpdateChecks(l10n);
  }, [username]);

  if (username === "") {
    return <LoginFrag />;
  }

  return (
    <>
      <Helmet htmlAttributes={{ lang: lang }}>
        <title>
          {l10n.geph} {getVersion()}
        </title>
      </Helmet>
      <Dialog open={busy}>
        <DialogTitle>{l10n.syncing}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <LinearProgress />
            <span style={{ color: "red" }}>{busyError}</span>
            {busyError ? (
              <>
                <hr />
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
                  style={{ minWidth: 100 }}
                >
                  {l10n.logout}
                </Button>
              </>
            ) : (
              ""
            )}
          </DialogContentText>
        </DialogContent>
      </Dialog>
      <div
        style={{
          height: "calc(100vh - 64px)",
          maxHeight: "calc(100vh - 64px)",
          overflow: "auto",
        }}
      >
        {(() => {
          switch (activePage) {
            case 0:
              return <OverviewFrag forceSync={() => refreshSync(true)} />;
            // case 1:
            //   return <Status />;
            case 1:
              return <Announcements />;
            case 2:
              return <SettingsFrag />;
          }
        })()}
      </div>
      <BottomNavigation
        className={classes.stickToBottom}
        value={activePage}
        onChange={(event, newValue) => {
          setActivePage(newValue);
        }}
        showLabels
      >
        <BottomNavigationAction label={l10n.overview} icon={<icons.Home />} />
        {/* <BottomNavigationAction
          label={l10n.status}
          icon={<icons.Dashboard />}
        /> */}
        <BottomNavigationAction
          label={l10n.announcements}
          icon={
            <Badge badgeContent={unreadCount} color="secondary">
              <icons.Notifications />
            </Badge>
          }
        />
        <BottomNavigationAction
          label={l10n.settings}
          icon={<icons.Settings />}
        />
      </BottomNavigation>
    </>
  );
};

const WrappedApp: React.FC = (props) => (
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </Provider>
);

export default WrappedApp;
