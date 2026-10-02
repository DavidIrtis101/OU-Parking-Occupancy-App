import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  getGarage,
  getEvents,
  startSimulation,
  stopSimulation,
} from '../api'
import StatusBadge from '../components/StatusBadge'
import OccupancyBar from '../components/OccupancyBar'
import EventFeed from '../components/EventFeed'
import HistoryChart from './History'
import ForecastPanel from '../components/ForecastPanel'

const POLL_MS = 3000

export default function GarageDetail() {
  const { id } = useParams()
  const [garage, setGarage] = useState(null)
  const [events, setEvents] = useState([])
  const [error, setError] = useState(null)
  const [simBusy, setSimBusy] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const [g, e] = await Promise.all([getGarage(id), getEvents(id, 20)])
      setGarage(g)
      setEvents(e)
      setError(null)
    } catch (err) {
      setError(err.message)
    }
  }, [id])

  useEffect(() => {
    refresh()
    const timer = setInterval(refresh, POLL_MS)
    return () => clearInterval(timer)
  }, [refresh])

  const handleStart = async () => {
    setSimBusy(true)
    try {
      await startSimulation(id)
      await refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setSimBusy(false)
    }
  }

  const handleStop = async () => {
    setSimBusy(true)
    try {
      await stopSimulation(id)
      await refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setSimBusy(false)
    }
  }

  if (error && !garage) {
    return (
      <div>
        <Link to="/" className="text-sm text-crimson hover:underline">&larr; Back to dashboard</Link>
        <p className="mt-4 text-red-700">{error}</p>
      </div>
    )
  }

  if (!garage) return <p className="text-gray-500">Loading...</p>

  const isRunning = garage.simulationRunning

  return (
    <div>
      <Link to="/" className="text-sm text-crimson hover:underline">&larr; Back to dashboard</Link>

      <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">{garage.name}</h2>
            <p className="text-gray-500">{garage.location_label}</p>
          </div>
          <StatusBadge status={garage.status} />
        </div>

        <p className="text-4xl font-bold">
          {garage.occupancy}{' '}
          <span className="text-2xl font-normal text-gray-400">/ {garage.capacity}</span>
        </p>
        <p className="mt-1 text-gray-600">
          {garage.available} spaces available · {garage.percent_occupied}% occupied
        </p>
        <div className="mt-4 max-w-md">
          <OccupancyBar percent={garage.percent_occupied} status={garage.status} />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleStart}
            disabled={simBusy || isRunning}
            className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Start Simulation
          </button>
          <button
            type="button"
            onClick={handleStop}
            disabled={simBusy || !isRunning}
            className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Stop Simulation
          </button>
          <span className={`text-sm ${isRunning ? 'font-semibold text-green-700' : 'text-gray-500'}`}>
            {isRunning ? 'Simulation running' : 'Simulation stopped'}
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section>
          <h3 className="mb-3 text-lg font-semibold">Recent Events</h3>
          <EventFeed events={events} />
        </section>

        <section>
          <ForecastPanel garageId={id} />
        </section>
      </div>

      <section className="mt-6">
        <HistoryChart garageId={id} />
      </section>
    </div>
  )
}
