'use client'

import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface MiniChartProps {
  type: 'bar' | 'line'
  data: Array<{ date: string; value: number }>
  color?: string
  height?: number
}

export default function MiniChart({ type, data, color = '#10b981', height = 100 }: MiniChartProps) {
  const chartData = data.map((item, index) => ({
    ...item,
    index,
    // Format date for display (show last 7 days)
    displayDate: item.date.slice(-5) // Show MM-DD format
  }))

  if (type === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <XAxis 
            dataKey="displayDate" 
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            hide
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937',
              border: 'none',
              borderRadius: '8px',
              color: '#f9fafb'
            }}
          />
          <Bar 
            dataKey="value" 
            fill={color}
            radius={[2, 2, 0, 0]}
            animationDuration={1000}
          />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <XAxis 
          dataKey="displayDate" 
          tick={{ fontSize: 10 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          tick={{ fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          hide
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#1f2937',
            border: 'none',
            borderRadius: '8px',
            color: '#f9fafb'
          }}
        />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke={color}
          strokeWidth={2}
          dot={{ fill: color, strokeWidth: 2, r: 3 }}
          activeDot={{ r: 5, stroke: color, strokeWidth: 2 }}
          animationDuration={1000}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

