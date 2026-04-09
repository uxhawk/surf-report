import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, LabelList,
} from 'recharts'

const COLORS = ['#FF2D78', '#00CFFF', '#FFE600', '#BF00FF']

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-retro-surface2 border border-retro-border rounded-lg px-3 py-2">
      <p className="text-retro-muted text-xs mb-0.5">{label}</p>
      <p className="text-white text-sm font-semibold">{payload[0].value} surfs</p>
    </div>
  )
}

export function SurfChart({ title, data, color = '#FF2D78', multiColor = false }) {
  if (!data?.length) return null

  return (
    <div className="gradient-border rounded-xl p-4 bg-retro-surface">
      <h3 className="text-neon-yellow font-display text-[9px] leading-relaxed mb-4 uppercase">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} margin={{ top: 14, right: 0, left: -28, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2D1060" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: '#A78BFA', fontSize: 9, fontFamily: 'Inter' }}
            axisLine={false}
            tickLine={false}
            interval={0}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: '#A78BFA', fontSize: 9, fontFamily: 'Inter' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,45,120,0.08)' }} />
          <Bar dataKey="count" radius={[3, 3, 0, 0]}>
            <LabelList dataKey="count" position="top" style={{ fill: '#A78BFA', fontSize: 9, fontFamily: 'Inter' }} />
            {data.map((_, index) => (
              <Cell
                key={index}
                fill={multiColor ? COLORS[index % COLORS.length] : color}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
