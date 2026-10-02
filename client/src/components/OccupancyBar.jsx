const BAR_COLORS = {
  available: 'bg-green-500',
  'filling up': 'bg-yellow-500',
  full: 'bg-red-500',
}

export default function OccupancyBar({ percent, status }) {
  const clamped = Math.min(100, Math.max(0, percent))
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
      <div
        className={`h-full rounded-full transition-all duration-500 ${BAR_COLORS[status] || 'bg-gray-400'}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
