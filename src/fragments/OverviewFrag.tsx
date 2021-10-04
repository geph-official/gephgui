import React, { useState, Props } from "react";
import { l10nSelector } from "../redux/l10n";
import { useSelector, useDispatch } from "react-redux";
import * as icons from "@material-ui/icons";
import Alert from "@material-ui/lab/Alert";
import {
  Grid,
  makeStyles,
  CircularProgress,
  Switch,
  withStyles,
  Theme,
  createStyles,
  Card,
  CardContent,
  Typography,
  Button,
} from "@material-ui/core";
import { GlobalState } from "../redux";
import { ConnectionStatus, Tier, SpecialConnStates } from "../redux/connState";
import { IOSSwitch, AntSwitch } from "./Switches";
import { ExitDisplay, ExitSelector } from "./ExitDisplay";
import { startDaemon, getPlatform } from "../nativeGate";
import { prefSelector } from "../redux/prefs";
import { stopDaemon } from "../nativeGate";
import { purple, green } from "@material-ui/core/colors";
import AccountFrag from "./AccountFrag";

const useStyles = makeStyles({
  verticalGrid: {
    height: "calc(100vh - 64px)",
    padding: 0,
  },
  center: {
    textAlign: "center",
  },
});

const OverviewFrag = (props: { forceSync: () => void }) => {
  const l10n = useSelector(l10nSelector);
  const connState = useSelector((state: GlobalState) => state.connState);
  const classes = useStyles();
  return (
    <>
      <Grid
        container
        className={classes.verticalGrid}
        direction="column"
        justify="space-between"
        alignItems="center"
        style={{ height: "calc(100vh - 80px)" }}
      >
        <Grid item style={{ width: "100%", marginTop: 0, paddingTop: 0 }}>
          <AccountFrag forceSync={props.forceSync} />
        </Grid>
        <Grid container direction="column" alignItems="center">
          <ConnStatusInfo />
          <ExitDisplay />
        </Grid>
        <Grid
          item
          style={{
            width: "100%",
            marginBottom: "1.25rem",
          }}
          className={classes.center}
        >
          <Grid item>
            <ExitSelector /> <br />
            <ConnToggle />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

const GreenButton = withStyles((theme) => ({
  root: {
    color: theme.palette.getContrastText(green[800]),
    backgroundColor: green[700],
    "&:hover": {
      backgroundColor: green[900],
    },
  },
}))(Button);

const ConnToggle = (props: {}) => {
  const l10n = useSelector(l10nSelector);
  const stateConnected = useSelector(
    (state: GlobalState) => state.connState.connected
  );
  const exitState = useSelector((state: GlobalState) => state.exitState);
  const username = useSelector(prefSelector("username", "dorbie"));
  const password = useSelector(prefSelector("password", "fc9dfc3d"));
  const listenAllStr = useSelector(prefSelector("listenAll", "false"));
  const forceBridgesStr = useSelector(prefSelector("forceBridges", "false"));
  const autoProxyStr = useSelector(prefSelector("autoProxy", "true"));
  const bypassChineseStr = useSelector(prefSelector("bypassChinese", "false"));
  const vpnStr = useSelector(prefSelector("vpn", "false"));
  const tcpStr = useSelector(prefSelector("useTCP", "false"));
  const excludeAppsJson = useSelector(prefSelector("excludedAppList", "[]"));
  const excludeApps =
    useSelector(prefSelector("excludeApps", false)) === "true";
  const dispatch = useDispatch();
  const [forceState, setForceState] = useState("ind");
  const handler = async (_) => {
    if (stateConnected === ConnectionStatus.Disconnected) {
      // we first set the state to unknown
      dispatch({ type: "CONN", rawJson: SpecialConnStates.Connecting });
      await startDaemon(
        exitState.selectedExit.hostname,
        username,
        password,
        listenAllStr === "true",
        forceBridgesStr === "true",
        tcpStr === "true",
        autoProxyStr === "true",
        bypassChineseStr === "true",
        vpnStr === "true",
        excludeApps ? excludeAppsJson : "[]"
      );
      setForceState("yes");
    } else {
      setForceState("no");
      await stopDaemon();
      dispatch({ type: "CONN", rawJson: SpecialConnStates.Dead });
    }
  };
  if (stateConnected === ConnectionStatus.Disconnected) {
    return (
      <GreenButton
        variant="contained"
        color="primary"
        disableElevation
        onClick={handler}
        style={{
          fontSize: "110%",
          textTransform: "initial",
          fontWeight: "normal",
          width: "50vw",
        }}
      >
        {l10n.connect}
      </GreenButton>
    );
  } else {
    return (
      <Button
        variant="contained"
        color="secondary"
        disableElevation
        onClick={handler}
        style={{
          fontSize: "110%",
          textTransform: "initial",
          fontWeight: "normal",
          width: "50vw",
        }}
      >
        {l10n.disconnect}
      </Button>
    );
  }
};

const ConnStatusInfo = (props: {}) => {
  let lhs;
  let rhs;
  const l10n = useSelector(l10nSelector);
  const connState = useSelector((state: GlobalState) => state.connState);

  // disconnected state
  if (connState.connected === ConnectionStatus.Disconnected) {
    lhs = (
      <icons.HighlightOff
        style={{ fontSize: "5rem", marginRight: "0.4rem" }}
        color="disabled"
      />
    );
    rhs = l10n.disconnected;
  }

  // connecting state
  if (connState.connected === ConnectionStatus.Connecting) {
    lhs = <CircularProgress size={55} />;
    rhs = <b>{l10n.connecting}...</b>;
  }

  // connected state
  if (connState.connected === ConnectionStatus.Connected) {
    lhs = (
      <icons.CheckCircle
        style={{ fontSize: "5rem", marginRight: "0.4rem" }}
        color="primary"
      />
    );
    rhs = (
      <span>
        <b>{l10n.connected}</b>
        <br />
        <NetActivityInfo />
      </span>
    );
  }

  return (
    <Grid
      container
      justify="center"
      alignItems="center"
      style={{ height: "3.75rem" }}
    >
      <Grid item style={{ marginRight: "1.25rem" }}>
        {lhs}
      </Grid>
      <Grid item style={{ fontSize: "150%" }}>
        {rhs}
      </Grid>
    </Grid>
  );
};

const NetActivityInfo = (props: {}) => {
  const l10n = useSelector(l10nSelector);
  const connState = useSelector((state: GlobalState) => state.connState);
  const acctState = useSelector((state: GlobalState) => state.acctState);
  const isValid = useSelector(
    (state: GlobalState) =>
      state.connState.connected === ConnectionStatus.Connected
  );
  let max;
  let isPaid = acctState && acctState.subscription;
  if (isPaid) {
    max = 100000000;
  } else {
    max = 1600;
  }
  const upSpeed =
    !isValid || connState.oldUpBytes < 1
      ? 0
      : connState.upBytes - connState.oldUpBytes;
  const downSpeed =
    !isValid || connState.oldDownBytes < 1
      ? 0
      : connState.downBytes - connState.oldDownBytes;
  const loss = isValid && connState.loss;
  return (
    <div
      style={{
        fontSize: "60%",
        width: 0,
        overflow: "visible",
        whiteSpace: "nowrap",
        opacity: 0.8,
      }}
    >
      <SpeedLabel kbps={(8 * (downSpeed + upSpeed)) / 1000} max={max} />
      &ensp;
      <PingLabel ms={isValid && connState.ping} />
      &ensp;
      <LossLabel loss={loss} />
      <br />
    </div>
  );
};

const SpeedLabel = (props) => {
  const bwStyle = {};

  function roundToTwo(num) {
    if (num < 1) {
      return "0.00";
    }
    return num.toPrecision(3);
  }
  let suffix;
  let divider;
  if (props.kbps > 1000) {
    suffix = "M";
    divider = 1000;
  } else {
    suffix = "k";
    divider = 1;
  }

  // compute the color
  let intensity = Math.min(1, Math.pow(props.kbps / props.max, 5));
  let beestyle = {
    color: "rgba(" + intensity * 255 + ", 50, 50, 255)",
  };

  return (
    <span style={bwStyle}>
      <b style={beestyle}>{roundToTwo(props.kbps / divider)}</b>
      {suffix}
    </span>
  );
};

const PingLabel = (props) => {
  let style = {};
  if (props.ms) {
    if (props.ms < 100) {
      style = { color: "darkgreen" };
    } else if (props.ms < 150) {
      style = { color: "green" };
    } else if (props.ms < 200) {
      style = { color: "darkorange" };
    } else {
      style = { color: "red" };
    }
  }
  return (
    <>
      <b style={style}>{props.ms && props.ms > 0.01 ? props.ms : "-"}</b>ms
    </>
  );
};

const LossLabel = (props) => {
  let style = {};
  if (props.loss < 1) {
    style = { color: "darkgreen" };
  } else if (props.loss < 5) {
    style = { color: "green" };
  } else if (props.loss < 15) {
    style = { color: "darkorange" };
  } else {
    style = { color: "red" };
  }

  return (
    <>
      <b style={style}>{props.loss.toFixed(1)}</b>%
    </>
  );
};

export default OverviewFrag;
