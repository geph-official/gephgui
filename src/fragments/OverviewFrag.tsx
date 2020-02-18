import React, { useState, Props } from "react";
import { l10nSelector } from "../redux/l10n";
import { useSelector } from "react-redux";
import * as icons from "@material-ui/icons";
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
  Typography
} from "@material-ui/core";
import { GlobalState } from "../redux";
import { ConnectionStatus, Tier } from "../redux/connState";
import { IOSSwitch, AntSwitch } from "./Switches";
import ExitSelectorFrag from "./ExitSelectorFrag";

const useStyles = makeStyles({
  verticalGrid: {
    height: "calc(100vh - 50px)",
    padding: 0
  },
  card: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: "24px 24px 0px 0px",
    boxShadow: "0px -5px 5px #eeeeee",
    height: "100%"
  },
  center: {
    textAlign: "center"
  }
});

const OverviewFrag: React.FC = props => {
  const l10n = useSelector(l10nSelector);
  const classes = useStyles();
  return (
    <>
      <Grid
        container
        className={classes.verticalGrid}
        direction="column"
        justify="space-around"
        alignItems="center"
      >
        <Grid item>
          <ConnStatusInfo />
        </Grid>
        <Grid item>
          <ConnToggle />
        </Grid>
        <Grid
          item
          style={{
            height: "40vh",
            width: "100%"
          }}
          className={classes.center}
        >
          <Card className={classes.card}>
            <CardContent>
              <ExitSelectorFrag /> <br />
              <NetActivityInfo />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
};

const ConnToggle = (props: {}) => {
  return <IOSSwitch />;
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
    <Grid container justify="center" alignItems="center">
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
  let max;
  if (connState.tier === Tier.Free) {
    max = 800;
  } else {
    max = 100000000;
  }
  return (
    <>
      <icons.ArrowDownward fontSize="small" />
      &nbsp;
      <SpeedLabel kbps={0} max={max} />
      &emsp;
      <icons.ArrowUpward />
      &nbsp;
      <SpeedLabel kbps={0} max={max} />
      &emsp;
      <icons.ImportExport />
      &nbsp;
      <PingLabel ms={connState.ping} /> <br />
      {connState.tier === Tier.Free && (
        <small>
          {l10n.freelimit} <b style={{ color: "red" }}>800</b>
          &nbsp;kbps
        </small>
      )}
    </>
  );
};

const SpeedLabel = props => {
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
    color: "rgba(" + intensity * 255 + ", 50, 50, 255)"
  };

  return (
    <span style={bwStyle}>
      <b style={beestyle}>{roundToTwo(props.kbps / divider)}</b> {suffix}
    </span>
  );
};

const PingLabel = props => {
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
