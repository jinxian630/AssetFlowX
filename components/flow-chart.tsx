"use client"

import { Card, BarChart } from "@tremor/react"

interface FlowChartProps {
  data: Array<{ chain: string; inflow: number; outflow: number }>
}

export function FlowChart({ data }: FlowChartProps) {
  const chartdata = data.map(item => ({
    chain: item.chain,
    "Inflow": item.inflow,
    "Outflow": item.outflow
  }))

  return (
    <Card className="card border-0 shadow-none p-0">
      <h3 className="font-semibold text-lg mb-4">Flow by Chain</h3>
      <BarChart
        className="h-64"
        data={chartdata}
        index="chain"
        categories={["Inflow", "Outflow"]}
        colors={["emerald", "rose"]}
        valueFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
        yAxisWidth={65}
        showAnimation={true}
        stack={false}
      />
    </Card>
  )
}
