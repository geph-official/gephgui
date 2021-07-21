import React, { useEffect, useState } from "react";

import MetricsGraphics from "react-metrics-graphics";
import "metrics-graphics/dist/metricsgraphics.css";
import { useInterval } from "../utils";
import axios from "axios";
import $ from "jquery";
import { curveStep, curveMonotoneX } from "d3";
import { useSelector } from "react-redux";
import { l10nSelector } from "../redux/l10n";

const SECONDS = 300;

const Status = (props: {}) => {
  const [deltaStats, setDeltaStats] = useState([]);
  const [minX, setMinX] = useState(
    new Date(new Date().getTime() - SECONDS * 1000)
  );

  // HACK: forces the whole thing to reload periodically to workaround metricsgraphics memory leak
  const [hackKey, setHackKey] = useState(0);

  const refreshStats = async () => {
    try {
      const deltaResponse = await axios.get("http://127.0.0.1:9809/deltastats");
      const deltaData = deltaResponse.data
        .map((item) => {
          item.date = new Date(item.time.secs_since_epoch * 1000);
          item.recv_speed *= 8;
          item.send_speed *= 8;
          delete item.time;
          return item;
        })
        .filter(
          (item) =>
            Math.abs(item.date.getTime() - new Date().getTime()) <
            SECONDS * 1000
        );
      console.log(deltaData);
      setDeltaStats(deltaData);
    } catch {
      setDeltaStats([]);
    }
  };

  useInterval(() => {
    refreshStats();
    setMinX(new Date(new Date().getTime() - SECONDS * 1000));
  }, SECONDS * 7.0);

  useInterval(() => {
    setHackKey(hackKey + 1);
  }, 6 * 1000);

  useEffect(() => {
    (window as any).$ = $;
    refreshStats();
    setMinX(new Date(new Date().getTime() - SECONDS * 1000));
  }, []);

  const titleStyle = {
    opacity: 0.5,
    paddingLeft: 10,
    fontSize: "100%",
  };

  const l10n = useSelector(l10nSelector);
  return (
    <div key={hackKey}>
      <h3 style={titleStyle}>{l10n.usage}</h3>
      <MetricsGraphics
        data={deltaStats}
        full_width
        height={150}
        transition_on_update={false}
        x_accessor="date"
        x_extended_ticks
        y_accessor={["recv_speed", "send_speed"]}
        baselines={[{ value: 1677722, label: l10n.freelimit }]}
        min_x={minX}
        max_x={new Date(minX.getTime() + SECONDS * 1000)}
        yax_units="bps"
        yax_units_append
        inflator={1.6}
        left={70}
        top={0}
        interpolate={curveMonotoneX}
        animate_on_load={true}
        legend={["↓", "↑"]}
        colors={["#007bbb", "#d9333f"]}
        chart_type={deltaStats.length > 0 ? "line" : "missing-data"}
        missing_is_zero
      />

      <h3 style={titleStyle}>{l10n.latency}</h3>
      <MetricsGraphics
        data={deltaStats}
        full_width
        height={150}
        transition_on_update={false}
        x_accessor="date"
        x_extended_ticks
        y_accessor={["ping"]}
        min_x={minX}
        max_x={new Date(minX.getTime() + SECONDS * 1000)}
        left={70}
        animate_on_load={true}
        yax_units="ms"
        yax_units_append
        interpolate={curveMonotoneX}
        top={0}
        colors={["#007bbb"]}
        chart_type={deltaStats.length > 0 ? "line" : "missing-data"}
      />

      <h3 style={titleStyle}>{l10n.packetLossEstimation}</h3>
      <MetricsGraphics
        data={deltaStats}
        full_width
        height={150}
        transition_on_update={false}
        x_accessor="date"
        x_extended_ticks
        y_accessor={["loss"]}
        min_x={minX}
        max_x={new Date(minX.getTime() + SECONDS * 1000)}
        yax_units="%"
        yax_units_append
        left={70}
        animate_on_load={true}
        top={0}
        colors={["red"]}
        interpolate={curveStep}
        chart_type={deltaStats.length > 0 ? "line" : "missing-data"}
      />
    </div>
  );
};
export default Status;
