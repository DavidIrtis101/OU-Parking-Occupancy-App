const LABELS = {
  available: 'Available',
  'filling up': 'Filling Up',
  full: 'Full',
}

const STYLES = {
  available: 'bg-green-100 text-green-800',
  'filling up': 'bg-yellow-100 text-yellow-800',
  full: 'bg-red-100 text-red-800',
}

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${STYLES[status] || 'bg-gray-100 text-gray-800'}`}
    >
      {LABELS[status] || status}
    </span>
  )
}
