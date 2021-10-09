import React, { useState, useEffect } from "react";
import {
  AppBar,
  Tabs,
  Tab,
  Typography,
  Box,
  Paper,
  Divider,
  Button,
  List,
  ListItem,
  ListSubheader,
  ListItemText,
  Card,
  CardContent,
} from "@material-ui/core";
import Parser from "rss-parser";
import axios from "axios";
import sanitizeHtml from "sanitize-html";
import franc from "franc";
import { tify, sify } from "chinese-conv";
import { useSelector, useDispatch } from "react-redux";
import { langSelector } from "../redux/l10n";
import EventIcon from "@material-ui/icons/Event";
import { prefSelector } from "../redux/prefs";

const filterByLanguage = (francCode: string, toFilter: string) => {
  // divide by br tags
  const lines = toFilter.split("<br />");
  // filter
  return lines
    .filter((line) => {
      const dl = franc(line, { only: ["eng", "cmn"] });

      return (
        line.trim().length > 0 &&
        (dl === francCode || dl === "und" || line.includes("https"))
      );
    })
    .join("<br />");
};

export const getAnnouncementFeed = async () => {
  const parser = new Parser();
  const feedContents: any = await (async () => {
    try {
      return parser.parseString(
        (await axios.get("https://channel2rss.bitmachine.org/rss/gephannounce"))
          .data
      );
    } catch {
      return parser.parseString(
        await window["rpc"].call(
          "get_url",
          "https://channel2rss.bitmachine.org/rss/gephannounce"
        )
      );
    }
  })();
  const feedContentsFiltered = feedContents.items
    .map((item) => {
      return item
        ? {
            text: sanitizeHtml(item.content).replace(
              /<a/g,
              "<a target='_blank' "
            ) as string,
            date: item.isoDate as string,
          }
        : { text: "", date: "" };
    })
    .filter((msg) => new Date(msg.date) > new Date("2020-04-10"));
  console.log(JSON.stringify(feedContentsFiltered));
  if (feedContents.items) {
    return feedContentsFiltered;
  }
  return [];
};

const Announcements = (props) => {
  const lang = useSelector(langSelector);
  const announcements = useSelector(prefSelector("announceCache", []));
  const announceBusy = useSelector(prefSelector("announceBusy", false));
  const lastReadAnnounce = useSelector(
    prefSelector("lastReadAnnounce", new Date("1900-01-01"))
  );
  const dispatch = useDispatch();
  useEffect(() => {
    setTimeout(() => {
      if (announcements.length > 0) {
        dispatch({
          type: "PREF",
          key: "lastReadAnnounce",
          value: new Date(announcements[0].date),
        });
      }
    }, 1000);
  }, []);
  const isNew = (annDate: string) =>
    new Date(annDate).getTime() > new Date(lastReadAnnounce).getTime();
  const filterMsg = (msg: string) => {
    if (lang === "zh-CN") return sify(filterByLanguage("cmn", msg)) as string;
    else if (lang === "zh-TW")
      return tify(filterByLanguage("cmn", msg)) as string;
    else return filterByLanguage("eng", msg) as string;
  };
  return (
    <>
      <List style={{ maxHeight: "calc(100vh - 64px)" }}>
        {announcements
          .filter((msg) => {
            const finalMsg = filterMsg(msg.text);
            return finalMsg.length > 0;
          })
          .map((msg) => {
            const finalMsg = filterMsg(msg.text);
            // if (finalMsg.length === 0) {
            //   return <></>;
            // }
            const options = {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            };

            return (
              <ListItem key={msg.date}>
                <Card
                  style={{
                    width: "100%",
                  }}
                >
                  <CardContent>
                    <Typography
                      color={isNew(msg.date) ? "secondary" : "textSecondary"}
                      gutterBottom
                    >
                      <span
                        style={{
                          verticalAlign: "middle",
                          display: "inline-block",
                        }}
                      >
                        <EventIcon fontSize="small" />
                      </span>
                      <small>
                        {new Date(msg.date).toLocaleDateString(lang, options)}
                      </small>
                    </Typography>
                    <Typography
                      dangerouslySetInnerHTML={{
                        __html: finalMsg,
                      }}
                      style={{ fontSize: "90%" }}
                    />
                  </CardContent>
                </Card>
              </ListItem>
            );
          })}
      </List>
    </>
  );
};

export default Announcements;
