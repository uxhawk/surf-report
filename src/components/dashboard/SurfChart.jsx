import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, LabelList,
} from 'recharts'

const COLORS = ['#FF2D78', '#00CFFF', '#FFE600', '#BF00FF']
const MAX_LABEL_LEN = 14

function CustomTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null
  const val = payload[0].value
  return (
    <div className="bg-retro-surface2 border border-retro-border rounded-lg px-3 py-2">
      <p className="text-retro-muted text-xs mb-0.5">{label}</p>
      <p className="text-white text-sm font-semibold">{val != null ? `${val}${unit ?? ''}` : '—'}</p>
    </div>
  )
}

function RotatedTick({ x, y, payload }) {
  const label = payload.value.length > MAX_LABEL_LEN
    ? payload.value.slice(0, MAX_LABEL_LEN) + '…'
    : payload.value
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={4}
        textAnchor="end"
        fill="#A78BFA"
        fontSize={9}
        fontFamily="Inter"
        transform="rotate(-45)"
      >
        {label}
      </text>
    </g>
  )
}

export function SurfChart({ title, data, color = '#FF2D78', multiColor = false, logScale = false, onBarClick, unit }) {
  if (!data?.length) return null

  const hasData = data.some(d => d.count != null)
  if (!hasData) return null

  const needsRotation = data.some(d => d.name.length > 4) || data.length > 9

  const labelFormatter = (val) => val != null ? `${val}${unit ?? ''}` : ''

  return (
    <div className="gradient-border rounded-xl p-4 bg-retro-surface">
      <h3 className="text-neon-yellow font-display text-[9px] leading-relaxed mb-4 uppercase">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={needsRotation ? 200 : 160}>
        <BarChart data={data} margin={{ top: 14, right: 4, left: -28, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2D1060" vertical={false} />
          <XAxis
            dataKey="name"
            tick={needsRotation ? <RotatedTick /> : { fill: '#A78BFA', fontSize: 9, fontFamily: 'Inter' }}
            axisLine={false}
            tickLine={false}
            interval={0}
            height={needsRotation ? 64 : 30}
          />
          <YAxis
            allowDecimals={false}
            scale={logScale ? 'log' : 'auto'}
            domain={logScale ? [1, 'auto'] : [0, 'auto']}
            tick={{ fill: '#A78BFA', fontSize: 9, fontFamily: 'Inter' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip unit={unit} />} cursor={{ fill: 'rgba(255,45,120,0.08)' }} />
          <Bar
            dataKey="count"
            radius={[3, 3, 0, 0]}
            onClick={onBarClick ? (entry) => onBarClick(entry) : undefined}
            style={onBarClick ? { cursor: 'pointer' } : undefined}
          >
            <LabelList dataKey="count" position="top" formatter={labelFormatter} style={{ fill: '#A78BFA', fontSize: 9, fontFamily: 'Inter' }} />
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
