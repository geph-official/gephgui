import React from "react";
import { Redirect, Route } from "react-router-dom";
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTab,
  IonTabButton,
  IonTabs,
  IonContent,
  IonModal,
  IonHeader,
  setupConfig,
  IonBadge,
  IonGrid,
  IonToolbar,
  IonTitle
} from "@ionic/react";
import { IonReactHashRouter } from "@ionic/react-router";
import * as icons from "ionicons/icons";
import Overview from "./pages/Overview";
import Account from "./pages/Account.jsx";
import Settings from "./pages/Settings";
import Logs from "./pages/Logs";
import Details from "./pages/Details";
import axiosRetry, { exponentialDelay } from "axios-retry";
import { Helmet } from "react-helmet";
import Login from "./pages/Login";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";
import * as axios from "axios";
import * as ngate from "./nativeGate.js";

import { getl10n } from "./pages/l10n";

/* Theme variables */
import "./theme/variables.css";

//axiosRetry(axios, { retries: 1});

setupConfig({
  rippleEffect: true,
  mode: "md"
});

const initState = {
  netstats: {
    Connected: false,
    UpBytes: 0,
    DownBytes: 0
  },
  upspeed: 0,
  downspeed: 0,
  updating: true,
  logs: []
};

class App extends React.Component {
  // initialize fields
  constructor(props) {
    super(props);
    this.state = initState;
  }

  componentDidMount() {
    this.updateData(true);
    this.timerID = setInterval(() => this.updateData(false), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  // update data from local port
  updateData(changeRunning) {
    axios
      .get("http://localhost:9809")
      .then(resp => {
        this.setState((state, props) => {
          let firstTime = state.netstats.DownBytes === 0;
          let UP = ((resp.data.UpBytes - state.netstats.UpBytes) * 8) / 1000;
          let DOWN =
            ((resp.data.DownBytes - state.netstats.DownBytes) * 8) / 1000;
          console.log(resp.data);
          return {
            netstats: resp.data,
            upspeed: firstTime ? 0 : UP,
            downspeed: firstTime ? 0 : DOWN,
            running: changeRunning ? true : state.running
          };
        });
      })
      .catch(error => {
        this.setState(initState);
        if (changeRunning) {
          this.setState({ running: false });
        }
      })
      .finally(() => {
        this.setState({ updating: false });
      });
  }

  render() {
    const [lang, l10n] = getl10n();
    return (
      <IonApp>
        <Helmet htmlAttributes={{ lang: lang }}>
          <title>{l10n.geph + " " + "v" + ngate.version}</title>
        </Helmet>

        <IonReactHashRouter>
          <IonHeader mode="ios">
            <IonToolbar mode="ios" style={{ textAlign: "center" }}>
              <img
                src={require("./assets/images/logo-naked.svg")}
                height={32}
              />
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <Login />
            <IonTabs>
              <IonRouterOutlet>
                <Redirect exact from="/" to="/tab1" />
                <Route
                  exact
                  path="/tab1"
                  component={() => (
                    <Overview
                      {...this.state}
                      onConnToggle={checked => {
                        this.setState({ updating: true });
                        console.log(checked);
                        if (checked) {
                          this.setState({ running: true });
                          // add every log line to the state
                          ngate.startDaemon();
                        } else {
                          this.setState({ running: false });
                          ngate.stopDaemon();
                        }
                      }}
                    />
                  )}
                />
                <Route
                  exact
                  path="/tab2"
                  component={() => <Account {...this.state} />}
                />
                <Route exact path="/logs" component={() => <Logs />} />
                <Route exact path="/tab3" component={Settings} />
              </IonRouterOutlet>
              <IonTabBar slot="bottom">
                <IonTabButton tab="tab1" id="labooyah" href="/tab1">
                  <IonIcon icon={icons.home} />
                  <IonLabel>{l10n.overview}</IonLabel>
                </IonTabButton>
                <IonTabButton tab="tab2" href="/tab2">
                  <IonIcon icon={icons.person} />
                  <IonLabel>{l10n.account}</IonLabel>
                  {this.state.netstats &&
                    this.state.netstats.Tier === "free" && (
                      <IonBadge color="danger"></IonBadge>
                    )}
                </IonTabButton>
                <IonTabButton tab="tab3" href="/tab3">
                  <IonIcon icon={icons.settings} />
                  <IonLabel>{l10n.settings}</IonLabel>
                </IonTabButton>
              </IonTabBar>
            </IonTabs>
          </IonContent>
        </IonReactHashRouter>
      </IonApp>
    );
  }
}
export default App;
