'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { AssetAllocation } from '@/types'
import { CHART_COLORS } from '@/lib/constants'

interface AssetAllocationChartProps {
  allocation: AssetAllocation
}

export function AssetAllocationChart({ allocation }: AssetAllocationChartProps) {
  const data = [
    { name: 'Equity', value: allocation.equity, color: CHART_COLORS[0] },
    { name: 'Debt', value: allocation.debt, color: CHART_COLORS[1] },
    { name: 'Gold', value: allocation.gold, color: CHART_COLORS[2] },
  ]

  if (allocation.others && allocation.others > 0) {
    data.push({ name: 'Others', value: allocation.others, color: CHART_COLORS[3] })
  }

  const renderLabel = (entry: any) => `${entry.name}: ${entry.value}%`

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderLabel}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => `${value}%`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
