import React, { useState, useEffect } from "react";
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
  IonText,
  IonTextarea
} from "@ionic/react";
import axios from "axios";

const Logs = props => {
  const [logs, setLogs] = useState([]);
  async function fetchLogs() {
    const logResp = await axios.get("http://localhost:9809/logs");
    setLogs(logResp.data);
  }
  useEffect(() => {
    fetchLogs();
  }, []);
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Debug logs</IonTitle>
          <IonButtons slot="start">
            <IonBackButton defaultHref="home" />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonTextarea
          style={{
            fontSize: "8pt",
            fontFamily: "monospace"
          }}
        >
          {logs.join("\n")}
        </IonTextarea>
      </IonContent>
    </IonPage>
  );
};

export default Logs;
