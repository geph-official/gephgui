import {
  Avatar,
  Button,
  Checkbox,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resolve } from "url";
import { l10nSelector } from "../redux/l10n";
import { prefSelector } from "../redux/prefs";

import utf8 from "utf8";

interface AppMetadata {
  packageName: string;
  friendlyName: string;
}

// obtains the list of app metadatas.
const getAppList = (): Promise<AppMetadata[]> => {
  return new Promise((resolve, reject) => {
    (window as any)._ALIST_CALLBACK = (v) => {
      console.log("CALLBACK");
      let lala = JSON.parse(utf8.decode(atob(v)));
      lala.sort((a, b) => {
        let textA = a.friendlyName;
        let textB = b.friendlyName;
        return textA < textB ? -1 : textA > textB ? 1 : 0;
      });
      console.log("CALLBACK DONE");
      resolve(lala);
    };
    (window as any).Android.jsGetAppList();
  });
  //   return JSON.parse((window as any).Android.jsGetAppList());
  //   return new Promise((resolve, reject) =>
  //     resolve([
  //       { packageName: "com.tencent.mm.lala.booyah", friendlyName: "WeChat" },
  //     ])
  //   );
};

let appIconCache: any = {};

const getAppIcon = (packageName: string): string | null => {
  if (appIconCache[packageName]) {
    return appIconCache[packageName];
  }
  try {
    const lala = (window as any).Android.jsGetAppIcon(packageName);
    appIconCache[packageName] = lala;
    return lala;
  } catch (e) {
    alert(e.toString());
    return null;
  }
  //   return WECHAT_DATA_URI;
};

const ExcludeAppPicker = (props: { handleClose: any }) => {
  const l10n = useSelector(l10nSelector);
  const dispatch = useDispatch();
  const excludedJsonList: string = useSelector(
    prefSelector("excludedAppList", "[]")
  );
  const excludedList: string[] = JSON.parse(excludedJsonList);
  const isExcluded = (pname: string) => excludedList.includes(pname);
  const setExcluded = (pname: string, isExcluded: boolean) => {
    if (!isExcluded) {
      dispatch({
        type: "PREF",
        key: "excludedAppList",
        value: JSON.stringify(excludedList.filter((item) => item !== pname)),
      });
    } else {
      dispatch({
        type: "PREF",
        key: "excludedAppList",
        value: JSON.stringify([...excludedList, pname]),
      });
    }
  };

  const [appList, setAppList] = useState([] as AppMetadata[]);

  useEffect(() => {
    (async () => {
      setAppList(await getAppList());
      console.log("APP LIST LOADED");
    })();
  }, []);

  return (
    <>
      <DialogTitle>{l10n.selectExcludedApps}</DialogTitle>
      <DialogContent style={{ padding: 0, margin: 0 }}>
        <List>
          {appList.length === 0 ? <LinearProgress /> : ""}
          {appList.map((elem) => {
            let icon = getAppIcon(elem.packageName);
            return (
              <ListItem>
                <ListItemAvatar>
                  {icon ? (
                    <Avatar src={icon} />
                  ) : (
                    <Avatar>{elem.friendlyName.substring(0, 1)}</Avatar>
                  )}
                </ListItemAvatar>
                <ListItemText
                  primary={elem.friendlyName}
                  secondary={elem.packageName}
                  style={{
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                  }}
                />
                <ListItemSecondaryAction>
                  <Checkbox
                    edge="end"
                    checked={isExcluded(elem.packageName)}
                    onChange={(event) => {
                      setExcluded(elem.packageName, event.target.checked);
                    }}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.handleClose} color="primary">
          OK
        </Button>
      </DialogActions>
    </>
  );
};

export default ExcludeAppPicker;

const WECHAT_DATA_URI =
  "data:image/png;base64,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";
