import React, { useState } from "react";
import { getl10n } from "../redux/l10n";
import {
  IonLabel,
  IonButton,
  IonModal,
  IonRow,
  IonText,
  IonCol,
  IonBackButton,
  IonHeader,
  IonIcon,
  IonButtons,
  IonTitle,
  IonToolbar,
  IonCardTitle,
  IonCard,
  IonSpinner,
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
import * as axios from "axios";
import axiosRetry from "axios-retry";
import Flag from "react-world-flags";
import * as icons from "ionicons/icons";
import exits from "../fragments/exitList";
import * as ngate from "../nativeGate";
import "./Login.css";

const proxClient = axios.create({ baseURL: "http://127.0.0.1:23456" });
axiosRetry(proxClient, {
  retries: 10,
  retryDelay: axiosRetry.exponentialDelay
});

class Register extends React.Component {
  constructor(props) {
    super(props);
    this.props = props;
    this.state = {
      uname: "",
      pwd: "",
      pwdconfirm: "",
      captchaData:
        "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==",
      captchaID: "",
      captchaSoln: "",
      frozen: false
    };
    this.unameRegex = new RegExp("^[a-zA-Z0-9]{5,100}$");
  }

  componentDidMount() {
    this.proxyPID = ngate.startBinderProxy();
    console.log("spawned binder proxy");
    window.onbeforeunload = e => false;
    this.refreshCaptcha();
  }

  componentWillUnmount() {
    ngate.stopBinderProxy(this.proxyPID);
    console.log("stopped binder proxy");
    window.onbeforeunload = null;
  }

  refreshCaptcha() {
    console.log("refreshing captcha...");
    proxClient
      .get("/captcha", { responseType: "arraybuffer" })
      .then(response => {
        let b64img = new Buffer(response.data, "binary").toString("base64");
        let captchaID = response.headers["x-captcha-id"];
        console.log("got captcha response with ID = " + captchaID);
        this.setState({
          captchaID: captchaID,
          captchaData: "data:image/png;base64," + b64img
        });
      });
  }

  doRegister() {
    const [lang, l10n] = getl10n();
    console.log("registering!");
    this.refreshCaptcha();
    this.setState({ frozen: true });
    proxClient
      .post("/register", {
        Username: this.state.uname,
        Password: this.state.pwd,
        CaptchaID: this.state.captchaID,
        CaptchaSoln: this.state.captchaSoln
      })
      .then(resp => {
        console.log("got response with status", resp.status);
        if (resp.status !== 200) {
          alert("unexpected status: ", +resp.status);
        } else {
          this.props.onSuccess(this.state.uname, this.state.pwd);
        }
      })
      .catch(err => {
        if (/403/.test(err.toString())) {
          alert(l10n.errExists);
        } else if (/400/.test(err.toString())) {
          alert(l10n.errBadCaptcha);
        } else {
          alert(err.toString());
        }
      })
      .finally(() => {
        this.setState({ frozen: false });
      });
  }

  render() {
    const [lang, l10n] = getl10n();
    return (
      <IonModal isOpen={true}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>{l10n.registerblurb}</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={this.props.onCancel}>{l10n.cancel}</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonList>
            <IonItem>
              <IonLabel position="floating" color="medium">
                {l10n.username}
              </IonLabel>
              <IonInput
                type="text"
                required
                value={this.state.uname}
                onInput={e => {
                  this.setState({ uname: e.target.value });
                }}
                disabled={this.state.frozen}
              ></IonInput>
              {this.unameRegex.test(this.state.uname) ? (
                ""
              ) : (
                <small>
                  <IonText color="danger">{l10n.unameillegal}</IonText>
                </small>
              )}
            </IonItem>
            <IonItem>
              <IonLabel position="floating" color="medium">
                {l10n.password}
              </IonLabel>
              <IonInput
                type="password"
                required
                value={this.state.pwd}
                onInput={e => {
                  this.setState({ pwd: e.target.value });
                }}
                disabled={this.state.frozen}
              ></IonInput>
            </IonItem>
            <IonItem>
              <IonLabel position="floating" color="medium">
                {l10n.passwordConfirm}
              </IonLabel>
              <IonInput
                type="password"
                required
                value={this.state.pwdconfirm}
                onInput={e => {
                  this.setState({ pwdconfirm: e.target.value });
                }}
                disabled={this.state.frozen}
              ></IonInput>
              {this.state.pwd === this.state.pwdconfirm ? (
                ""
              ) : (
                <small>
                  <IonText color="danger">{l10n.pwdmismatch}</IonText>
                </small>
              )}
            </IonItem>
            <IonItem>
              <IonText>
                <img
                  src={this.state.captchaData}
                  height="80"
                  width="240"
                  onClick={_ => this.refreshCaptcha()}
                />
              </IonText>
              <IonLabel position="floating" color="medium">
                {l10n.captcha}
              </IonLabel>
              <IonInput
                type="number"
                required
                value={this.state.captchaSoln}
                onInput={e => {
                  this.setState({ captchaSoln: e.target.value });
                }}
                disabled={this.state.frozen}
              ></IonInput>
            </IonItem>
          </IonList>
          <IonButton
            className="regButton"
            expand="block"
            mode="ios"
            onClick={_ => this.doRegister()}
            disabled={
              this.state.frozen ||
              this.state.pwd !== this.state.pwdconfirm ||
              this.state.pwd.length === 0 ||
              !this.unameRegex.test(this.state.uname)
            }
          >
            {l10n.registerblurb}
          </IonButton>
        </IonContent>
      </IonModal>
    );
  }
}

export default class Login extends React.Component {
  constructor(props) {
    super(props);
    this.props = props;
    if (localStorage.getItem("prefs.uname")) {
      this.state = { success: true };
    } else {
      this.state = {
        uname: "",
        pwd: "",
        trying: false,
        success: false,
        registerOpen: false
      };
    }
  }

  onLogin() {
    this.setState({ trying: true });
    ngate.checkAccount(this.state.uname, this.state.pwd).then(code => {
      setTimeout(() => {
        this.setState({ trying: false });
        if (code === 0) {
          this.setState({ success: true });
          localStorage.setItem("prefs.uname", this.state.uname);
          localStorage.setItem("prefs.pwd", this.state.pwd);
        } else if (code === 11) {
          alert("Incorrect username and password. Please try again.");
        } else if (code === 10) {
          alert("Timeout");
        } else {
          alert("Could not connect. ECODE " + code);
        }
      }, 1000);
    });
  }

  onOpenRegister() {
    this.setState({ registerOpen: true });
  }

  render() {
    const [lang, l10n] = getl10n();
    return (
      <IonModal isOpen={!this.state.success}>
        <IonContent>
          {/* Spinner */}
          {this.state.trying && <IonLoading isOpen message={""} />}
          {/* Registration modal */}
          {this.state.registerOpen ? (
            <Register
              onCancel={_ => this.setState({ registerOpen: false })}
              onSuccess={(u, p) => {
                this.setState({
                  registerOpen: false,
                  uname: u,
                  pwd: p
                });
              }}
            />
          ) : (
            ""
          )}
          <div class="container">
            <IonCard mode="ios">
              <IonCardHeader id="biglogohdr">
                <img
                  id="biglogo"
                  src={require("../assets/images/logo-naked.svg")}
                />
              </IonCardHeader>
              <IonCardContent>
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    this.onLogin();
                  }}
                >
                  <IonList id="upform">
                    <IonItem>
                      <IonLabel position="floating" color="medium">
                        {l10n.username}
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
                        {l10n.password}
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
                    {l10n.loginblurb}
                  </IonButton>
                  <IonButton
                    className="regButton"
                    color="dark"
                    expand="block"
                    mode="ios"
                    type="button"
                    onClick={e => this.onOpenRegister()}
                  >
                    {l10n.registerblurb}
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
