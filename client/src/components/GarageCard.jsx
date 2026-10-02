import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge'
import OccupancyBar from './OccupancyBar'

export default function GarageCard({ garage }) {
  return (
    <Link
      to={`/garages/${garage.id}`}
      className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-crimson/30 hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h2 className="font-semibold text-gray-900">{garage.name}</h2>
          <p className="text-sm text-gray-500">{garage.location_label}</p>
        </div>
        <StatusBadge status={garage.status} />
      </div>

      <p className="mb-1 text-2xl font-bold text-gray-900">
        {garage.occupancy}{' '}
        <span className="text-lg font-normal text-gray-400">/ {garage.capacity}</span>
      </p>
      <p className="mb-3 text-sm text-gray-500">
        {garage.available} spaces available · {garage.percent_occupied}% occupied
      </p>

      <OccupancyBar percent={garage.percent_occupied} status={garage.status} />
    </Link>
  )
}
