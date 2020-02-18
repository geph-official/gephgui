import React, { useState } from "react";
import axiosRetry, { exponentialDelay } from "axios-retry";
import { Helmet } from "react-helmet";
import * as axios from "axios";

import { l10nSelector, langSelector } from "./redux/l10n";
import persistState from "redux-localstorage";
import "./theme/typography.css";
import {
  BottomNavigation,
  Grid,
  Paper,
  BottomNavigationAction,
  makeStyles,
  Box
} from "@material-ui/core";
import * as icons from "@material-ui/icons";
import { rootReducer, GlobalState } from "./redux";
import { createStore } from "redux";
import { Provider, useSelector, useDispatch } from "react-redux";
import OverviewFrag from "./fragments/OverviewFrag";

const store = createStore(rootReducer, persistState("prefState", {}));

const useStyles = makeStyles({
  stickToBottom: {
    width: "100%",
    position: "fixed",
    bottom: 0
  }
});

const App: React.FC = props => {
  const classes = useStyles();
  const l10n = useSelector(l10nSelector);
  const lang = useSelector(langSelector);
  const dispatch = useDispatch();
  const [activePage, setActivePage] = useState(0);
  return (
    <>
      {(() => {
        switch (activePage) {
          case 0:
            return <OverviewFrag />;
          case 1:
            return "Page1";
          case 2:
            return "Page2";
        }
      })()}
      <Helmet htmlAttributes={{ lang: lang }}>
        <title>{l10n.geph}</title>
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
    <App />
  </Provider>
);

export default WrappedApp;
