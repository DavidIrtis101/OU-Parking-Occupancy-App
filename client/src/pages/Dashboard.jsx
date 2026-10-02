import { useCallback, useEffect, useState } from 'react'
import { getGarages, startAllSimulations, stopAllSimulations } from '../api'
import GarageCard from '../components/GarageCard'

const POLL_MS = 3000

export default function Dashboard() {
  const [garages, setGarages] = useState([])
  const [simRunning, setSimRunning] = useState(false)
  const [simBusy, setSimBusy] = useState(false)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    try {
      const data = await getGarages()
      setGarages(data.garages)
      setSimRunning(data.simulationRunning)
      setError(null)
    } catch (err) {
      setError(err.message)
    }
  }, [])

  useEffect(() => {
    refresh()
    const timer = setInterval(refresh, POLL_MS)
    return () => clearInterval(timer)
  }, [refresh])

  const handleStart = async () => {
    setSimBusy(true)
    try {
      await startAllSimulations()
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
      await stopAllSimulations()
      await refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setSimBusy(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Parking Garages</h2>
          <p className="text-sm text-gray-500">Live occupancy across campus · updates every 3s</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleStart}
            disabled={simBusy || simRunning}
            className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Start Simulation
          </button>
          <button
            type="button"
            onClick={handleStop}
            disabled={simBusy || !simRunning}
            className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Stop Simulation
          </button>
          <span className={`text-sm ${simRunning ? 'font-semibold text-green-700' : 'text-gray-500'}`}>
            {simRunning ? 'Simulation running' : 'Simulation stopped'}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-100 px-4 py-3 text-red-800">{error}</div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {garages.map((g) => (
          <GarageCard key={g.id} garage={g} />
        ))}
      </div>

      {!garages.length && !error && (
        <p className="text-gray-500">Loading garages...</p>
      )}
    </div>
  )
}
