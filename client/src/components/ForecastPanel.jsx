import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { getForecast } from '../api'

function formatHour(h) {
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 || 12
  return `${hour12}${suffix}`
}

export default function ForecastPanel({ garageId }) {
  const [forecast, setForecast] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    getForecast(garageId)
      .then(setForecast)
      .catch((err) => setError(err.message))
  }, [garageId])

  if (error) return <p className="text-sm text-red-700">{error}</p>
  if (!forecast) return <p className="text-sm text-gray-500">Loading forecast...</p>

  const chartData = forecast.hourly.map((h) => ({
    ...h,
    label: formatHour(h.hour),
  }))

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-1 flex items-center gap-2">
        <h3 className="text-lg font-semibold">Parking Forecast</h3>
        <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
          Simulated
        </span>
      </div>
      <p className="mb-4 text-sm text-gray-600">{forecast.message}</p>

      {chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} unit="%" />
            <Tooltip formatter={(v) => [`${v}%`, 'Avg occupied']} />
            <Bar dataKey="percent" fill="#841617" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
