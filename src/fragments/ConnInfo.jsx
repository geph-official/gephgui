import React, { useEffect } from "react";
import * as d3 from "d3";
import * as dagreD3 from "dagre-d3";

const IPLabel = props => <b>{props.ip ? props.ip : "-"}</b>;

const censorIP = ip => {
  const splitted = ip.split(".");
  if (splitted.length === 4) {
    splitted[2] = "*";
    splitted[3] = "*";
    return splitted.join(".");
  }
  return ip;
};

export const ConnInfo = props => {
  useEffect(() => {
    console.log(props);
    let g = new dagreD3.graphlib.Graph().setGraph({
      edgesep: 5,
      ranksep: 20,
      nodesep: 10,
      directed: false,
      rankdir: "LR"
    });
    g.setNode("START", {
      label: props.l10n.you,
      shape: "diamond",
      style: "fill: #fff; stroke: #000"
    });
    if (props.PublicIP) {
      g.setNode("END", {
        label: props.PublicIP,
        shape: "rect",
        style: "fill: #fff; stroke: #000",
        labelStyle: "font-weight: bold"
      });
      let total = 1;
      if (!props.Bridges || props.Bridges.length === 0) {
        console.log("drawing start to end");
        g.setEdge("START", "END", {
          arrowhead: "undirected",
          style: "fill: #fff; stroke: #000"
        });
      } else {
        props.Bridges.forEach(bdesc => (total += bdesc.RecvCnt));
        props.Bridges.forEach(bdesc => {
          if (bdesc.Ping < 10000) {
            const id = bdesc.RecvCnt.toFixed(0);
            const strokeWidth = 0.4 + (5 * bdesc.RecvCnt) / total;
            if (bdesc.RecvCnt < 1) {
              g.setNode(id, {
                label: censorIP(bdesc.RemoteIP) + " [TCP]",
                style: "fill: #ddd; stroke: #000"
              });
            } else {
              let nodeColor = "#ffb0b0";
              if (bdesc.LossPct < 0.1) {
                nodeColor = "#afd9a8";
              } else if (bdesc.LossPct < 0.2) {
                nodeColor = "#fff199";
              }
              g.setNode(id, {
                label:
                  censorIP(bdesc.RemoteIP) +
                  " / " +
                  bdesc.Ping.toFixed(0) +
                  "ms / " +
                  (bdesc.LossPct * 100).toFixed(0) +
                  "%",
                style:
                  "fill: " +
                  nodeColor +
                  "; stroke-width:" +
                  strokeWidth.toFixed(4) +
                  "px; stroke: #000"
              });
            }
            g.setEdge("START", id, {
              arrowhead: "undirected",
              style: "fill: #fff; stroke: #000"
            });
            g.setEdge(id, "END", {
              label: "",
              arrowhead: "undirected",
              style: "fill: #fff; stroke: #000"
            });
          }
        });
      }
    }
    let svg = d3.select("#thesvg");
    let inner = svg.select("g");
    console.log(svg);
    var render = new dagreD3.render();
    render(inner, g);
    var padding = 60,
      bBox = svg.node().getBoundingClientRect(),
      hRatio = (bBox.height - padding) / g.graph().height,
      wRatio = (bBox.width - padding) / g.graph().width;
    let ratio = Math.min(1.0, Math.min(hRatio, wRatio)).toFixed(10);
    var xCenterOffset = (bBox.width - g.graph().width * ratio) / 2;
    var yCenterOffset = (bBox.height - g.graph().height * ratio) / 2;
    inner.attr(
      "transform",
      "translate(" + xCenterOffset + `,` + yCenterOffset + `) scale(${ratio})`
    );
  });

  return (
    <svg style={{ width: "100%", height: "100%", padding: "0" }} id="thesvg">
      <g style={{ width: "100%", height: "100%", padding: "0" }} />
    </svg>
  );
};
