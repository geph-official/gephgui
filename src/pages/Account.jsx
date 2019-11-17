import React, { useState } from "react";
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
  IonNote,
  IonCol,
  IonIcon,
  IonButton,
  IonText,
  IonButtons
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
    visibility:
      props.running && props.netstats && props.netstats.Connected
        ? "visible"
        : "hidden"
  };
  const isFree = props.netstats.Tier === "free";
  const extendURL = `https://geph.io/billing/login?next=%2Fbilling%2Fdashboard&uname=${encodeURI(
    localStorage.getItem("prefs.uname")
  )}&pwd=${encodeURI(localStorage.getItem("prefs.pwd"))}`;
  // state
  const [pwdShown, setPwdShown] = useState(false);
  return (
    <IonPage>
      <IonContent>
        <div class="cards">
          <IonCard mode="ios">
            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={icons.person} size="large" />
                &nbsp;
                <IonLabel>{l10n.accinfo}</IonLabel>
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonGrid>
                <IonRow>
                  <IonCol>
                    <b>{l10n.username}</b>
                  </IonCol>
                  <IonCol className="accinfo">
                    {localStorage.getItem("prefs.uname")}
                  </IonCol>
                </IonRow>
                <IonRow>
                  <IonCol>
                    <b>{l10n.password}</b>
                  </IonCol>
                  <IonCol className="accinfo">
                    {pwdShown ? (
                      <>
                        <IonIcon
                          icon={icons.eyeOff}
                          onClick={() => setPwdShown(false)}
                        />
                        &nbsp;&nbsp;<tt>{localStorage.getItem("prefs.pwd")}</tt>
                      </>
                    ) : (
                      <>
                        <IonIcon
                          icon={icons.eye}
                          onClick={() => setPwdShown(true)}
                        />
                        &nbsp;&nbsp;<tt>*******</tt>
                      </>
                    )}
                  </IonCol>
                </IonRow>
                <IonRow>
                  <IonCol style={{ textAlign: "center" }}>
                    <IonButton
                      color="danger"
                      size="small"
                      onClick={() => {
                        // FORCE reset
                        ngate.stopDaemon();
                        localStorage.clear();
                        window.location.reload();
                      }}
                    >
                      {l10n.logout}
                    </IonButton>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonCardContent>
          </IonCard>
          <IonCard class="flexgrow" mode="ios" style={hideWhenNotRunning}>
            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={icons.card} size="large" />
                &nbsp;
                <IonLabel>{l10n.subscription}</IonLabel>
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonGrid>
                <IonRow>
                  <IonCol>
                    <b>{l10n.subscription}</b>
                  </IonCol>
                  <IonCol className="accinfo">
                    {props.netstats.Username === "dorbie" ||
                    props.netstats.Username === "LisaWei"
                      ? "Dorthisbe"
                      : l10n[props.netstats.Tier]}
                  </IonCol>
                </IonRow>
                <IonRow>
                  {!isFree
                    ? [
                        <IonCol>
                          <b>{l10n.expiry}</b>
                        </IonCol>,
                        <IonCol className="accinfo">
                          {expiryText === "2100-01-31" ? "Forever" : expiryText}
                        </IonCol>
                      ]
                    : [
                        <IonCol>
                          <b>
                            <IonText color="success">
                              {l10n.upgradeToPlus}
                            </IonText>
                          </b>
                          <br />
                          <small>{l10n.unlockUnlimitedSpeed}</small>
                        </IonCol>,
                        <IonCol>
                          <IonButton
                            size="small"
                            mode="ios"
                            onClick={() => {
                              if (ngate.platform === "android") {
                                window.location.href = extendURL;
                              } else {
                                window.open(extendURL, "_blank");
                              }
                            }}
                          >
                            {l10n.seePlans}
                          </IonButton>
                        </IonCol>
                      ]}
                </IonRow>
                {!isFree ? (
                  <IonRow>
                    <IonCol style={{ textAlign: "center" }}>
                      <IonButton
                        color="primary"
                        mode="ios"
                        fill="outline"
                        size="small"
                        onClick={() => {
                          if (ngate.platform === "android") {
                            window.location.href = extendURL;
                          } else {
                            window.open(extendURL, "_blank");
                          }
                        }}
                      >
                        {l10n.extend}
                      </IonButton>
                    </IonCol>
                  </IonRow>
                ) : (
                  ""
                )}
              </IonGrid>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Account;
