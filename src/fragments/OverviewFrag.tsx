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
import ExitSelectorFrag, { exitPrefKey } from "./ExitSelectorFrag";
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
  card: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: "24px 24px 0px 0px",
    boxShadow: "0px -5px 5px #eeeeee",
    height: "100%",
  },
  center: {
    textAlign: "center",
  },
});

const OverviewFrag: React.FC = (props) => {
  const l10n = useSelector(l10nSelector);
  const connState = useSelector((state: GlobalState) => state.connState);
  const classes = useStyles();
  return (
    <>
      <Grid
        container
        className={classes.verticalGrid}
        direction="column"
        justify="space-around"
        alignItems="center"
        style={{ height: "calc(100vh - 120px)" }}
      >
        <Grid item>
          <ConnStatusInfo />
        </Grid>
        <Grid item style={{ width: "100%" }}>
          <AccountFrag />
        </Grid>
        <Grid
          item
          style={{
            height: "100px",
            width: "100%",
          }}
          className={classes.center}
        >
          <Card className={classes.card}>
            <CardContent style={{ height: "100%" }}>
              <Grid
                container
                direction="column"
                alignItems="center"
                justify="space-between"
                style={{ height: "100%" }}
              >
                <Grid item>
                  <ExitSelectorFrag /> <br />
                  <NetActivityInfo />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          <Grid item>
            <ConnToggle />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

const formatRemaining = (l10n: Record<string, any>, dateString: string) => {
  const date = new Date(Date.parse(dateString));
  const msPerDay = 24 * 60 * 60 * 1000;
  const timeLeft = date.getTime() - new Date().getTime();
  const daysLeft = timeLeft / msPerDay;
  const nana = l10n.fmtDaysLeft as (x: string) => string;
  return l10n.fmtDaysLeft(daysLeft.toFixed(0));
};

const PayBanner = (props) => {
  const l10n = useSelector(l10nSelector);
  const username = useSelector(prefSelector("username", ""));
  const password = useSelector(prefSelector("password", ""));
  const extendURL = `https://geph.io/billing/login?next=%2Fbilling%2Fdashboard&uname=${encodeURIComponent(
    username
  )}&pwd=${encodeURIComponent(password)}`;
  return (
    <Grid
      container
      justify="space-between"
      alignItems="center"
      style={{
        backgroundColor: props.expiry ? "#eeeeee" : "#316745",
        color: props.expiry ? "black" : "white",
        display: "flex",
        padding: "0px",
        paddingLeft: "8px",
        paddingRight: "8px",
        margin: "0px",
        top: "0px",
        left: "0px",
        width: "100%",
        fontSize: "90%",
        height: "48px",
        visibility: props.visible ? "visible" : "hidden",
        position: "absolute",
      }}
    >
      <Grid item style={{ textAlign: "left" }}>
        {props.expiry ? formatRemaining(l10n, props.expiry) : l10n.plusblurb}
      </Grid>
      <Grid item style={{ textAlign: "right" }}>
        <Button
          onClick={() => {
            if (getPlatform() === "android") {
              window.location.href = extendURL;
            } else {
              window.open(extendURL, "_blank");
            }
          }}
          variant="contained"
        >
          {props.expiry ? l10n.manage : l10n.upgrade}
        </Button>
      </Grid>
    </Grid>
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
  const stateConnected = useSelector(
    (state: GlobalState) => state.connState.connected
  );
  const exitState = useSelector((state: GlobalState) => state.exitState);
  const username = useSelector(prefSelector("username", "dorbie"));
  const password = useSelector(prefSelector("password", "fc9dfc3d"));
  const listenAllStr = useSelector(prefSelector("listenAll", "false"));
  const forceBridgesStr = useSelector(prefSelector("forceBridges", "false"));
  const autoProxyStr = useSelector(prefSelector("autoProxy", "true"));
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
        autoProxyStr === "true"
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
      >
        Connect to Geph
      </GreenButton>
    );
  } else {
    return (
      <Button
        variant="contained"
        color="secondary"
        disableElevation
        onClick={handler}
      >
        Disconnect
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
        style={{ fontSize: "50px", marginRight: "-10px" }}
        color="disabled"
      />
    );
    rhs = l10n.disconnected;
  }

  // connecting state
  if (connState.connected === ConnectionStatus.Connecting) {
    lhs = <CircularProgress />;
    rhs = <b>{l10n.connecting}...</b>;
  }

  // connected state
  if (connState.connected === ConnectionStatus.Connected) {
    lhs = (
      <icons.CheckCircle
        style={{ fontSize: "50px", marginRight: "-10px" }}
        color="primary"
      />
    );
    rhs = (
      <span>
        <b>{l10n.connected}</b>
        <br />
        <small>{l10n.connectedblurb}</small>
      </span>
    );
  }

  return (
    <Grid
      container
      justify="center"
      alignItems="center"
      style={{ height: "40px" }}
    >
      <Grid item style={{ marginRight: "20px" }}>
        {lhs}
      </Grid>
      <Grid item>{rhs}</Grid>
    </Grid>
  );
};

const NetActivityInfo = (props: {}) => {
  const l10n = useSelector(l10nSelector);
  const connState = useSelector((state: GlobalState) => state.connState);
  const isValid = useSelector(
    (state: GlobalState) =>
      state.connState.connected === ConnectionStatus.Connected
  );
  let max;
  let isPaid = connState.syncState && connState.syncState.subscription;
  if (isPaid) {
    max = 100000000;
  } else {
    max = 800;
  }
  const upSpeed =
    !isValid || connState.oldUpBytes < 1
      ? 0
      : connState.upBytes - connState.oldUpBytes;
  const downSpeed =
    !isValid || connState.oldDownBytes < 1
      ? 0
      : connState.downBytes - connState.oldDownBytes;
  return (
    <span style={{ fontSize: "90%" }}>
      <icons.ArrowDownward fontSize="small" style={{ marginBottom: "-4px" }} />
      &nbsp;
      <SpeedLabel kbps={(8 * downSpeed) / 1000} max={max} />
      &emsp;
      <icons.ArrowUpward fontSize="small" style={{ marginBottom: "-4px" }} />
      &nbsp;
      <SpeedLabel kbps={(8 * upSpeed) / 1000} max={max} />
      &emsp;
      <icons.ImportExport fontSize="small" style={{ marginBottom: "-4px" }} />
      &nbsp;
      <PingLabel ms={isValid && connState.ping} /> <br />
    </span>
  );
};

const SpeedLabel = (props) => {
  const bwStyle = {};

  function roundToTwo(num) {
    if (num < 1) {
      return 0;
    }
    return num.toPrecision(3);
  }
  let suffix;
  let divider;
  if (props.kbps > 1000) {
    suffix = "Mbps";
    divider = 1000;
  } else {
    suffix = "kbps";
    divider = 1;
  }

  // compute the color
  let intensity = Math.min(1, Math.pow(props.kbps / props.max, 5));
  let beestyle = {
    color: "rgba(" + intensity * 255 + ", 50, 50, 255)",
  };

  return (
    <span style={bwStyle}>
      <b style={beestyle}>{roundToTwo(props.kbps / divider)}</b> {suffix}
    </span>
  );
};

const PingLabel = (props) => {
  let style = {};
  if (props.ms) {
    if (props.ms < 100) {
      style = { color: "blue" };
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
      <b style={style}>{props.ms && props.ms > 0.01 ? props.ms : "-"}</b> ms
    </>
  );
};

export default OverviewFrag;
