import React, { useState, useEffect } from "react";
import {
  AppBar,
  Tabs,
  Tab,
  Typography,
  Box,
  Paper,
  Divider,
  Button
} from "@material-ui/core";
import { useSelector } from "react-redux";
import { l10nSelector } from "../redux/l10n";
import axios from "axios";
import { useInterval } from "../utils";
import { getPlatform } from "../nativeGate";

const Details = props => {
  const l10n = useSelector(l10nSelector);
  const [value, setValue] = useState(0);
  const [logLines, setLogLines] = useState([] as string[]);
  const logsURL = "http://localhost:9809/logs";
  const updateLogs = async () => {
    const resp = await axios.get(logsURL);
    setLogLines((resp.data as string).split("\n"));
  };

  useInterval(() => {
    updateLogs();
  }, 5000);
  useEffect(() => {
    updateLogs();
  }, []);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div style={{ flexGrow: 1 }}>
      <AppBar position="absolute" color="inherit">
        <Tabs value={value} onChange={handleChange}>
          <Tab label={l10n.debuglogs} />
          <Tab label={l10n.feedback} />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0}>
        <div
          style={{
            height: "calc(100vh - 160px)",
            fontSize: "80%",
            overflow: "auto",
            display: "flex",
            flexDirection: "column-reverse"
          }}
          className="mspace"
        >
          {(logLines as string[]).map(str => (
            <>
              {str}
              <br />
            </>
          ))}
        </div>
      </TabPanel>
      <TabPanel value={value} index={1} style={{ textAlign: "center" }}>
        <Box component="div" color="primary" m={2}>
          {l10n.feedbackblurb} <br /> <br />
          <Button
            color="primary"
            variant="contained"
            disableElevation
            size="large"
            onClick={() => {
              const url = "http://localhost:9809/debugpack";
              if (getPlatform() === "android") {
                window.location.href = url;
              } else {
                window.open(url, "_blank");
              }
            }}
            disabled={logLines.length === 0}
          >
            {l10n.feedbackbutton}
          </Button>
        </Box>
      </TabPanel>
    </div>
  );
};

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Paper style={{ marginTop: "64px" }} variant="outlined">
          <Box component="div" p={1}>
            {children}
          </Box>
        </Paper>
      )}
    </Typography>
  );
}

export default Details;
