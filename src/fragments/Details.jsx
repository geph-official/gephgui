import React, { useState } from "react";
import { AppBar, Tabs, Tab } from "@material-ui/core";

const Details = props => {
  const l10n = useSelector(l10nSelector);
  return (
    <div style={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Tabs>
          <Tab label={l10n.debuglogs} />
        </Tabs>
      </AppBar>
    </div>
  );
};

export default Details;
