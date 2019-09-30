import React, { useState } from "react";
import l10n from "./l10n";
import {
  IonLabel,
  IonButton,
  IonModal,
  IonRow,
  IonText,
  IonCol,
  IonHeader,
  IonIcon,
  IonButtons,
  IonTitle,
  IonToolbar,
  IonCardTitle,
  IonCard,
  IonItem,
  IonContent,
  IonList,
  IonListHeader,
  IonChip,
  IonCardContent,
  IonInput,
  IonCardHeader,
  IonLoading
} from "@ionic/react";
import Flag from "react-world-flags";
import * as icons from "ionicons/icons";
import exits from "./exitList";
import * as ngate from "../nativeGate";

import "./Login.css";

export default class Login extends React.Component {
  constructor(props) {
    super(props);
    this.props = props;
    if (localStorage.getItem("prefs.uname")) {
      this.state = { success: true };
    } else {
      this.state = { uname: "", pwd: "", trying: false, success: false };
    }
  }

  render() {
    return (
      <IonModal isOpen={!this.state.success}>
        <IonContent>
          <IonLoading isOpen={this.state.trying} message={"Logging in..."} />
          <div class="container">
            <IonCard mode="ios">
              <IonCardHeader id="biglogohdr">
                <img
                  id="biglogo"
                  src={require("../assets/images/logo-zh-black.svg")}
                />
              </IonCardHeader>
              <IonCardContent>
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    this.setState({ trying: true });
                    ngate
                      .checkAccount(this.state.uname, this.state.pwd)
                      .then(code => {
                        setTimeout(() => {
                          this.setState({ trying: false });
                          if (code === 0) {
                            this.setState({ success: true });
                            localStorage.setItem(
                              "prefs.uname",
                              this.state.uname
                            );
                            localStorage.setItem("prefs.pwd", this.state.pwd);
                          } else if (code === 147) {
                            alert(
                              "Incorrect username and password. Please try again."
                            );
                          } else {
                            alert("Could not connect. ECODE " + code);
                          }
                        }, 1000);
                      });
                  }}
                >
                  <IonList id="upform">
                    <IonItem>
                      <IonLabel position="floating" color="medium">
                        Username
                      </IonLabel>
                      <IonInput
                        type="text"
                        required
                        value={this.state.uname}
                        onInput={e => {
                          this.setState({ uname: e.target.value });
                        }}
                      ></IonInput>
                    </IonItem>
                    <IonItem>
                      <IonLabel
                        position="floating"
                        type="password"
                        color="medium"
                      >
                        Password
                      </IonLabel>
                      <IonInput
                        type="password"
                        required
                        value={this.state.pwd}
                        onInput={e => {
                          this.setState({ pwd: e.target.value });
                        }}
                      ></IonInput>
                    </IonItem>
                  </IonList>
                  <button style={{ display: "none" }} type="submit"></button>
                  <IonButton
                    className="regButton"
                    expand="block"
                    mode="ios"
                    type="submit"
                  >
                    Log in with existing account
                  </IonButton>
                  <IonButton
                    className="regButton"
                    color="dark"
                    expand="block"
                    mode="ios"
                    type="button"
                  >
                    Create a new account
                  </IonButton>
                </form>
              </IonCardContent>
            </IonCard>
          </div>
        </IonContent>
      </IonModal>
    );
  }
}
