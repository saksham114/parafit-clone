'use client'

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts'

export default function WeightChart({ data }: { data: { date: string, kg: number }[] }) {
  return (
    <div className="w-full h-48">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <XAxis 
            dataKey="date" 
            stroke="#6B7280"
            fontSize={12}
            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          />
          <YAxis 
            stroke="#6B7280"
            fontSize={12}
            tickFormatter={(value) => `${value}kg`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#FFFFFF', 
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              color: '#1F2937',
              boxShadow: '0 10px 24px rgba(0,0,0,0.06), 0 2px 6px rgba(0,0,0,0.04)'
            }}
            labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric' 
            })}
            formatter={(value: number) => [`${value}kg`, 'Weight']}
          />
          <Line 
            type="monotone"
            dataKey="kg" 
            stroke="#00B887" 
            strokeWidth={3}
            dot={{ fill: '#00B887', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#00B887', strokeWidth: 2, fill: '#00B887' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
