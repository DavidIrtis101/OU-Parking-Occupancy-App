function formatTime(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export default function EventFeed({ events }) {
  if (!events.length) {
    return <p className="text-sm text-gray-500">No events yet.</p>
  }

  return (
    <ul className="max-h-72 divide-y divide-gray-100 overflow-y-auto rounded-lg border border-gray-200">
      {events.map((e) => (
        <li key={e.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
              e.event_type === 'entry'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-purple-100 text-purple-800'
            }`}
          >
            {e.event_type}
          </span>
          <span className="text-gray-500">{formatTime(e.created_at)}</span>
        </li>
      ))}
    </ul>
  )
}
