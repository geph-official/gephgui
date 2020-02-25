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
  ThemeProvider
} from "@material-ui/core";
import * as icons from "@material-ui/icons";
import { rootReducer, GlobalState } from "./redux";
import { createStore } from "redux";
import { Provider, useSelector, useDispatch } from "react-redux";
import OverviewFrag from "./fragments/OverviewFrag";
import { useInterval } from "./utils";
import { SpecialConnStates } from "./redux/connState";
import { prefSelector } from "./redux/prefs";
import LoginFrag from "./fragments/LoginFrag";
import AccountFrag from "./fragments/AccountFrag";
import SettingsFrag from "./fragments/SettingsFrag";
import { startUpdateChecks, getVersion } from "./nativeGate";
import Details from "./fragments/Details";

const store = createStore(rootReducer, persistState("prefState", {}));

const useStyles = makeStyles({
  stickToBottom: {
    width: "100%",
    position: "fixed",
    bottom: 0,
    left: 0,
    padding: 0,
    margin: 0
  }
});

// custom theme
const theme = createMuiTheme({
  palette: {
    primary: { main: "#007bbb" },
    secondary: { main: "#c9171e" }
  }
});

const App: React.FC = props => {
  const classes = useStyles();
  const l10n = useSelector(l10nSelector);
  const lang = useSelector(langSelector);
  const username = useSelector(prefSelector("username", ""));
  const dispatch = useDispatch();
  const [activePage, setActivePage] = useState(0);
  const statsURL = "http://localhost:9809";

  const updateData = async () => {
    if (username === "") {
      return;
    }
    try {
      const response = await axios.get(statsURL);
      console.log(response);
      dispatch({ type: "CONN", rawJson: response.data });
    } catch {
      dispatch({ type: "CONN", rawJson: SpecialConnStates.Dead });
    }
  };

  useInterval(() => {
    updateData();
  }, 1000);

  useEffect(() => {
    updateData();
    startUpdateChecks(l10n);
  }, []);

  if (username === "") {
    return <LoginFrag />;
  }

  return (
    <>
      {(() => {
        switch (activePage) {
          case 0:
            return <OverviewFrag />;
          case 1:
            return <Details />;
          case 2:
            return <AccountFrag />;
          case 3:
            return <SettingsFrag />;
        }
      })()}
      <Helmet htmlAttributes={{ lang: lang }}>
        <title>
          {l10n.geph} {getVersion()}
        </title>
      </Helmet>
      <BottomNavigation
        showLabels
        className={classes.stickToBottom}
        value={activePage}
        onChange={(event, newValue) => {
          setActivePage(newValue);
        }}
      >
        <BottomNavigationAction
          label={l10n.overview}
          icon={<icons.Dashboard />}
        />
        <BottomNavigationAction label={l10n.details} icon={<icons.Details />} />
        <BottomNavigationAction
          label={l10n.account}
          icon={<icons.AccountCircle />}
        />
        <BottomNavigationAction
          label={l10n.settings}
          icon={<icons.Settings />}
        />
      </BottomNavigation>
    </>
  );
};

const WrappedApp: React.FC = props => (
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </Provider>
);

export default WrappedApp;
