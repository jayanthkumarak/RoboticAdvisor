'use client'

import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { CashFlowProjection } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface CashFlowChartProps {
  data: CashFlowProjection[]
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  const chartData = useMemo(() => {
    return data.map((item) => ({
      year: item.year,
      'Portfolio Value': item.portfolioValue,
      Income: item.income,
      Expenses: item.expenses,
      Investment: item.investment,
    }))
  }, [data])

  const formatValue = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(1)}Cr`
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`
    }
    return formatCurrency(value)
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="year"
          className="text-sm"
          tick={{ fill: 'currentColor' }}
        />
        <YAxis
          className="text-sm"
          tick={{ fill: 'currentColor' }}
          tickFormatter={formatValue}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
          formatter={(value: number) => formatCurrency(value)}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="Portfolio Value"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="Income"
          stroke="#10b981"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="Expenses"
          stroke="#ef4444"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="Investment"
          stroke="#8b5cf6"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
