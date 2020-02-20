import React, { useState, useEffect } from "react";
import {
  Grid,
  TextField,
  Button,
  CircularProgress,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from "@material-ui/core";
import { useSelector, useDispatch } from "react-redux";
import { l10nSelector } from "../redux/l10n";
import { checkAccount, stopBinderProxy, startBinderProxy } from "../nativeGate";
import axios from "axios";
import axiosRetry, { exponentialDelay } from "axios-retry";
import Alert from "@material-ui/lab/Alert";

const codeBadCred = 11;
const codeBadNet = 10;
const codeOK = 0;
const codeExists = 12;
const codeBadCaptcha = 13;

const LoginFrag: React.FC = props => {
  const [uname, setUname] = useState("");
  const [pwd, setPwd] = useState("");
  const [busy, setBusy] = useState(false);
  const [dialogContent, setDialogContent] = useState(<></>);
  const l10n = useSelector(l10nSelector);
  const dispatch = useDispatch();
  // port over old localstorage-based username and pwd
  useEffect(() => {
    const oldUname = localStorage.getItem("prefs.uname");
    const oldPwd = localStorage.getItem("prefs.pwd");
    console.log(oldUname);
    console.log(oldPwd);
    if (oldUname && oldPwd) {
      localStorage.removeItem("prefs.uname");
      localStorage.removeItem("prefs.pwd");
      setUname(oldUname);
      setPwd(oldPwd);
    }
  }, []);
  const finishLogin = () => {
    dispatch({ type: "PREF", key: "username", value: uname });
    dispatch({ type: "PREF", key: "password", value: pwd });
  };

  // show login progress
  const doLogin = async () => {
    setDialogContent(
      <>
        <DialogTitle>{l10n.loggingin}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <LinearProgress />
          </DialogContentText>
        </DialogContent>
      </>
    );
    setBusy(true);
    const code = await checkAccount(uname, pwd);
    if (code === codeOK) {
      finishLogin();
      return;
    }
    setDialogContent(
      <>
        <DialogTitle>{l10n.loggingin}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {code === codeBadCred ? l10n.errBadCred : l10n.errBadNet}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={_ => setBusy(false)}>OK</Button>
        </DialogActions>
      </>
    );
  };

  // show register
  const doRegister = async () => {
    setDialogContent(
      <Register
        uname={uname}
        pwd={pwd}
        onCancel={() => {
          setBusy(false);
        }}
        onSuccess={(u: string, p: string) => {
          setUname(u);
          setPwd(p);
          setBusy(false);
        }}
      />
    );
    setBusy(true);
  };
  return (
    <>
      <Dialog open={busy} fullWidth>
        {dialogContent}
      </Dialog>
      <Grid
        container
        direction="column"
        justify="center"
        alignItems="center"
        style={{ height: "90vh" }}
      >
        <Grid item style={{ width: "80vw", textAlign: "center" }}>
          <img
            style={{
              maxHeight: "20vh",
              maxWidth: "50vw",
              paddingBottom: "30px"
            }}
            src={require("../assets/images/logo-naked.svg")}
          />{" "}
          <br />
          <form
            onSubmit={async e => {
              e.preventDefault();
              doLogin();
            }}
          >
            <TextField
              id="uname"
              label={l10n.username}
              fullWidth
              variant="outlined"
              style={{ paddingBottom: "16px" }}
              onChange={evt => setUname(evt.target.value)}
              value={uname}
            />
            <TextField
              id="pwd"
              label={l10n.password}
              fullWidth
              type="password"
              variant="outlined"
              style={{ paddingBottom: "16px" }}
              onChange={evt => setPwd(evt.target.value)}
              value={pwd}
              helperText={pwd + " "}
            />
            <Button
              variant="contained"
              color="primary"
              style={{ marginBottom: "8px", textTransform: "none" }}
              type="submit"
              disabled={busy}
            >
              {l10n.loginblurb}
            </Button>
            <br />
            <Button
              variant="contained"
              style={{ marginBottom: "8px", textTransform: "none" }}
              onClick={_ => doRegister()}
            >
              {l10n.registerblurb}
            </Button>
          </form>
        </Grid>
      </Grid>
    </>
  );
};

const Register = (props: {
  uname: string;
  pwd: string;
  onCancel: () => any;
  onSuccess: (uname: string, pwd: string) => any;
}) => {
  const l10n = useSelector(l10nSelector);
  const [uname, setUname] = useState(props.uname);
  const [pwd, setPwd] = useState(props.pwd);
  const [captchaSoln, setCaptchaSoln] = useState("");
  const [captchaData, setCaptchaData] = useState("");
  const [captchaID, setCaptchaID] = useState("");
  const [busy, setBusy] = useState(false);
  const [errString, setErrString] = useState("");

  const fetchCaptcha = async () => {
    const [id, c] = await getCaptcha();
    console.log(c);
    setCaptchaData(c);
    setCaptchaID(id);
  };
  const doRegister = async () => {
    setBusy(true);
    try {
      console.log("attempting to register account");
      const retcode = await registerAccount(uname, pwd, captchaID, captchaSoln);
      switch (retcode) {
        case codeOK:
          setErrString("");
          props.onSuccess(uname, pwd);
          break;
        case codeExists:
          setErrString(l10n.errExists);
          break;
        case codeBadCaptcha:
          setErrString(l10n.errBadCaptcha);
          fetchCaptcha();
          break;
        case codeBadNet:
          setErrString(l10n.errBadNet);
          break;
      }
    } finally {
      setBusy(false);
    }
  };
  // fetch captcha
  useEffect(() => {
    fetchCaptcha();
  }, []);
  return (
    <>
      <DialogTitle>{l10n.registerblurb}</DialogTitle>
      <DialogContent>
        {errString !== "" ? <Alert severity="error">{errString}</Alert> : ""}
        <TextField
          id="uname"
          label={l10n.username}
          fullWidth
          variant="outlined"
          size="small"
          style={{ marginBottom: "8px", marginTop: "8px" }}
          onChange={evt => setUname(evt.target.value)}
          value={uname}
        />
        <TextField
          id="pwd"
          label={l10n.password}
          fullWidth
          type="password"
          variant="outlined"
          size="small"
          style={{ marginBottom: "8px", marginTop: "8px" }}
          onChange={evt => setPwd(evt.target.value)}
          value={pwd}
          helperText={pwd + " "}
        />
        <div style={{ marginBottom: "0px", marginTop: "0px", height: "60px" }}>
          {captchaData === "" ? (
            <CircularProgress />
          ) : (
            <img
              src={captchaData}
              height="60"
              width="240"
              onClick={_ => {
                setCaptchaData("");
                fetchCaptcha();
              }}
            />
          )}
        </div>
        <TextField
          id="captcha"
          label={l10n.captcha}
          fullWidth
          type="number"
          variant="outlined"
          size="small"
          style={{ marginBottom: "8px", marginTop: "8px" }}
          onChange={evt => setCaptchaSoln(evt.target.value)}
          value={captchaSoln}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={_ => props.onCancel()} disabled={busy}>
          {l10n.cancel}
        </Button>
        <Button color="primary" onClick={_ => doRegister()} disabled={busy}>
          {l10n.registerblurb}
        </Button>
      </DialogActions>
    </>
  );
};

const proxClient = axios.create({ baseURL: "http://127.0.0.1:23456" });
axiosRetry(proxClient, {
  retries: 1000,
  retryDelay: exponentialDelay
});

const getCaptcha = async () => {
  const pid = startBinderProxy();
  try {
    const response = await proxClient.get("/captcha", {
      responseType: "arraybuffer"
    });
    const b64img =
      "data:image/png;base64," +
      new Buffer(response.data, "binary").toString("base64");
    const captchaID = response.headers["x-captcha-id"] as string;
    return [captchaID, b64img];
  } finally {
    stopBinderProxy(pid);
  }
};

const registerAccount = async (
  username: string,
  password: string,
  captchaID: string,
  captchaSoln: string
) => {
  const pid = startBinderProxy();
  try {
    while (true) {
      try {
        const resp = await proxClient.post("/register", {
          Username: username,
          Password: password,
          CaptchaID: captchaID,
          CaptchaSoln: captchaSoln
        });
        if (resp.status !== 200) {
          return codeBadNet;
        } else {
          return codeOK;
        }
      } catch (err) {
        if (/403/.test(err.toString())) {
          return codeExists;
        } else if (/400/.test(err.toString())) {
          return codeBadCaptcha;
        } else {
          continue;
        }
      }
    }
  } finally {
    stopBinderProxy(pid);
  }
};
export default LoginFrag;
