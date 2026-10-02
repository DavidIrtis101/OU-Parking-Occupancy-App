async function request(path, options) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed (${res.status})`)
  }
  return res.json()
}

export const getGarages = () => request('/api/garages')
export const getGarage = (id) => request(`/api/garages/${id}`)
export const getEvents = (id, limit = 20) =>
  request(`/api/garages/${id}/events?limit=${limit}`)
export const getHistory = (id, range = '24h') =>
  request(`/api/garages/${id}/history?range=${range}`)
export const getForecast = (id) => request(`/api/garages/${id}/forecast?day=today`)
export const recordEvent = (id, eventType) =>
  request(`/api/garages/${id}/events`, {
    method: 'POST',
    body: JSON.stringify({ event_type: eventType }),
  })
export const startSimulation = (id) =>
  request(`/api/garages/${id}/simulate/start`, { method: 'POST' })
export const stopSimulation = (id) =>
  request(`/api/garages/${id}/simulate/stop`, { method: 'POST' })
export const startAllSimulations = () =>
  request('/api/garages/simulate/start', { method: 'POST' })
export const stopAllSimulations = () =>
  request('/api/garages/simulate/stop', { method: 'POST' })
