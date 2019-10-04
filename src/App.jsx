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
import { IonReactRouter } from "@ionic/react-router";
import * as icons from "ionicons/icons";
import Overview from "./pages/Overview";
import Account from "./pages/Account.jsx";
import Settings from "./pages/Settings";
import Details from "./pages/Details";
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

import { l10n, lang } from "./pages/l10n";

/* Theme variables */
import "./theme/variables.css";
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
  running: false
};

class App extends React.Component {
  // initialize fields
  constructor(props) {
    super(props);
    this.state = initState;
  }

  componentDidMount() {
    this.timerID = setInterval(() => this.updateData(), 1000);
    if (localStorage.getItem("prefs.autoConn") === "true") {
      ngate.startDaemon();
    }

    function clickLaboo() {
      let laboo = document.getElementById("labooyah");
      if (laboo !== null) {
        laboo.click();
      } else {
        console.log(laboo);
        setTimeout(clickLaboo, 300);
      }
    }

    setTimeout(clickLaboo, 500);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  // update data from local port
  updateData() {
    axios
      .get("http://localhost:9809")
      .then(resp => {
        this.setState((state, props) => {
          let UP = ((resp.data.UpBytes - state.netstats.UpBytes) * 8) / 1000;
          let DOWN =
            ((resp.data.DownBytes - state.netstats.DownBytes) * 8) / 1000;
          console.log("UP: " + state.upspeed);
          console.log("DN: " + state.downspeed);
          return {
            netstats: resp.data,
            upspeed: UP,
            downspeed: DOWN,
            running: true
          };
        });
      })
      .catch(error => {
        this.setState(initState);
      });
  }

  render() {
    return (
      <IonApp>
        <Helmet htmlAttributes={{ lang: lang }} />

        <IonReactRouter>
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
                <Route
                  path="/tab1"
                  component={() => (
                    <Overview
                      {...this.state}
                      onConnToggle={checked => {
                        console.log(checked);
                        if (checked) {
                          ngate.startDaemon();
                        } else {
                          ngate.stopDaemon();
                        }
                      }}
                    />
                  )}
                />
                <Route
                  path="/tab2"
                  component={() => <Account {...this.state} />}
                />
                <Route path="/tab3" component={Settings} />
              </IonRouterOutlet>
              <IonTabBar slot="bottom">
                <IonTabButton tab="tab1" id="labooyah" href="/tab1">
                  <IonIcon icon={icons.home} />
                  <IonLabel>{l10n.overview}</IonLabel>
                </IonTabButton>
                <IonTabButton tab="tab2" href="/tab2">
                  <IonIcon icon={icons.person} />
                  <IonLabel>{l10n.account}</IonLabel>
                </IonTabButton>
                <IonTabButton tab="tab3" href="/tab3">
                  <IonIcon icon={icons.settings} />
                  <IonLabel>{l10n.settings}</IonLabel>
                </IonTabButton>
              </IonTabBar>
            </IonTabs>
          </IonContent>
        </IonReactRouter>
      </IonApp>
    );
  }
}
export default App;
