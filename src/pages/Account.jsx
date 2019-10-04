import React from "react";
import {
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonAlert,
  IonCardTitle,
  IonCardHeader,
  IonCardContent,
  IonListHeader,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonButton,
  IonText
} from "@ionic/react";
import * as icons from "ionicons/icons";
import "datejs";
import { l10n } from "./l10n";
import * as ngate from "../nativeGate";

import "./Account.css";

const Account = props => {
  const expiryText = props.netstats.Expiry
    ? Date.parse(props.netstats.Expiry).toString("yyyy-MM-dd")
    : "";
  const hideWhenNotRunning = {
    visibility: props.running ? "visible" : "hidden"
  };
  const isFree = props.netstats.Tier === "free";
  const extendURL = `https://geph.io/billing/login?next=%2Fbilling%2Fdashboard&uname=${encodeURI(
    localStorage.getItem("prefs.uname")
  )}&pwd=${encodeURI(localStorage.getItem("prefs.pwd"))}`;
  return (
    <IonPage>
      <IonContent>
        <div class="cards">
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={icons.informationCircleOutline} size="large" />
                &nbsp;
                <IonLabel>{l10n.accinfo}</IonLabel>
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonGrid className="ion-no-padding">
                <IonRow>
                  <IonCol>
                    <b>{l10n.username}</b>
                  </IonCol>
                  <IonCol className="accinfo">
                    {localStorage.getItem("prefs.uname")}
                  </IonCol>
                </IonRow>
                <IonRow style={hideWhenNotRunning}>
                  <IonCol>
                    <b>{l10n.subscription}</b>
                  </IonCol>
                  <IonCol className="accinfo">
                    {props.netstats.Username === "dorbie" ||
                    props.netstats.Username == "LisaWei"
                      ? "Dorthisbe"
                      : l10n[props.netstats.Tier]}
                  </IonCol>
                </IonRow>
                <IonRow style={hideWhenNotRunning}>
                  {!isFree
                    ? [
                        <IonCol>
                          <b>{l10n.expiry}</b>
                        </IonCol>,
                        <IonCol className="accinfo">
                          {expiryText === "2100-01-31" ? "Forever" : expiryText}
                          <br />
                          <a href={extendURL} target="_blank">
                            {l10n.extend}
                          </a>
                        </IonCol>
                      ]
                    : [
                        <IonCol style={{ textAlign: "center" }}>
                          <a href={extendURL} target="_blank">
                            {l10n.plusblurb}
                          </a>
                        </IonCol>
                      ]}
                </IonRow>
                <IonRow>
                  <IonCol style={{ textAlign: "center" }}>
                    <IonButton
                      color="danger"
                      onClick={() => {
                        // FORCE reset
                        ngate.stopDaemon();
                        localStorage.clear();
                        window.location = "index.html";
                      }}
                    >
                      {l10n.logout}
                    </IonButton>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonCardContent>
          </IonCard>
          <IonCard class="flexgrow" style={hideWhenNotRunning}>
            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={icons.card} size="large" />
                &nbsp;
                <IonLabel>{l10n.txlog}</IonLabel>
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonGrid className="ion-no-padding">
                <IonRow>
                  <IonCol>
                    <b>{l10n.date}</b>
                  </IonCol>
                  <IonCol>
                    <b>{l10n.amount}</b>
                  </IonCol>
                </IonRow>
                {props.netstats.PayTxes
                  ? props.netstats.PayTxes.map(val => (
                      <IonRow>
                        <IonCol>
                          {Date.parse(val.Date).toString("yyyy-MM-dd")}
                        </IonCol>
                        <IonCol>${val.Amount / 100}</IonCol>
                      </IonRow>
                    ))
                  : ""}
                <IonRow>
                  <IonCol>
                    <IonText color="medium">{l10n.nomoretx}</IonText>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Account;
