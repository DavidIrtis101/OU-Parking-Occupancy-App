import { Outlet, Link } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-crimson px-6 py-4 text-white shadow">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link to="/" className="hover:opacity-90">
            <h1 className="text-xl font-semibold">OU Parking</h1>
            <p className="text-sm opacity-80">Campus garage occupancy · simulated data</p>
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-6">
        <Outlet />
      </main>
    </div>
  )
}
