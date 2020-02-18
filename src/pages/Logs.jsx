import React, { useState, useEffect } from "react";
import { getl10n } from "../redux/l10n";
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
  function downloadURI(uri, name) {
    let link = document.createElement("a");
    link.download = name;
    link.href = uri;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    link.remove();
  }
  const [lang, l10n] = getl10n();
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Debug logs</IonTitle>
          <IonButtons slot="start">
            <IonBackButton defaultHref="home" />
          </IonButtons>
          <IonButtons slot="end">
            <IonButton
              onClick={async _ => {
                if (!window.Android) {
                  const txt = logs.join("\n");
                  const dataUrl = "data:text/plain;base64," + btoa(txt);
                  downloadURI(
                    dataUrl,
                    "geph-logs-" + new Date().getTime() + ".txt"
                  );
                } else {
                  const ta = document.getElementById("ta");
                  const textar = await ta.getInputElement();
                  textar.select();
                  document.execCommand("copy");
                  window.Android.jsShowToast(l10n.clipboard);
                }
              }}
            >
              {l10n.export}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonTextarea
          style={{
            fontSize: "8pt",
            fontFamily: "monospace"
          }}
          autoGrow
          id="ta"
          value={logs.join("\n")}
        ></IonTextarea>
      </IonContent>
    </IonPage>
  );
};

export default Logs;
