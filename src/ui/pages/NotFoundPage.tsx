import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="glass rounded-3xl p-10 text-center">
      <div className="text-3xl font-black text-white">404</div>
      <div className="mt-2 text-sm text-slate-300">Page not found.</div>
      <div className="mt-6 flex justify-center gap-3">
        <Link className="btn-primary" to="/">
          Go home
        </Link>
        <Link className="btn-ghost" to="/book">
          Book service
        </Link>
      </div>
    </div>
  )
}

