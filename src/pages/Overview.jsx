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
import React, { useRef, useEffect, useLayoutEffect } from "react";
import { getl10n } from "../redux/l10n";
import * as icons from "ionicons/icons";
import ExitSelector from "./ExitSelector";
import * as ngate from "../nativeGate";
import * as d3 from "d3";
import * as dagreD3 from "dagre-d3";
import * as dagre from "dagre";

import "./graph.css";

import bglogo from "../assets/images/logo-bg.png";
import { continueStatement } from "@babel/types";
const ConnStatusInfo = props => {
  let lhs;
  let rhs;
  const [lang, l10n] = getl10n();

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
    <IonRow
      style={{ height: "100px", paddingTop: "10px" }}
      className="ion-align-items-center"
    >
      <IonCol size="5" style={{ textAlign: "right", paddingRight: "10px" }}>
        {lhs}
      </IonCol>
      <IonCol style={{ textAlign: "left", paddingLeft: "10px" }}>{rhs}</IonCol>
    </IonRow>
  );
};

const SpeedLabel = props => {
  const [lang, l10n] = getl10n();
  const bwStyle = {};

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

const censorIP = ip => {
  const splitted = ip.split(".");
  if (splitted.length === 4) {
    splitted[2] = "*";
    splitted[3] = "*";
    return splitted.join(".");
  }
  return ip;
};

const ConnInfo = props => {
  useEffect(() => {
    let g = new dagreD3.graphlib.Graph().setGraph({
      edgesep: 5,
      ranksep: 20,
      nodesep: 10,
      directed: false,
      rankdir: "LR"
    });
    g.setNode("START", {
      label: props.l10n.you,
      shape: "diamond"
    });
    if (props.PublicIP) {
      g.setNode("END", {
        label: props.PublicIP,
        shape: "rect",
        labelStyle: "font-weight: bold"
      });
      let total = 1;
      if (!props.Bridges || props.Bridges.length === 0) {
        g.setEdge("START", "END", {
          arrowhead: "undirected"
        });
      } else {
        props.Bridges.forEach(bdesc => (total += bdesc.RecvCnt));
        props.Bridges.forEach(bdesc => {
          if (bdesc.Ping < 10000) {
            const id = bdesc.RecvCnt.toFixed(0);
            const strokeWidth = 0.4 + (5 * bdesc.RecvCnt) / total;
            if (bdesc.RecvCnt < 1) {
              g.setNode(id, {
                label: censorIP(bdesc.RemoteIP) + " [TCP]",
                style: "fill: #ddd"
              });
            } else {
              let nodeColor = "#ffb0b0";
              if (bdesc.LossPct < 0.1) {
                nodeColor = "#afd9a8";
              } else if (bdesc.LossPct < 0.2) {
                nodeColor = "#fff199";
              }
              g.setNode(id, {
                label:
                  censorIP(bdesc.RemoteIP) +
                  " / " +
                  bdesc.Ping.toFixed(0) +
                  "ms / " +
                  (bdesc.LossPct * 100).toFixed(0) +
                  "%",
                style:
                  "fill: " +
                  nodeColor +
                  "; stroke-width:" +
                  strokeWidth.toFixed(4) +
                  "px"
              });
            }
            g.setEdge("START", id, {
              arrowhead: "undirected"
            });
            g.setEdge(id, "END", { label: "", arrowhead: "undirected" });
          }
        });
      }
    }
    let svg = d3.select("svg");
    let inner = svg.select("g");
    var render = new dagreD3.render();
    render(inner, g);
    var padding = 30,
      bBox = svg.node().getBoundingClientRect(),
      hRatio = (bBox.height - padding) / g.graph().height,
      wRatio = (bBox.width - padding) / g.graph().width;
    let ratio = Math.min(1.0, Math.min(hRatio, wRatio)).toFixed(10);
    var xCenterOffset = (bBox.width - g.graph().width * ratio) / 2;
    var yCenterOffset = (bBox.height - g.graph().height * ratio) / 2;
    inner.attr(
      "transform",
      "translate(" + xCenterOffset + `,` + yCenterOffset + `) scale(${ratio})`
    );
  });

  return (
    <svg style={{ width: "100%", height: "90%", padding: "0" }} id="thesvg">
      <g style={{ width: "100%", height: "90%", padding: "0" }} />
    </svg>
  );
};

const NetActivityInfo = props => {
  let max;
  if (props.free) {
    max = 800;
  } else {
    max = 100000000;
  }
  const [lang, l10n] = getl10n();
  return (
    <>
      <IonIcon icon={icons.arrowDown} style={{ verticalAlign: "-10%" }} />
      &nbsp;
      <SpeedLabel kbps={props.down} max={max} />
      &emsp;
      <IonIcon icon={icons.arrowUp} style={{ verticalAlign: "-10%" }} />
      &nbsp;
      <SpeedLabel kbps={props.up} max={max} />
      &emsp;
      <IonIcon icon={icons.swap} style={{ verticalAlign: "-10%" }} />
      &nbsp;
      <PingLabel ms={props.ms} /> <br />
      {props.free && (
        <small>
          {l10n.freelimit}{" "}
          <b>
            <IonText color="danger">800</IonText>
          </b>{" "}
          kbps
        </small>
      )}
    </>
  );
};

const formatRemaining = dateString => {
  const [_, l10n] = getl10n();
  const date = Date.parse(dateString);
  const msPerDay = 24 * 60 * 60 * 1000;
  const timeLeft = date.getTime() - new Date().getTime();
  const daysLeft = timeLeft / msPerDay;
  return l10n.fmtDaysLeft(daysLeft.toFixed(0));
};

const getExtendURL = () =>
  `https://geph.io/billing/login?next=%2Fbilling%2Fdashboard&uname=${encodeURI(
    localStorage.getItem("prefs.uname")
  )}&pwd=${encodeURI(localStorage.getItem("prefs.pwd"))}`;

const PayBanner = props => (
  <IonRow
    style={{
      backgroundColor: props.expiry ? "#eeeeee" : "#316745",
      color: props.expiry ? "black" : "white",
      display: "flex",
      padding: "4px",
      fontSize: "90%",
      justifyContent: "center",
      alignItems: "center",
      visibility: props.visible ? "visible" : "hidden"
    }}
  >
    <IonCol style={{ textAlign: "left" }}>
      {props.expiry ? formatRemaining(props.expiry) : props.l10n.plusblurb}
    </IonCol>
    <IonCol style={{ textAlign: "right" }} size="auto">
      <IonButton
        size="small"
        color="light"
        onClick={() => {
          if (ngate.platform === "android") {
            window.location.href = getExtendURL();
          } else {
            window.open(getExtendURL(), "_blank");
          }
        }}
      >
        {props.expiry ? props.l10n.manage : props.l10n.upgrade}
      </IonButton>
    </IonCol>
  </IonRow>
);

const Overview = props => {
  const [lang, l10n] = getl10n();
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
          "--background": "#fefefe"
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            height: "100%"
          }}
        >
          <IonGrid className="ion-no-padding">
            <PayBanner
              l10n={l10n}
              visible={connState === "connected"}
              expiry={
                connState === "connected" &&
                props.netstats.Tier === "paid" &&
                props.netstats.Expiry
              }
            />
            <ConnStatusInfo status={connState} />
            <IonRow style={{ paddingTop: "16px", paddingBottom: "20px" }}>
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
          </IonGrid>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "0px",
            width: "100%",
            height: "50%",
            backgroundColor: "white",
            borderRadius: "24px 24px 0px 0px",
            boxShadow: "0px -5px 5px #eeeeee",
            display: "flex",
            flexDirection: "column"
          }}
        >
          <ExitSelector disabled={props.running} />
          <div>
            <NetActivityInfo
              free={props.netstats && props.netstats.Tier === "free"}
              up={props.upspeed}
              down={props.downspeed}
              ms={props.netstats && props.netstats.MinPing}
            />
          </div>
          <div
            style={{
              flex: "1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              backgroundImage: require("../assets/images/logo-naked.svg")
            }}
          >
            {connState === "connected" ? (
              <ConnInfo
                PublicIP={props.netstats.PublicIP}
                Bridges={props.netstats.Bridges}
                l10n={l10n}
              />
            ) : (
              <img
                src={require("../assets/images/logo-naked.svg")}
                style={{
                  height: "100px",
                  width: "100%",
                  objectFit: "contain",
                  opacity: "0.2"
                }}
              />
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Overview;
