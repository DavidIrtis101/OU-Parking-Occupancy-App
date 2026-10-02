import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { getHistory } from '../api'

function formatLabel(iso) {
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function History({ garageId }) {
  const [range, setRange] = useState('24h')
  const [points, setPoints] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    getHistory(garageId, range)
      .then((data) => {
        setPoints(
          data.points.map((p) => ({
            ...p,
            label: formatLabel(p.recorded_at),
          }))
        )
        setError(null)
      })
      .catch((err) => setError(err.message))
  }, [garageId, range])

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Occupancy History</h3>
        <div className="flex gap-2">
          {['24h', '7d'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`rounded px-3 py-1 text-sm font-medium ${
                range === r
                  ? 'bg-crimson text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      {!points.length && !error && (
        <p className="text-sm text-gray-500">No history data yet.</p>
      )}

      {points.length > 0 && (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={points}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11 }}
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              labelFormatter={(_, payload) =>
                payload?.[0]?.payload?.recorded_at
                  ? new Date(payload[0].payload.recorded_at).toLocaleString()
                  : ''
              }
            />
            <Line
              type="monotone"
              dataKey="occupancy"
              stroke="#841617"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
