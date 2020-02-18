import React from "react";
import { withStyles, Theme, createStyles } from "@material-ui/core/styles";
import { purple } from "@material-ui/core/colors";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch, { SwitchClassKey, SwitchProps } from "@material-ui/core/Switch";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

interface Styles extends Partial<Record<SwitchClassKey, string>> {
  focusVisible?: string;
}

interface Props extends SwitchProps {
  classes: Styles;
}

const PurpleSwitch = withStyles({
  switchBase: {
    color: purple[300],
    "&$checked": {
      color: purple[500]
    },
    "&$checked + $track": {
      backgroundColor: purple[500]
    }
  },
  checked: {},
  track: {}
})(Switch);

export const IOSSwitch = withStyles((theme: Theme) =>
  createStyles({
    root: {
      width: 88,
      height: 48,
      padding: 0,
      paddingBottom: 0,
      overflow: "visible"
    },
    switchBase: {
      padding: 1,
      "&$checked": {
        transform: "translateX(38px)",
        color: theme.palette.common.white,
        "& + $track": {
          backgroundColor: "#3eb370",
          opacity: 1
        }
      },
      "&$focusVisible $thumb": {
        color: "#52d869",
        border: "6px solid #fff"
      }
    },
    thumb: {
      width: 48,
      height: 48
    },
    track: {
      borderRadius: 48 / 2,
      border: `1px solid ${theme.palette.grey[400]}`,
      backgroundColor: theme.palette.grey[50],
      opacity: 1,
      transition: theme.transitions.create(["background-color", "border"])
    },
    checked: {},
    focusVisible: {}
  })
)(({ classes, ...props }: Props) => {
  return (
    <Switch
      focusVisibleClassName={classes.focusVisible}
      disableRipple
      classes={{
        root: classes.root,
        switchBase: classes.switchBase,
        thumb: classes.thumb,
        track: classes.track,
        checked: classes.checked
      }}
      {...props}
    />
  );
});

export const AntSwitch = withStyles((theme: Theme) =>
  createStyles({
    root: {
      width: 28,
      height: 16,
      padding: 0,
      display: "flex"
    },
    switchBase: {
      padding: 2,
      color: theme.palette.grey[500],
      "&$checked": {
        transform: "translateX(12px)",
        color: theme.palette.common.white,
        "& + $track": {
          opacity: 1,
          backgroundColor: theme.palette.primary.main,
          borderColor: theme.palette.primary.main
        }
      }
    },
    thumb: {
      width: 12,
      height: 12,
      boxShadow: "none"
    },
    track: {
      border: `1px solid ${theme.palette.grey[500]}`,
      borderRadius: 16 / 2,
      opacity: 1,
      backgroundColor: theme.palette.common.white
    },
    checked: {}
  })
)(Switch);
