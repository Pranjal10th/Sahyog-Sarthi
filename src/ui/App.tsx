import { Navigate, Route, Routes } from 'react-router-dom'
import { SiteShell } from './components/SiteShell'
import { AdminPage } from './pages/AdminPage'
import { BookPage } from './pages/BookPage'
import { HomePage } from './pages/HomePage'
import { TrackPage } from './pages/TrackPage'
import { WorkerPage } from './pages/WorkerPage'
import { NotFoundPage } from './pages/NotFoundPage'

export function App() {
  return (
    <div className="min-h-full app-bg">
      <SiteShell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/book" element={<BookPage />} />
          <Route path="/track" element={<TrackPage />} />
          <Route path="/worker" element={<WorkerPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </SiteShell>
    </div>
  )
}
