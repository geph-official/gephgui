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
  IonBackButton,
  IonButtons,
  IonListHeader,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonButton,
  IonText
} from "@ionic/react";

const Logs = props => (
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>Debug logs</IonTitle>
        <IonButtons slot="start">
          <IonBackButton defaultHref="home" />
        </IonButtons>
      </IonToolbar>
    </IonHeader>
    <IonContent
      style={{
        fontSize: "6pt",
        "--background": "#282828",
        "--color": "#00ff76",
        height: "100%",
        overflowY: "scroll"
      }}
    >
      {props.logs.map(line => (
        <>
          <tt>{line}</tt>
          <br />
        </>
      ))}
    </IonContent>
  </IonPage>
);

export default Logs;
