"use client"

import { Card, AreaChart } from "@tremor/react"

interface NetflowChartProps {
  data: Array<{ date: string; inflow: number; outflow: number; netflow: number }>
}

export function NetflowChart({ data }: NetflowChartProps) {
  const chartdata = data.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    "Inflow": item.inflow,
    "Outflow": item.outflow,
    "Net Flow": item.netflow
  }))

  return (
    <Card className="card border-0 shadow-none p-0">
      <h3 className="font-semibold text-lg mb-4">Net Flow Over Time</h3>
      <AreaChart
        className="h-80"
        data={chartdata}
        index="date"
        categories={["Inflow", "Outflow", "Net Flow"]}
        colors={["emerald", "rose", "purple"]}
        valueFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
        yAxisWidth={65}
        showAnimation={true}
      />
    </Card>
  )
}
