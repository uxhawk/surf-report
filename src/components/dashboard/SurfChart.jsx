import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, LabelList,
} from 'recharts'

const COLORS = ['#FF2D78', '#00CFFF', '#FFE600', '#BF00FF']
const MAX_LABEL_LEN = 14

function CustomTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null
  if (payload.length === 1) {
    const val = payload[0].value
    return (
      <div className="bg-retro-surface2 border border-retro-border rounded-lg px-3 py-2">
        <p className="text-retro-muted text-xs mb-0.5">{label}</p>
        <p className="text-white text-sm font-semibold">{val != null ? `${val}${unit ?? ''}` : '—'}</p>
      </div>
    )
  }
  return (
    <div className="bg-retro-surface2 border border-retro-border rounded-lg px-3 py-2">
      <p className="text-retro-muted text-xs mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: p.fill || p.color }}>
          {p.name}: {p.value != null ? `${p.value}${unit ?? ''}` : '—'}
        </p>
      ))}
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

export function SurfChart({ title, data, color = '#FF2D78', multiColor = false, logScale = false, onBarClick, unit, bars }) {
  if (!data?.length) return null

  const primaryKey = bars ? bars[0].key : 'count'
  const hasData = data.some(d => d[primaryKey] != null)
  if (!hasData) return null

  const needsRotation = data.some(d => d.name.length > 4) || data.length > 9

  const labelFormatter = (val) => val != null ? `${val}${unit ?? ''}` : ''

  return (
    <div className="gradient-border rounded-xl p-4 bg-retro-surface">
      <h3 className="text-neon-yellow font-display text-[9px] leading-relaxed mb-4 uppercase">
        {title}
      </h3>
      {bars && (
        <div className="flex gap-4 mb-3">
          {bars.map(b => (
            <div key={b.key} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: b.color }} />
              <span className="text-retro-muted text-[9px] uppercase">{b.label}</span>
            </div>
          ))}
        </div>
      )}
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
          {bars ? (
            bars.map(b => (
              <Bar key={b.key} dataKey={b.key} name={b.label} fill={b.color} radius={[3, 3, 0, 0]}>
                <LabelList dataKey={b.key} position="top" formatter={labelFormatter} style={{ fill: '#A78BFA', fontSize: 9, fontFamily: 'Inter' }} />
              </Bar>
            ))
          ) : (
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
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
