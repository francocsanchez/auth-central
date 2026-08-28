"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts";

type ConnectedUsersChartProps = {
  connectedUsers: number;
  activeSessions: number;
  activeUsers: number;
  inactiveUsers: number;
};

export function ConnectedUsersChart({
  connectedUsers,
  activeSessions,
  activeUsers,
  inactiveUsers,
}: ConnectedUsersChartProps) {
  const chartRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!chartRef.current) {
      return;
    }

    const chart = echarts.init(chartRef.current);
    const option = {
      animationDuration: 400,
      grid: {
        top: 24,
        right: 16,
        bottom: 16,
        left: 16,
        containLabel: true,
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
      },
      xAxis: {
        type: "category",
        axisTick: { show: false },
        data: [
          "Conectados",
          "Sesiones",
          "Activos",
          "Inactivos",
        ],
      },
      yAxis: {
        type: "value",
        minInterval: 1,
        splitLine: {
          lineStyle: {
            color: "rgba(127,127,127,0.16)",
          },
        },
      },
      series: [
        {
          type: "bar",
          barWidth: "42%",
          data: [
            connectedUsers,
            activeSessions,
            activeUsers,
            inactiveUsers,
          ],
          itemStyle: {
            color: "var(--primary)",
          },
          label: {
            show: true,
            position: "top",
          },
        },
      ],
    };

    chart.setOption(option);

    const resizeObserver = new ResizeObserver(() => {
      chart.resize();
    });

    resizeObserver.observe(chartRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.dispose();
    };
  }, [activeSessions, activeUsers, connectedUsers, inactiveUsers]);

  return <div ref={chartRef} className="h-72 w-full" aria-label="Grafico de usuarios conectados" />;
}
