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

import { l10n, arrs } from "./l10n";

const Settings = () => {
  return (
    <IonPage>
      <IonContent>
        <IonList>
          <IonListHeader mode="ios">{l10n.general}</IonListHeader>
          <IonItem lines="full">
            <IonLabel>
              {l10n.autoconn}
              <br />
              <IonNote>{l10n.autoconnblurb}</IonNote>
            </IonLabel>
            <IonToggle
              slot="end"
              checked={localStorage.getItem("prefs.autoConn")}
              onIonChange={e => {
                localStorage.setItem("prefs.autoConn", e.target.checked);
              }}
            />
          </IonItem>
          <IonItem>
            <IonLabel>{l10n.language}</IonLabel>
            <IonSelect
              value={localStorage.getItem("prefs.lang")}
              slot="end"
              onIonChange={e => {
                localStorage.setItem("prefs.lang", e.target.value);
                alert(l10n.restartblurb);
              }}
            >
              {["en-US", "zh-TW", "zh-CN"].map(v => (
                <IonSelectOption value={v}>{arrs[v].langname}</IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
        </IonList>
        <IonList>
          <IonListHeader mode="ios">{l10n.advanced}</IonListHeader>
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
          <IonItem lines="full">
            <IonLabel>
              <Link to="/logs">Debug logs</Link>
            </IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Settings;
