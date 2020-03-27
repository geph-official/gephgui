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
      let sty = {
        arrowhead: "undirected",
        style: "fill: #fff; stroke: #000"
      }
      let total = 1;
      if (!props.Bridges || Object.keys(props.Bridges).length === 0) {
        console.log("drawing start to end");
        g.setEdge("START", "END", {
          arrowhead: "undirected",
          style: "fill: #fff; stroke: #000"
        });
      } else {
        let counter = 0
        console.log(props.Bridges)
        Object.keys(props.Bridges).forEach(key => {
          const label = key.split("//")[0]
          const id = counter;
          counter++;
          g.setNode(id, {
            label: censorIP(label) + " [" + props.Bridges[key] + "]",
            style: "fill: #ddd; stroke: #000"
          });
          g.setEdge("START", id, {
            arrowhead: "undirected",
            style: "fill: #fff; stroke: #000"
          });
          g.setEdge(id, "END", {
            label: "",
            arrowhead: "undirected",
            style: "fill: #fff; stroke: #000"
          });
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
