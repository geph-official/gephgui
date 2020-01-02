import React from "react";
import {
  IonHeader,
  IonToolbar,
  IonPage,
  IonTitle,
  IonContent,
  IonList,
  IonListHeader,
  IonItem,
  IonToggle,
  IonLabel,
  IonSelect,
  IonNote,
  IonSelectOption
} from "@ionic/react";
import { Link } from "react-router-dom";
import * as ngate from "../nativeGate";

import { getl10n, arrs } from "./l10n";

const Settings = () => {
  const [lang, l10n] = getl10n();
  return (
    <IonPage>
      <IonContent>
        <IonList>
          <IonListHeader mode="ios">{l10n.general}</IonListHeader>
          <IonItem>
            <IonLabel>{l10n.language}</IonLabel>
            <IonSelect
              value={localStorage.getItem("prefs.lang")}
              slot="end"
              onIonChange={e => {
                localStorage.setItem("prefs.lang", e.target.value);
              }}
            >
              {["en-US", "zh-TW", "zh-CN"].map(v => (
                <IonSelectOption value={v}>{arrs[v].langname}</IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
        </IonList>
        <IonList>
          <IonListHeader mode="ios">{l10n.network}</IonListHeader>
          <IonItem lines="full">
            <IonLabel>
              {l10n.tcp}
              <br />
              <IonNote>{l10n.tcpblurb}</IonNote>
            </IonLabel>
            <IonToggle
              slot="end"
              checked={localStorage.getItem("prefs.useTCP")}
              onIonChange={e => {
                localStorage.setItem("prefs.useTCP", e.target.checked);
              }}
            />
          </IonItem>
          <IonItem lines="full">
            <IonLabel>
              {l10n.forcebridges}
              <br />
              <IonNote>{l10n.tcpblurb}</IonNote>
            </IonLabel>
            <IonToggle
              slot="end"
              checked={localStorage.getItem("prefs.forceBridges")}
              onIonChange={e => {
                localStorage.setItem("prefs.forceBridges", e.target.checked);
              }}
            />
          </IonItem>
          {ngate.platform === "electron" ? (
            <IonItem lines="full">
              <IonLabel>
                {l10n.autoproxy}
                <br />
                <IonNote>{l10n.autoproxyblurb}</IonNote>
              </IonLabel>
              <IonToggle
                slot="end"
                checked={localStorage.getItem("prefs.autoProxy")}
                onIonChange={e => {
                  localStorage.setItem("prefs.autoProxy", e.target.checked);
                }}
              />
            </IonItem>
          ) : (
            ""
          )}
          <IonItem lines="full">
            <IonLabel>{l10n.socks5}</IonLabel>
            <IonLabel slot="end" color="medium">
              <tt>localhost:9909</tt>
            </IonLabel>
          </IonItem>
          <IonItem lines="full">
            <IonLabel>{l10n.http}</IonLabel>
            <IonLabel slot="end" color="medium">
              <tt>localhost:9910</tt>
            </IonLabel>
          </IonItem>
        </IonList>
        <IonList>
          <IonListHeader mode="ios">{l10n.advanced}</IonListHeader>
          <Link to="/logs">
            <IonItem lines="full">
              <IonLabel>Debug logs</IonLabel>
            </IonItem>
          </Link>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Settings;
