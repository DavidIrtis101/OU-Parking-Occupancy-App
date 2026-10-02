import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import GarageDetail from './pages/GarageDetail'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="garages/:id" element={<GarageDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
