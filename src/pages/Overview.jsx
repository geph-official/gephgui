import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonPage,
  IonTitle,
  IonButton,
  IonText,
  IonToolbar,
  IonActionSheet,
  IonAvatar,
  IonGrid,
  IonSpinner,
  IonToggle,
  IonRow,
  IonCol,
  IonProgressBar,
  IonThumbnail,
  IonToast,
  IonSelect,
  IonSelectOption
} from "@ionic/react";
import Odometer from "react-odometerjs";
import React, { useState } from "react";
import { l10n } from "./l10n";
import * as icons from "ionicons/icons";
import ExitSelector from "./ExitSelector";

import "./odometer.css";

import bglogo from "../assets/images/logo-bg.png";
const ConnStatusInfo = props => {
  let lhs;
  let rhs;

  // disconnected state
  if (props.status === "disconnected") {
    lhs = (
      <IonIcon
        icon={icons.closeCircleOutline}
        color="medium"
        style={{ fontSize: "50px", marginRight: "-10px" }}
      />
    );
    rhs = <IonLabel>{l10n.disconnected}</IonLabel>;
  }

  // connecting state
  if (props.status === "connecting") {
    lhs = (
      <IonSpinner
        name="crescent"
        style={{ transform: "scale(1.5)" }}
        duration={300}
        color="primary"
      />
    );
    rhs = (
      <IonLabel>
        <b>{l10n.connecting}...</b>
      </IonLabel>
    );
  }

  // connected state
  if (props.status === "connected") {
    lhs = (
      <IonIcon
        icon={icons.checkmarkCircleOutline}
        style={{ fontSize: "50px", marginRight: "-10px" }}
        color="primary"
      />
    );
    rhs = (
      <span>
        <IonLabel>
          <b>{l10n.connected}</b>
        </IonLabel>{" "}
        <br />
        <small>
          <IonText color="dark">{l10n.connectedblurb}</IonText>
        </small>
      </span>
    );
  }

  return (
    <IonRow style={{ height: "100px" }} className="ion-align-items-center">
      <IonCol size="5" style={{ textAlign: "right", paddingRight: "10px" }}>
        {lhs}
      </IonCol>
      <IonCol style={{ textAlign: "left", paddingLeft: "10px" }}>{rhs}</IonCol>
    </IonRow>
  );
};

const SpeedLabel = props => {
  const bwStyle = {
    fontSize: "14pt"
  };

  function roundToTwo(num) {
    if (num < 1) {
      return 0;
    }
    return num.toPrecision(3);
  }
  let suffix;
  let divider;
  if (props.kbps > 1000) {
    suffix = "Mbps";
    divider = 1000;
  } else {
    suffix = "kbps";
    divider = 1;
  }

  // compute the color
  let intensity = Math.min(1, Math.pow(props.kbps / props.max, 5));
  let beestyle = {
    color: "rgba(" + intensity * 255 + ", 50, 50, 255)"
  };

  return (
    <span style={bwStyle}>
      <b style={beestyle}>{roundToTwo(props.kbps / divider)}</b> {suffix}
    </span>
  );
};

const PingLabel = props => {
  let style = {};
  if (props.ms) {
    if (props.ms < 100) {
      style = { color: "blue" };
    } else if (props.ms < 150) {
      style = { color: "green" };
    } else if (props.ms < 200) {
      style = { color: "darkorange" };
    } else {
      style = { color: "red" };
    }
  }
  return (
    <>
      <b style={style}>{props.ms && props.ms > 0.01 ? props.ms : "-"}</b> ms
    </>
  );
};

const IPLabel = props => <b>{props.ip ? props.ip : "-"}</b>;

const NetActivityInfo = props => {
  let max;
  if (props.free) {
    max = 800;
  } else {
    max = 100000000;
  }
  return (
    <IonRow>
      <IonCol>
        <IonCard style={{ textAlign: "center", "--background": "white" }}>
          <IonCardContent>
            <IonGrid>
              <IonRow>
                <IonCol className="ion-no-padding">
                  <IonLabel>{l10n.downstream}</IonLabel> <br />
                  <SpeedLabel kbps={props.down} max={max} />
                </IonCol>
                <IonCol className="ion-no-padding">
                  {l10n.upstream} <br />
                  <SpeedLabel kbps={props.up} max={max} />
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonCardContent>
        </IonCard>
      </IonCol>
    </IonRow>
  );
};

const Overview = props => {
  // calculate states
  let connState;
  if (props.running) {
    if (props.netstats.Connected) {
      connState = "connected";
    } else {
      connState = "connecting";
    }
  } else {
    connState = "disconnected";
  }
  return (
    <IonPage>
      <IonContent
        style={{
          textAlign: "center",
          "--background": "center top no-repeat " + `url(${bglogo})`
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%"
          }}
        >
          <IonGrid>
            <ConnStatusInfo status={connState} />

            <IonRow style={{ paddingTop: "20px", paddingBottom: "20px" }}>
              <IonCol>
                <IonToggle
                  style={{ transform: "scale(1.7)" }}
                  mode="ios"
                  color="success"
                  value="maintoggle"
                  onIonChange={e => {
                    if (props.updating) {
                      return;
                    }
                    props.onConnToggle(e.detail.checked);
                  }}
                  checked={props.running}
                  disabled={props.updating}
                />
              </IonCol>
            </IonRow>

            <ExitSelector disabled={props.running} />

            <IonRow>
              <IonCol className="ion-no-padding">
                <tt style={{ opacity: 0.7 }}>
                  <IPLabel ip={props.netstats && props.netstats.PublicIP} /> /{" "}
                  <PingLabel ms={props.netstats && props.netstats.MinPing} />
                </tt>
              </IonCol>
            </IonRow>
            <NetActivityInfo
              up={props.upspeed}
              down={props.downspeed}
              netstats={props.netstats}
              free={props.netstats && props.netstats.Tier === "free"}
            />

            <IonRow style={{ height: "20px" }}></IonRow>
          </IonGrid>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "0px",
            width: "100%",
            height: "48px",
            lineHeight: "48px",
            display: "block",
            background: "#ffffff",
            boxShadow: "0px -5px 5px #eeeeee",
            textAlign: "left",
            paddingLeft: "10px",
            paddingRight: "10px",
            display:
              props.netstats && props.netstats.Tier === "free"
                ? "block"
                : "none",
            textAlign: "center"
          }}
        >
          {l10n.freelimit}
          <IonText color="danger">
            <b> 800</b>
          </IonText>{" "}
          kbps
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Overview;
